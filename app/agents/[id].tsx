import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListingRow } from "components/home/ListingCards";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { agentAreas, agentFullName, summarise, tenure, type AgentUser } from "lib/agents";
import { toDate } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { openListing } from "lib/listing";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useListingsByUser } from "lib/query/useListings";
import { useReviewsByAgent } from "lib/query/useReviews";
import { useUser } from "lib/query/useUsers";
import type { Review } from "lib/types";
import { openWhatsApp } from "lib/whatsapp";
import { gutter, radius, useTheme } from "theme";

/** "12 — Agent profile" and "67 — Agent profile · Your view". */
export default function AgentProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { data: agentData, isPending, isError } = useUser(id);
  const agent = agentData as AgentUser | null | undefined;
  const { data: allListings = [] } = useListingsByUser(id);
  const { data: reviews } = useReviewsByAgent(id);
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  const scroll = useRef<ScrollView>(null);
  const [listingsY, setListingsY] = useState(0);

  const isMe = user?.uid === id;
  const listings = useMemo(() => allListings.filter((l) => l.status === "active"), [allListings]);
  const summary = useMemo(() => summarise(reviews), [reviews]);
  const myReview = reviews?.find((r) => r.userId === user?.uid);
  const featured = useMemo(() => pickQuote(reviews), [reviews]);

  if (isPending) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.inkMuted} />
      </View>
    );
  }
  if (isError || !agent) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text variant="title">{t("agents.notFound")}</Text>
        <Button label={t("agents.back")} variant="outline" size="md" onPress={() => router.back()} />
      </View>
    );
  }

  const name = agentFullName(agent);
  const firstName = agent.accountType === "company" ? name : agent.firstName || name;
  const isCompany = agent.accountType === "company";
  const areas = agentAreas(agent, listings).slice(0, 2).join(", ") || agent.location;
  const time = tenure(agent.createdAt);
  const phone = (agent as { whatsapp?: string }).whatsapp || agent.phone;

  const share = () => Share.share({ message: t("agents.shareText", { name }) }).catch(() => {});
  const goReviews = () => router.push({ pathname: "/agents/reviews", params: { id } });
  const goWrite = () => router.push({ pathname: "/agents/write-review", params: { id } });
  const goListings = () => scroll.current?.scrollTo({ y: listingsY - insets.top - 20, animated: true });
  const whatsapp = () => openWhatsApp(phone, t("agents.message", { name: firstName }));

  const monthYear = (ts: unknown) =>
    toDate(ts)?.toLocaleDateString(locale, { month: "long", year: "numeric" }) ?? "";

  const stats = [
    { value: String(listings.length), label: t("agents.stats.listings", { count: listings.length }), onPress: listings.length ? goListings : undefined },
    {
      value: summary.average != null ? summary.average.toFixed(1) : "—",
      label: t("agents.stats.reviews", { count: summary.count }),
      onPress: summary.count ? goReviews : undefined,
    },
    {
      value: time ? t(`agents.stats.${time.unit}`, { count: time.value }) : t("agents.stats.new"),
      label: t("agents.stats.onFakaba"),
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {isMe ? (
        <View style={[styles.banner, { paddingTop: insets.top + 8, backgroundColor: colors.signalTint }]}>
          <Icon name="eye" size={18} />
          <Text variant="sm" weight="medium" style={styles.flex}>
            {t("agents.yourView")}
          </Text>
          <Pressable hitSlop={10} onPress={() => router.back()} accessibilityRole="button">
            <Text variant="sm" weight="semibold" underline>
              {t("agents.done")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.nav, { paddingTop: insets.top + 6 }]}>
          <IconButton icon="back" accessibilityLabel={t("agents.back")} onPress={() => router.back()} />
          <IconButton icon="share" accessibilityLabel={t("agents.share")} onPress={share} />
        </View>
      )}

      <ScrollView ref={scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Avatar name={name} uri={agent.profileImage} size={88} kind={isCompany ? "company" : "person"} />

        <View style={styles.identity}>
          <Text variant="h1" style={styles.name} accessibilityRole="header">
            {name}
          </Text>
          <View style={styles.metaRow}>
            {agent.verified && (
              <View style={[styles.verified, { backgroundColor: colors.palmTint }]}>
                <View style={[styles.dot, { backgroundColor: colors.palm }]} />
                <Text variant="label" color="palm">
                  {isCompany ? t("agents.verifiedCompany") : t("agents.verifiedAgent")}
                </Text>
              </View>
            )}
            {areas ? (
              <Text variant="sm" color="inkMuted">
                {areas}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.stats}>
          {stats.map((s) => (
            <Pressable
              key={s.label}
              disabled={!s.onPress}
              onPress={s.onPress}
              style={[styles.stat, { borderTopColor: colors.ink }]}
              accessibilityRole={s.onPress ? "button" : undefined}
            >
              <Text variant="h2" style={styles.statValue}>
                {s.value}
              </Text>
              <Text variant="label" color="inkMuted" style={styles.regular}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {summary.tags.length > 0 && (
          <View style={styles.block}>
            <Text variant="caps" color="inkMuted">
              {t("agents.whatTenantsSay").toUpperCase()}
            </Text>
            {summary.tags.slice(0, 3).map(({ tag, share: pct }) => (
              <View key={tag} style={styles.barRow}>
                <Text variant="sm" style={styles.barLabel} numberOfLines={1}>
                  {t(`reviews.tags.${tag}`, { defaultValue: tag })}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.line }]}>
                  <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: colors.ink }]} />
                </View>
                <Text variant="sm" weight="bold" align="right" style={styles.barValue}>
                  {Math.round(pct * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {featured ? (
          <Pressable onPress={goReviews} style={styles.quote} accessibilityRole="button">
            <Text variant="body">“{featured.comment.trim()}”</Text>
            <Text variant="label" color="inkMuted" style={styles.regular}>
              {[featured.userName, monthYear(featured.createdAt)].filter(Boolean).join(" · ")}
            </Text>
          </Pressable>
        ) : summary.count === 0 && !isMe ? (
          <Text variant="base" color="inkMuted">
            {t("agents.noReviewsYet", { name: firstName })}
          </Text>
        ) : null}

        <View style={styles.links}>
          {summary.count > 0 && (
            <Pressable onPress={goReviews} hitSlop={8} accessibilityRole="link">
              <Text variant="sm" weight="semibold" underline>
                {t("agents.seeAllReviews", { count: summary.count })}
              </Text>
            </Pressable>
          )}
          {!isMe && user && (
            <Pressable onPress={goWrite} hitSlop={8} accessibilityRole="link">
              <Text variant="sm" weight="semibold" underline>
                {myReview ? t("agents.editReview") : t("agents.writeReview")}
              </Text>
            </Pressable>
          )}
        </View>

        {listings.length > 0 && (
          <View style={styles.listings} onLayout={(e) => setListingsY(e.nativeEvent.layout.y)}>
            <Text variant="h2">{t("agents.listingsBy", { name: firstName })}</Text>
            <View>
              {listings.map((l, i) => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  saved={isFavorited(l.id)}
                  onToggleSave={toggleFavorite}
                  onPress={(x) => openListing(x.id)}
                  last={i === listings.length - 1}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bar,
          { borderTopColor: colors.line, backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        {isMe ? (
          <>
            <Button
              label={t("agents.shareProfile")}
              variant="outline"
              leading={<Icon name="share" size={18} />}
              onPress={share}
              style={styles.flex}
            />
            <Button
              label={t("agents.editProfile")}
              variant="strong"
              onPress={() => router.push("/settings/edit-profile")}
              style={styles.flex}
            />
          </>
        ) : !listings.length && !phone ? (
          // Nothing to browse and no way to message: make reviewing the action.
          user ? (
            <Button
              label={myReview ? t("agents.editReview") : t("agents.writeReview")}
              variant={myReview ? "outline" : "primary"}
              onPress={goWrite}
              style={styles.flex}
            />
          ) : null
        ) : (
          <>
            {listings.length > 0 && (
              <Button
                label={t("agents.seeListings", { count: listings.length })}
                variant="outline"
                onPress={goListings}
                style={styles.flex}
              />
            )}
            {phone ? (
              <Button
                label={t("agents.whatsapp")}
                variant="palm"
                leading={<Icon name="chat" size={20} color="#FFFFFF" />}
                onPress={whatsapp}
                style={styles.flex}
              />
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

/** The most useful recent review to quote: rated 4+, with a real sentence. */
function pickQuote(reviews?: Review[]) {
  return (reviews ?? []).find((r) => r.rating >= 4 && (r.comment?.trim().length ?? 0) >= 30) ?? null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  regular: { fontFamily: "Inter_400Regular" },
  nav: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 6 },
  banner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: gutter, paddingBottom: 12 },
  body: { paddingHorizontal: gutter, paddingTop: 16, paddingBottom: 32, gap: 24 },
  identity: { gap: 10, marginTop: -8 },
  name: { fontSize: 34, lineHeight: 38 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  verified: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stats: { flexDirection: "row", gap: 16 },
  stat: { flex: 1, borderTopWidth: 2, paddingTop: 12, gap: 2 },
  statValue: { fontSize: 26, lineHeight: 30 },
  block: { gap: 12 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  barLabel: { width: 130 },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  barValue: { width: 40 },
  quote: { gap: 8 },
  links: { flexDirection: "row", gap: 20, flexWrap: "wrap", marginTop: -8 },
  listings: { gap: 4, marginTop: 8 },
  bar: { flexDirection: "row", gap: 12, paddingHorizontal: gutter, paddingTop: 12, borderTopWidth: 1 },
});
