import { Stack } from "expo-router";

export default function AgentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Agents",
          headerShown: false,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          title: "Agent Detail",
          headerBackTitle: "Back",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
