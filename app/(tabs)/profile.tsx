import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheet } from "components/settings/BottomSheet";
import { SectionLabel, SettingsRow } from "components/settings/SettingsRow";
import { SheetOption } from "components/settings/SheetOption";
import { Avatar } from "components/ui/Avatar";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { useThemePreference, type ThemePreference } from "contexts/ThemeContext";
import { APP_VERSION, displayNameOf, formatPhone, LINKS } from "lib/account";
import { useTranslation } from "lib/i18n/useTranslation";
import { gutter, opacity, useTheme } from "theme";

const LANGUAGES = [
  { id: "en", badge: "EN", title: "English", subtitle: "Find your next place" },
  { id: "fr", badge: "FR", title: "Français", subtitle: "Trouvez votre prochain logement" },
];
const THEMES: ThemePreference[] = ["system", "light", "dark"];

/** "52 — Profile & settings" + "54 — Language" sheet. */
export default function ProfileScreen() {
  const { t, locale, changeLocale } = useTranslation();
  const { user, userProfile, isPasswordUser, signOut } = useAuth();
  const { themePreference, setThemePreference } = useThemePreference();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<"language" | "theme" | null>(null);

  const isCompany = userProfile?.accountType === "company";
  const name = displayNameOf(userProfile, user?.displayName) || t("account.noName");
  const phone = formatPhone(userProfile?.phone);
  const language = LANGUAGES.find((l) => locale.startsWith(l.id)) ?? LANGUAGES[0];

  const confirmSignOut = () =>
    Alert.alert(t("account.signOutTitle"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("account.signOut"), style: "destructive", onPress: () => signOut().catch(() => {}) },
    ]);

  const openLink = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar
            name={name}
            uri={userProfile?.profileImage ?? user?.photoURL}
            size={64}
            kind={isCompany ? "company" : "person"}
          />
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
              {name}
            </Text>
            {user?.email ? (
              <Text variant="sm" color="inkMuted" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("account.editProfile")}
            hitSlop={6}
            onPress={() => router.push("/settings/edit-profile")}
            style={({ pressed }) => [styles.edit, { borderColor: colors.ink }, pressed && { opacity: opacity.pressed }]}
          >
            <Text variant="sm" weight="semibold">
              {t("common.edit")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.groups}>
          <View>
            <SectionLabel label={t("account.sections.account")} />
            <SettingsRow
              label={t("account.whatsapp")}
              value={phone || t("account.add")}
              onPress={() => router.push({ pathname: "/settings/edit-profile", params: { focus: "phone" } })}
              divider={isPasswordUser}
            />
            {isPasswordUser && (
              <SettingsRow label={t("account.changePassword")} onPress={() => router.push("/settings/change-password")} />
            )}
          </View>

          <View>
            <SectionLabel label={t("account.sections.preferences")} />
            <SettingsRow label={t("account.language")} value={language.title} onPress={() => setSheet("language")} divider />
            <SettingsRow
              label={t("account.appearance")}
              value={t(`account.theme.${themePreference}`)}
              onPress={() => setSheet("theme")}
              divider
            />
            <SettingsRow label={t("account.help")} onPress={() => openLink(LINKS.support)} />
          </View>

          <View style={[styles.footer, { borderTopColor: colors.line }]}>
            <Pressable accessibilityRole="button" onPress={confirmSignOut} style={styles.signOut} hitSlop={4}>
              <Text variant="body" weight="semibold" style={styles.signOutText}>
                {t("account.signOut")}
              </Text>
            </Pressable>
            <View style={styles.footerRow}>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push("/settings/delete-account")}>
                <Text variant="sm" weight="medium" color="danger">
                  {t("account.deleteAccount")}
                </Text>
              </Pressable>
              <View style={styles.legal}>
                <Text variant="xs" color="inkSubtle">
                  Fakaba {APP_VERSION} ·{" "}
                </Text>
                <Pressable accessibilityRole="link" hitSlop={8} onPress={() => openLink(LINKS.terms)}>
                  <Text variant="xs" color="inkSubtle">
                    {t("account.terms")}
                  </Text>
                </Pressable>
                <Text variant="xs" color="inkSubtle">
                  {" · "}
                </Text>
                <Pressable accessibilityRole="link" hitSlop={8} onPress={() => openLink(LINKS.privacy)}>
                  <Text variant="xs" color="inkSubtle">
                    {t("account.privacy")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomSheet visible={sheet === "language"} onClose={() => setSheet(null)} title="Language · Langue">
        <View style={styles.options} accessibilityRole="radiogroup">
          {LANGUAGES.map((l) => (
            <SheetOption
              key={l.id}
              badge={l.badge}
              title={l.title}
              subtitle={l.subtitle}
              selected={l.id === language.id}
              onPress={() => {
                changeLocale(l.id);
                setSheet(null);
              }}
            />
          ))}
        </View>
        <Text variant="sm" color="inkMuted">
          {t("account.languageNote")}
        </Text>
      </BottomSheet>

      <BottomSheet visible={sheet === "theme"} onClose={() => setSheet(null)} title={t("account.appearance")}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {THEMES.map((pref) => (
            <SheetOption
              key={pref}
              title={t(`account.theme.${pref}`)}
              subtitle={pref === "system" ? t("account.theme.systemSub") : undefined}
              selected={pref === themePreference}
              onPress={() => {
                setThemePreference(pref);
                setSheet(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: gutter, paddingBottom: 32 },
  identity: { flexDirection: "row", alignItems: "center", gap: 14, paddingBottom: 24 },
  identityText: { flex: 1, gap: 2 },
  name: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 26, lineHeight: 32, letterSpacing: -0.78 },
  edit: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, justifyContent: "center" },
  groups: { gap: 22 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth * 2 },
  signOut: { paddingVertical: 13, alignSelf: "flex-start" },
  signOutText: { fontSize: 16, lineHeight: 20 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  legal: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  options: { gap: 10 },
});
