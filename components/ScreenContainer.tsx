import { YStack } from "tamagui";

export default function ScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <YStack flex={1} p="$5" gap="$2" bg="$background">
      {children}
    </YStack>
  );
}
