import { YStack } from "tamagui";

export default function ScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <YStack flex={1} p="$5" mt={40} gap="$2">
      {children}
    </YStack>
  );
}
