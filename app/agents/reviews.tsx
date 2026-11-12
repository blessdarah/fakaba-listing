import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarRow } from "components/agents/Stars";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { agentFullName, summarise, type AgentUser } from "lib/agents";
import { toDate } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { useReviewsByAgent } from "lib/query/useReviews";
import { useUser } from "lib/query/useUsers";
import type { Review } from "lib/types";
import { fonts, gutter, radius, useTheme } from "theme";

type Sort = "newest" | "lowest" | "replies";

function replyText(r: Review) {
  if (!r.response) return "";
  return typeof r.response === "string" ? r.response : (r.response.text ?? "");
}

/** "66 — Agent reviews": score, distribution, sortable list with agent replies. */
export default function AgentReviews() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: agentData } = useUser(id);
  const agent = agentData as AgentUser | null | undefined;
  const { data: reviews = [], isPending } = useReviewsByAgent(id);
  const [sort, setSort] = useState<Sort>("newest");

  const name = agentFullName(agent ?? undefined);
  const firstName = agent?.accountType === "company" ? name : agent?.firstName || name;
  const summary = useMemo(() => summarise(reviews), [reviews]);
  const maxBucket = Math.max(...summary.distribution, 1);
  const canWrite = !!user && user.uid !== id;
  const mine = reviews.find((r) => r.userId === user?.uid);

  const sorted = useMemo(() => {
    const time = (r: Review) => toDate(r.createdAt)?.getTime() ?? 0;
    if (sort === "lowest") return [...reviews].sort((a, b) => a.rating - b.rating || time(b) - time(a));
    if (sort === "replies") return reviews.filter((r) => replyText(r));
    return [...reviews].sort((a, b) => time(b) - time(a));
  }, [reviews, sort]);

  const monthYear = (ts: unknown) =>
    toDate(ts)?.toLocaleDateString(locale, { month: "long", year: "numeric" }) ?? "";

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 6 }]}>
      <View style={styles.header}>
        <IconButton icon="back" accessibilityLabel={t("agents.back")} onPress={() => router.back()} />
        <Text variant="base" weight="semibold" numberOfLines={1} style={styles.headerTitle} accessibilityRole="header">
          {firstName ? t("reviews.title", { name: firstName }) : ""}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={styles.top}>
            <View style={styles.score}>
              <View style={styles.big}>
                <Text variant="display" style={styles.bigNumber}>
                  {summary.average != null ? summary.average.toFixed(1) : "—"}
                </Text>
                <Text variant="sm" color="inkMuted">
                  {t("agents.stats.reviews", { count: summary.count })}
                </Text>
              </View>
              <View style={styles.dist}>
                {summary.distribution.map((n, i) => (
                  <View key={i} style={styles.distRow}>
                    <Text variant="xs" color="inkMuted" style={styles.distLabel}>
                      {5 - i}
                    </Text>
                    <View style={[styles.track, { backgroundColor: colors.surface }]}>
                      <View style={[styles.fill, { width: `${(n / maxBucket) * 100}%`, backgroundColor: colors.ink }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.chips}>
              {(["newest", "lowest", "replies"] as Sort[]).map((s) => (
                <Chip key={s} label={t(`reviews.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
              ))}
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.review,
              index < sorted.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
            ]}
          >
            <View style={styles.reviewHead}>
              <Avatar name={item.userName} uri={item.userImage} size={32} />
              <View style={styles.flex}>
                <Text variant="base" weight="semibold">
                  {item.userName}
                </Text>
                <Text variant="label" color="inkMuted" style={styles.regular}>
                  {monthYear(item.createdAt)}
                </Text>
              </View>
              <StarRow rating={item.rating} />
            </View>
            {item.comment?.trim() ? <Text variant="base">{item.comment.trim()}</Text> : null}
            {item.tags?.length ? (
              <View style={styles.tags}>
                {item.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.surface }]}>
                    <Text variant="label" weight="medium">
                      {t(`reviews.tags.${tag}`, { defaultValue: tag })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {replyText(item) ? (
              <View style={[styles.reply, { backgroundColor: colors.surface, borderLeftColor: colors.ink }]}>
                <Text variant="label">{t("reviews.replyFrom", { name: firstName })}</Text>
                <Text variant="sm">{replyText(item)}</Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          isPending ? null : (
            <Text variant="base" color="inkMuted" align="center" style={styles.empty}>
              {t("reviews.empty")}
            </Text>
          )
        }
      />

      {canWrite && (
        <View
          style={[styles.bar, { borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
        >
          <Button
            label={mine ? t("agents.editReview") : t("agents.writeReview")}
            variant={mine ? "outline" : "primary"}
            onPress={() => router.push({ pathname: "/agents/write-review", params: { id } })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  regular: { fontFamily: fonts.regular },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  headerTitle: { flex: 1, textAlign: "center" },
  headerSpacer: { width: 40 },
  top: { paddingTop: 24, gap: 20, paddingBottom: 8 },
  score: { flexDirection: "row", alignItems: "center", gap: 20 },
  big: { gap: 2 },
  bigNumber: { fontSize: 52, lineHeight: 56, letterSpacing: -2 },
  dist: { flex: 1, gap: 6 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  distLabel: { width: 10 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  review: { paddingVertical: 18, gap: 10 },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  reply: { padding: 14, gap: 4, borderLeftWidth: 3, borderRadius: radius.sm },
  empty: { paddingTop: 40 },
  bar: { paddingHorizontal: gutter, paddingTop: 12, borderTopWidth: 1 },
});
