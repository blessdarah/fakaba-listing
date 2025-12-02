import { YStack, H2, Text, Separator } from "tamagui";

export default function FavoritesScreen() {
  return (
    <YStack flex={1} p="$4" bg="$background">
      <YStack gap="$2" pt="$8">
        <H2>Favorites</H2>
        <Separator />
      </YStack>
      <YStack flex={1} justify="center" verticalAlign="center">
        <Text fontSize={16} color="$gray11">
          Your favorite items will appear here
        </Text>
      </YStack>
    </YStack>
  );
}
