import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";
import { useTheme, type Palette } from "theme";

/**
 * One name per glyph used in the app, mapped to SF Symbols on iOS and
 * Material Symbols on Android/web (both shipped by expo-symbols).
 */
const glyphs = {
  back: { ios: "chevron.left", android: "chevron_left" },
  forward: { ios: "chevron.right", android: "chevron_right" },
  chevronDown: { ios: "chevron.down", android: "expand_more" },
  arrowRight: { ios: "arrow.right", android: "arrow_forward" },
  search: { ios: "magnifyingglass", android: "search" },
  filters: { ios: "slider.horizontal.3", android: "tune" },
  pin: { ios: "mappin", android: "location_on" },
  locate: { ios: "location", android: "near_me" },
  heart: { ios: "heart", android: "favorite" },
  heartFill: { ios: "heart.fill", android: "favorite" },
  home: { ios: "house", android: "home" },
  homeFill: { ios: "house.fill", android: "home" },
  briefcase: { ios: "briefcase", android: "work" },
  briefcaseFill: { ios: "briefcase.fill", android: "work" },
  person: { ios: "person", android: "person" },
  personFill: { ios: "person.fill", android: "person" },
  eye: { ios: "eye", android: "visibility" },
  eyeOff: { ios: "eye.slash", android: "visibility_off" },
  check: { ios: "checkmark", android: "check" },
  plus: { ios: "plus", android: "add" },
  camera: { ios: "camera", android: "photo_camera" },
  clock: { ios: "clock", android: "schedule" },
  alert: { ios: "exclamationmark.circle", android: "error" },
  info: { ios: "info.circle", android: "info" },
  verified: { ios: "checkmark.seal.fill", android: "verified" },
  star: { ios: "star.fill", android: "star" },
  offline: { ios: "wifi.slash", android: "wifi_off" },
} satisfies Record<string, { ios: string; android: string }>;

export type IconName = keyof typeof glyphs;

type IconProps = {
  name: IconName;
  size?: number;
  color?: keyof Palette | (string & {});
  weight?: "regular" | "medium" | "semibold" | "bold";
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color = "ink", weight = "medium", style }: IconProps) {
  const { colors } = useTheme();
  const tint: ColorValue = color in colors ? colors[color as keyof Palette] : color;
  const glyph = glyphs[name];
  return (
    <SymbolView
      name={{ ios: glyph.ios, android: glyph.android, web: glyph.android } as SymbolViewProps["name"]}
      size={size}
      tintColor={tint}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
    />
  );
}
