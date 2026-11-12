import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { opacity, useTheme } from "theme";

/** Caps label above a group of rows ("ACCOUNT", "PREFERENCES"). */
export function SectionLabel({ label }: { label: string }) {
  return (
    <Text variant="caps" color="inkMuted" style={styles.section} accessibilityRole="header">
      {label.toUpperCase()}
    </Text>
  );
}

/** "52 — Profile & settings" row: 16/20 medium label, muted value, chevron. */
export function SettingsRow({
  label,
  value,
  onPress,
  divider,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  /** Hairline under the row (every row but the last in a group). */
  divider?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
        pressed && { opacity: opacity.pressed },
      ]}
    >
      <Text variant="body" weight="medium" style={styles.label}>
        {label}
      </Text>
      <View style={styles.end}>
        {value ? (
          <Text variant="sm" color="inkMuted" numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        ) : null}
        <Icon name="forward" size={14} color="inkSubtle" weight="semibold" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { paddingBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, gap: 16 },
  label: { fontSize: 16, lineHeight: 20 },
  end: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  value: { flexShrink: 1 },
});
