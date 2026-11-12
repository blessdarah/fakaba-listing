import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { opacity, radius, useTheme, type Palette } from "theme";
import { Icon, type IconName } from "./Icon";

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  /** Background palette key. Defaults to surface. */
  tone?: keyof Palette;
  iconColor?: keyof Palette | (string & {});
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 40,
  iconSize = 20,
  tone = "surface",
  iconColor = "ink",
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: colors[tone],
          alignItems: "center",
          justifyContent: "center",
        },
        pressed && { opacity: opacity.pressed },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={iconColor} weight="semibold" />
    </Pressable>
  );
}
