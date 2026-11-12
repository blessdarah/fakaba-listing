import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { Text } from "components/ui/Text";
import { useTheme } from "theme";

/**
 * Feather outlines for every tab so the set reads as one family (SF Symbols mixed
 * filled/outlined weights). Focus is shown by ink colour and the signal bar.
 */
const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: "home",
  search: "search",
  saved: "heart",
  services: "briefcase",
  profile: "user",
};

/** 5 destinations. Active = ink icon + label with the signal bar above it. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if ((options as { href?: unknown }).href === null) return null;
        const focused = state.index === index;
        const label = typeof options.title === "string" ? options.title : route.name;
        const icon = ICONS[route.name] ?? ICONS.index;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                Haptics.selectionAsync().catch(() => {});
                navigation.navigate(route.name, route.params);
              }
            }}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={styles.item}
          >
            <Marker active={focused} />
            <Feather name={icon} size={23} color={focused ? colors.ink : colors.inkSubtle} />
            <Text variant="caps" weight={focused ? "semibold" : "medium"} color={focused ? "ink" : "inkMuted"} style={styles.label}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Marker({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0, { duration: 160 }),
    transform: [{ scaleX: withSpring(active ? 1 : 0.2, { damping: 14 }) }],
  }));
  return <Animated.View style={[styles.marker, { backgroundColor: colors.signal }, style]} />;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  item: { width: 64, alignItems: "center", gap: 5 },
  marker: { width: 20, height: 3, borderRadius: 2 },
  label: { letterSpacing: 0 },
});
