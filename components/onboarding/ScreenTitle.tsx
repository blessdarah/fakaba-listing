import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "components/ui/Text";

/** 34/38 Bricolage headline + muted 16/23 lead. */
export function ScreenTitle({
  title,
  lead,
  style,
}: {
  title: string;
  lead?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Text variant="h1" accessibilityRole="header">
        {title}
      </Text>
      {lead ? (
        <Text variant="body" color="inkMuted">
          {lead}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
});
