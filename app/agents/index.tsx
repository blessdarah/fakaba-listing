import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star } from "components/agents/Stars";
import { rankEntries, useAgentDirectory, type DirectoryEntry } from "components/agents/useAgentDirectory";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { openAgent } from "lib/agents";
import { useTranslation } from "lib/i18n/useTranslation";
import { fonts, gutter, radius, useTheme } from "theme";

type Filter = "all" | "verified" | "topRated" | "nearby" | `cat:${string}`;
const CATEGORY_FILTERS = ["Land", "Commercial", "House", "Apartment", "Room"];

function normalise(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** "40 — Agents directory": search by name or neighbourhood, quick filter chips. */
export default function AgentsDirectory() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { userProfile } = useAuth();
  const town = userProfile?.location?.trim() ?? "";
  const { entries, isPending, isError, refetch } = useAgentDirectory();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const inTown = useCallback(
    (e: DirectoryEntry) =>
      !!town &&
      normalise([e.agent.location, ...e.areas, ...e.listings.map((l) => l.location)].join(" ")).includes(normalise(town)),
    [town]
  );

  const results = useMemo(() => {
    const words = normalise(query).split(/[\s,]+/).filter(Boolean);
    const filtered = entries.filter((e) => {
      if (filter === "verified" && !e.agent.verified) return false;
      if (filter === "topRated" && !((e.reviews?.average ?? 0) >= 4.5 && (e.reviews?.count ?? 0) >= 3)) return false;
      if (filter === "nearby" && !inTown(e)) return false;
      if (filter.startsWith("cat:") && !e.categories.has(filter.slice(4))) return false;
      if (!words.length) return true;
      const hay = normalise([e.name, e.agent.location, ...e.areas, ...e.listings.map((l) => `${l.address} ${l.location}`)].join(" "));
      return words.every((w) => hay.includes(w));
    });
    return rankEntries(filtered);
  }, [entries, query, filter, inTown]);

  const verifiedCount = entries.filter((e) => e.agent.verified).length;
  const availableCategories = CATEGORY_FILTERS.filter((c) => entries.some((e) => e.categories.has(c)));

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: t("agents.filters.all") },
    ...(town ? [{ id: "nearby" as Filter, label: t("agents.filters.nearby", { town }) }] : []),
    ...(verifiedCount ? [{ id: "verified" as Filter, label: t("agents.filters.verified") }] : []),
    { id: "topRated", label: t("agents.filters.topRated") },
    ...availableCategories.map((c) => ({ id: `cat:${c}` as Filter, label: t(`feed.categories.${c}`) })),
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 4 }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FlatList
        data={isPending || isError ? [] : results}
        keyExtractor={(e) => e.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.inkMuted} />}
        ListHeaderComponent={
          <View>
            <View style={styles.top}>
              <IconButton
                icon="back"
                accessibilityLabel={t("agents.back")}
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              />
            </View>
            <View style={styles.titleBlock}>
              <Text variant="h1" accessibilityRole="header">
                {filter === "nearby" && town ? t("agents.titleIn", { town }) : t("agents.title")}
              </Text>
              {!isPending && (
                <Text variant="base" color="inkMuted">
                  {[t("agents.count", { count: entries.length }), verifiedCount ? t("agents.verifiedCount", { count: verifiedCount }) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
            </View>
            <View style={[styles.search, { backgroundColor: colors.surface }]}>
              <Icon name="search" size={20} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t("agents.placeholder")}
                placeholderTextColor={colors.inkSubtle}
                selectionColor={colors.ink}
                autoCorrect={false}
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.ink }]}
                accessibilityLabel={t("agents.placeholder")}
              />
              {query ? (
                <Pressable hitSlop={10} onPress={() => setQuery("")} accessibilityLabel={t("search.clear")}>
                  <Icon name="close" size={16} color="inkMuted" weight="semibold" />
                </Pressable>
              ) : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {chips.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  selected={filter === c.id}
                  onPress={() => setFilter(filter === c.id && c.id !== "all" ? "all" : c.id)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item, index }) => <AgentRow entry={item} last={index === results.length - 1} />}
        ListEmptyComponent={
          isPending ? (
            <DirectorySkeleton />
          ) : isError ? (
            <View style={styles.message}>
              <Text variant="title" align="center">
                {t("agents.errorTitle")}
              </Text>
              <Button label={t("agents.retry")} variant="quiet" size="md" onPress={() => refetch()} />
            </View>
          ) : (
            <View style={styles.message}>
              <Text variant="title" align="center">
                {t("agents.emptyTitle")}
              </Text>
              <Text variant="base" color="inkMuted" align="center">
                {t("agents.emptyBody")}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

function AgentRow({ entry, last }: { entry: DirectoryEntry; last: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { agent, reviews, listings, areas } = entry;
  const isCompany = agent.accountType === "company";

  const listingsLabel = t("agents.listings", { count: listings.length });
  const placeLine = [isCompany ? t("agents.company") : null, areas.slice(0, 2).join(", ") || agent.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={() => openAgent(entry.id)}
      accessibilityRole="button"
      accessibilityLabel={entry.name}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Avatar name={entry.name} uri={agent.profileImage} size={56} kind={isCompany ? "company" : "person"} />
      <View style={styles.rowText}>
        <View style={styles.inline}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.shrink}>
            {entry.name}
          </Text>
          {agent.verified && <Icon name="verified" size={15} color="palm" />}
        </View>
        <View style={styles.inline}>
          {reviews?.average != null ? (
            <>
              <Star size={12} />
              <Text variant="label">{reviews.average.toFixed(1)}</Text>
              <Text variant="label" color="inkMuted" style={styles.regular}>
                ({reviews.count}) · {listingsLabel}
              </Text>
            </>
          ) : (
            <Text variant="label" color="inkMuted" style={styles.regular}>
              {t("agents.newOnFakaba")} · {listingsLabel}
            </Text>
          )}
        </View>
        {placeLine ? (
          <Text variant="label" color="inkMuted" style={styles.regular} numberOfLines={1}>
            {placeLine}
          </Text>
        ) : null}
      </View>
      <Icon name="forward" size={16} weight="semibold" />
    </Pressable>
  );
}

function DirectorySkeleton() {
  const { colors } = useTheme();
  return (
    <View style={styles.skeleton} accessibilityRole="progressbar">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={[styles.skeletonAvatar, { backgroundColor: colors.skeleton }]} />
          <View style={styles.rowText}>
            <View style={[styles.bone, { width: 150, backgroundColor: colors.skeleton }]} />
            <View style={[styles.bone, { width: 120, backgroundColor: colors.skeleton }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { paddingHorizontal: gutter, paddingTop: 4 },
  titleBlock: { paddingHorizontal: gutter, paddingTop: 20, gap: 4 },
  search: {
    marginHorizontal: gutter,
    marginTop: 20,
    height: 52,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: { flex: 1, height: "100%", fontFamily: fonts.regular, fontSize: 15 },
  chips: { paddingHorizontal: gutter, paddingTop: 16, paddingBottom: 8, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, marginHorizontal: gutter },
  rowText: { flex: 1, gap: 3 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  shrink: { flexShrink: 1 },
  regular: { fontFamily: fonts.regular },
  message: { paddingHorizontal: 40, paddingTop: 48, gap: 10, alignItems: "center" },
  skeleton: { paddingHorizontal: gutter, paddingTop: 12, gap: 20 },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  skeletonAvatar: { width: 56, height: 56, borderRadius: 28 },
  bone: { height: 14, borderRadius: radius.sm },
});
