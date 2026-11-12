import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, type Region as MapRegion } from "react-native-maps";
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoFill } from "components/home/PhotoFill";
import { PricePin } from "components/map/PricePin";
import { Icon } from "components/ui/Icon";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { dealType, formatPrice, specsLine } from "lib/format";
import {
  DEFAULT_REGION,
  distanceM,
  geocodeTown,
  inRegion,
  regionFor,
  requestPosition,
  useKnownPosition,
  useListingCoords,
  type LatLng,
  type Region,
} from "lib/geo";
import { useTranslation } from "lib/i18n/useTranslation";
import { areaOf, openListing } from "lib/listing";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useSearchListings } from "lib/query/useListings";
import { activeFilterCount, applyFilters, useSearchFilters, type SearchFilters } from "lib/searchFilters";
import type { Listing } from "lib/types";
import { fonts, radius, useTheme } from "theme";

/** "31 — Search · Map". Same pool and filters as the Search list. */
export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { userProfile } = useAuth();
  const town: string = userProfile?.location?.trim() ?? "";
  const filters = useSearchFilters();
  const pool = useSearchListings();
  const mapRef = useRef<MapView>(null);

  // "Search this area": once set, pins come from the drawn region instead of the text query.
  const [area, setArea] = useState<Region | null>(null);
  const [moved, setMoved] = useState<Region | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useKnownPosition();

  const matching = useMemo(
    () => applyFilters(pool.data ?? [], area ? { ...filters, query: "" } : filters),
    [pool.data, filters, area]
  );
  const { placed, pending } = useListingCoords(matching);
  const pins = useMemo(
    () =>
      matching
        .filter((l) => placed[l.id] && (!area || inRegion(placed[l.id], area)))
        .map((l) => ({ listing: l, at: placed[l.id] })),
    [matching, placed, area]
  );
  const selected = pins.find((p) => p.listing.id === selectedId) ?? null;

  // Before any pin lands, centre on the typed town / the user's town.
  const [ready, setReady] = useState(false);
  const [townRegion, setTownRegion] = useState<Region | null>(null);
  useEffect(() => {
    const place = filters.query.trim() || town;
    if (!place) return;
    geocodeTown(place).then((c) => c && setTownRegion({ ...c, latitudeDelta: 0.08, longitudeDelta: 0.08 }));
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One place decides the camera: fit the pins (again once geocoding finishes or
  // filters change), else the town. Waits for the map, which ignores earlier calls,
  // and leaves the camera alone while the user explores a drawn area.
  const framedFor = useRef("");
  useEffect(() => {
    if (!ready || area) return;
    const target = pins.length ? regionFor(pins.map((p) => p.at)) : townRegion;
    if (!target) return;
    const key = pins.length ? `pins|${JSON.stringify(filters)}|${pending === 0}` : "town";
    if (framedFor.current === key) return;
    framedFor.current = key;
    mapRef.current?.animateToRegion(target, 400);
  }, [ready, area, pins, townRegion, filters, pending]);

  const onRegionChangeComplete = useCallback((r: MapRegion, details?: { isGesture?: boolean }) => {
    // iOS doesn't always report isGesture; treat any settle after load as a possible pan.
    if (details?.isGesture === false) return;
    setMoved(r);
  }, []);

  const searchThisArea = () => {
    if (!moved) return;
    Haptics.selectionAsync().catch(() => {});
    setArea(moved);
    setMoved(null);
    setSelectedId(null);
  };

  const locate = async () => {
    const p = await requestPosition();
    if (!p) return;
    setPosition(p);
    mapRef.current?.animateToRegion({ ...p, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 400);
  };

  const count = activeFilterCount(filters);
  const title = area ? t("map.thisArea") : filters.query.trim() || town || t("map.allPlaces");
  const summary = useFilterSummary(filters);
  const showSearchArea = !!moved && (!area || moved !== area);

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        onMapReady={() => setReady(true)}
        // Keep Apple's legal label clear of the bottom controls and card.
        legalLabelInsets={{ top: 0, left: 16, right: 0, bottom: (selected ? 190 : 72) + insets.bottom }}
        mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
        userInterfaceStyle={isDark ? "dark" : "light"}
        showsUserLocation={!!position}
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        showsCompass={false}
        toolbarEnabled={false}
        pitchEnabled={false}
        onPress={() => setSelectedId(null)}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {pins.map(({ listing, at }) => (
          <Marker
            key={listing.id}
            coordinate={at}
            anchor={{ x: 0.5, y: listing.id === selectedId ? 1 : 0.5 }}
            zIndex={listing.id === selectedId ? 10 : 1}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.selectionAsync().catch(() => {});
              setSelectedId(listing.id);
            }}
          >
            <PricePin price={listing.price} selected={listing.id === selectedId} approximate={at.approximate} />
          </Marker>
        ))}
      </MapView>

      {/* Header pill + filters */}
      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <View style={[styles.pillHeader, styles.shadow, { backgroundColor: colors.bg }]}>
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("map.back")}
              style={styles.back}
            >
              <Icon name="back" size={18} weight="semibold" />
            </Pressable>
            <View style={styles.flex}>
              <Text variant="base" weight="semibold" numberOfLines={1}>
                {title}
              </Text>
              {summary ? (
                <Text variant="xs" color="inkMuted" numberOfLines={1}>
                  {summary}
                </Text>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/filters")}
            accessibilityRole="button"
            accessibilityLabel={count ? `${t("search.filters")} (${count})` : t("search.filters")}
            style={[styles.round, styles.shadow, { backgroundColor: colors.ink }]}
          >
            <Icon name="filters" size={20} color="onInk" />
            {count > 0 && (
              <View style={[styles.badge, { borderColor: colors.ink }]}>
                <Text variant="caps" weight="bold" color="#121212" style={styles.badgeText}>
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {showSearchArea ? (
          <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={styles.centerRow}>
            <Pressable
              onPress={searchThisArea}
              accessibilityRole="button"
              style={[styles.chip, styles.shadow, { backgroundColor: colors.bg }]}
            >
              <Icon name="search" size={14} weight="semibold" />
              <Text variant="sm" weight="semibold">
                {t("map.searchArea")}
              </Text>
            </Pressable>
          </Animated.View>
        ) : pending > 0 ? (
          <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={styles.centerRow}>
            <View style={[styles.chip, styles.shadow, { backgroundColor: colors.bg }]}>
              <Text variant="xs" color="inkMuted">
                {t("map.placing", { count: pending })}
              </Text>
            </View>
          </Animated.View>
        ) : !pool.isPending && !pins.length ? (
          <Animated.View entering={FadeIn.duration(160)} style={styles.centerRow}>
            <View style={[styles.chip, styles.shadow, { backgroundColor: colors.bg }]}>
              <Text variant="xs" color="inkMuted">
                {area ? t("map.noneHere") : t("map.none")}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </View>

      {/* Bottom: list toggle, locate, selected card */}
      <View style={[styles.bottom, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
        <View style={styles.controls} pointerEvents="box-none">
          <View style={styles.flex} />
          <Pressable
            onPress={() => router.navigate("/search")}
            accessibilityRole="button"
            style={[styles.listButton, styles.shadow, { backgroundColor: colors.ink }]}
          >
            <Icon name="list" size={16} color="signal" weight="semibold" />
            <Text variant="sm" weight="semibold" color="onInk">
              {t("map.list")}
            </Text>
          </Pressable>
          <View style={[styles.flex, styles.end]}>
            <Pressable
              onPress={locate}
              accessibilityRole="button"
              accessibilityLabel={t("map.locate")}
              style={[styles.round, styles.shadow, { backgroundColor: colors.bg }]}
            >
              <Icon name="locate" size={20} />
            </Pressable>
          </View>
        </View>

        {selected ? (
          <Animated.View key={selected.listing.id} entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(150)}>
            <SelectedCard listing={selected.listing} at={selected.at} position={position} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

function useFilterSummary(f: SearchFilters) {
  const { t } = useTranslation();
  const parts: string[] = [];
  if (f.deal) parts.push(t(f.deal === "sale" ? "filters.buy" : `filters.${f.deal}`));
  if (f.categories.length === 1) parts.push(t(`setup.interests.${f.categories[0]}`));
  else if (f.categories.length > 1) parts.push(t("map.types", { count: f.categories.length }));
  if (f.maxPrice != null) parts.push(t("map.under", { price: formatPrice(f.maxPrice) }));
  if (f.minBedrooms != null) parts.push(`${f.minBedrooms}+ ${t("feed.bd")}`);
  return parts.join(" · ");
}

function SelectedCard({ listing, at, position }: { listing: Listing; at: LatLng; position: LatLng | null }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  const deal = dealType(listing);
  const saved = isFavorited(listing.id);
  const specs = specsLine(listing, { bd: t("feed.bd"), ba: t("feed.ba") });
  const meters = position ? distanceM(position, at) : null;
  const away =
    meters == null
      ? null
      : meters < 1000
        ? t("map.mAway", { m: Math.max(50, Math.round(meters / 50) * 50) })
        : t("map.kmAway", { km: (meters / 1000).toFixed(meters < 10_000 ? 1 : 0).replace(".", ",") });

  return (
    <Pressable
      onPress={() => openListing(listing.id)}
      accessibilityRole="button"
      style={[styles.card, styles.shadow, { backgroundColor: colors.bg }]}
    >
      <PhotoFill uri={listing.imageUrls?.[0]} seed={listing.id} style={styles.cardPhoto}>
        <SignTag label={t(`feed.${deal}`)} tone={deal} />
      </PhotoFill>
      <View style={styles.cardText}>
        <View style={styles.priceRow}>
          <Text variant="h2" style={styles.price}>
            {formatPrice(listing.price)}
          </Text>
          <Text variant="label" color="inkMuted" style={styles.unit}>
            {deal === "rent" ? t("map.perMonthShort") : t("feed.fcfa")}
          </Text>
        </View>
        <Text variant="base" weight="semibold" numberOfLines={2} style={styles.cardTitle}>
          {listing.title}
        </Text>
        <Text variant="label" color="inkMuted" numberOfLines={1} style={styles.regular}>
          {[areaOf(listing), specs].filter(Boolean).join(" · ")}
        </Text>
        {away ? (
          <View style={styles.away}>
            <Icon name="clock" size={12} color="palm" weight="semibold" />
            <Text variant="xs" weight="semibold" color="palm">
              {away}
            </Text>
          </View>
        ) : null}
      </View>
      <Pressable
        hitSlop={12}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          toggleFavorite(listing.id);
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: saved }}
        accessibilityLabel={saved ? t("listing.unsave") : t("listing.save")}
        style={styles.cardHeart}
      >
        <Icon name={saved ? "heartFill" : "heart"} size={20} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  end: { alignItems: "flex-end" },
  regular: { fontFamily: fonts.regular },
  shadow: {
    shadowColor: "#121212",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  top: { position: "absolute", left: 16, right: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pillHeader: {
    flex: 1,
    height: 56,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 20,
    gap: 10,
  },
  back: { width: 28, alignItems: "center" },
  round: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
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
  centerRow: { alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.full,
  },
  bottom: { position: "absolute", left: 16, right: 16, gap: 14 },
  controls: { flexDirection: "row", alignItems: "center" },
  listButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radius.full,
  },
  card: { flexDirection: "row", gap: 14, padding: 10, borderRadius: radius.lg },
  cardPhoto: { width: 112, height: 112, borderRadius: radius.md, padding: 8 },
  cardText: { flex: 1, gap: 2, paddingVertical: 4, paddingRight: 24 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  unit: { fontFamily: fonts.medium },
  cardTitle: { lineHeight: 19 },
  away: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cardHeart: { position: "absolute", top: 14, right: 14 },
});
