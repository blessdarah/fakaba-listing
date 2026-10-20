import { useState } from "react";
import {
  View,
  ScrollView,
  YStack,
  XStack,
  Text,
  Input,
  Label,
  Button,
  Spinner,
} from "tamagui";
import { ChevronLeft, Lock } from "@tamagui/lucide-icons-2";
import { Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastController } from "@tamagui/toast";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToastController();
  const { changePassword, signOut } = useAuth();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!currentPassword) {
      next.currentPassword = t("changePassword.errorCurrentRequired");
    }

    if (!newPassword) {
      next.newPassword = t("changePassword.errorNewRequired");
    } else if (newPassword.length < 6) {
      next.newPassword = t("changePassword.errorTooShort");
    }

    if (!confirmPassword) {
      next.confirmPassword = t("changePassword.errorConfirmRequired");
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = t("changePassword.errorMismatch");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    Alert.alert(
      t("changePassword.confirmTitle"),
      t("changePassword.confirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          style: "destructive",
          onPress: async () => {
            setIsPending(true);
            try {
              await changePassword(currentPassword, newPassword);
              toast.show(t("changePassword.success"));
              await signOut();
            } catch (error: any) {
              const code = error?.code;
              if (
                code === "auth/wrong-password" ||
                code === "auth/invalid-credential"
              ) {
                toast.show(t("common.error"), {
                  message: t("changePassword.errorWrongPassword"),
                });
              } else {
                toast.show(t("common.error"), {
                  message: t("changePassword.errorGeneric"),
                });
              }
            } finally {
              setIsPending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View flex={1} bg="$background">
      {/* Header */}
      <XStack
        pt={insets.top + 8}
        pb="$3"
        px="$4"
        items="center"
        gap="$3"
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} color="$color" />
        </Pressable>
        <Text fontSize="$6" fontWeight="700" flex={1}>
          {t("changePassword.title")}
        </Text>
      </XStack>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack p="$4" gap="$4" pb={insets.bottom + 32}>
            {/* Current Password */}
            <YStack gap="$1">
              <Label fontSize={14} fontWeight="600">
                {t("changePassword.currentPassword")}
              </Label>
              <XStack
                borderWidth={1}
                borderColor={errors.currentPassword ? "$red10" : "$borderColor"}
                rounded="$6"
                items="center"
                px="$3"
              >
                <Lock
                  size={20}
                  color={errors.currentPassword ? "$red10" : "gray"}
                />
                <Input
                  flex={1}
                  size="$5"
                  bg="transparent"
                  borderWidth={0}
                  placeholder={t("changePassword.currentPasswordPlaceholder")}
                  value={currentPassword}
                  onChangeText={(v) => {
                    setCurrentPassword(v);
                    if (errors.currentPassword)
                      setErrors((e) => ({ ...e, currentPassword: undefined }));
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="current-password"
                />
              </XStack>
              {errors.currentPassword ? (
                <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                  {errors.currentPassword}
                </Text>
              ) : null}
            </YStack>

            {/* New Password */}
            <YStack gap="$1">
              <Label fontSize={14} fontWeight="600">
                {t("changePassword.newPassword")}
              </Label>
              <XStack
                borderWidth={1}
                borderColor={errors.newPassword ? "$red10" : "$borderColor"}
                rounded="$6"
                items="center"
                px="$3"
              >
                <Lock
                  size={20}
                  color={errors.newPassword ? "$red10" : "gray"}
                />
                <Input
                  flex={1}
                  size="$5"
                  bg="transparent"
                  borderWidth={0}
                  placeholder={t("changePassword.newPasswordPlaceholder")}
                  value={newPassword}
                  onChangeText={(v) => {
                    setNewPassword(v);
                    if (errors.newPassword)
                      setErrors((e) => ({ ...e, newPassword: undefined }));
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
              </XStack>
              {errors.newPassword ? (
                <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                  {errors.newPassword}
                </Text>
              ) : null}
            </YStack>

            {/* Confirm New Password */}
            <YStack gap="$1">
              <Label fontSize={14} fontWeight="600">
                {t("changePassword.confirmPassword")}
              </Label>
              <XStack
                borderWidth={1}
                borderColor={errors.confirmPassword ? "$red10" : "$borderColor"}
                rounded="$6"
                items="center"
                px="$3"
              >
                <Lock
                  size={20}
                  color={errors.confirmPassword ? "$red10" : "gray"}
                />
                <Input
                  flex={1}
                  size="$5"
                  bg="transparent"
                  borderWidth={0}
                  placeholder={t("changePassword.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    if (errors.confirmPassword)
                      setErrors((e) => ({ ...e, confirmPassword: undefined }));
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
              </XStack>
              {errors.confirmPassword ? (
                <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </YStack>

            {/* Submit Button */}
            <Button
              size="$5"
              bg={isPending ? "$color5" : "$blue9"}
              rounded="$6"
              height={56}
              disabled={isPending}
              onPress={handleSubmit}
              mt="$2"
            >
              {isPending ? (
                <XStack gap="$2" items="center">
                  <Spinner size="small" color="white" />
                  <Button.Text color="white" fontWeight="700">
                    {t("changePassword.changing")}
                  </Button.Text>
                </XStack>
              ) : (
                <Button.Text color="white" fontWeight="700">
                  {t("changePassword.submit")}
                </Button.Text>
              )}
            </Button>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
