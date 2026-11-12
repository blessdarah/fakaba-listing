import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { radius } from "theme";
import { Text } from "./Text";

type SignTagProps = {
  label: string;
  /** rent = yellow board, sale = black board, lease = outlined. */
  tone?: "rent" | "sale" | "lease";
  style?: StyleProp<ViewStyle>;
};

/** The painted sign: sharp 4px corners, Bricolage caps. */
export function SignTag({ label, tone = "rent", style }: SignTagProps) {
  const t = tones[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      <Text variant="tag" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const tones = {
  rent: { bg: "#FFD700", fg: "#121212", border: "#FFD700" },
  sale: { bg: "#121212", fg: "#FFFFFF", border: "#121212" },
  lease: { bg: "#FFFFFF", fg: "#121212", border: "#121212" },
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: radius.xs,
    borderWidth: 1.5,
  },
});
