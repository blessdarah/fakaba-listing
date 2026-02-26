import {
  XStack,
  YStack,
  Text,
  Button,
  Separator,
  RadioGroup,
  Label,
  View,
  ScrollView,
} from "tamagui";
import { useAuth } from "../../contexts/AuthContext";

import { Alert } from "react-native";
import { useTranslation } from "lib/i18n/useTranslation";
import { LanguageSelector } from "components/LanguageSelector";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase.config";
import {
  ChevronRight,
  Lock,
  User,
  Palette,
  Globe,
  Languages,
  ListChecks,
  MessageCircle,
} from "@tamagui/lucide-icons";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const listingsCount = 5;
  const listingsLabel = t("profile.listingsCount", {
    count: String(listingsCount).padStart(2, "0"),
  });
  const whatsappValue = user?.phoneNumber ?? t("profile.whatsappValue");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert(t("common.error"), t("errors.signOutError"));
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      Alert.alert("Reset Password", "No email found for this account.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        "Reset Password",
        "We sent a password reset link to your email."
      );
    } catch (error) {
      Alert.alert("Reset Password", "Unable to send reset email.");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <YStack flex={1} p="$4" bg="$background" gap="$5">
        <YStack
          gap="$2"
          p="$4"
          bg="$backgroundStrong"
          rounded="$8"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize="$8" fontWeight="800">
            {t("settings.title")}
          </Text>
          <Text color="$color8">
            Manage your account, preferences, and security.
          </Text>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700">
            Account
          </Text>
          {user && (
            <YStack
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
              bg="$background"
              p="$3"
              rounded="$6"
            >
              <Text color="$color8">{t("settings.email")}</Text>
              <Text color="$color" fontSize="$4">
                {user.email}
              </Text>
              {user.displayName && (
                <>
                  <Text color="$color8" pt="$2">
                    {t("settings.name")}
                  </Text>
                  <Text fontSize="$4">{user.displayName}</Text>
                </>
              )}
            </YStack>
          )}

          <YStack gap="$2">
            <Button
              size="$4"
              bg="$backgroundStrong"
              justifyContent="space-between"
              onPress={() => router.push("/profile")}
              icon={<User size={18} />}
              iconAfter={<ChevronRight size={18} />}
            >
              <Button.Text fontWeight="600">Account management</Button.Text>
            </Button>

            <Button
              size="$4"
              bg="$backgroundStrong"
              justifyContent="space-between"
              onPress={handleResetPassword}
              icon={<Lock size={18} />}
              iconAfter={<ChevronRight size={18} />}
            >
              <Button.Text fontWeight="600">Reset password</Button.Text>
            </Button>
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700">
            Preferences
          </Text>

          <YStack
            gap="$3"
            borderWidth={1}
            borderColor="$borderColor"
            bg="$background"
            p="$3"
            rounded="$6"
          >
            <XStack items="center" justify="space-between">
              <XStack items="center" gap="$2">
                <Palette size={18} />
                <Text fontWeight="600">Theme</Text>
              </XStack>
              <Text color="$color8">System</Text>
            </XStack>
            <RadioGroup orientation="horizontal" defaultValue="system">
              <XStack gap="$2" items="center">
                <RadioGroup.Item value="system" id="system" disabled>
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="system">System</Label>
              </XStack>
              <XStack gap="$2" items="center">
                <RadioGroup.Item value="light" id="light" disabled>
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="light">Light</Label>
              </XStack>
              <XStack gap="$2" items="center">
                <RadioGroup.Item value="dark" id="dark" disabled>
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                <Label htmlFor="dark">Dark</Label>
              </XStack>
            </RadioGroup>
            <Text color="$color8" fontSize="$2">
              Theme follows your device settings.
            </Text>
          </YStack>

          <YStack
            gap="$3"
            borderWidth={1}
            borderColor="$borderColor"
            bg="$background"
            p="$3"
            rounded="$6"
          >
            <XStack items="center" gap="$2">
              <Globe size={18} />
              <Text fontWeight="600">Language</Text>
            </XStack>
            <LanguageSelector />
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700">
            {t("profile.otherSettings")}
          </Text>
          <YStack gap="$2">
            <Button
              size="$4"
              bg="$backgroundStrong"
              justifyContent="space-between"
              icon={<ListChecks size={18} />}
              iconAfter={<ChevronRight size={18} />}
            >
              <Button.Text fontWeight="600">
                {t("profile.yourListings")}
              </Button.Text>
              <Button.Text color="$color8">{listingsLabel}</Button.Text>
            </Button>

            <Button
              size="$4"
              bg="$background"
              justify="space-between"
              icon={<MessageCircle size={18} />}
              iconAfter={<ChevronRight size={18} />}
            >
              <YStack>
                <Button.Text fontWeight="600">
                  {t("profile.whatsappContact")}
                </Button.Text>
                <Button.Text color="$color8">{whatsappValue}</Button.Text>
              </YStack>
            </Button>

            <Button
              size="$4"
              bg="$background"
              justify="space-between"
              icon={<Lock size={18} />}
              iconAfter={<ChevronRight size={18} />}
              onPress={handleResetPassword}
            >
              <Button.Text fontWeight="600">
                {t("profile.security")}
              </Button.Text>
            </Button>
          </YStack>
        </YStack>

        <View>
          <Button size="$4" onPress={handleSignOut} bg="$red10">
            {t("auth.signOut")}
          </Button>
        </View>
      </YStack>
    </ScrollView>
  );
}
