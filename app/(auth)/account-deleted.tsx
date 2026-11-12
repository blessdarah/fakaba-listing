import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { WelcomeArt } from "components/illustrations";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { Button } from "components/ui/Button";
import { Text } from "components/ui/Text";
import { useTranslation } from "lib/i18n/useTranslation";

/** "60 — Account deleted". Shown once, right after the account is gone. */
export default function AccountDeletedScreen() {
  const { t } = useTranslation();
  return (
    <OnboardingScreen
      contentStyle={styles.content}
      footer={<Button label={t("account.deleted.close")} variant="outline" onPress={() => router.replace("/welcome")} />}
    >
      <Animated.View entering={FadeIn.duration(400)} style={styles.art}>
        <WelcomeArt width={300} height={225} />
      </Animated.View>
      <View style={styles.copy}>
        <Text variant="h1" align="center" accessibilityRole="header">
          {t("account.deleted.title")}
        </Text>
        <Text variant="body" color="inkMuted" align="center">
          {t("account.deleted.body")}
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 72, gap: 28 },
  art: { alignItems: "center" },
  copy: { gap: 12, paddingHorizontal: 12 },
});
