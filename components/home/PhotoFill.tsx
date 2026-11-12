import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

/** Warm photo-like placeholders from the design, picked per listing. */
const PLACEHOLDERS: [string, string, string][] = [
  ["#D8CBB4", "#B59F80", "#8E7A5E"],
  ["#B9C4C9", "#8C9DA6", "#62737D"],
  ["#C3CFB4", "#93A57D", "#617452"],
  ["#D9C4B4", "#BC9C86", "#8F6F5B"],
  ["#CBC6BD", "#A79F94", "#7F776C"],
];

export function placeholderFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) | 0;
  return PLACEHOLDERS[Math.abs(h) % PLACEHOLDERS.length];
}

/**
 * "No boxes around listings — the photo is the card." Renders the listing
 * photo with a gradient placeholder underneath while it loads (or if missing).
 */
export function PhotoFill({
  uri,
  seed,
  style,
  children,
}: {
  uri?: string;
  seed: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const colors = placeholderFor(seed);
  return (
    <View style={[styles.frame, style]}>
      <LinearGradient
        colors={colors}
        locations={[0, 0.55, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          recyclingKey={uri}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden" },
});
