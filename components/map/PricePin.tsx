import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { fonts, radius } from "theme";

/** Pins stay short: 75 000 · 450 000 · 18,5 M. */
export function pinPrice(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${(Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)).replace(".", ",")} M`;
  }
  return formatPrice(n);
}

/**
 * "31 — Search · Map" pins: a white pill, or — when selected — the yellow
 * signboard on a post. Colours are fixed (pins sit on the map, not the theme).
 */
export const PricePin = memo(function PricePin({
  price,
  selected,
  approximate,
}: {
  price: number;
  selected?: boolean;
  approximate?: boolean;
}) {
  if (selected) {
    return (
      <View style={styles.signWrap}>
        <View style={styles.sign}>
          <Text variant="label" color="#121212" style={styles.signText}>
            {pinPrice(price)}
          </Text>
        </View>
        <View style={styles.post} />
      </View>
    );
  }
  return (
    <View style={[styles.pill, approximate && styles.pillApprox]}>
      <Text variant="xs" weight="bold" color="#121212">
        {pinPrice(price)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: "#FFFFFF",
    shadowColor: "#121212",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    margin: 6,
  },
  pillApprox: { backgroundColor: "#F3F3F1" },
  signWrap: { alignItems: "center", margin: 6 },
  sign: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.xs,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#121212",
  },
  signText: { fontFamily: fonts.display, fontSize: 15, lineHeight: 18 },
  post: { width: 3, height: 12, backgroundColor: "#121212" },
});
