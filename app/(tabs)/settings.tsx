import { YStack, Text, Button, H2, Separator } from "tamagui";
import { useAuth } from "../../contexts/AuthContext";

import { Alert } from "react-native";
import { useTranslation } from "lib/i18n/useTranslation";
import { LanguageSelector } from "components/LanguageSelector";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert(t("common.error"), t("errors.signOutError"));
    }
  };

  return (
    <YStack flex={1} p="$4" bg="$background" space="$4">
      <YStack gap="$2" p="$8">
        <H2>{t("settings.title")}</H2>
        <Separator />
      </YStack>

      <YStack gap="$3" pt="$4">
        <Text fontSize="$5" fontWeight="bold">
          {t("settings.account")}
        </Text>
        {user && (
          <YStack gap="$2" bg="$white2" p="$3" rounded="$4">
            <Text color="gray">{t("settings.email")}</Text>
            <Text fontSize="$4">{user.email}</Text>
            {user.displayName && (
              <>
                <Text color="gray" pt="$2">
                  {t("settings.name")}
                </Text>
                <Text fontSize="$4">{user.displayName}</Text>
              </>
            )}
          </YStack>
        )}
      </YStack>

      <YStack gap="$3" pt="$4">
        <LanguageSelector />
      </YStack>

      <YStack pt="$4">
        <Button
          size="$4"
          onPress={handleSignOut}
          bg="$red10"
          pressStyle={{ bg: "$red9" }}
          color="white"
        >
          {t("auth.signOut")}
        </Button>
      </YStack>
    </YStack>
  );
}
