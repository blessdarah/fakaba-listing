import { Stack } from "expo-router";
import { useTheme } from "theme";

/** Service detail ("62") and the admin form ("63", presented modally). */
export default function ServiceLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="edit" options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
    </Stack>
  );
}
