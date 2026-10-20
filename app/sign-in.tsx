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
};

export default function SignIn() {
  const { signInWithEmail } = useAuth();
  const { t } = useTranslation();
  const toast = useToastController();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<any>(null);

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
      await signInWithEmail(email.trim(), password);
    } catch (error: any) {
      console.error("Email sign in error:", error);

      let message = t("auth.errors.genericSignIn");
      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message = t("auth.errors.invalidCredentials");
          break;
        case "auth/too-many-requests":
          message = t("auth.errors.tooManyRequests");
          break;
        case "auth/network-request-failed":
          message = t("auth.errors.network");
          break;
      }

      toast.show(t("errors.signInError"), { message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signInDescription")}
      footer={
        <YStack gap={20}>
          <XStack justify="center" alignItems="center" gap={6} flexWrap="wrap">
            <Text fontSize={14} color="$color9">
              {t("auth.dontHaveAccount")}
            </Text>
            <Text
              fontSize={14}
              color="$blue10"
              fontWeight="600"
              onPress={() => router.replace("/sign-up")}
              cursor="pointer"
              accessibilityRole="link"
            >
              {t("auth.signUp")}
            </Text>
          </XStack>

          <Text
            fontSize={11.5}
            color="$color8"
            textAlign="center"
            lineHeight={16}
          >
            {t("auth.termsPrefix")}{" "}
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

          {__DEV__ ? (
            <Text
              fontSize={11.5}
              color="$color8"
              textAlign="center"
              onPress={() => router.replace("/setup")}
              cursor="pointer"
            >
              Dev: skip to setup
            </Text>
          ) : null}
        </YStack>
      }
    >
      <YStack gap={16}>
        <AuthField
          id="signin-email"
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
          id="signin-password"
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
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        <AuthButton
          label={t("auth.signIn")}
          loadingLabel={t("auth.signingIn")}
          loading={submitting}
          onPress={handleSubmit}
        />
      </YStack>
    </AuthScreen>
  );
}
