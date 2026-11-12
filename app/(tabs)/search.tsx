import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListingRow } from "components/home/ListingCards";
import { EmptySearchArt } from "components/illustrations";
import { FilterPills } from "components/search/FilterPills";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { openListing } from "lib/listing";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useSearchListings } from "lib/query/useListings";
import {
  activeFilterCount,
  applyFilters,
  resetFilters,
  setFilters,
  useSearchFilters,
  type SearchFilters,
  type SortKey,
} from "lib/searchFilters";
import type { Listing } from "lib/types";
import { fonts, gutter, radius, useTheme } from "theme";

const SORTS: SortKey[] = ["newest", "priceAsc", "priceDesc"];

/** "30 — Search · Results" and "33 — Search · No results". */
export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const filters = useSearchFilters();
  const pool = useSearchListings();
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  const [refreshing, setRefreshing] = useState(false);

  const results = useMemo(() => applyFilters(pool.data ?? [], filters), [pool.data, filters]);
  const count = activeFilterCount(filters);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await pool.refetch();
    setRefreshing(false);
  }, [pool]);

  const pickSort = () => {
    const labels = SORTS.map((s) => t(`search.sort.${s}`));
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: t("search.sort.title"), options: [...labels, t("common.cancel")], cancelButtonIndex: labels.length },
        (i) => i < SORTS.length && setFilters({ sort: SORTS[i] })
      );
    } else {
      Alert.alert(
        t("search.sort.title"),
        undefined,
        SORTS.map((s, i) => ({ text: labels[i], onPress: () => setFilters({ sort: s }) })),
        { cancelable: true }
      );
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <View style={styles.rowWrap}>
        <ListingRow
          listing={item}
          saved={isFavorited(item.id)}
          onToggleSave={toggleFavorite}
          onPress={(l) => openListing(l.id)}
          last={index === results.length - 1}
        />
      </View>
    ),
    [isFavorited, toggleFavorite, results.length]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 4 }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Search header */}
      <View style={styles.header}>
        <View style={[styles.input, { backgroundColor: colors.surface }]}>
          <Icon name="search" size={20} />
          <TextInput
            value={filters.query}
            onChangeText={(query) => setFilters({ query })}
            placeholder={t("search.placeholder")}
            placeholderTextColor={colors.inkSubtle}
            selectionColor={colors.ink}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.inputText, { color: colors.ink }]}
            accessibilityLabel={t("search.placeholder")}
          />
          {filters.query ? (
            <Pressable hitSlop={10} onPress={() => setFilters({ query: "" })} accessibilityLabel={t("search.clear")}>
              <Icon name="close" size={16} color="inkMuted" weight="semibold" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push("/filters")}
          accessibilityRole="button"
          accessibilityLabel={count ? `${t("search.filters")} (${count})` : t("search.filters")}
          style={[styles.filterButton, { backgroundColor: colors.ink }]}
        >
          <Icon name="filters" size={20} color="onInk" />
          {count > 0 && (
            <View style={[styles.badge, { borderColor: colors.bg }]}>
              <Text variant="caps" weight="bold" color="#121212" style={styles.badgeText}>
                {count}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.pills}>
        <FilterPills filters={filters} />
      </View>

      {pool.isPending ? (
        <ResultsSkeleton />
      ) : pool.isError && !pool.data ? (
        <View style={styles.message}>
          <Text variant="title" align="center">
            {t("search.errorTitle")}
          </Text>
          <Text variant="base" color="inkMuted" align="center">
            {t("search.errorBody")}
          </Text>
          <Button label={t("search.retry")} variant="quiet" size="md" onPress={() => pool.refetch()} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(l) => l.id}
          renderItem={renderItem}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.inkMuted} />}
          ListHeaderComponent={
            results.length ? (
              <View style={styles.resultsBar}>
                <View style={styles.count}>
                  <Text variant="h2" style={styles.countNumber}>
                    {formatPrice(results.length)}
                  </Text>
                  <Text variant="sm" color="inkMuted">
                    {t("search.places", { count: results.length })}
                  </Text>
                </View>
                <Pressable onPress={pickSort} hitSlop={10} style={styles.sort} accessibilityRole="button">
                  <Text variant="sm" weight="semibold">
                    {t(`search.sort.${filters.sort}`)}
                  </Text>
                  <Icon name="chevronDown" size={12} weight="bold" />
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={<NoResults filters={filters} pool={pool.data ?? []} />}
        />
      )}
    </View>
  );
}

/** "33 — Search · No results": illustration + one-tap ways to loosen the search. */
function NoResults({ filters, pool }: { filters: SearchFilters; pool: Listing[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const suggestions = useMemo(() => {
    const out: { key: string; label: string; patch: Partial<SearchFilters> }[] = [];
    if (filters.maxPrice != null) {
      const raised = Math.ceil((filters.maxPrice * 1.6) / 5000) * 5000;
      out.push({ key: "max", label: t("search.raiseMax", { price: formatPrice(raised) }), patch: { maxPrice: raised } });
    }
    if (filters.categories.length) out.push({ key: "cat", label: t("search.dropCategory"), patch: { categories: [] } });
    if (filters.minBedrooms != null) out.push({ key: "beds", label: t("search.dropBeds"), patch: { minBedrooms: null } });
    if (filters.query.trim()) out.push({ key: "q", label: t("search.searchAll"), patch: { query: "" } });
    return out
      .map((s) => ({ ...s, count: applyFilters(pool, { ...filters, ...s.patch }).length }))
      .filter((s) => s.count > 0)
      .slice(0, 3);
  }, [filters, pool, t]);

  return (
    <View style={styles.empty}>
      <EmptySearchArt />
      <Text variant="h2" align="center" style={styles.emptyTitle}>
        {t("search.emptyTitle")}
      </Text>
      <Text variant="base" color="inkMuted" align="center" style={styles.emptyBody}>
        {t("search.emptyBody")}
      </Text>
      <View style={styles.suggestions}>
        {suggestions.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => setFilters(s.patch)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.suggestion, { borderColor: colors.line }, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.flex}>
              <Text variant="base" weight="semibold">
                {s.label}
              </Text>
              <Text variant="label" color="inkMuted" style={styles.regular}>
                {t("feed.places", { count: s.count })}
              </Text>
            </View>
            <Icon name="forward" size={16} weight="semibold" />
          </Pressable>
        ))}
        {!suggestions.length && (
          <Button label={t("search.clearAll")} variant="quiet" onPress={() => resetFilters()} />
        )}
      </View>
    </View>
  );
}

function ResultsSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={styles.skeleton} accessibilityRole="progressbar">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={[styles.skeletonThumb, { backgroundColor: colors.skeleton }]} />
          <View style={styles.skeletonText}>
            <View style={[styles.bone, { width: 110, height: 20, backgroundColor: colors.skeleton }]} />
            <View style={[styles.bone, { width: 180, backgroundColor: colors.skeleton }]} />
            <View style={[styles.bone, { width: 140, backgroundColor: colors.skeleton }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  regular: { fontFamily: fonts.regular },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: gutter },
  input: {
    flex: 1,
    height: 52,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  inputText: { flex: 1, height: "100%", fontFamily: fonts.medium, fontSize: 15 },
  filterButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { letterSpacing: 0 },
  pills: { paddingTop: 12 },
  resultsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: gutter,
    paddingTop: 16,
    paddingBottom: 4,
  },
  count: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  countNumber: { fontSize: 22, lineHeight: 28 },
  sort: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowWrap: { paddingHorizontal: gutter },
  message: { paddingHorizontal: 40, paddingTop: 72, gap: 10, alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 28, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 28, lineHeight: 32, marginTop: 8 },
  emptyBody: { marginTop: 8, maxWidth: 300 },
  suggestions: { alignSelf: "stretch", gap: 10, marginTop: 24 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  skeleton: { paddingHorizontal: gutter, paddingTop: 20, gap: 20 },
  skeletonRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  skeletonThumb: { width: 96, height: 96, borderRadius: radius.md },
  skeletonText: { flex: 1, gap: 8 },
  bone: { height: 14, borderRadius: radius.sm },
});
