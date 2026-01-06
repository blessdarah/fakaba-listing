import { YStack, H2, Separator, Text } from "tamagui";

export default function Listings() {
  return (
    <YStack flex={1} p="$4" bg="$background">
      <YStack gap="$2" pt="$8">
        <H2>Listings</H2>
        <Separator />
      </YStack>
      <YStack flex={1} justify="center" verticalAlign="center">
        <Text fontSize={16}>Working on it</Text>
      </YStack>
    </YStack>
  );
}
