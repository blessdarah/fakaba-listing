import { YStack, H2, Text, Separator } from "tamagui";

export default function SearchScreen() {
  return (
    <YStack flex={1} padding="$4" bg="$background">
      <YStack space="$2" paddingTop="$8">
        <H2>Search</H2>
        <Separator />
      </YStack>
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={16} color="$gray11">
          Search for items and locations
        </Text>
      </YStack>
    </YStack>
  );
}
