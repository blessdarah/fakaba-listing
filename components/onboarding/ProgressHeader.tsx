import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useTheme } from "theme";

type ProgressHeaderProps = {
  step: number;
  total: number;
  onBack?: () => void;
  backLabel?: string;
};

/** Back button · segmented progress · "n/5". */
export function ProgressHeader({ step, total, onBack, backLabel = "Back" }: ProgressHeaderProps) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <IconButton icon="back" accessibilityLabel={backLabel} onPress={onBack} />
      ) : (
        <View style={styles.slot} />
      )}
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: step }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <Segment key={i} filled={i < step} />
        ))}
      </View>
      <Text variant="sm" weight="semibold" align="right" style={styles.count}>
        {step}/{total}
      </Text>
    </View>
  );
}

function Segment({ filled }: { filled: boolean }) {
  const { colors } = useTheme();
  const fill = useAnimatedStyle(() => ({
    width: withTiming(filled ? "100%" : "0%", { duration: 260 }),
  }));
  return (
    <View style={[styles.segment, { backgroundColor: colors.line }]}>
      <Animated.View style={[styles.fill, { backgroundColor: colors.ink }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  slot: { width: 40, height: 40 },
  track: { flex: 1, flexDirection: "row", gap: 4 },
  segment: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  count: { width: 40 },
});
