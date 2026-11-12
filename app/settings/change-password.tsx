import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { ScreenHeader } from "components/settings/ScreenHeader";
import { Button } from "components/ui/Button";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { authErrorKind, passwordScore } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { useTheme } from "theme";

const MIN_LENGTH = 6;

/** "55 — Change password". On success we sign out so the new password is used. */
export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { user, changePassword, sendPasswordReset, signOut } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const canSubmit = current.length > 0 && next.length >= MIN_LENGTH && confirm.length > 0;

  async function submit() {
    if (!canSubmit) return;
    if (next !== confirm) {
      setConfirmError(t("account.password.mismatch"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await changePassword(current, next);
      Alert.alert(t("account.password.doneTitle"), t("account.password.doneBody"), [
        { text: t("common.ok"), onPress: () => signOut().catch(() => {}) },
      ]);
    } catch (e) {
      const kind = authErrorKind(e);
      if (kind === "mismatch") setCurrentError(t("account.password.wrongCurrent"));
      else if (kind === "weakPassword") setError(t("account.password.weak"));
      else if (kind === "tooMany") setError(t("account.password.tooMany"));
      else if (kind === "network") setError(t("signIn.errors.network"));
      else setError(t("signIn.errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function forgot() {
    if (!user?.email) return;
    try {
      await sendPasswordReset(user.email);
      Alert.alert(t("account.password.resetSentTitle"), t("account.password.resetSentBody", { email: user.email }));
    } catch {
      Alert.alert(t("signIn.errors.generic"));
    }
  }

  return (
    <OnboardingScreen
      footer={
        <>
          {error && (
            <Text variant="sm" color="danger" align="center">
              {error}
            </Text>
          )}
          <Button label={t("account.changePassword")} disabled={!canSubmit} loading={saving} onPress={submit} />
        </>
      }
    >
      <View style={styles.back}>
        <ScreenHeader onBack={() => router.back()} />
      </View>
      <ScreenTitle title={t("account.changePassword")} lead={t("account.password.lead")} />
      <View style={styles.fields}>
        <TextField
          label={t("account.password.current")}
          labelAccessory={
            <Pressable accessibilityRole="button" hitSlop={8} onPress={forgot}>
              <Text variant="label" underline>
                {t("account.password.forgot")}
              </Text>
            </Pressable>
          }
          value={current}
          onChangeText={(v) => {
            setCurrent(v);
            if (currentError) setCurrentError(null);
          }}
          secureTextEntry
          revealable
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          onSubmitEditing={() => nextRef.current?.focus()}
          error={currentError}
        />
        <View style={styles.newBlock}>
          <TextField
            ref={nextRef}
            label={t("account.password.new")}
            value={next}
            onChangeText={setNext}
            secureTextEntry
            revealable
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          {next.length > 0 && <Strength password={next} />}
          <Text variant="xs" color="inkMuted" style={styles.hint}>
            {t("account.password.hint")}
          </Text>
        </View>
        <TextField
          ref={confirmRef}
          label={t("account.password.confirm")}
          placeholder={t("account.password.confirmPlaceholder")}
          value={confirm}
          onChangeText={(v) => {
            setConfirm(v);
            if (confirmError) setConfirmError(null);
          }}
          secureTextEntry
          revealable
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={confirmError}
        />
      </View>
    </OnboardingScreen>
  );
}

/** Four bars + label; "Too short" until the minimum length. */
function Strength({ password }: { password: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const short = password.length < MIN_LENGTH;
  const score = short ? 1 : passwordScore(password);
  const label = short ? t("account.password.tooShort") : t(`signUp.strength.${["weak", "fair", "good", "strong"][score - 1]}`);
  const tone = score <= 1 ? colors.danger : score === 2 ? colors.inkMuted : colors.palm;
  return (
    <View style={styles.meter} accessibilityLabel={`${t("account.password.new")}: ${label}`}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i < score ? tone : colors.line }]} />
        ))}
      </View>
      <Text variant="label" color={tone} style={styles.meterLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 28 },
  fields: { gap: 18, paddingTop: 24 },
  newBlock: { gap: 10 },
  hint: { fontSize: 13 },
  meter: { flexDirection: "row", alignItems: "center", gap: 10 },
  bars: { flex: 1, flexDirection: "row", gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  meterLabel: { minWidth: 48, textAlign: "right" },
});
