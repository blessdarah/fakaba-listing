/**
 * Painted-sign vectors from the Paper file ("02 — Illustrations").
 * 2.5px ink outline, flat fills from the palette, round joins.
 * Illustrations keep their own colours in dark mode.
 */
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText, type SvgProps } from "react-native-svg";
import { art, fonts } from "theme";

const stroke = {
  stroke: art.ink,
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type ArtProps = Omit<SvgProps, "viewBox"> & { width?: number; height?: number };

const signFont = { fontFamily: fonts.display, fill: art.ink, textAnchor: "middle" as const };

/** Welcome — Mt Cameroon, home, palm, the sign. viewBox 320×240. */
export function WelcomeArt({ width = 340, height = 255, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 240" {...rest}>
      <Circle cx={252} cy={58} r={20} fill={art.yellow} {...stroke} />
      <Path d="M8 212 L96 84 L122 112 L158 62 L246 212 Z" fill={art.paper} {...stroke} />
      <Path d="M146 78 L158 62 L170 80 L162 76 L156 84 L150 76 Z" fill={art.ink} {...stroke} />
      <Path d="M136 148 L190 108 L244 148" fill={art.ink} {...stroke} />
      <Rect x={146} y={146} width={88} height={66} fill={art.paper} {...stroke} />
      <Rect x={182} y={172} width={22} height={40} fill={art.yellow} {...stroke} />
      <Rect x={156} y={158} width={18} height={16} fill={art.stone} {...stroke} />
      <Rect x={212} y={158} width={14} height={16} fill={art.stone} {...stroke} />
      <Path d="M282 212 Q276 176 288 142" fill="none" {...stroke} />
      <Path d="M288 142 Q266 128 248 140 Q270 140 288 142 Z" fill={art.palm} {...stroke} />
      <Path d="M288 142 Q306 124 314 136 Q300 138 288 142 Z" fill={art.palm} {...stroke} />
      <Path d="M288 142 Q284 118 296 108 Q294 128 288 142 Z" fill={art.palm} {...stroke} />
      <Path d="M288 142 Q272 150 262 166 Q278 156 288 142 Z" fill={art.palm} {...stroke} />
      <Rect x={66} y={150} width={7} height={62} fill={art.ink} {...stroke} />
      <G transform="rotate(-5 70 130)">
        <Rect x={24} y={108} width={94} height={44} rx={4} fill={art.yellow} {...stroke} />
        <SvgText x={71} y={137} fontSize={15} letterSpacing={1.2} {...signFont}>
          À LOUER
        </SvgText>
      </G>
      <Path d="M4 212 H316" fill="none" {...stroke} />
    </Svg>
  );
}

/** Verify email — letter with a "seen" tag. viewBox 240×180. */
export function InboxArt({
  width = 290,
  height = 218,
  tag = "VU",
  badge = "check",
  ...rest
}: ArtProps & { tag?: string; badge?: "check" | "clock" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      {badge === "check" && (
        <Path d="M34 34 L28 28 M44 24 L42 14 M24 46 L14 44" fill="none" {...stroke} />
      )}
      <Rect x={40} y={52} width={150} height={100} rx={8} fill={art.paper} {...stroke} />
      <Path d="M40 60 L115 112 L190 60" fill="none" {...stroke} />
      <Path d="M40 148 L96 100 M190 148 L134 100" fill="none" {...stroke} />
      <Path d="M176 52 L196 30" fill="none" {...stroke} />
      <G transform="rotate(12 206 36)">
        <Rect x={182} y={20} width={tag.length > 3 ? 66 : 56} height={30} rx={4} fill={art.yellow} {...stroke} />
        <Circle cx={190} cy={35} r={3} fill={art.ink} {...stroke} />
        <SvgText
          x={tag.length > 3 ? 220 : 215}
          y={40}
          fontSize={tag.length > 3 ? 10 : 12}
          letterSpacing={0.8}
          {...signFont}
        >
          {tag}
        </SvgText>
      </G>
      {badge === "check" ? (
        <>
          <Circle cx={186} cy={146} r={18} fill={art.palm} {...stroke} />
          <Path d="M178 146 L184 152 L195 140" fill="none" stroke={art.paper} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <Circle cx={186} cy={146} r={18} fill={art.paper} {...stroke} />
          <Path d="M186 136 V147 L193 152" fill="none" {...stroke} />
        </>
      )}
      <Path d="M10 166 H230" fill="none" {...stroke} />
    </Svg>
  );
}

/** Location — folded map, pin, a route. viewBox 240×180. */
export function LocationArt({ width = 200, height = 150, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      <Path d="M20 60 L80 44 L150 60 L220 44 V150 L150 166 L80 150 L20 166 Z" fill={art.paper} {...stroke} />
      <Path d="M80 44 V150 M150 60 V166" fill="none" {...stroke} stroke={art.stone} />
      <Path
        d="M34 140 Q70 120 96 132 T150 112 T206 92"
        fill="none"
        {...stroke}
        strokeDasharray="2 8"
      />
      <Path d="M164 136 L186 104 L196 116 L210 96 L220 112 V150 L164 150 Z" fill={art.stone} />
      <Path
        d="M120 20 C98 20 84 36 84 56 C84 82 120 114 120 114 C120 114 156 82 156 56 C156 36 142 20 120 20 Z"
        fill={art.yellow}
        {...stroke}
      />
      <Circle cx={120} cy={56} r={13} fill={art.paper} {...stroke} />
      <Ellipse cx={120} cy={124} rx={18} ry={5} fill={art.ink} opacity={0.18} />
    </Svg>
  );
}

/** You're in — open door, welcome tag. viewBox 240×180. */
export function DoneArt({ width = 260, height = 195, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      <Rect x={70} y={26} width={96} height={140} fill={art.ink} {...stroke} />
      <Path d="M78 34 H158 V166 H78 Z" fill={art.cream} />
      <Path d="M78 34 L128 46 V174 L78 166 Z" fill={art.yellow} {...stroke} />
      <Circle cx={118} cy={110} r={4} fill={art.ink} {...stroke} />
      <Path d="M40 166 H200" fill="none" {...stroke} />
      <Path
        d="M44 52 V66 M37 59 H51 M196 40 V54 M189 47 H203 M184 96 V106 M179 101 H189"
        fill="none"
        {...stroke}
      />
      <Path d="M118 114 L130 130" fill="none" {...stroke} />
      <G transform="rotate(-14 160 143)">
        <Rect x={116} y={130} width={96} height={26} rx={4} fill={art.paper} {...stroke} />
        <SvgText x={164} y={147.5} fontSize={10} letterSpacing={0.6} {...signFont}>
          BIENVENUE
        </SvgText>
      </G>
    </Svg>
  );
}

/** Published — sign going up. viewBox 240×180. Used by the home "list your property" CTA. */
export function PublishedArt({ width = 180, height = 135, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      <Path d="M20 160 H220" fill="none" {...stroke} />
      <Rect x={100} y={80} width={8} height={80} fill={art.ink} {...stroke} />
      <G transform="rotate(-3 104 56)">
        <Rect x={46} y={28} width={116} height={56} rx={5} fill={art.yellow} {...stroke} />
        <SvgText x={104} y={63} fontSize={18} letterSpacing={1.4} {...signFont}>
          À LOUER
        </SvgText>
        <Circle cx={56} cy={38} r={2.5} fill={art.ink} {...stroke} />
        <Circle cx={152} cy={38} r={2.5} fill={art.ink} {...stroke} />
      </G>
      <G transform="rotate(-35 178 70)">
        <Rect x={170} y={56} width={10} height={56} rx={3} fill={art.paper} {...stroke} />
        <Rect x={160} y={44} width={30} height={16} rx={3} fill={art.ink} {...stroke} />
      </G>
      <Path d="M168 24 L174 34 M190 30 L182 38 M196 50 L186 52" fill="none" {...stroke} />
      <Path d="M40 150 Q36 128 46 112" fill="none" {...stroke} />
      <Path d="M46 112 Q30 104 22 114 Q36 112 46 112 Z" fill={art.palm} {...stroke} />
      <Path d="M46 112 Q58 98 66 106 Q56 108 46 112 Z" fill={art.palm} {...stroke} />
    </Svg>
  );
}

/* ---------------------------------------------------------------------------
 * Spot illustrations — 64×64 tiles used by setup cards and category pickers.
 * ------------------------------------------------------------------------- */

export type SpotName =
  | "individual"
  | "company"
  | "renter"
  | "buyer"
  | "seller"
  | "agent"
  | "investor"
  | "land"
  | "commercial";

export function Spot({
  name,
  size = 64,
  tile = art.surface,
}: {
  name: SpotName;
  size?: number;
  /** Tile colour behind the drawing. */
  tile?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x={2} y={2} width={60} height={60} rx={16} fill={tile} />
      {spots[name]}
    </Svg>
  );
}

const spots: Record<SpotName, React.ReactNode> = {
  individual: (
    <>
      <Path d="M14 54 C14 42 22 36 32 36 C42 36 50 42 50 54" fill={art.yellow} {...stroke} />
      <Circle cx={32} cy={24} r={10} fill={art.paper} {...stroke} />
    </>
  ),
  company: (
    <>
      <Rect x={16} y={14} width={22} height={40} fill={art.paper} {...stroke} />
      <Rect x={38} y={28} width={12} height={26} fill={art.yellow} {...stroke} />
      <Path d="M22 22 H26 M30 22 H32 M22 30 H26 M30 30 H32 M22 38 H26 M30 38 H32" fill="none" {...stroke} />
      <Rect x={24} y={46} width={6} height={8} fill={art.ink} {...stroke} />
      <Path d="M10 54 H54" fill="none" {...stroke} />
    </>
  ),
  renter: (
    <>
      <Circle cx={22} cy={32} r={10} fill={art.yellow} {...stroke} />
      <Circle cx={22} cy={32} r={3.5} fill={art.paper} {...stroke} />
      <Path d="M32 32 H52 M46 32 V39 M51 32 V37" fill="none" {...stroke} />
    </>
  ),
  buyer: (
    <>
      <Path d="M12 30 L32 14 L52 30" fill={art.ink} {...stroke} />
      <Rect x={17} y={29} width={30} height={23} fill={art.paper} {...stroke} />
      <Rect x={28} y={38} width={9} height={14} fill={art.yellow} {...stroke} />
    </>
  ),
  seller: (
    <>
      <Rect x={30} y={34} width={4} height={20} fill={art.ink} {...stroke} />
      <G transform="rotate(-6 32 26)">
        <Rect x={12} y={16} width={40} height={20} rx={3} fill={art.ink} {...stroke} />
        <Path d="M18 26 H46" fill="none" stroke={art.yellow} strokeWidth={3} strokeLinecap="round" />
      </G>
    </>
  ),
  agent: (
    <>
      <Path d="M25 22 V18 H39 V22" fill="none" {...stroke} />
      <Rect x={12} y={22} width={40} height={28} rx={4} fill={art.ink} {...stroke} />
      <Rect x={28} y={32} width={8} height={7} rx={1.5} fill={art.yellow} {...stroke} />
    </>
  ),
  investor: (
    <>
      <Rect x={14} y={38} width={9} height={14} fill={art.paper} {...stroke} />
      <Rect x={27} y={30} width={9} height={22} fill={art.paper} {...stroke} />
      <Rect x={40} y={18} width={9} height={34} fill={art.yellow} {...stroke} />
      <Path d="M12 52 H52" fill="none" {...stroke} />
    </>
  ),
  land: (
    <>
      <Path d="M10 44 L28 30 L54 38 L36 52 Z" fill={art.palm} {...stroke} />
      <Path d="M28 30 V14" fill="none" {...stroke} />
      <Path d="M28 14 L40 18 L28 22 Z" fill={art.yellow} {...stroke} />
    </>
  ),
  commercial: (
    <>
      <Rect x={14} y={28} width={36} height={24} fill={art.paper} {...stroke} />
      <Path d="M12 20 H52 L50 28 H14 Z" fill={art.yellow} {...stroke} />
      <Path d="M22 20 L21 28 M32 20 V28 M42 20 L43 28" fill="none" {...stroke} />
      <Rect x={28} y={38} width={9} height={14} fill={art.ink} {...stroke} />
    </>
  ),
};

/** No results — a blank sign on an empty plot, with a magnifier. viewBox 240×180. */
export function EmptySearchArt({ width = 220, height = 165, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      <Path d="M20 150 L120 120 L220 150 L120 176 Z" fill={art.surface} {...stroke} />
      <Path d="M60 140 L60 150 M180 140 L180 150 M120 120 V128" fill="none" {...stroke} />
      <Rect x={104} y={64} width={6} height={86} fill={art.ink} {...stroke} />
      <G transform="rotate(-6 107 54)">
        <Rect x={62} y={30} width={94} height={44} rx={4} fill={art.paper} {...stroke} />
        <SvgText x={109} y={60} fontSize={22} {...signFont}>
          ?
        </SvgText>
      </G>
      <Circle cx={176} cy={74} r={20} fill={art.yellow} {...stroke} />
      <Circle cx={176} cy={74} r={10} fill={art.paper} {...stroke} />
      <Path d="M190 88 L206 104" fill="none" stroke={art.ink} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

/** Nothing saved — a heart on the sign, a seedling, two sparkles. viewBox 240×180. */
export function EmptySavedArt({ width = 240, height = 180, ...rest }: ArtProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180" {...rest}>
      <Path d="M20 160 H220" fill="none" {...stroke} />
      <Rect x={114} y={92} width={7} height={68} fill={art.ink} {...stroke} />
      <G transform="rotate(5 118 62)">
        <Rect x={70} y={32} width={96} height={60} rx={5} fill={art.paper} {...stroke} />
        <Path
          d="M118 80 C 102 70 94 62 94 54 a10 10 0 0 1 24 -4 a10 10 0 0 1 24 4 c0 8 -8 16 -24 26 z"
          fill={art.yellow}
          {...stroke}
        />
      </G>
      <Path d="M44 150 Q40 128 50 112" fill="none" {...stroke} />
      <Path d="M50 112 Q34 104 26 114 Q40 112 50 112 Z" fill={art.palm} {...stroke} />
      <Path d="M50 112 Q62 98 70 106 Q60 108 50 112 Z" fill={art.palm} {...stroke} />
      <Path d="M182 40 V52 M176 46 H188 M196 70 V78 M192 74 H200" fill="none" {...stroke} />
    </Svg>
  );
}
