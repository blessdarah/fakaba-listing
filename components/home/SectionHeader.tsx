import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "components/ui/Text";

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, style]}>
      <Text variant="h2" accessibilityRole="header" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {action ? (
        <Pressable hitSlop={10} onPress={onAction} accessibilityRole="link">
          <Text variant="sm" weight="semibold" underline>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  title: { flexShrink: 1 },
});
