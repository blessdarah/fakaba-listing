import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Avatar, Button, Separator, Text, View, XStack, YStack } from "tamagui";
import {
  ArrowLeft,
  Languages,
  ListChecks,
  Lock,
  MapPin,
  MessageCircle,
  PenSquare,
  Star,
} from "@tamagui/lucide-icons-2";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

interface SettingsItemProps {
  label: string;
  value: string;
  icon: IconComponent;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  const joinedDate = React.useMemo(() => {
    if (!user?.metadata?.creationTime) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(user.metadata.creationTime));
    } catch (error) {
      console.warn("Failed to format joined date", error);
      return null;
    }
  }, [locale, user?.metadata?.creationTime]);

  const lastActive = React.useMemo(() => {
    if (!user?.metadata?.lastSignInTime) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(user.metadata.lastSignInTime));
    } catch (error) {
      console.warn("Failed to format last active date", error);
      return null;
    }
  }, [locale, user?.metadata?.lastSignInTime]);

  const avatarSource =
    user?.photoURL ??
    "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=200&h=200&dpr=2&q=80";

  const fallbackValue = t("profile.notProvided");

  const infoRows = [
    { label: t("profile.displayName"), value: user?.displayName },
    { label: t("profile.email"), value: user?.email },
    { label: t("profile.phone"), value: user?.phoneNumber },
  ];

  const accountRows = [
    { label: t("profile.userId"), value: user?.uid },
    { label: t("profile.lastActive"), value: lastActive },
    { label: t("profile.joinedLabel"), value: joinedDate },
  ];

  const locationLabel = t("profile.locationPlaceholder");
  const ratingValue = 4.8;
  const reviewsCount = 42;
  const ratingLabel = t("profile.ratingText", {
    rating: ratingValue.toFixed(1),
  });
  const reviewsLabel = t("profile.reviewsText", { count: reviewsCount });
  const aboutText = t("profile.aboutDescription");
  const languageDisplay =
    locale === "fr"
      ? t("profile.languageFrench")
      : t("profile.languageEnglish");
  const listingsCount = 5;
  const listingsLabel = t("profile.listingsCount", {
    count: String(listingsCount).padStart(2, "0"),
  });
  const whatsappValue = user?.phoneNumber ?? t("profile.whatsappValue");

  const goToSettings = React.useCallback(() => {
    router.push("/(tabs)/settings");
  }, [router]);

  const settingsItems = React.useMemo<SettingsItemProps[]>(
    () => [
      {
        label: t("profile.preferredLanguage"),
        value: languageDisplay,
        icon: Languages,
        onPress: goToSettings,
      },
      {
        label: t("profile.yourListings"),
        value: listingsLabel,
        icon: ListChecks,
      },
      {
        label: t("profile.whatsappContact"),
        value: whatsappValue,
        icon: MessageCircle,
      },
      {
        label: t("profile.security"),
        value: t("profile.securitySubtitle"),
        icon: Lock,
        onPress: goToSettings,
      },
    ],
    [goToSettings, languageDisplay, listingsLabel, t, whatsappValue]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" p="$4">
          <XStack items="center" justify="space-between">
            <Button
              size="$2"
              circular
              variant="outlined"
              onPress={() => router.back()}
              icon={<ArrowLeft size={16} />}
            />
            <Text fontSize="$7" fontWeight="700">
              {t("profile.title")}
            </Text>
            <Button
              size="$2"
              circular
              variant="outlined"
              onPress={goToSettings}
              icon={<PenSquare size={16} />}
            />
          </XStack>

          <Text color="$color10">{t("profile.subtitle")}</Text>

          <YStack
            gap="$3"
            p="$4"
            borderWidth={1}
            borderColor="$borderColor"
            rounded="$7"
            bg="$backgroundFocus"
          >
            <XStack gap="$3" items="center">
              <Avatar circular size="$7" borderColor="$blue10" borderWidth={3}>
                <Avatar.Image src={avatarSource} />
                <Avatar.Fallback delayMs={600} bg="$blue10" />
              </Avatar>

              <YStack flex={1} gap="$1">
                <Text fontSize="$6" fontWeight="700">
                  {user?.displayName || fallbackValue}
                </Text>
                {user?.email ? (
                  <Text color="$color10">{user.email}</Text>
                ) : null}
                <Text color="$color10">
                  {joinedDate
                    ? t("profile.joined", { date: joinedDate })
                    : fallbackValue}
                </Text>
              </YStack>

              <Button
                size="$4"
                circular
                variant="outlined"
                onPress={goToSettings}
                icon={<PenSquare size={16} />}
              />
            </XStack>

            <Separator />

            <XStack justify="space-between" flexWrap="wrap" gap="$3">
              <XStack gap="$2" items="center">
                <View
                  width={40}
                  height={40}
                  rounded={20}
                  bg="$blue4"
                  items="center"
                  justify="center"
                >
                  <MapPin color="#1d4ed8" size={18} />
                </View>
                <Text color="$color10">{locationLabel}</Text>
              </XStack>

              <XStack gap="$2" items="center">
                <View
                  width={40}
                  height={40}
                  rounded={20}
                  bg="$yellow4"
                  items="center"
                  justify="center"
                >
                  <Star color="#b45309" fill="#facc15" size={18} />
                </View>
                <YStack>
                  <Text fontWeight="700">{ratingLabel}</Text>
                  <Text color="$color10">{reviewsLabel}</Text>
                </YStack>
              </XStack>
            </XStack>
          </YStack>

          <SectionCard title={t("profile.aboutTitle")}>
            <Text color="$color10" lineHeight={22}>
              {aboutText}
            </Text>
          </SectionCard>

          <SectionCard title={t("profile.personalInfo")}>
            {infoRows.map((item) => (
              <ProfileInfoRow
                key={item.label}
                label={item.label}
                value={item.value}
                fallback={fallbackValue}
              />
            ))}
          </SectionCard>

          <SectionCard title={t("profile.accountDetails")}>
            {accountRows.map((item) => (
              <ProfileInfoRow
                key={item.label}
                label={item.label}
                value={item.value}
                fallback={fallbackValue}
              />
            ))}
          </SectionCard>

          <SectionCard title={t("profile.otherSettings")}>
            <YStack>
              {settingsItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 ? <Separator borderColor="$borderColor" /> : null}
                  <SettingsRow {...item} />
                </React.Fragment>
              ))}
            </YStack>
          </SectionCard>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

const SectionCard = ({ title, children }: SectionCardProps) => {
  return (
    <YStack
      gap="$3"
      p="$4"
      borderWidth={1}
      borderColor="$borderColor"
      rounded="$6"
      bg="$backgroundFocus"
    >
      <Text fontSize="$5" fontWeight="600">
        {title}
      </Text>
      <Separator />
      <YStack gap="$2">{children}</YStack>
    </YStack>
  );
};

interface ProfileInfoRowProps {
  label: string;
  value?: string | null;
  fallback: string;
}

const ProfileInfoRow = ({ label, value, fallback }: ProfileInfoRowProps) => {
  return (
    <XStack justify="space-between" items="center" py="$1" gap="$2">
      <Text color="$color11">{label}</Text>
      <Text fontWeight="600" text="right">
        {value || fallback}
      </Text>
    </XStack>
  );
};

const SettingsRow = ({
  label,
  value,
  icon: Icon,
  onPress,
}: SettingsItemProps) => {
  return (
    <XStack
      py="$2"
      items="center"
      justify="space-between"
      onPress={onPress}
      cursor={onPress ? "pointer" : "default"}
      pressStyle={onPress ? { opacity: 0.7, scale: 0.98 } : undefined}
    >
      <XStack gap="$3" items="center">
        <View
          width={40}
          height={40}
          rounded={20}
          bg="$color3"
          items="center"
          justify="center"
        >
          <Icon size={18} color="$white8" />
        </View>
        <YStack gap="$1">
          <Text fontWeight="600">{label}</Text>
          <Text color="$color10">{value}</Text>
        </YStack>
      </XStack>
      <PenSquare size={16} color="#94a3b8" />
    </XStack>
  );
};
