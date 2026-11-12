import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { InboxArt } from "components/illustrations";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { authErrorKind, EMAIL_RE, formatCountdown } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { useCountdown } from "lib/useCountdown";

/** "56 — Forgot password" → "57 — Forgot · Link sent" */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { sendPasswordReset } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const countdown = useCountdown(60, false);

  async function send() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError(t("signIn.errors.emailInvalid"));
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendPasswordReset(trimmed);
      setSentTo(trimmed);
      countdown.restart();
    } catch (e) {
      const kind = authErrorKind(e);
      // Don't reveal whether an account exists: user-not-found still shows "sent".
      if (kind === "mismatch") {
        setSentTo(trimmed);
        countdown.restart();
      } else if (kind === "network") setError(t("signIn.errors.network"));
      else if (kind === "emailInvalid") setError(t("signIn.errors.emailInvalid"));
      else setError(t("signIn.errors.generic"));
    } finally {
      setSending(false);
    }
  }

  const goSignIn = () => (router.canGoBack() ? router.back() : router.replace("/sign-in"));

  if (sentTo) {
    return (
      <OnboardingScreen
        contentStyle={styles.sent}
        footer={
          <>
            <Button label={t("forgot.backToSignIn")} variant="strong" onPress={goSignIn} />
            {countdown.done ? (
              <Button label={t("forgot.resend")} variant="link" loading={sending} onPress={send} />
            ) : (
              <Text variant="base" weight="semibold" color="inkSubtle" align="center" style={styles.resend}>
                {t("forgot.resendIn", { time: formatCountdown(countdown.left) })}
              </Text>
            )}
          </>
        }
      >
        <Animated.View entering={FadeIn.duration(300)} style={styles.art}>
          <InboxArt />
        </Animated.View>
        <ScreenTitle title={t("forgot.sentTitle")} lead={t("forgot.sentBody", { email: sentTo })} />
        <View style={styles.hint}>
          <Icon name="info" size={16} color="inkMuted" style={styles.hintIcon} />
          <Text variant="label" color="inkMuted" style={styles.hintText}>
            {t("forgot.sentHint")}
          </Text>
        </View>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen
      footer={
        <>
          <Button label={t("forgot.submit")} loading={sending} onPress={send} />
          <View style={styles.switchRow}>
            <Text variant="base" color="inkMuted">
              {t("forgot.remembered")}
            </Text>
            <Pressable hitSlop={10} accessibilityRole="link" onPress={goSignIn}>
              <Text variant="base" weight="semibold" underline>
                {t("forgot.signIn")}
              </Text>
            </Pressable>
          </View>
        </>
      }
    >
      <IconButton icon="back" accessibilityLabel={t("setup.back")} onPress={goSignIn} style={styles.back} />
      <ScreenTitle title={t("forgot.title")} lead={t("forgot.lead")} />
      <View style={styles.field}>
        <TextField
          label={t("signIn.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError(null);
          }}
          placeholder={t("signIn.emailPlaceholder")}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={send}
          autoFocus
          error={error}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 28 },
  field: { paddingTop: 24 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
  sent: { gap: 24, paddingTop: 32 },
  art: { alignItems: "center" },
  hint: { flexDirection: "row", gap: 10 },
  hintIcon: { marginTop: 1 },
  hintText: { flex: 1, fontFamily: "Inter_400Regular", lineHeight: 20 },
  resend: { paddingVertical: 6 },
});
