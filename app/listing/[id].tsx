import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoPager } from "components/listing/PhotoPager";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { dealType, formatPrice, placeLine } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { openAgent } from "lib/agents";
import { areaOf, countSimilar, ownerName, priceUnit, relativeWhen, searchSimilar, shareListing } from "lib/listing";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useListing, useSearchListings } from "lib/query/useListings";
import { useReviewsByAgent } from "lib/query/useReviews";
import type { Listing } from "lib/types";
import { gutter, radius, useTheme } from "theme";

const GALLERY_HEIGHT = 360;
const SHEET_OVERLAP = 24;

/** "11 — Listing detail" and "65 — Listing · Taken (tenant view)". */
export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { data: listing, isPending, isError, refetch } = useListing(id);
  const { toggleFavorite, isFavorited } = useToggleFavorite();

  // Past the photos, a solid header fades in so the nav stays legible.
  const solidAt = GALLERY_HEIGHT - insets.top - 60;
  const scrollY = useSharedValue(0);
  const [solid, setSolid] = useState(false);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  useAnimatedReaction(
    () => scrollY.value > solidAt,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setSolid, now);
    }
  );
  const headerBg = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [solidAt - 40, solidAt], [0, 1], Extrapolation.CLAMP),
  }));

  if (isPending) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.inkMuted} />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, paddingHorizontal: 40 }]}>
        <Text variant="title" align="center">
          {isError ? t("listing.loadError") : t("listing.notFound")}
        </Text>
        <Text variant="base" color="inkMuted" align="center">
          {t("listing.notFoundBody")}
        </Text>
        <View style={styles.row}>
          {isError && <Button label={t("search.retry")} variant="quiet" size="md" onPress={() => refetch()} />}
          <Button label={t("listing.back")} variant="outline" size="md" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const saved = isFavorited(listing.id);
  const openGallery = (index = 0) =>
    router.push({ pathname: "/listing/gallery", params: { id: listing.id, index: String(index) } });

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={solid ? (isDark ? "light" : "dark") : "light"} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <PhotoPager
          seed={listing.id}
          urls={listing.imageUrls ?? []}
          height={GALLERY_HEIGHT}
          bottomInset={SHEET_OVERLAP}
          onPressPhoto={openGallery}
        />
        <Sheet listing={listing} />
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.headerBg,
          { height: insets.top + 58, backgroundColor: colors.bg, borderBottomColor: colors.line },
          headerBg,
        ]}
      />

      {/* Floating nav over the photos */}
      <View style={[styles.nav, { top: insets.top + 6 }]} pointerEvents="box-none">
        <IconButton icon="back" tone={solid ? "surface" : "bg"} accessibilityLabel={t("listing.back")} onPress={() => router.back()} />
        <View style={styles.navRight}>
          <IconButton icon="share" tone={solid ? "surface" : "bg"} accessibilityLabel={t("listing.share")} onPress={() => shareListing(listing, t)} />
          <IconButton
            icon={saved ? "heartFill" : "heart"}
            tone={solid ? "surface" : "bg"}
            accessibilityLabel={saved ? t("listing.unsave") : t("listing.save")}
            onPress={() => toggleFavorite(listing.id)}
          />
        </View>
      </View>

      {listing.status === "active" ? <ContactBar listing={listing} /> : <TakenBar listing={listing} />}
    </View>
  );
}

function Sheet({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const deal = dealType(listing);
  const taken = listing.status !== "active";
  const isLand = listing.category === "Land";
  const owner = listing.owner as (Listing["owner"] & { businessName?: string; verified?: boolean }) | undefined;
  const { data: reviews } = useReviewsByAgent(listing.ownerId);

  const rating = useMemo(() => {
    if (!reviews?.length) return null;
    return reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
  }, [reviews]);

  const specs = [
    !isLand && listing.bedrooms ? { value: String(listing.bedrooms), label: t("listing.bedrooms", { count: listing.bedrooms }) } : null,
    !isLand && listing.bathrooms ? { value: String(listing.bathrooms), label: t("listing.bathrooms", { count: listing.bathrooms }) } : null,
    listing.size ? { value: `${formatPrice(listing.size)} m²`, label: isLand ? t("listing.plotSize") : t("listing.floorArea") } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  const category = t(`feed.categories.${listing.category}`, { defaultValue: listing.category });
  const roleLabel =
    owner?.accountType === "company"
      ? t("listing.role.company")
      : owner?.role === "agent"
        ? t("listing.role.agent")
        : t("listing.role.owner");
  const place = placeLine(listing);
  const description = listing.description?.trim() ?? "";
  const long = description.length > 180;

  return (
    <View style={[styles.sheet, { backgroundColor: colors.bg, marginTop: -SHEET_OVERLAP }]}>
      <View style={styles.tagRow}>
        {taken ? (
          <SignTag label={t("listing.taken")} tone="sale" />
        ) : (
          <SignTag label={t(`feed.${deal}`)} tone={deal} />
        )}
        <Text variant="label" weight="medium" color="inkMuted" style={styles.flex} numberOfLines={1}>
          {category}
          {listing.createdAt ? ` · ${t("listing.posted", { when: relativeWhen(listing.createdAt, t) })}` : ""}
        </Text>
      </View>

      <View style={styles.titleBlock}>
        <Text variant="h1" style={styles.title} accessibilityRole="header">
          {listing.title}
        </Text>
        {place ? (
          <View style={styles.placeRow}>
            <Icon name="pin" size={16} color="inkMuted" />
            <Text variant="base" color="inkMuted" style={styles.flex}>
              {place}
            </Text>
          </View>
        ) : null}
      </View>

      {specs.length > 0 && (
        <View style={[styles.specs, { borderColor: colors.line }]}>
          {specs.map((s, i) => (
            <View key={s.label} style={[styles.spec, i > 0 && { borderLeftColor: colors.line, borderLeftWidth: 1, paddingLeft: 16 }]}>
              <Text variant="h2" style={styles.specValue}>
                {s.value}
              </Text>
              <Text variant="label" color="inkMuted" style={styles.regular}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {owner && (
        <Pressable
          style={styles.ownerRow}
          onPress={() => openAgent(listing.ownerId)}
          accessibilityRole="button"
          accessibilityLabel={ownerName(owner)}
        >
          <Avatar
            name={ownerName(owner)}
            uri={owner.profileImage}
            size={44}
            kind={owner.accountType === "company" ? "company" : "person"}
          />
          <View style={styles.flex}>
            <View style={styles.inline}>
              <Text variant="base" weight="semibold" numberOfLines={1}>
                {ownerName(owner)}
              </Text>
              {owner.verified && <Icon name="verified" size={14} color="palm" />}
            </View>
            <View style={styles.inline}>
              {rating != null && <Icon name="star" size={12} />}
              <Text variant="label" color="inkMuted" style={styles.regular}>
                {[
                  rating != null ? rating.toFixed(1) : null,
                  reviews?.length ? t("listing.reviews", { count: reviews.length }) : null,
                  roleLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          </View>
          <Icon name="forward" size={18} weight="semibold" />
        </Pressable>
      )}

      {description ? (
        <View style={styles.descBlock}>
          <Text variant="base" numberOfLines={expanded || !long ? undefined : 4}>
            {description}
          </Text>
          {long && (
            <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8} accessibilityRole="button">
              <Text variant="sm" weight="semibold" underline>
                {expanded ? t("listing.readLess") : t("listing.readMore")}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {listing.features?.length ? (
        <View style={styles.features}>
          <Text variant="caps" color="inkMuted">
            {t("listing.features").toUpperCase()}
          </Text>
          {listing.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Icon name="check" size={16} color="palm" weight="bold" />
              <Text variant="base" style={styles.flex}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ContactBar({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const openContact = () => router.push({ pathname: "/listing/contact", params: { id: listing.id } });

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 4, backgroundColor: colors.bg, borderTopColor: colors.line }]}>
      <View style={styles.flex}>
        <Text variant="h2" style={styles.barPrice}>
          {formatPrice(listing.price)}
        </Text>
        <Text variant="label" weight="medium" color="inkMuted">
          {priceUnit(listing, t)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("listing.call")}
        onPress={openContact}
        style={({ pressed }) => [styles.callButton, { borderColor: colors.ink }, pressed && { opacity: 0.85 }]}
      >
        <Icon name="phone" size={20} />
      </Pressable>
      <Button
        label={t("listing.whatsapp")}
        variant="palm"
        leading={<Icon name="chat" size={20} color="#FFFFFF" />}
        onPress={openContact}
      />
    </View>
  );
}

function TakenBar({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: pool } = useSearchListings();
  const area = areaOf(listing) || listing.location;

  const key = { id: listing.id, category: listing.category, area, type: listing.type };
  const similar = useMemo(() => countSimilar(pool ?? [], key), [pool, listing.id, listing.category, area]); // eslint-disable-line react-hooks/exhaustive-deps
  const seeSimilar = () => searchSimilar(key);

  return (
    <View style={[styles.takenBar, { paddingBottom: Math.max(insets.bottom, 12) + 4, backgroundColor: colors.bg, borderTopColor: colors.line }]}>
      <Text variant="label" color="inkMuted" style={styles.regular}>
        {t("listing.takenNote")}
      </Text>
      <Button
        label={similar ? t("listing.seeSimilar", { count: similar, area }) : t("listing.seeSimilarNone", { area })}
        variant="strong"
        onPress={seeSimilar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  flex: { flex: 1 },
  regular: { fontFamily: "Inter_400Regular" },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, borderBottomWidth: 1 },
  nav: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navRight: { flexDirection: "row", gap: 10 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: gutter,
    gap: 20,
  },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  titleBlock: { gap: 8 },
  title: { fontSize: 30, lineHeight: 34, letterSpacing: -0.9 },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  specs: { flexDirection: "row", paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1 },
  spec: { flex: 1, gap: 2 },
  specValue: { fontSize: 22, lineHeight: 28 },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  inline: { flexDirection: "row", alignItems: "center", gap: 4 },
  descBlock: { gap: 8 },
  features: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: gutter,
    borderTopWidth: 1,
  },
  barPrice: { fontSize: 22, lineHeight: 28 },
  callButton: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  takenBar: { paddingTop: 12, paddingHorizontal: gutter, gap: 12, borderTopWidth: 1 },
});
