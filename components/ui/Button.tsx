import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { opacity, radius, useTheme, type Palette } from "theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

/**
 * 52px tall, full width on mobile. One yellow (primary) button per screen —
 * the thing we want you to do.
 */
export type ButtonVariant =
  | "primary" // signal yellow
  | "strong" // ink
  | "palm" // contact
  | "outline" // secondary
  | "quiet" // surface
  | "destructive" // danger tint
  | "link"; // text with underline

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  /** Icon shown after the label (e.g. arrowRight on "Show me places"). */
  trailingIcon?: IconName;
  trailingIconColor?: keyof Palette | (string & {});
  leading?: ReactNode;
  size?: "lg" | "md";
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
};

export function Button({
  label,
  variant = "primary",
  loading,
  disabled,
  trailingIcon,
  trailingIconColor,
  leading,
  size = "lg",
  style,
  haptic = true,
  onPress,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const v = variants(colors)[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={({ pressed }) => [
        variant === "link" ? styles.link : size === "lg" ? styles.lg : styles.md,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        pressed && { opacity: opacity.pressed },
        disabled && !loading && { opacity: opacity.disabled },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          <Text
            variant="base"
            weight="semibold"
            color={v.fg}
            underline={variant === "link"}
            style={size === "lg" && variant !== "link" ? styles.lgLabel : undefined}
          >
            {label}
          </Text>
          {trailingIcon && (
            <Icon name={trailingIcon} size={16} color={trailingIconColor ?? v.fg} weight="semibold" />
          )}
        </View>
      )}
    </Pressable>
  );
}

type VariantStyle = { bg: string; fg: string; border?: string };

const variants = (c: Palette): Record<ButtonVariant, VariantStyle> =>
  ({
    primary: { bg: c.signal, fg: "#121212" },
    strong: { bg: c.ink, fg: c.onInk },
    palm: { bg: c.palm, fg: "#FFFFFF" },
    outline: { bg: "transparent", fg: c.ink, border: c.ink },
    quiet: { bg: c.surface, fg: c.ink },
    destructive: { bg: c.dangerTint, fg: c.danger },
    link: { bg: "transparent", fg: c.ink },
  });

const styles = StyleSheet.create({
  lg: {
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  md: {
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  link: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  lgLabel: { fontSize: 16, lineHeight: 20 },
});
