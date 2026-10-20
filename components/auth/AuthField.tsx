import React, { useState } from "react";
import { Input, Label, Text, XStack, YStack } from "tamagui";
import { Eye, EyeOff } from "@tamagui/lucide-icons-2";

type AuthFieldProps = {
  id: string;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words";
  autoComplete?: "email" | "current-password" | "new-password";
  textContentType?: "emailAddress" | "password" | "newPassword";
  returnKeyType?: "next" | "go" | "done";
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  inputRef?: React.RefObject<any>;
};

export function AuthField({
  id,
  label,
  value,
  onChangeText,
  placeholder = label,
  error,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  autoFocus,
  inputRef,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error ? "$red10" : focused ? "$blue10" : "$borderColor";

  return (
    <YStack gap={6}>
      <Label
        htmlFor={id}
        fontSize={13}
        fontWeight="600"
        color={error ? "$red10" : "$color11"}
      >
        {label}
      </Label>

      <XStack
        items="center"
        gap={10}
        px={14}
        height={52}
        rounded="$4"
        borderWidth={1}
        borderColor={borderColor}
        bg="$background"
        animation="quick"
      >
        {icon ? (
          <YStack style={{ opacity: error || focused ? 1 : 0.65 }}>{icon}</YStack>
        ) : null}

        <Input
          id={id}
          ref={inputRef}
          flex={1}
          height="100%"
          padding={0}
          borderWidth={0}
          bg="transparent"
          fontSize={16}
          color="$color"
          placeholderTextColor="$color8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !revealed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          blurOnSubmit={returnKeyType !== "next"}
        />

        {secureTextEntry ? (
          <YStack
            onPress={() => setRevealed((r) => !r)}
            hitSlop={10}
            cursor="pointer"
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? (
              <EyeOff size={18} color="$color8" />
            ) : (
              <Eye size={18} color="$color8" />
            )}
          </YStack>
        ) : null}
      </XStack>

      {error ? (
        <Text fontSize={12.5} color="$red10" pl={2}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <XStack items="center" gap={12}>
      <YStack flex={1} height={1} width="100%" bg="$borderColor" />
      <Text fontSize={12} color="$color8">
        {label}
      </Text>
      <YStack flex={1} height={1} width="100%" bg="$borderColor" />
    </XStack>
  );
}
