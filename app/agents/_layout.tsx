import { Stack } from "expo-router";
import { useTheme } from "theme";

export default function AgentsLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="write-review" options={{ presentation: "modal" }} />
    </Stack>
  );
}
