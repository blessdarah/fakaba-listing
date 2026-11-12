import { useMemo } from "react";
import { useThemePreference } from "contexts/ThemeContext";
import { palettes, type Palette, type ColorScheme } from "./tokens";

export * from "./tokens";

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  isDark: boolean;
};

/** Resolved colours for the current light/dark preference. */
export function useTheme(): Theme {
  const { resolvedTheme } = useThemePreference();
  return useMemo(
    () => ({
      scheme: resolvedTheme,
      colors: palettes[resolvedTheme],
      isDark: resolvedTheme === "dark",
    }),
    [resolvedTheme]
  );
}

/**
 * Build a theme-aware StyleSheet once per colour scheme.
 *
 *   const useStyles = makeStyles((c) => StyleSheet.create({ root: { backgroundColor: c.bg } }));
 *   const styles = useStyles();
 */
export function makeStyles<T>(factory: (colors: Palette, scheme: ColorScheme) => T) {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useStyles(): T {
    const { scheme, colors } = useTheme();
    if (!cache[scheme]) cache[scheme] = factory(colors, scheme);
    return cache[scheme]!;
  };
}
