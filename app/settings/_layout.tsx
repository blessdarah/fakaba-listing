import { Stack } from "expo-router";
import { useTheme } from "theme";

/** Profile sub-screens: edit profile, change password, delete account. */
export default function SettingsLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    />
  );
}
