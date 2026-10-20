import { useRef, useState } from "react";
import { Linking } from "react-native";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { Mail, Lock } from "@tamagui/lucide-icons-2";
import { useToastController } from "@tamagui/toast";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../lib/i18n/useTranslation";
import { AuthButton, AuthScreen } from "../components/auth/AuthScreen";
import { AuthField } from "../components/auth/AuthField";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignUp() {
  const { signUpWithEmail } = useAuth();
  const { t } = useTranslation();
  const toast = useToastController();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = t("auth.validation.emailRequired");
    } else if (!isValidEmail(email.trim())) {
      next.email = t("auth.validation.emailInvalid");
    }

    if (!password) {
      next.password = t("auth.validation.passwordRequired");
    } else if (password.length < 6) {
      next.password = t("auth.validation.passwordTooShort");
    }

    if (!confirmPassword) {
      next.confirmPassword = t("auth.validation.confirmRequired");
    } else if (password && confirmPassword !== password) {
      next.confirmPassword = t("auth.validation.passwordMismatch");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (submitting || !validate()) return;

    try {
      setSubmitting(true);
      await signUpWithEmail(email.trim(), password);
    } catch (error: any) {
      console.error("Email sign up error:", error);

      let message = t("auth.errors.genericSignUp");
      switch (error?.code) {
        case "auth/email-already-in-use":
        case "auth/invalid-email":
          message = t("auth.errors.emailInUse");
          break;
        case "auth/weak-password":
          message = t("auth.errors.weakPassword");
          break;
        case "auth/too-many-requests":
          message = t("auth.errors.tooManyRequests");
          break;
        case "auth/network-request-failed":
          message = t("auth.errors.network");
          break;
      }

      toast.show(t("errors.signUpError"), { message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={t("auth.createAccount")}
      subtitle={t("auth.signUpDescription")}
      onBack={() => router.replace("/sign-in")}
      footer={
        <YStack gap={20}>
          <XStack justify="center" alignItems="center" gap={6} flexWrap="wrap">
            <Text fontSize={14} color="$color9">
              {t("auth.alreadyHaveAccount")}
            </Text>
            <Text
              fontSize={14}
              color="$blue10"
              fontWeight="600"
              onPress={() => router.replace("/sign-in")}
              cursor="pointer"
              accessibilityRole="link"
            >
              {t("auth.signIn")}
            </Text>
          </XStack>

          <Text
            fontSize={11.5}
            color="$color8"
            textAlign="center"
            lineHeight={16}
          >
            {t("auth.termsSignUpPrefix")}{" "}
            <Text
              fontSize={11.5}
              color="$blue10"
              onPress={() => Linking.openURL("https://www.fakaba.com/terms")}
              cursor="pointer"
              accessibilityRole="link"
            >
              {t("auth.termsOfService")}
            </Text>{" "}
            {t("auth.and")}{" "}
            <Text
              fontSize={11.5}
              color="$blue10"
              onPress={() => Linking.openURL("https://fakaba.com/privacy-policy")}
              cursor="pointer"
              accessibilityRole="link"
            >
              {t("auth.privacyPolicy")}
            </Text>
          </Text>
        </YStack>
      }
    >
      <YStack gap={16}>
        <AuthField
          id="signup-email"
          label={t("auth.fields.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            clearError("email");
          }}
          error={errors.email}
          icon={<Mail size={18} color="$color8" />}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          autoFocus
        />

        <AuthField
          id="signup-password"
          label={t("auth.fields.password")}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearError("password");
          }}
          error={errors.password}
          icon={<Lock size={18} color="$color8" />}
          inputRef={passwordRef}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        <AuthField
          id="signup-confirm-password"
          label={t("auth.fields.confirmPassword")}
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            clearError("confirmPassword");
          }}
          error={errors.confirmPassword}
          icon={<Lock size={18} color="$color8" />}
          inputRef={confirmRef}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        <AuthButton
          label={t("auth.signUp")}
          loadingLabel={t("auth.creatingAccount")}
          loading={submitting}
          onPress={handleSubmit}
        />
      </YStack>
    </AuthScreen>
  );
}
