import { Pressable } from "react-native";
import { Text, YStack, Button } from "tamagui";
import { useRouter, Stack } from "expo-router";

export default function FilterModal() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <Pressable
        style={{ flex: 1 }}
        onPress={() => router.back()} // tap outside to close
      >
        <YStack
          height="70%"
          position="absolute"
          b={0}
          l={0}
          r={0}
          bg="$background"
          p="$5"
          gap="$4"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          elevation="$4"
        >
          <Text fontSize="$8" fontWeight="800">
            Filters
          </Text>

          {/* Your filters UI */}
          <Text>Price range</Text>
          <Text>Bedrooms</Text>

          <Button onPress={() => router.back()}>Apply Filters</Button>
        </YStack>
      </Pressable>
    </>
  );
}
