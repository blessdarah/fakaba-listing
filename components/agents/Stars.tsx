import * as Haptics from "expo-haptics";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "theme";

const STAR = "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z";

/** Drawn stars (SF/Material star glyphs differ too much between platforms). */
export function Star({ size = 14, filled = true, color }: { size?: number; filled?: boolean; color?: string }) {
  const { colors } = useTheme();
  const c = color ?? colors.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      <Path
        d={STAR}
        fill={filled ? c : "none"}
        stroke={filled ? c : colors.inkSubtle}
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarRow({ rating, size = 13, style }: { rating: number; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: 2 }, style]} accessibilityLabel={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} filled={n <= Math.round(rating)} />
      ))}
    </View>
  );
}

/** Big tappable stars for writing a review. */
export function StarInput({
  value,
  onChange,
  size = 44,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  labels: string[];
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={labels[n - 1]}
          accessibilityState={{ selected: n === value }}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onChange(n);
          }}
        >
          <Star size={size} filled={n <= value} />
        </Pressable>
      ))}
    </View>
  );
}
