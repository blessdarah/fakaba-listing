import { Stack } from "expo-router";
export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="filter"
        options={{
          title: "",
          headerShown: false,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
