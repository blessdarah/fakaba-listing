import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WelcomeArt } from "components/illustrations";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { Button } from "components/ui/Button";
import { Text } from "components/ui/Text";
import { useTranslation } from "lib/i18n/useTranslation";
import { makeStyles, radius, useTheme } from "theme";

/** "20 — Onboarding · Welcome" */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <OnboardingScreen
      edgeToEdgeTop
      hero={
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <View style={styles.langRow}>
            <LanguageToggle />
          </View>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.art}>
            <WelcomeArt width={340} height={255} />
          </Animated.View>
        </View>
      }
      contentStyle={styles.copy}
      footer={
        <>
          <Button label={t("welcome.create")} onPress={() => router.push("/sign-up")} />
          <Button
            label={t("welcome.haveAccount")}
            variant="outline"
            onPress={() => router.push("/sign-in")}
          />
        </>
      }
    >
      <Text variant="hero" accessibilityRole="header">
        {t("welcome.title")}
      </Text>
      <Text variant="body" color="inkMuted">
        {t("welcome.lead")}
      </Text>
    </OnboardingScreen>
  );
}

function LanguageToggle() {
  const { locale, changeLocale } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup" accessibilityLabel="Language">
      {(["en", "fr"] as const).map((code) => {
        const active = locale.startsWith(code);
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={code === "en" ? "English" : "Français"}
            onPress={() => changeLocale(code)}
            style={[styles.toggleItem, active && { backgroundColor: colors.ink }]}
          >
            <Text variant="label" color={active ? "onInk" : "inkMuted"}>
              {code.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  hero: {
    backgroundColor: c.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    gap: 8,
  },
  langRow: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20 },
  art: { alignItems: "center" },
  copy: { paddingTop: 28, gap: 12 },
  toggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: c.bg,
  },
  toggleItem: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
})
);
