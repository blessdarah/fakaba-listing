import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { radius } from "theme";

const logo = require("../assets/images/logo-mark.png");

/** The quatrefoil door mark. It sits on brand blue, so only use it there. */
export function LogoMark({ size = 56, rounded = true }: { size?: number; rounded?: boolean }) {
  return (
    <Image
      source={logo}
      style={{ width: size, height: size, borderRadius: rounded ? radius.md : 0 }}
      contentFit="cover"
      accessibilityLabel="Fakaba"
    />
  );
}

export function Wordmark({ size = 76, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Text
      variant="display"
      color={color}
      style={{ fontSize: size, lineHeight: size * 0.9, letterSpacing: -size * 0.05 }}
      accessibilityRole="header"
    >
      fakaba.
    </Text>
  );
}

/**
 * "72 — Splash". Shown while auth state resolves, picking up seamlessly from
 * the native splash (same blue, same mark) and adding the wordmark + sign.
 */
export function BrandSplash() {
  const insets = useSafeAreaInsets();
  const lift = useSharedValue(12);
  useEffect(() => {
    lift.value = withDelay(80, withSpring(0, { damping: 14 }));
  }, [lift]);
  const wordStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));

  return (
    <View style={styles.splash}>
      <View style={styles.centre}>
        <LogoMark size={200} rounded={false} />
        <Animated.View entering={FadeIn.duration(260)} style={wordStyle}>
          <Wordmark size={44} />
        </Animated.View>
      </View>
      <Animated.View
        entering={FadeIn.delay(200).duration(300)}
        style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}
      >
        <SignTag label="À LOUER · À VENDRE" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#1300A7" },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  footer: { alignItems: "center" },
});
