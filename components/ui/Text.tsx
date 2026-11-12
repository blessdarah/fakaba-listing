import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { fonts, type, useTheme, type Palette, type TypeVariant } from "theme";

type Weight = "regular" | "medium" | "semibold" | "bold";

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  /** A palette key ("ink", "inkMuted", …) or any colour string. */
  color?: keyof Palette | (string & {});
  /** Override the Inter weight for body variants. Ignored for display variants. */
  weight?: Weight;
  align?: TextStyle["textAlign"];
  underline?: boolean;
};

const weightFont: Record<Weight, string> = {
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
};

const displayFonts: string[] = [fonts.display, fonts.displayBold];

export function Text({
  variant = "base",
  color = "ink",
  weight,
  align,
  underline,
  style,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const base = type[variant];
  const resolvedColor = color in colors ? colors[color as keyof Palette] : color;
  const fontFamily =
    weight && !displayFonts.includes(base.fontFamily) ? weightFont[weight] : base.fontFamily;

  return (
    <RNText
      {...rest}
      style={[
        base,
        { fontFamily, color: resolvedColor },
        align && { textAlign: align },
        underline && { textDecorationLine: "underline" },
        style,
      ]}
    />
  );
}
