import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { ScreenHeader } from "components/settings/ScreenHeader";
import { Button } from "components/ui/Button";
import { Icon, type IconName } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { authErrorKind } from "lib/authErrors";
import { useTranslation } from "lib/i18n/useTranslation";
import { useMyListings, useUpdateListingStatus } from "lib/query/useListings";
import { opacity, radius, useTheme } from "theme";

/** "58 — Delete account · What goes" → "59 — Confirm" → "60 — Account deleted". */
export default function DeleteAccountScreen() {
  const [step, setStep] = useState<"what" | "confirm">("what");
  return step === "what" ? (
    <WhatGoes onContinue={() => setStep("confirm")} />
  ) : (
    <Confirm onBack={() => setStep("what")} />
  );
}

function WhatGoes({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, userProfile } = useAuth();
  const uid = user?.uid ?? "";
  const { data: listings } = useMyListings(uid);
  const hide = useUpdateListingStatus(uid);

  const live = (listings ?? []).filter((l) => l.status === "active");
  const listingCount = listings?.length ?? 0;
  const savedCount = userProfile?.favorites?.length ?? 0;

  const items: { icon: IconName; title: string; sub?: string }[] = [
    { icon: "person", title: t("account.delete.profile"), sub: t("account.delete.profileSub") },
    ...(listingCount > 0
      ? [{ icon: "home" as const, title: t("account.delete.listings", { count: listingCount }), sub: t("account.delete.listingsSub") }]
      : []),
    ...(savedCount > 0 ? [{ icon: "heart" as const, title: t("account.delete.saved", { count: savedCount }) }] : []),
    { icon: "star", title: t("account.delete.reviews") },
  ];

  async function hideListings() {
    try {
      await Promise.all(live.map((l) => hide.mutateAsync({ id: l.id, status: "inactive" })));
      Alert.alert(t("account.delete.hiddenTitle"), t("account.delete.hiddenBody"), [
        { text: t("common.ok"), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t("signIn.errors.generic"));
    }
  }

  return (
    <OnboardingScreen footer={<Button label={t("account.delete.continue")} variant="destructive" onPress={onContinue} />}>
      <View style={styles.back}>
        <ScreenHeader />
      </View>
      <ScreenTitle title={t("account.delete.title")} lead={t("account.delete.lead")} />
      <View style={styles.list}>
        {items.map((item, i) => (
          <View
            key={item.icon}
            style={[
              styles.item,
              i < items.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
            ]}
          >
            <View style={[styles.itemIcon, { backgroundColor: colors.dangerTint }]}>
              <Icon name={item.icon} size={15} color="danger" weight="semibold" />
            </View>
            <View style={styles.itemText}>
              <Text variant="base" weight="semibold">
                {item.title}
              </Text>
              {item.sub ? (
                <Text variant="xs" color="inkMuted" style={styles.itemSub}>
                  {item.sub}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {live.length > 0 && (
        <View style={[styles.note, { backgroundColor: colors.surface }]}>
          <Icon name="alert" size={18} style={styles.noteIcon} />
          <View style={styles.noteText}>
            <Text variant="sm">{t("account.delete.breakBody")}</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={hideListings}
              disabled={hide.isPending}
              style={({ pressed }) => [pressed && { opacity: opacity.pressed }, hide.isPending && { opacity: opacity.disabled }]}
            >
              <Text variant="sm" weight="semibold" underline>
                {t("account.delete.hideListings")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </OnboardingScreen>
  );
}

function Confirm({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isPasswordUser, deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = agreed && (!isPasswordUser || password.length > 0);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount(isPasswordUser ? password : undefined);
      // Signed out now: the (auth) group is open again.
      router.replace("/account-deleted");
    } catch (e) {
      const kind = authErrorKind(e);
      const code = (e as { code?: string })?.code;
      if (kind === "mismatch") setPasswordError(t("account.password.wrongCurrent"));
      else if (kind === "tooMany") setError(t("account.password.tooMany"));
      else if (kind === "network") setError(t("signIn.errors.network"));
      else if (code === "auth/requires-recent-login") setError(t("account.delete.recentLogin"));
      else setError(t("signIn.errors.generic"));
      setDeleting(false);
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
          <Button
            label={t("account.delete.cta")}
            variant="danger"
            disabled={!canDelete}
            loading={deleting}
            onPress={confirmDelete}
          />
          <Button label={t("account.delete.keep")} variant="link" onPress={() => router.back()} />
        </>
      }
    >
      <Animated.View entering={FadeInRight.duration(240)}>
        <View style={styles.back}>
          <ScreenHeader onBack={onBack} />
        </View>
        <ScreenTitle
          title={t("account.delete.confirmTitle")}
          lead={
            isPasswordUser
              ? t("account.delete.confirmLead", { email: user?.email ?? "" })
              : t("account.delete.confirmLeadNoPassword", { email: user?.email ?? "" })
          }
        />
        <View style={styles.fields}>
          {isPasswordUser && (
            <TextField
              label={t("signIn.password")}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(null);
              }}
              secureTextEntry
              revealable
              autoComplete="current-password"
              textContentType="password"
              error={passwordError}
            />
          )}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => setAgreed((a) => !a)}
            style={styles.check}
          >
            <View
              style={[
                styles.box,
                agreed ? { backgroundColor: colors.ink, borderColor: colors.ink } : { borderColor: colors.inkSubtle },
              ]}
            >
              {agreed && <Icon name="check" size={13} color="onInk" weight="bold" />}
            </View>
            <Text variant="base" style={styles.checkText}>
              {t("account.delete.understand")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 28 },
  list: { paddingTop: 20 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  itemText: { flex: 1, gap: 2 },
  itemSub: { fontSize: 13 },
  note: { flexDirection: "row", gap: 12, padding: 16, borderRadius: radius.md, marginTop: 20 },
  noteIcon: { marginTop: 1 },
  noteText: { flex: 1, gap: 6, alignItems: "flex-start" },
  fields: { gap: 18, paddingTop: 24 },
  check: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkText: { flex: 1 },
});
