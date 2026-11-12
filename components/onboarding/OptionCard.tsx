import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import { Spot, type SpotName } from "components/illustrations";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { radius, useTheme } from "theme";

type OptionCardProps = {
  spot: SpotName;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  /**
   * large: account type (64 spot, Bricolage title)
   * row: role list (48 spot, Inter title)
   * tile: interests grid (spot top-left, title bottom, check top-right)
   */
  layout?: "large" | "row" | "tile";
  /** Multi-select options read as checkboxes to screen readers. */
  multi?: boolean;
};

export function OptionCard({
  spot,
  title,
  subtitle,
  selected,
  onPress,
  layout = "row",
  multi,
}: OptionCardProps) {
  const { colors } = useTheme();
  const frame = [
    styles.card,
    layout === "tile" ? styles.tile : layout === "large" ? styles.large : styles.row,
    selected
      ? { backgroundColor: colors.signalTint, borderColor: colors.ink, borderWidth: 2 }
      : { borderColor: colors.line, borderWidth: 1.5 },
  ];

  return (
    <Pressable
      accessibilityRole={multi ? "checkbox" : "radio"}
      accessibilityState={multi ? { checked: selected } : { selected }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [frame, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      {layout === "tile" ? (
        <>
          <View style={styles.tileTop}>
            <Spot name={spot} size={48} />
            {selected && <Check />}
          </View>
          <Text variant="base" weight="semibold" style={styles.tileTitle}>
            {title}
          </Text>
        </>
      ) : (
        <>
          <Spot name={spot} size={layout === "large" ? 64 : 48} />
          <View style={styles.text}>
            <Text
              variant={layout === "large" ? "title" : "lg"}
              weight={layout === "large" ? undefined : "semibold"}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text variant="sm" color="inkMuted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {selected ? <Check /> : <View style={[styles.radio, { borderColor: colors.line }]} />}
        </>
      )}
    </Pressable>
  );
}

function Check() {
  const { colors } = useTheme();
  return (
    <View style={[styles.check, { backgroundColor: colors.ink }]}>
      <Icon name="check" size={13} color="onInk" weight="bold" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg },
  large: { flexDirection: "row", alignItems: "center", padding: 16, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, gap: 16 },
  tile: { flex: 1, padding: 14, minHeight: 122, justifyContent: "space-between" },
  tileTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tileTitle: { marginTop: 12 },
  text: { flex: 1, gap: 3 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
});
