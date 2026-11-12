import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Svg, { G, Path, Rect } from "react-native-svg";
import { PricePin } from "components/map/PricePin";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { regionFor, useListingCoords } from "lib/geo";
import type { Listing } from "lib/types";
import { radius, useTheme } from "theme";

const PREVIEW_PINS = 8;

/** Painted map tile from the design — shown until the first live pins are placed. */
function MapArt({ dark }: { dark: boolean }) {
  const ground = dark ? "#1C1B27" : "#EFEEE9";
  const green = dark ? "#1E2E27" : "#DCEBDF";
  const block = dark ? "#242332" : "#E5E3DB";
  const road = dark ? "#2E2D3D" : "#FFFFFF";
  const main = dark ? "#4A4326" : "#F6E7A8";
  return (
    <Svg width="100%" height="100%" viewBox="20 250 350 200" preserveAspectRatio="xMidYMid slice">
      <Rect x={0} y={0} width={390} height={844} fill={ground} />
      <Path d="M250 120 C300 110 360 140 400 130 V330 C350 320 300 340 262 300 Z" fill={green} />
      <Rect x={40} y={250} width={150} height={110} rx={10} fill={block} />
      <G fill="none" stroke={road} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M-20 420 C100 400 220 440 410 380" strokeWidth={14} />
        <Path d="M200 -10 C190 200 210 520 170 860" strokeWidth={14} />
        <Path d="M-10 200 C80 220 150 180 210 200" strokeWidth={7} />
        <Path d="M60 -10 L90 400" strokeWidth={7} />
        <Path d="M190 300 C260 300 320 260 400 270" strokeWidth={7} />
        <Path d="M300 400 L330 860" strokeWidth={7} />
        <Path d="M90 400 L60 860" strokeWidth={7} />
        <Path d="M-10 300 L40 300" strokeWidth={7} />
      </G>
      <Path d="M-20 420 C100 400 220 440 410 380" fill="none" stroke={main} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

const PIN_SPOTS = [
  { left: 50, top: 58 },
  { left: 180, top: 96 },
  { left: 230, top: 40 },
];

export function NearYouCard({
  listings,
  title,
  subtitle,
  onPress,
}: {
  listings: Listing[];
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  const { colors, isDark } = useTheme();
  const preview = useMemo(() => listings.slice(0, PREVIEW_PINS), [listings]);
  const { placed } = useListingCoords(preview);
  const pins = preview.filter((l) => placed[l.id]);
  const region = useMemo(
    () => regionFor(pins.map((l) => placed[l.id])),
    // Re-frame only when the set of placed pins changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pins.map((l) => l.id).join(",")]
  );
  // Leave the card's bottom strip clear of the highest-priced pin.
  const hot = pins.length ? pins.reduce((a, b) => (b.price > a.price ? b : a)).id : null;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={styles.card}>
      {pins.length ? (
        // A live, non-interactive preview; the whole card opens the full map.
        <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
          <MapView
            style={StyleSheet.absoluteFill}
            region={{ ...region, latitude: region.latitude - region.latitudeDelta * 0.12 }}
            mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
            userInterfaceStyle={isDark ? "dark" : "light"}
            liteMode
            // Apple's legal label must stay visible above the info strip.
            legalLabelInsets={{ top: 0, left: 10, right: 0, bottom: 78 }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            showsPointsOfInterests={false}
            showsCompass={false}
          >
            {pins.map((l) => (
              <Marker key={l.id} coordinate={placed[l.id]} anchor={{ x: 0.5, y: l.id === hot ? 1 : 0.5 }}>
                <PricePin price={l.price} selected={l.id === hot} approximate={placed[l.id].approximate} />
              </Marker>
            ))}
          </MapView>
        </View>
      ) : (
        <PaintedPreview prices={listings.map((l) => l.price)} dark={isDark} />
      )}
      <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
        <View style={styles.sheetText}>
          <Text variant="sm" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="xs" color="inkMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Icon name="forward" size={16} weight="semibold" />
      </View>
    </Pressable>
  );
}

function PaintedPreview({ prices, dark }: { prices: number[]; dark: boolean }) {
  const { colors } = useTheme();
  return (
    <>
      <MapArt dark={dark} />
      {prices.slice(0, 3).map((price, i) => {
        const highlight = i === 1 || (prices.length === 1 && i === 0);
        return (
          <View
            key={i}
            style={[styles.pinBase, PIN_SPOTS[i], highlight ? styles.pinHot : [styles.pin, { backgroundColor: colors.bg }]]}
          >
            <Text
              variant={highlight ? "label" : "xs"}
              weight="bold"
              color={highlight ? "#121212" : "ink"}
              style={highlight && styles.pinHotText}
            >
              {formatPrice(price)}
            </Text>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  card: { height: 200, borderRadius: radius.lg, overflow: "hidden" },
  pinBase: { position: "absolute" },
  pin: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radius.full,
    shadowColor: "#121212",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pinHot: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.xs,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#121212",
  },
  pinHotText: { fontFamily: "BricolageGrotesque_800ExtraBold" },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetText: { flex: 1 },
});
