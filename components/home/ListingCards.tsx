import * as Haptics from "expo-haptics";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "components/ui/Icon";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { dealType, formatPrice, placeLine, specsLine } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import type { Listing } from "lib/types";
import { radius, useTheme } from "theme";
import { PhotoFill } from "./PhotoFill";

type CardProps = {
  listing: Listing;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onPress?: (listing: Listing) => void;
};

function Price({ listing, size = "lg" }: { listing: Listing; size?: "lg" | "md" }) {
  const { t } = useTranslation();
  const deal = dealType(listing);
  return (
    <View style={styles.priceRow}>
      <Text variant="h2" style={size === "md" && styles.priceMd}>
        {formatPrice(listing.price)}
      </Text>
      <Text variant="sm" weight="medium" color="inkMuted">
        {deal === "rent" ? t("feed.perMonth") : t("feed.fcfa")}
      </Text>
    </View>
  );
}

function HeartButton({ saved, onPress }: { saved?: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!saved }}
      accessibilityLabel={saved ? "Remove from saved" : "Save"}
      hitSlop={8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[styles.heart, { backgroundColor: colors.float }]}
    >
      <Icon name={saved ? "heartFill" : "heart"} size={18} color="ink" />
    </Pressable>
  );
}

/** Feed card: 300 wide, 230 photo with sign + heart + page dots, details under. */
export const FeedCard = memo(function FeedCard({ listing, saved, onToggleSave, onPress }: CardProps) {
  const { t } = useTranslation();
  const deal = dealType(listing);
  const photos = listing.imageUrls?.length ?? 0;
  const specs = specsLine(listing, { bd: t("feed.bd"), ba: t("feed.ba") });

  return (
    <Pressable
      onPress={onPress ? () => onPress(listing) : undefined}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={styles.feedCard}
    >
      <PhotoFill uri={listing.imageUrls?.[0]} seed={listing.id} style={styles.feedPhoto}>
        <View style={styles.photoTop}>
          <SignTag label={t(`feed.${deal}`)} tone={deal} />
          {onToggleSave && <HeartButton saved={saved} onPress={() => onToggleSave(listing.id)} />}
        </View>
        {photos > 1 && (
          <View style={styles.dots}>
            {Array.from({ length: Math.min(photos, 4) }).map((_, i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
        )}
      </PhotoFill>
      <View style={styles.details}>
        <Price listing={listing} />
        <Text variant="body" weight="semibold" numberOfLines={1} style={styles.title}>
          {listing.title}
        </Text>
        <Text variant="sm" color="inkMuted" numberOfLines={1}>
          {[placeLine(listing), specs].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </Pressable>
  );
});

/** Sale card: 180 wide, square-ish photo, compact price + title + place. */
export const SaleCard = memo(function SaleCard({ listing, onPress }: CardProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress ? () => onPress(listing) : undefined}
      disabled={!onPress}
      style={styles.saleCard}
    >
      <PhotoFill uri={listing.imageUrls?.[0]} seed={listing.id} style={styles.salePhoto}>
        <View style={styles.photoTop}>
          <SignTag label={t("feed.sale")} tone="sale" />
        </View>
      </PhotoFill>
      <View style={styles.saleDetails}>
        <Text variant="title" style={styles.salePrice}>
          {formatPrice(listing.price)}
        </Text>
        <Text variant="base" weight="semibold" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text variant="xs" color="inkMuted" numberOfLines={1} style={styles.saleLocation}>
          {listing.address || listing.location}
        </Text>
      </View>
    </Pressable>
  );
});

/** Row: 96 thumb, price/title/place+specs, heart in a fixed trailing slot. */
export const ListingRow = memo(function ListingRow({ listing, saved, onToggleSave, onPress, last }: CardProps & { last?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const specs = specsLine(listing, { bd: t("feed.bd"), ba: t("feed.ba") });
  const place = listing.address || listing.location;
  return (
    <Pressable
      onPress={onPress ? () => onPress(listing) : undefined}
      disabled={!onPress}
      style={[styles.row, !last && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 }]}
    >
      <PhotoFill uri={listing.imageUrls?.[0]} seed={listing.id} style={styles.thumb} />
      <View style={styles.rowText}>
        <Price listing={listing} size="md" />
        <Text variant="base" weight="semibold" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text variant="label" color="inkMuted" numberOfLines={1} style={styles.rowMeta}>
          {[place, specs].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <View style={styles.trailing}>
        {onToggleSave && (
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityState={{ selected: !!saved }}
            accessibilityLabel={saved ? "Remove from saved" : "Save"}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onToggleSave(listing.id);
            }}
          >
            <Icon name={saved ? "heartFill" : "heart"} size={20} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  priceMd: { fontSize: 20, lineHeight: 24 },
  feedCard: { width: 300, gap: 14 },
  feedPhoto: { height: 230, borderRadius: radius.lg, padding: 14, justifyContent: "space-between" },
  photoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heart: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", alignSelf: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.6)" },
  dotActive: { width: 16, backgroundColor: "#FFFFFF" },
  details: { gap: 4 },
  title: { lineHeight: 22 },
  saleCard: { width: 228, gap: 12 },
  salePhoto: { height: 150, borderRadius: radius.lg, padding: 12 },
  saleDetails: { gap: 2 },
  salePrice: { fontFamily: "BricolageGrotesque_800ExtraBold" },
  saleLocation: { marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 12 },
  thumb: { width: 96, height: 96, borderRadius: radius.md },
  rowText: { flex: 1, gap: 2 },
  rowMeta: { fontFamily: "Inter_400Regular" },
  trailing: { width: 28, alignItems: "flex-end" },
});
