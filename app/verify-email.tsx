import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { InboxArt } from "components/illustrations";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { formatCountdown } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { useCountdown } from "lib/useCountdown";
import { radius, useTheme } from "theme";

/** "22 — Onboarding · Verify email" */
export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, checkEmailVerified, resendVerificationEmail, signOut } = useAuth();
  const countdown = useCountdown(60);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [notYet, setNotYet] = useState(false);

  // Coming back from the mail app is the moment people expect this to "just work".
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkEmailVerified().catch(() => {});
    });
    return () => sub.remove();
  }, [checkEmailVerified]);

  async function confirm() {
    setChecking(true);
    setNotYet(false);
    try {
      const ok = await checkEmailVerified();
      if (!ok) setNotYet(true);
    } finally {
      setChecking(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await resendVerificationEmail();
      countdown.restart();
    } catch {
      // Firebase throttles resends; the timer still guides people.
      countdown.restart();
    } finally {
      setResending(false);
    }
  }

  return (
    <OnboardingScreen
      contentStyle={styles.content}
      footer={
        <>
          <Button label={t("verify.submit")} loading={checking} onPress={confirm} />
          <Button label={t("verify.differentEmail")} variant="link" onPress={() => signOut()} />
        </>
      }
    >
      <Animated.View entering={FadeIn.duration(350)} style={styles.art}>
        <InboxArt />
      </Animated.View>
      <ScreenTitle
        title={t("verify.title")}
        lead={t("verify.lead", { email: user?.email ?? "" })}
      />

      <View style={[styles.resendBar, { backgroundColor: colors.surface }]}>
        <Text variant="sm" color="inkMuted" style={styles.flex}>
          {t("verify.nothingYet")}
        </Text>
        {countdown.done ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            disabled={resending}
            onPress={resend}
          >
            <Text variant="sm" weight="semibold" underline>
              {t("verify.resend")}
            </Text>
          </Pressable>
        ) : (
          <Text variant="sm" weight="semibold" color="inkSubtle">
            {t("verify.resendIn", { time: formatCountdown(countdown.left) })}
          </Text>
        )}
      </View>

      {notYet && (
        <Animated.View entering={FadeIn} style={styles.notYet}>
          <Icon name="info" size={16} color="inkMuted" style={styles.icon} />
          <Text variant="sm" color="inkMuted" style={styles.flex}>
            {t("verify.notYet")}
          </Text>
        </Animated.View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 24, paddingTop: 32 },
  art: { alignItems: "center" },
  resendBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  notYet: { flexDirection: "row", gap: 10, marginTop: -8 },
  icon: { marginTop: 2 },
  flex: { flex: 1 },
});
