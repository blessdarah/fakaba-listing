import { ExternalLink } from "@tamagui/lucide-icons";
import { Anchor, H2, Paragraph, XStack, YStack } from "tamagui";
import { ToastControl } from "components/CurrentToast";

export default function TabOneScreen() {
  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <H2>Home</H2>

      <ToastControl />

      <XStack
        items="center"
        justify="center"
        flexWrap="wrap"
        gap="$1.5"
        position="absolute"
        b="$8"
      >
        <Paragraph fontSize="$5" text="center">
          to configure your themes and tokens.
        </Paragraph>
      </XStack>
    </YStack>
  );
}
