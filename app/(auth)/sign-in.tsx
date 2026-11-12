import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoMark, Wordmark } from "components/brand";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { authErrorKind, EMAIL_RE } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { radius, useTheme } from "theme";

/** "13 — Sign in" and "73 — Sign in · Errors" */
export default function SignInScreen() {
  const { t } = useTranslation();
  const { signInWithEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [tooMany, setTooMany] = useState(false);

  async function submit() {
    setEmailError(null);
    setPasswordError(null);
    setTooMany(false);

    const trimmed = email.trim();
    if (!trimmed || !password) {
      setPasswordError(t("signIn.errors.required"));
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError(t("signIn.errors.emailInvalid"));
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(trimmed, password);
      // The root navigator's guards take it from here.
    } catch (e) {
      const kind = authErrorKind(e);
      if (kind === "tooMany") setTooMany(true);
      else if (kind === "emailInvalid") setEmailError(t("signIn.errors.emailInvalid"));
      else if (kind === "mismatch") setPasswordError(t("signIn.errors.mismatch"));
      else if (kind === "network") setPasswordError(t("signIn.errors.network"));
      else setPasswordError(t("signIn.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <OnboardingScreen
        edgeToEdgeTop
        statusBar="light"
        hero={
          <View style={[styles.hero, { paddingTop: insets.top + 36 }]}>
            <View style={styles.markRow}>
              <LogoMark size={56} />
              <SignTag label="À LOUER · À VENDRE" />
            </View>
            <Wordmark size={76} />
            <Text variant="lg" color="#FFFFFF" style={styles.tagline}>
              {t("signIn.tagline")}
            </Text>
          </View>
        }
        contentStyle={styles.form}
      >
        <TextField
          label={t("signIn.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) setEmailError(null);
          }}
          placeholder={t("signIn.emailPlaceholder")}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={emailError}
        />
        <TextField
          ref={passwordRef}
          label={t("signIn.password")}
          labelAccessory={
            <Link href="/forgot-password" asChild>
              <Pressable hitSlop={10} accessibilityRole="link">
                <Text variant="label" underline>
                  {t("signIn.forgot")}
                </Text>
              </Pressable>
            </Link>
          }
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError(null);
          }}
          placeholder={t("signIn.passwordPlaceholder")}
          secureTextEntry
          revealable
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={passwordError}
        />
        <Button label={t("signIn.submit")} variant="strong" loading={submitting} onPress={submit} />
        <View style={styles.switchRow}>
          <Text variant="base" color="inkMuted">
            {t("signIn.newHere")}
          </Text>
          <Pressable hitSlop={10} accessibilityRole="link" onPress={() => router.replace("/sign-up")}>
            <Text variant="base" weight="semibold" underline>
              {t("signIn.createAccount")}
            </Text>
          </Pressable>
        </View>
      </OnboardingScreen>

      {tooMany && <TooManyAttempts onDismiss={() => setTooMany(false)} bottom={insets.bottom} />}
    </>
  );
}

function TooManyAttempts({ onDismiss, bottom }: { onDismiss: () => void; bottom: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutDown}
      style={[toast.wrap, { bottom: Math.max(bottom, 16) + 8 }]}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        style={[toast.card, { backgroundColor: "#121212" }]}
      >
        <Icon name="clock" size={20} color={colors.signal} />
        <View style={toast.text}>
          <Text variant="base" weight="semibold" color="#FFFFFF">
            {t("signIn.errors.tooManyTitle")}
          </Text>
          <Text variant="sm" color="#C8C8C4">
            {t("signIn.errors.tooManyBody")}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
    hero: {
      // Fixed brand blue in both themes — the logo mark is drawn on it.
      backgroundColor: "#1300A7",
      paddingHorizontal: 24,
      paddingBottom: 28,
      gap: 14,
    },
    markRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    tagline: { maxWidth: 300 },
    form: { paddingTop: 28, gap: 18 },
    switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, paddingTop: 4 },
});

const toast = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    alignItems: "flex-start",
  },
  text: { flex: 1, gap: 2 },
});
