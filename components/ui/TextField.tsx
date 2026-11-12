import { forwardRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { fonts, makeStyles, radius, useTheme } from "theme";
import { Icon } from "./Icon";
import { Text } from "./Text";

type TextFieldProps = TextInputProps & {
  label?: string;
  /** Right side of the label row — e.g. "Optional" or a "Forgot?" link. */
  labelAccessory?: ReactNode;
  error?: string | null;
  /** Rendered before the input, separated by a hairline (e.g. "CM +237"). */
  prefix?: string;
  /** Rendered at the end of the field (e.g. "/ month"). */
  trailing?: ReactNode;
  leadingIcon?: ReactNode;
  /** Show an eye toggle for passwords. */
  revealable?: boolean;
  /** Field shape: "field" (14px corners) or "pill" (search). */
  shape?: "field" | "pill";
};

/**
 * Labels sit above, always visible. Focus is a 2px ink ring — never yellow.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    labelAccessory,
    error,
    prefix,
    trailing,
    leadingIcon,
    revealable,
    secureTextEntry,
    shape = "field",
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref
) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const state = error ? "error" : focused ? "focus" : "idle";

  return (
    <View style={styles.wrap}>
      {(label || labelAccessory) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text variant="label" nativeID={rest.accessibilityLabelledBy as string | undefined}>
              {label}
            </Text>
          ) : (
            <View />
          )}
          {labelAccessory}
        </View>
      )}
      <View
        style={[
          styles.field,
          shape === "pill" && styles.pill,
          state === "focus" && styles.focus,
          state === "error" && styles.error,
        ]}
      >
        {leadingIcon}
        {prefix && (
          <View style={styles.prefix}>
            <Text variant="base" weight="semibold">
              {prefix}
            </Text>
          </View>
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.ink}
          cursorColor={colors.ink}
          secureTextEntry={secureTextEntry && !revealed}
          accessibilityLabel={label}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing}
        {revealable && (
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            onPress={() => setRevealed((r) => !r)}
          >
            <Icon name={revealed ? "eyeOff" : "eye"} size={20} color="inkMuted" />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="alert" size={16} color="danger" style={styles.errorIcon} />
          <Text variant="sm" color="danger" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  field: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pill: { borderRadius: radius.full, paddingLeft: 18, paddingRight: 8 },
  focus: { backgroundColor: c.bg, borderColor: c.ink },
  error: { backgroundColor: c.dangerTint, borderColor: c.danger, borderWidth: 1.5 },
  prefix: {
    paddingRight: 12,
    borderRightWidth: StyleSheet.hairlineWidth * 2,
    borderRightColor: c.line,
    height: 24,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.regular,
    fontSize: 16,
    color: c.ink,
    paddingVertical: 0,
  },
  errorRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  errorIcon: { marginTop: 2 },
  errorText: { flex: 1 },
})
);
