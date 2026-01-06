import { YStack, H2, Text, Separator } from "tamagui";

export default function SearchScreen() {
  return (
    <YStack flex={1} p="$4" bg="$background">
      <YStack gap="$2" pt="$8">
        <H2>Search</H2>
        <Separator />
      </YStack>
      <YStack flex={1} justify="center" items="center">
        <Text fontSize={16}>Search for items and locations</Text>
      </YStack>
    </YStack>
  );
}
