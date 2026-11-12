import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { opacity, radius, useTheme } from "theme";
import { Icon } from "./Icon";
import { Text } from "./Text";

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Show a yellow check before the label when selected (location / areas pickers). */
  checkWhenSelected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 40px pill. Selected = ink fill, otherwise a 1.5px hairline outline. */
export function Chip({ label, selected, checkWhenSelected, onPress, style }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: colors.ink, borderColor: colors.ink }
          : { borderColor: colors.line },
        pressed && { opacity: opacity.pressed },
        style,
      ]}
    >
      <View style={styles.row}>
        {selected && checkWhenSelected && (
          <Icon name="check" size={13} color="signal" weight="bold" />
        )}
        <Text
          variant="sm"
          weight={selected ? "semibold" : "medium"}
          color={selected ? "onInk" : "ink"}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
