/**
 * Service tiles from "61 — Services" (64×64 viewBox, surface tile included).
 * Like the other illustrations, they keep their own colours in dark mode.
 */
import { Image } from "expo-image";
import { View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { art, radius } from "theme";
import { Spot } from "./index";

const s = {
  stroke: art.ink,
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SERVICE_ART = ["landTitle", "management", "building", "selling", "moving"] as const;
export type ServiceArtName = (typeof SERVICE_ART)[number];

export function ServiceArt({ name, size = 52, tile = art.surface }: { name: ServiceArtName; size?: number; tile?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x={2} y={2} width={60} height={60} rx={16} fill={tile} />
      {name === "landTitle" && (
        <>
          <Path d="M10 44 L28 30 L54 38 L36 52 Z" fill={art.palm} {...s} />
          <Path d="M28 30 V14" fill="none" {...s} />
          <Path d="M28 14 L40 18 L28 22 Z" fill={art.yellow} {...s} />
        </>
      )}
      {name === "management" && (
        <>
          <Rect x={16} y={14} width={22} height={40} fill={art.paper} {...s} />
          <Rect x={38} y={28} width={12} height={26} fill={art.yellow} {...s} />
          <Path d="M22 22 H26 M30 22 H32 M22 30 H26 M30 30 H32 M22 38 H26 M30 38 H32" fill="none" {...s} />
          <Rect x={24} y={46} width={6} height={8} fill={art.ink} {...s} />
          <Path d="M10 54 H54" fill="none" {...s} />
        </>
      )}
      {name === "building" && (
        <>
          <Rect x={14} y={28} width={36} height={24} fill={art.paper} {...s} />
          <Path d="M12 20 H52 L50 28 H14 Z" fill={art.yellow} {...s} />
          <Path d="M22 20 L21 28 M32 20 V28 M42 20 L43 28" fill="none" {...s} />
          <Rect x={28} y={38} width={9} height={14} fill={art.ink} {...s} />
        </>
      )}
      {name === "selling" && (
        <>
          <Rect x={30} y={34} width={4} height={20} fill={art.ink} {...s} />
          <G transform="rotate(-6 32 26)">
            <Rect x={12} y={16} width={40} height={20} rx={3} fill={art.ink} {...s} />
            <Path d="M18 26 H46" fill="none" {...s} stroke={art.yellow} strokeWidth={3} />
          </G>
        </>
      )}
      {name === "moving" && (
        <>
          <Circle cx={22} cy={32} r={10} fill={art.yellow} {...s} />
          <Circle cx={22} cy={32} r={3.5} fill={art.paper} {...s} />
          <Path d="M32 32 H52 M46 32 V39 M51 32 V37" fill="none" {...s} />
        </>
      )}
    </Svg>
  );
}

/** A service's picture: uploaded cover, else its illustration, else a generic agent spot. */
export function ServiceVisual({
  imageUrl,
  illustration,
  size = 52,
  tile,
}: {
  imageUrl?: string | null;
  illustration?: string | null;
  size?: number;
  tile?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.25) }}
        contentFit="cover"
        transition={150}
      />
    );
  }
  if (illustration && (SERVICE_ART as readonly string[]).includes(illustration)) {
    return <ServiceArt name={illustration as ServiceArtName} size={size} tile={tile} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, overflow: "hidden" }}>
      <Spot name="agent" size={size} tile={tile} />
    </View>
  );
}
