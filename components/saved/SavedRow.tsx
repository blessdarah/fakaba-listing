import * as Haptics from "expo-haptics";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { PhotoFill } from "components/home/PhotoFill";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { dealType, formatPrice, specsLine } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import type { SavedSnapshot } from "lib/savedSnapshots";
import type { Listing } from "lib/types";
import { fonts, radius, useTheme } from "theme";

export type SavedRowProps = {
  id: string;
  /** Missing when the owner deleted the listing. */
  listing?: Listing;
  snapshot?: SavedSnapshot;
  /** False after the heart was tapped off; the row stays until you leave the tab. */
  saved: boolean;
  editing: boolean;
  /** Active places like this one nearby, for unavailable rows. */
  similar: number;
  last: boolean;
  onPress: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onSeeSimilar: (id: string) => void;
};

export function isUnavailable(listing?: Listing) {
  return !listing || listing.status !== "active";
}

export function priceDrop(listing?: Listing, snapshot?: SavedSnapshot) {
  return !!listing && !!snapshot && listing.price < snapshot.price;
}

const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

/** "38 — Saved" row: 96 thumb, optional status pill, price/title/meta, fixed trailing action. */
export const SavedRow = memo(function SavedRow(p: SavedRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { listing, snapshot } = p;
  const unavailable = isUnavailable(listing);
  const dropped = priceDrop(listing, snapshot);
  const title = listing?.title || snapshot?.title || t("saved.removedTitle");
  const canOpen = !!listing && !p.editing;

  const trailing = p.editing || unavailable ? (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={`${t("saved.remove")}: ${title}`}
      onPress={() => {
        tap();
        p.onRemove(p.id);
      }}
    >
      <Icon name="close" size={18} color="inkMuted" weight="semibold" />
    </Pressable>
  ) : (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityState={{ selected: p.saved }}
      accessibilityLabel={p.saved ? t("saved.remove") : t("saved.save")}
      onPress={() => {
        tap();
        p.onToggle(p.id);
      }}
    >
      <Icon name={p.saved ? "heartFill" : "heart"} size={22} />
    </Pressable>
  );

  return (
    <Pressable
      onPress={canOpen ? () => p.onPress(p.id) : undefined}
      disabled={!canOpen}
      accessibilityRole={canOpen ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        !p.last && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
        pressed && { opacity: 0.85 },
      ]}
    >
      <PhotoFill
        uri={listing?.imageUrls?.[0]}
        seed={p.id}
        style={[styles.thumb, unavailable && styles.faded]}
      />

      {unavailable ? (
        <View style={styles.text}>
          <View style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text variant="xs" weight="semibold" color="inkMuted">
              {t("saved.unavailable")}
            </Text>
          </View>
          <Text variant="base" weight="semibold" color="inkMuted" numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {(snapshot?.area || listing) && !p.editing && (
            <Pressable hitSlop={8} onPress={() => p.onSeeSimilar(p.id)} accessibilityRole="link" style={styles.link}>
              <Text variant="label" underline numberOfLines={1}>
                {p.similar
                  ? t("saved.seeSimilar", { count: p.similar })
                  : t("saved.searchArea", { area: snapshot?.area || listing?.location || "" })}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.text}>
          {dropped && (
            <View
              style={[styles.pill, styles.dropPill, { backgroundColor: colors.palmTint }]}
              accessible
              accessibilityLabel={t("saved.priceDropped", { price: formatPrice(snapshot!.price) })}
            >
              <Icon name="arrowDown" size={11} color="palm" weight="bold" />
              <Text variant="xs" weight="semibold" color="palm">
                {t("saved.was", { price: formatPrice(snapshot!.price) })}
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text variant="h2" style={styles.price}>
              {formatPrice(listing!.price)}
            </Text>
            <Text variant="label" color="inkMuted" style={styles.unit}>
              {dealType(listing!) === "rent" ? t("feed.perMonth") : t("feed.fcfa")}
            </Text>
          </View>
          <Text variant="base" weight="semibold" numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Text variant="label" color="inkMuted" numberOfLines={1} style={styles.meta}>
            {[
              listing!.address?.split(",")[0]?.trim() || listing!.location,
              specsLine(listing!, { bd: t("feed.bd"), ba: t("feed.ba") }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      )}

      <View style={styles.trailing}>{trailing}</View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 12 },
  thumb: { width: 96, height: 96, borderRadius: radius.md },
  faded: { opacity: 0.4 },
  text: { flex: 1, gap: 3 },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dropPill: { gap: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  unit: { fontFamily: fonts.medium },
  title: { lineHeight: 18 },
  meta: { fontFamily: fonts.regular },
  link: { alignSelf: "flex-start", marginTop: 1 },
  trailing: { width: 32, alignItems: "flex-end", flexShrink: 0 },
});
