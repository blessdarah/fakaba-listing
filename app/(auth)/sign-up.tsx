import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { Button } from "components/ui/Button";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { authErrorKind, EMAIL_RE, passwordScore } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { useTheme } from "theme";

/** "21 — Onboarding · Sign up" */
export default function SignUpScreen() {
  const { t } = useTranslation();
  const { signUpWithEmail } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  async function submit() {
    const next: typeof errors = {};
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) next.email = t("signUp.errors.emailInvalid");
    if (password.length < 8) next.password = t("signUp.errors.tooShort");
    if (confirm !== password) next.confirm = t("signUp.errors.mismatch");
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signUpWithEmail(trimmed, password);
      // Guard moves us to /verify-email.
    } catch (e) {
      const kind = authErrorKind(e);
      if (kind === "emailInUse") setErrors({ email: t("signUp.errors.emailInUse") });
      else if (kind === "emailInvalid") setErrors({ email: t("signUp.errors.emailInvalid") });
      else if (kind === "weakPassword") setErrors({ password: t("signUp.errors.tooShort") });
      else if (kind === "network") setErrors({ confirm: t("signIn.errors.network") });
      else setErrors({ confirm: t("signIn.errors.generic") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OnboardingScreen
      contentStyle={styles.content}
      footer={
        <>
          <Button label={t("signUp.submit")} loading={submitting} onPress={submit} />
          <Text variant="label" color="inkMuted" align="center" style={styles.legal}>
            {t("signUp.legal")}
          </Text>
        </>
      }
    >
      <IconButton
        icon="back"
        accessibilityLabel={t("setup.back")}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/welcome"))}
        style={styles.back}
      />
      <ScreenTitle title={t("signUp.title")} lead={t("signUp.lead")} />

      <View style={styles.fields}>
        <TextField
          label={t("signUp.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder={t("signUp.emailPlaceholder")}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email}
        />
        <View style={styles.passwordBlock}>
          <TextField
            ref={passwordRef}
            label={t("signUp.password")}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            placeholder={t("signUp.passwordPlaceholder")}
            secureTextEntry
            revealable
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
          />
          {password.length > 0 && !errors.password && <StrengthMeter password={password} />}
        </View>
        <TextField
          ref={confirmRef}
          label={t("signUp.confirm")}
          value={confirm}
          onChangeText={(v) => {
            setConfirm(v);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
          }}
          placeholder={t("signUp.confirmPlaceholder")}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={errors.confirm}
        />
      </View>
    </OnboardingScreen>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const score = passwordScore(password);
  const label = (["weak", "fair", "good", "strong"] as const)[score - 1];
  const tone = score <= 1 ? colors.danger : score === 2 ? colors.inkMuted : colors.palm;
  return (
    <View style={styles.meter} accessibilityLabel={`${t("signUp.password")}: ${t(`signUp.strength.${label}`)}`}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < score ? tone : colors.line }]}
          />
        ))}
      </View>
      <Text variant="label" color={tone} style={styles.meterLabel}>
        {t(`signUp.strength.${label}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 0 },
  back: { marginBottom: 28 },
  fields: { gap: 18, paddingTop: 24 },
  passwordBlock: { gap: 10 },
  meter: { flexDirection: "row", alignItems: "center", gap: 10 },
  bars: { flex: 1, flexDirection: "row", gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  meterLabel: { minWidth: 48, textAlign: "right" },
  legal: { fontFamily: "Inter_400Regular", paddingHorizontal: 12 },
});
