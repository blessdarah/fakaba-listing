import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";
import { ChevronLeft } from "@tamagui/lucide-icons-2";

type AuthScreenProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  onBack?: () => void;
};

export function AuthScreen({
  children,
  title,
  subtitle,
  footer,
  onBack,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <YStack
          flex={1}
          width="100%"
          maxW={440}
          alignSelf="center"
          justify="center"
          gap={28}
        >
          {onBack ? (
            <YStack
              onPress={onBack}
              hitSlop={12}
              width={40}
              height={40}
              rounded="$10"
              items="center"
              justify="center"
              cursor="pointer"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={24} color="$color" />
            </YStack>
          ) : null}

          <YStack gap={8}>
            <Wordmark />
            <YStack gap={4}>
              <Text
                fontSize={30}
                fontWeight="700"
                color="$color"
                letterSpacing={-0.6}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text fontSize={15} color="$color9" lineHeight={21}>
                  {subtitle}
                </Text>
              ) : null}
            </YStack>
          </YStack>

          {children}

          {footer}
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Wordmark() {
  return (
    <XStack items="center" gap={8}>
      <YStack
        width={24}
        height={24}
        rounded={7}
        items="center"
        justify="center"
        bg="$blue10"
      >
        <YStack width={11} height={11} rounded={3} bg="$background" />
      </YStack>
      <Text fontSize={15} fontWeight="700" color="$color" letterSpacing={-0.2}>
        Fakaba
      </Text>
    </XStack>
  );
}

type AuthButtonProps = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function AuthButton({
  label,
  loadingLabel,
  loading = false,
  disabled = false,
  onPress,
  variant = "primary",
}: AuthButtonProps) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  return (
    <Button
      disabled={isDisabled}
      onPress={onPress}
      opacity={isDisabled ? 0.55 : 1}
      animation="quick"
      cursor={isDisabled ? "default" : "pointer"}
      bg={isPrimary ? "$blue10" : "$background"}
      borderWidth={isPrimary ? 0 : 1}
      borderColor="$borderColor"
      rounded="$4"
      overflow="hidden"
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <XStack
        items="center"
        justify="center"
        gap={10}
        height={54}
        px={20}
        width="100%"
      >
        {loading ? <Spinner size="small" color={isPrimary ? "#fff" : "$color"} /> : null}
        <Button.Text fontSize={16} fontWeight="600" color={isPrimary ? "#fff" : "$color"}>
          {loading && loadingLabel ? loadingLabel : label}
        </Button.Text>
      </XStack>
    </Button>
  );
}
