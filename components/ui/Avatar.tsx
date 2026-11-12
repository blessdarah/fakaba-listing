import { Image } from "expo-image";
import { useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { radius } from "theme";
import { Text } from "./Text";

/** Warm, photo-like neutrals for initials avatars (from the design). */
const SWATCHES = ["#C9B79C", "#BFC9B4", "#B9C4C9", "#D3B8A8", "#C4BBD3"];

export function initialsOf(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2);
  return (letters ?? "?").toUpperCase();
}

function swatchFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return SWATCHES[Math.abs(h) % SWATCHES.length];
}

type AvatarProps = {
  name?: string | null;
  uri?: string | null;
  size?: number;
  /** Companies get a square ink tile with yellow initials. */
  kind?: "person" | "company";
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ name, uri, size = 40, kind = "person", style }: AvatarProps) {
  const isCompany = kind === "company";
  const shape = {
    width: size,
    height: size,
    borderRadius: isCompany ? radius.md : radius.full,
    overflow: "hidden" as const,
  };

  // Fall back to initials when the photo URL is dead (deleted upload, offline).
  const [failedUri, setFailedUri] = useState<string | null>(null);
  if (uri && uri !== failedUri) {
    return (
      <Image
        source={{ uri }}
        style={[shape, style as object]}
        contentFit="cover"
        transition={150}
        onError={() => setFailedUri(uri)}
      />
    );
  }

  return (
    <View
      style={[
        shape,
        {
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isCompany ? "#121212" : swatchFor(name ?? "?"),
        },
        style,
      ]}
    >
      <Text
        variant={size >= 56 ? "title" : "label"}
        color={isCompany ? "#FFD700" : "#121212"}
        style={{
          fontFamily: "BricolageGrotesque_800ExtraBold",
          fontSize: Math.round(size * 0.36),
          lineHeight: Math.round(size * 0.44),
        }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}
