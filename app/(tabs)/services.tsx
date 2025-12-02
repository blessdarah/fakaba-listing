import { YStack, H2, Text, Separator } from "tamagui";

export default function ServicesScreen() {
  return (
    <YStack flex={1} p="$4" bg="$background">
      <YStack gap="$2" pt="$8">
        <H2>Services</H2>
        <Separator />
      </YStack>
      <YStack flex={1} justify="center" verticalAlign="center">
        <Text fontSize={16} color="$gray11">
          Browse available services
        </Text>
      </YStack>
    </YStack>
  );
}
