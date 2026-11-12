import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { StarInput } from "components/agents/Stars";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { agentFullName, publicName, REVIEW_TAGS, type AgentUser } from "lib/agents";
import { useTranslation } from "lib/i18n/useTranslation";
import { useReviewsByAgent, useSaveReview } from "lib/query/useReviews";
import { useUser } from "lib/query/useUsers";
import { fonts, radius, useTheme } from "theme";

/** "51 — Write a review". One review per person per agent; reopening edits it. */
export default function WriteReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, userProfile } = useAuth();
  const { data: agentData } = useUser(id);
  const agent = agentData as AgentUser | null | undefined;
  const { data: reviews } = useReviewsByAgent(id);
  const save = useSaveReview(id);

  const existing = reviews?.find((r) => r.userId === user?.uid) ?? null;
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (existing && !prefilled) {
      setRating(existing.rating);
      setTags(existing.tags ?? []);
      setComment(existing.comment ?? "");
      setPrefilled(true);
    }
  }, [existing, prefilled]);

  const levels = t("reviews.write.levels") as unknown as string[];
  const name = agentFullName(agent ?? undefined);
  const shownAs = publicName(
    userProfile?.firstName ?? user?.displayName?.split(" ")[0],
    userProfile?.lastName ?? user?.displayName?.split(" ").slice(1).join(" "),
    user?.email?.split("@")[0] ?? ""
  );
  const isSelf = user?.uid === id;

  async function post() {
    if (!user || !rating || isSelf) return;
    setError(null);
    try {
      await save.mutateAsync({
        existing,
        review: {
          userId: user.uid,
          agentId: id,
          rating,
          comment: comment.trim(),
          tags,
          userName: shownAs,
          ...(userProfile?.profileImage || user.photoURL
            ? { userImage: (userProfile?.profileImage ?? user.photoURL) as string }
            : {}),
        },
      });
      router.back();
    } catch {
      setError(t("reviews.write.error"));
    }
  }

  return (
    <OnboardingScreen
      contentStyle={styles.content}
      footer={
        <>
          {error && (
            <Text variant="sm" color="danger" align="center">
              {error}
            </Text>
          )}
          <Button
            label={existing ? t("reviews.write.update") : t("reviews.write.post")}
            disabled={!rating || isSelf}
            loading={save.isPending}
            onPress={post}
          />
        </>
      }
    >
      <IconButton icon="close" accessibilityLabel={t("reviews.write.close")} onPress={() => router.back()} />

      <View style={styles.who}>
        <Avatar name={name} uri={agent?.profileImage} size={52} kind={agent?.accountType === "company" ? "company" : "person"} />
        <View style={styles.flex}>
          <Text variant="label" color="inkMuted" style={styles.regular}>
            {t("reviews.write.yourReviewOf")}
          </Text>
          <Text variant="title" style={styles.display} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>

      {isSelf ? (
        <Text variant="base" color="inkMuted">
          {t("reviews.write.own")}
        </Text>
      ) : (
        <>
          <View style={styles.block}>
            <Text variant="h1" accessibilityRole="header">
              {t("reviews.write.title")}
            </Text>
            <View style={styles.stars}>
              <StarInput value={rating} onChange={setRating} labels={levels} size={42} />
              {rating > 0 && (
                <Text variant="base" weight="semibold">
                  {levels[rating - 1]}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.block}>
            <Text variant="caps" color="inkMuted">
              {t("reviews.write.standOut").toUpperCase()}
            </Text>
            <View style={styles.chips}>
              {REVIEW_TAGS.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={t(`reviews.tags.${tag}`)}
                    selected={on}
                    checkWhenSelected
                    onPress={() => setTags(on ? tags.filter((x) => x !== tag) : [...tags, tag])}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text variant="label">{t("reviews.write.tellMore")}</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t("reviews.write.placeholder")}
              placeholderTextColor={colors.inkSubtle}
              selectionColor={colors.ink}
              multiline
              maxLength={600}
              textAlignVertical="top"
              style={[styles.textarea, { backgroundColor: colors.surface, color: colors.ink }]}
              accessibilityLabel={t("reviews.write.tellMore")}
            />
            {shownAs ? (
              <Text variant="label" color="inkMuted" style={styles.regular}>
                {t("reviews.write.shownAs", { name: shownAs })}
              </Text>
            ) : null}
          </View>
        </>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 28 },
  flex: { flex: 1 },
  regular: { fontFamily: fonts.regular },
  display: { fontFamily: fonts.display },
  who: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: -4 },
  block: { gap: 14 },
  stars: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  textarea: {
    minHeight: 112,
    borderRadius: radius.md,
    padding: 16,
    paddingTop: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
});
