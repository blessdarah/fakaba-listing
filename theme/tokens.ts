/**
 * Fakaba "Signage" design tokens — mirrored from the Paper design system
 * (file "Fakaba — Design System", artboard "00 — Foundations").
 *
 * Brand blue is the stamp (logo, splash, sign-in). Yellow is a fill, never
 * text. Ink does the everyday work. Palm means "talk to a person". Red means
 * "this can't be undone".
 */

export type ColorScheme = "light" | "dark";

const light = {
  bg: "#FFFFFF",
  surface: "#F3F3F1",
  line: "#E6E6E2",
  ink: "#121212",
  inkMuted: "#5E5E5A",
  inkSubtle: "#8C8C87",
  onInk: "#FFFFFF",
  signal: "#FFD700",
  signalTint: "#FFF7CC",
  palm: "#0B7A4B",
  palmTint: "#E2F2EA",
  danger: "#D4372C",
  dangerTint: "#FBE7E5",
  scrim: "rgba(18,18,18,0.55)",
  brand: "#1300A7",
  brandTint: "#ECE9FB",
  onBrand: "#FFFFFF",
  onBrandMuted: "#C9C4F0",
  /** Skeleton / shimmer base used on loading states. */
  skeleton: "#ECECE8",
  /** Floating white chip / heart button over photos. */
  float: "rgba(255,255,255,0.92)",
};

export type Palette = typeof light;

const dark: Palette = {
  bg: "#0E0D16",
  surface: "#1A1926",
  line: "#2B2A3A",
  ink: "#F3F2F8",
  inkMuted: "#A9A7BA",
  inkSubtle: "#77758A",
  onInk: "#0E0D16",
  signal: "#FFD700",
  signalTint: "rgba(255,215,0,0.14)",
  palm: "#2FA56F",
  palmTint: "rgba(47,165,111,0.16)",
  danger: "#F0574B",
  dangerTint: "rgba(240,87,75,0.14)",
  scrim: "rgba(0,0,0,0.6)",
  brand: "#3A2BE0",
  brandTint: "#24204A",
  onBrand: "#FFFFFF",
  onBrandMuted: "#C9C4F0",
  skeleton: "#1F1E2C",
  float: "rgba(14,13,22,0.86)",
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

/** Fixed illustration colours — illustrations don't re-tint in dark mode. */
export const art = {
  ink: "#121212",
  paper: "#FFFFFF",
  yellow: "#FFC70A",
  cream: "#FFF4CC",
  palm: "#0B7A4B",
  stone: "#E6E6E2",
  surface: "#F3F3F1",
};

/** 4px base. 20px screen gutter. */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const gutter = 20;
/** Onboarding screens use a slightly wider 24px gutter in the designs. */
export const onboardingGutter = 24;

/** Soft photos (20), firm controls (14), sharp signs (4). */
export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

export const opacity = {
  disabled: 0.4,
  pressed: 0.85,
};

/** Font family names as registered with expo-font in app/_layout.tsx. */
export const fonts = {
  display: "BricolageGrotesque_800ExtraBold",
  displayBold: "BricolageGrotesque_700Bold",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

/**
 * Type scale. Bricolage Grotesque 800 shouts — headlines and prices.
 * Inter speaks — everything you read or tap. Letter-spacing converted from em.
 */
export const type = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: -1.4 },
  hero: { fontFamily: fonts.display, fontSize: 38, lineHeight: 40, letterSpacing: -1.33 },
  h1: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -1.19 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.48 },
  title: { fontFamily: fonts.displayBold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
  lg: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  base: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  sm: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 16 },
  xs: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  caps: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.88 },
  tag: { fontFamily: fonts.display, fontSize: 12, lineHeight: 16, letterSpacing: 0.96 },
} as const;

export type TypeVariant = keyof typeof type;
