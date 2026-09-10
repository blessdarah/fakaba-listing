import { Toast, useToastState } from "@tamagui/toast";
import { Text, YStack } from "tamagui";

export function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, y: 20, scale: 0.95 }}
      exitStyle={{ opacity: 0, y: 10, scale: 0.97 }}
      opacity={1}
      y={0}
      scale={1}
      bg="$color12"
      borderWidth={0}
      rounded={100}
      px="$5"
      py="$3"
      mx="$4"
      elevation="$3"
    >
      <YStack items="center" gap="$1">
        <Toast.Title>
          <Text color="$color1" fontWeight="600" fontSize={15}>
            {currentToast.title}
          </Text>
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description>
            <Text color="$color5" fontSize={13}>
              {currentToast.message}
            </Text>
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
}
