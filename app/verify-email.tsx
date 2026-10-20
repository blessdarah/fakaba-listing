import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Text, YStack } from "tamagui";
import { Mail } from "@tamagui/lucide-icons-2";
import { useToastController } from "@tamagui/toast";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../lib/i18n/useTranslation";
import { AuthButton, AuthScreen } from "../components/auth/AuthScreen";

const RESEND_COOLDOWN = 60;
const POLL_INTERVAL = 5000;

export default function VerifyEmail() {
  const { user, checkEmailVerified, resendVerificationEmail, signOut } =
    useAuth();
  const { t } = useTranslation();
  const toast = useToastController();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleVerified = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    router.replace("/setup");
  }, []);

  // Auto-poll to check verification status
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const verified = await checkEmailVerified();
        if (verified) handleVerified();
      } catch {
        // Silently ignore poll errors
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkEmailVerified, handleVerified]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        handleVerified();
      } else {
        toast.show(t("auth.verifyEmail.notVerified"));
      }
    } catch {
      toast.show(t("auth.verifyEmail.notVerified"));
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN);
      toast.show(t("auth.verifyEmail.resent"));
    } catch {
      toast.show(t("auth.verifyEmail.resendFailed"));
    } finally {
      setResending(false);
    }
  };

  const handleDifferentEmail = async () => {
    await signOut();
    router.replace("/sign-up");
  };

  const resendLabel =
    cooldown > 0
      ? t("auth.verifyEmail.resendIn", { seconds: cooldown })
      : t("auth.verifyEmail.resend");

  return (
    <AuthScreen
      title={t("auth.verifyEmail.title")}
      subtitle={t("auth.verifyEmail.subtitle")}
    >
      <YStack gap={20} items="center">
        <YStack
          width={64}
          height={64}
          rounded="$10"
          bg="$blue4"
          items="center"
          justify="center"
        >
          <Mail size={32} color="$blue10" />
        </YStack>

        <Text
          fontSize={16}
          fontWeight="600"
          color="$color"
          textAlign="center"
        >
          {user?.email}
        </Text>

        <Text
          fontSize={14}
          color="$color9"
          textAlign="center"
          lineHeight={20}
        >
          {t("auth.verifyEmail.checkInbox")}
        </Text>

        <YStack gap={12} width="100%">
          <AuthButton
            label={t("auth.verifyEmail.iVerified")}
            loadingLabel={t("auth.verifyEmail.checking")}
            loading={checking}
            onPress={handleCheck}
          />

          <AuthButton
            variant="secondary"
            label={resendLabel}
            loading={resending}
            disabled={cooldown > 0}
            onPress={handleResend}
          />
        </YStack>

        <Text
          fontSize={14}
          color="$blue10"
          fontWeight="600"
          onPress={handleDifferentEmail}
          cursor="pointer"
          accessibilityRole="link"
        >
          {t("auth.verifyEmail.differentEmail")}
        </Text>
      </YStack>
    </AuthScreen>
  );
}
