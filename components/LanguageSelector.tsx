import React from "react";
import { XStack, YStack, Text, Button } from "tamagui";
import { useTranslation } from "lib/i18n/useTranslation";
import { Alert } from "react-native";

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export const LanguageSelector: React.FC = () => {
  const { t, locale, changeLocale, availableLocales } = useTranslation();

  const currentLanguage = LANGUAGE_OPTIONS.find((lang) => lang.code === locale);

  const showLanguageOptions = () => {
    const options = LANGUAGE_OPTIONS.filter((lang) =>
      availableLocales.includes(lang.code),
    );

    Alert.alert(t("settings.language"), "Select your preferred language:", [
      ...options.map((lang) => ({
        text: `${lang.flag} ${lang.name}`,
        onPress: () => changeLocale(lang.code),
      })),
      {
        text: t("common.cancel"),
        style: "cancel",
      },
    ]);
  };

  return (
    <YStack gap="$2">
      <Text fontSize="$4" fontWeight="600" color="gray">
        {t("settings.language")}
      </Text>
      <Button
        size="$4"
        onPress={showLanguageOptions}
        bg="$white3"
        // borderColor="$gray6"
        borderWidth={1}
        pressStyle={{
          bg: "$white4",
          scale: 0.98,
        }}
        px="$3"
      >
        <XStack gap="$2" justify="flex-start">
          <Text fontSize="$4">{currentLanguage?.flag}</Text>
          <Text fontSize="$4" color="gray">
            {currentLanguage?.name || "Select Language"}
          </Text>
        </XStack>
      </Button>
    </YStack>
  );
};

