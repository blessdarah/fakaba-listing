import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { onboardingGutter, useTheme } from "theme";

type OnboardingScreenProps = {
  children: ReactNode;
  /** Pinned under the content: the screen's main action(s). */
  footer?: ReactNode;
  /** Full-bleed block above the padded content (welcome art, sign-in hero). */
  hero?: ReactNode;
  /** Rendered above the scroll view, inside the safe area (progress header). */
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  statusBar?: "dark" | "light" | "auto";
  /** When the hero is drawn edge to edge we don't pad the top. */
  edgeToEdgeTop?: boolean;
};

/**
 * Shared shell for every pre-home screen: safe areas, keyboard handling and a
 * bottom-anchored footer that rides up with the keyboard.
 *
 * iOS: the ScrollView insets itself for the keyboard and scrolls the focused
 * field into view (automaticallyAdjustKeyboardInsets).
 * Android (edge-to-edge, the window no longer resizes): pad the container by
 * the keyboard height so the ScrollView shrinks and keeps the field visible.
 */
export function OnboardingScreen({
  children,
  footer,
  hero,
  header,
  contentStyle,
  statusBar = "auto",
  edgeToEdgeTop,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const barStyle = statusBar === "auto" ? (isDark ? "light" : "dark") : statusBar;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={barStyle} />
      {header && <View style={{ paddingTop: insets.top + 4 }}>{header}</View>}
      <KeyboardAvoidingView
        style={styles.root}
        behavior="padding"
        enabled={Platform.OS === "android"}
      >
        <ScrollView
          style={styles.root}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: header || edgeToEdgeTop ? 0 : insets.top + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          {hero}
          <View style={[styles.content, contentStyle]}>{children}</View>
          <View style={styles.spacer} />
          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: onboardingGutter },
  spacer: { flexGrow: 1, minHeight: 24 },
  footer: { paddingHorizontal: onboardingGutter, gap: 12 },
});
