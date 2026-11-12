import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { radius, useTheme } from "theme";

function Bone({ w, h, r = radius.sm }: { w: DimensionValue; h: number; r?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: w, height: h, borderRadius: r, backgroundColor: colors.skeleton }} />;
}

/** "77 — Home · Loading": chips, section title and a hero card, gently pulsing. */
export function HomeSkeleton() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.55, { duration: 850, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[styles.wrap, style]} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Bone w={170} h={24} />
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Bone w={300} h={230} r={radius.lg} />
          <Bone w={120} h={22} />
          <Bone w={220} h={16} />
          <Bone w={180} h={14} />
        </View>
        <Bone w={60} h={230} r={radius.lg} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingLeft: 20, paddingTop: 28, gap: 14 },
  cardRow: { flexDirection: "row", gap: 12, overflow: "hidden" },
  card: { gap: 12 },
});
