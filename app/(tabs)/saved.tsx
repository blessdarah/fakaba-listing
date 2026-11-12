import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptySavedArt } from "components/illustrations";
import { SavedRow, isUnavailable, priceDrop } from "components/saved/SavedRow";
import { Button } from "components/ui/Button";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { countSimilar, openListing, searchSimilar } from "lib/listing";
import { useAddToFavorites, useFavorites, useRemoveFromFavorites } from "lib/query/useFavorites";
import { useSavedListings, useSearchListings } from "lib/query/useListings";
import { ensureSnapshots, useSavedSnapshots, type SavedSnapshot } from "lib/savedSnapshots";
import type { Listing } from "lib/types";
import { gutter, radius, useTheme } from "theme";

type Row = { id: string; listing?: Listing; snapshot?: SavedSnapshot };

/** "38 — Saved" and "39 — Saved · Empty". */
export default function SavedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const favorites = useFavorites();
  const add = useAddToFavorites();
  const remove = useRemoveFromFavorites();
  const { snapshots, ready: snapshotsReady, qc } = useSavedSnapshots(user?.uid);

  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Hearts tapped off on this screen keep their row (hollow heart) until you
  // leave the tab, so a slip is one tap to undo.
  const [kept, setKept] = useState<string[]>([]);
  useFocusEffect(
    useCallback(
      () => () => {
        setKept([]);
        setEditing(false);
      },
      []
    )
  );

  const favIds = favorites.data;
  const favSet = useMemo(() => new Set(favIds ?? []), [favIds]);

  // Newest first. Kept rows hold their place instead of jumping around.
  const order = useRef<string[]>([]);
  const ids = useMemo(() => {
    const live = [...(favIds ?? [])].reverse();
    if (!kept.length) return (order.current = live);
    const keep = new Set([...live, ...kept]);
    const prev = order.current.filter((id) => keep.has(id));
    const fresh = live.filter((id) => !prev.includes(id));
    return (order.current = [...fresh, ...prev]);
  }, [favIds, kept]);

  const savedQuery = useSavedListings(ids, !!user && favorites.isSuccess && ids.length > 0);
  const byId = useMemo(() => new Map((savedQuery.data ?? []).map((l) => [l.id, l])), [savedQuery.data]);

  const rows: Row[] = useMemo(
    () =>
      ids
        // While a new id is loading, don't flash it as "no longer available".
        .filter((id) => byId.has(id) || !savedQuery.isPlaceholderData)
        .map((id) => ({ id, listing: byId.get(id), snapshot: snapshots?.[id] })),
    [ids, byId, snapshots, savedQuery.isPlaceholderData]
  );

  // First time we see a saved place without a price snapshot, take one now.
  useEffect(() => {
    if (!user || !snapshotsReady || !savedQuery.data || savedQuery.isPlaceholderData) return;
    const missing = savedQuery.data.filter((l) => favSet.has(l.id) && !snapshots?.[l.id]);
    if (missing.length) ensureSnapshots(qc, user.uid, missing);
  }, [user, snapshotsReady, snapshots, savedQuery.data, savedQuery.isPlaceholderData, favSet, qc]);

  const hasUnavailable = rows.some((r) => isUnavailable(r.listing));
  const pool = useSearchListings(hasUnavailable);
  const similarById = useMemo(() => {
    const out = new Map<string, number>();
    if (!pool.data) return out;
    for (const r of rows) {
      if (!isUnavailable(r.listing)) continue;
      out.set(r.id, countSimilar(pool.data, similarKey(r)));
    }
    return out;
  }, [rows, pool.data]);

  const changed = rows.filter(
    (r) => favSet.has(r.id) && (isUnavailable(r.listing) || priceDrop(r.listing, r.snapshot))
  ).length;

  const onToggle = useCallback(
    (id: string) => {
      if (favSet.has(id)) {
        remove.mutate(id);
        setKept((k) => (k.includes(id) ? k : [...k, id]));
      } else {
        add.mutate(id);
      }
    },
    [favSet, add, remove]
  );

  const onRemove = useCallback(
    (id: string) => {
      if (favSet.has(id)) remove.mutate(id);
      setKept((k) => k.filter((x) => x !== id));
    },
    [favSet, remove]
  );

  const onSeeSimilar = useCallback(
    (id: string) => {
      const r = rows.find((x) => x.id === id);
      if (r) searchSimilar(similarKey(r));
    },
    [rows]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([favorites.refetch(), savedQuery.refetch()]);
    setRefreshing(false);
  }, [favorites, savedQuery]);

  const loading = favorites.isPending || (ids.length > 0 && savedQuery.isPending);
  const failed = (favorites.isError && !favorites.data) || (savedQuery.isError && !savedQuery.data);
  const empty = !loading && !failed && rows.length === 0;

  // Leave edit mode once there's nothing left to edit.
  useEffect(() => {
    if (empty) setEditing(false);
  }, [empty]);

  const renderItem = useCallback(
    ({ item, index }: { item: Row; index: number }) => (
      <SavedRow
        id={item.id}
        listing={item.listing}
        snapshot={item.snapshot}
        saved={favSet.has(item.id)}
        editing={editing}
        similar={similarById.get(item.id) ?? 0}
        last={index === rows.length - 1}
        onPress={openListing}
        onToggle={onToggle}
        onRemove={onRemove}
        onSeeSimilar={onSeeSimilar}
      />
    ),
    [favSet, editing, similarById, rows.length, onToggle, onRemove, onSeeSimilar]
  );

  const savedCount = rows.filter((r) => favSet.has(r.id)).length;
  const subtitle = [
    t("feed.places", { count: savedCount }),
    changed ? t("saved.changed", { count: changed }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 12 }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="display" accessibilityRole="header">
            {t("nav.saved")}
          </Text>
          {!loading && !failed && !empty && (
            <Text variant="base" color="inkMuted" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
        {!loading && !failed && !empty && (
          <Pressable
            hitSlop={12}
            onPress={() => setEditing((e) => !e)}
            accessibilityRole="button"
            style={styles.edit}
          >
            <Text variant="sm" weight="semibold" underline>
              {editing ? t("saved.done") : t("saved.edit")}
            </Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <SavedSkeleton />
      ) : failed ? (
        <View style={styles.message}>
          <Text variant="title" align="center">
            {t("saved.errorTitle")}
          </Text>
          <Text variant="base" color="inkMuted" align="center">
            {t("saved.errorBody")}
          </Text>
          <Button label={t("search.retry")} variant="quiet" size="md" onPress={onRefresh} />
        </View>
      ) : empty ? (
        <EmptySaved />
      ) : (
        <Animated.FlatList
          data={rows}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          itemLayoutAnimation={LinearTransition.duration(220)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.inkMuted} />}
        />
      )}
    </View>
  );
}

function similarKey(r: Row) {
  return {
    id: r.id,
    category: r.listing?.category ?? r.snapshot?.category,
    area: r.snapshot?.area || r.listing?.address?.split(",")[0]?.trim() || r.listing?.location || "",
    type: r.listing?.type ?? r.snapshot?.type,
  };
}

/** "39 — Saved · Empty". */
function EmptySaved() {
  const { t } = useTranslation();
  return (
    <View style={styles.empty}>
      <EmptySavedArt />
      <Text variant="h2" align="center" style={styles.emptyTitle}>
        {t("saved.emptyTitle")}
      </Text>
      <Text variant="base" color="inkMuted" align="center" style={styles.emptyBody}>
        {t("saved.emptyBody")}
      </Text>
      <Button
        label={t("saved.emptyCta")}
        onPress={() => router.navigate("/search")}
        style={styles.emptyCta}
      />
    </View>
  );
}

function SavedSkeleton() {
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
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: gutter,
    gap: 12,
  },
  headerText: { flex: 1, gap: 4 },
  subtitle: { lineHeight: 18 },
  edit: { paddingBottom: 4 },
  list: { paddingHorizontal: gutter, paddingTop: 16, paddingBottom: 24 },
  message: { paddingHorizontal: 40, paddingTop: 72, gap: 10, alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 56, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 28, lineHeight: 32, marginTop: 24 },
  emptyBody: { marginTop: 10, maxWidth: 320 },
  emptyCta: { marginTop: 28, alignSelf: "center", paddingHorizontal: 28 },
  skeleton: { paddingHorizontal: gutter, paddingTop: 28, gap: 24 },
  skeletonRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  skeletonThumb: { width: 96, height: 96, borderRadius: radius.md },
  skeletonText: { flex: 1, gap: 8 },
  bone: { height: 14, borderRadius: radius.sm },
});
