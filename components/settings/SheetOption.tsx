import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { opacity, radius, useTheme } from "theme";

/**
 * Radio card from "54 — Language": selected = signal tint, ink border and an
 * ink check; otherwise a hairline card with an empty ring.
 */
export function SheetOption({
  badge,
  title,
  subtitle,
  selected,
  onPress,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        selected
          ? { backgroundColor: colors.signalTint, borderColor: colors.ink }
          : { borderColor: colors.line },
        pressed && { opacity: opacity.pressed },
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: selected ? "#121212" : colors.surface }]}>
          <Text variant="label" color={selected ? "#FFD700" : "ink"} style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text variant="lg" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="sm" color="inkMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View style={[styles.ring, { backgroundColor: colors.ink, borderColor: colors.ink }]}>
          <Icon name="check" size={12} color="onInk" weight="bold" />
        </View>
      ) : (
        <View style={[styles.ring, { borderColor: colors.line }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  badge: { width: 40, height: 40, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  badgeText: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 14 },
  copy: { flex: 1, gap: 2 },
  ring: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
