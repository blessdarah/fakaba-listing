import React, { useMemo, useState } from "react";
import {
  XStack,
  YStack,
  Text,
  Separator,
  View,
  ScrollView,
  Avatar,
  Spinner,
} from "tamagui";
import { useAuth } from "../../contexts/AuthContext";
import {
  useThemePreference,
  type ThemePreference,
} from "../../contexts/ThemeContext";
import { Pressable } from "react-native";
import { useTranslation } from "lib/i18n/useTranslation";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronRight,
  User,
  Sun,
  Globe,
  Package,
  MessageCircle,
  MapPin,
  Star,
  KeyRound,
  FileText,
  LogOut,
  Moon,
  Monitor,
  Check,
  Camera,
  UserPlus,
} from "@tamagui/lucide-icons-2";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToastController } from "@tamagui/toast";
import { useRouter } from "expo-router";
import { useMyListings } from "lib/query/useListings";

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "fr", name: "Fran\u00e7ais", flag: "\u{1F1EB}\u{1F1F7}" },
];

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

// --- SectionCard ---
type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

const SectionCard = ({ title, children }: SectionCardProps) => (
  <YStack gap="$2">
    <Text
      fontSize="$1"
      fontWeight="600"
      color="$color8"
      textTransform="uppercase"
      letterSpacing={1}
      pl="$2"
    >
      {title}
    </Text>
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      rounded="$6"
      bg="$background"
      overflow="hidden"
    >
      {children}
    </YStack>
  </YStack>
);

// --- SettingsRow ---
type SettingsRowProps = {
  icon: React.ReactNode;
  iconBg: any;
  label: string;
  value?: string | null;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
};

const SettingsRow = ({
  icon,
  iconBg,
  label,
  value,
  showChevron = false,
  onPress,
  isLast = false,
}: SettingsRowProps) => (
  <>
    <Pressable onPress={onPress} disabled={!onPress}>
      <XStack
        px="$3"
        py="$2.5"
        items="center"
        gap="$3"
        bg="$background"
      >
        <View
          width={36}
          height={36}
          rounded={10}
          bg={iconBg}
          items="center"
          justify="center"
        >
          {icon}
        </View>
        <YStack flex={1}>
          <Text fontWeight="500">{label}</Text>
        </YStack>
        {value ? (
          <Text color="$color8" fontSize="$3" numberOfLines={1} maxW={160}>
            {value}
          </Text>
        ) : null}
        {showChevron ? <ChevronRight size={16} color="$color8" /> : null}
      </XStack>
    </Pressable>
    {!isLast ? <Separator borderColor="$borderColor" ml={60} /> : null}
  </>
);

export default function SettingsScreen() {
  const { user, signOut, updateProfileImage, isAgent, becomeAgent } = useAuth();
  const { t, locale, changeLocale, availableLocales } = useTranslation();
  const { themePreference, setThemePreference } = useThemePreference();
  const toast = useToastController();
  const router = useRouter();

  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [becomingAgent, setBecomingAgent] = useState(false);

  // --- Data ---
  const { data: myListings = [] } = useMyListings(user?.uid ?? "");

  // --- Computed values ---
  const listingsLabel = t("profile.listingsCount", {
    count: myListings.length,
  });
  const whatsappValue = user?.phoneNumber ?? t("profile.whatsappValue");
  const fallbackValue = t("profile.notProvided");
  const ratingValue = 4.8;
  const reviewsCount = 42;
  const ratingLabel = t("profile.ratingText", {
    rating: ratingValue.toFixed(1),
  });
  const reviewsLabel = t("profile.reviewsText", { count: reviewsCount });
  const locationLabel = t("profile.locationPlaceholder");
  const aboutText = t("profile.aboutDescription");

  const joinedDate = useMemo(() => {
    if (!user?.metadata?.creationTime) return null;
    try {
      return new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(user.metadata.creationTime));
    } catch {
      return null;
    }
  }, [locale, user?.metadata?.creationTime]);

  const avatarSource =
    user?.photoURL ??
    "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=200&h=200&dpr=2&q=80";

  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.code === locale);
  const currentThemeLabel =
    THEME_OPTIONS.find((o) => o.value === themePreference)?.label ?? "System";

  // --- Handlers ---
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.show(t("common.error"), { message: t("errors.signOutError") });
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.show(t("common.error"), {
        message: t("profile.photoPermissionDenied"),
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      await updateProfileImage(result.assets[0].uri);
      toast.show(t("profile.photoUpdated"));
    } catch (error) {
      console.error("Profile image upload error:", error);
      toast.show(t("common.error"), {
        message: t("profile.photoUpdateFailed"),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBecomeAgent = async () => {
    setBecomingAgent(true);
    try {
      await becomeAgent();
      toast.show(t("agent.becomeAgentSuccess"));
    } catch {
      toast.show(t("common.error"), {
        message: t("agent.becomeAgentError"),
      });
    } finally {
      setBecomingAgent(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} p="$4" gap="$5" pb="$8">
          {/* --- Profile Header Card --- */}
          <YStack
            gap="$3"
            p="$4"
            borderWidth={1}
            borderColor="$borderColor"
            rounded="$7"
            bg="$backgroundFocus"
          >
            <XStack gap="$3" items="center">
              <Pressable onPress={handlePickImage} disabled={uploading}>
                <View position="relative">
                  <Avatar circular size="$7" borderColor="$blue10" borderWidth={3}>
                    <Avatar.Image src={avatarSource} />
                    <Avatar.Fallback delayMs={600} bg="$blue10" />
                  </Avatar>
                  {uploading ? (
                    <View
                      position="absolute"
                      inset={0}
                      rounded={999}
                      bg="rgba(0,0,0,0.4)"
                      items="center"
                      justify="center"
                    >
                      <Spinner size="small" color="white" />
                    </View>
                  ) : (
                    <View
                      position="absolute"
                      b={0}
                      r={0}
                      width={24}
                      height={24}
                      rounded={12}
                      bg="$blue9"
                      items="center"
                      justify="center"
                      borderWidth={2}
                      borderColor="$background"
                    >
                      <Camera size={12} color="white" />
                    </View>
                  )}
                </View>
              </Pressable>

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

          {/* --- Personal Information --- */}
          <SectionCard title={t("settings.personalInfo")}>
            <SettingsRow
              icon={<User size={18} color="white" />}
              iconBg="$blue9"
              label={t("profile.displayName")}
              value={user?.displayName || fallbackValue}
            />
            <SettingsRow
              icon={<Globe size={18} color="white" />}
              iconBg="$green9"
              label={t("profile.email")}
              value={user?.email || fallbackValue}
            />
            <SettingsRow
              icon={<MessageCircle size={18} color="white" />}
              iconBg="$green9"
              label={t("profile.whatsappContact")}
              value={whatsappValue}
              showChevron
              onPress={() => {}}
              isLast
            />
          </SectionCard>

          {/* --- Preferences --- */}
          <SectionCard title={t("settings.preferences")}>
            {/* Theme row + inline picker */}
            <Pressable onPress={() => setThemeOpen((v) => !v)}>
              <XStack
                px="$3"
                py="$2.5"
                items="center"
                gap="$3"
                bg="$background"
              >
                <View
                  width={36}
                  height={36}
                  rounded={10}
                  bg={"$purple9" as any}
                  items="center"
                  justify="center"
                >
                  <Sun size={18} color="orange"  />
                </View>
                <YStack flex={1}>
                  <Text fontWeight="500">{t("settings.theme")}</Text>
                </YStack>
                <Text color="$color8" fontSize="$3">
                  {currentThemeLabel}
                </Text>
                <ChevronRight
                  size={16}
                  color="$color8"
                  style={{
                    transform: [{ rotate: themeOpen ? "90deg" : "0deg" }],
                  }}
                />
              </XStack>
            </Pressable>
            {themeOpen ? (
              <YStack px="$3" pb="$3" gap="$1.5">
                {THEME_OPTIONS.map((option) => {
                  const active = themePreference === option.value;
                  const Icon = option.icon;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setThemePreference(option.value)}
                    >
                      <XStack
                        px="$3"
                        py="$2.5"
                        rounded="$4"
                        items="center"
                        gap="$3"
                        bg={active ? "$blue3" : "transparent"}
                      >
                        <Icon size={18} color={active ? "$blue9" : "$color8"} />
                        <Text
                          flex={1}
                          fontWeight={active ? "700" : "500"}
                          color={active ? "$blue9" : "$color"}
                        >
                          {option.label}
                        </Text>
                        {active ? (
                          <Check size={16} color="$blue9" />
                        ) : null}
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>
            ) : null}
            <Separator borderColor="$borderColor" ml={60} />

            {/* Language row + inline picker */}
            <Pressable onPress={() => setLangOpen((v) => !v)}>
              <XStack
                px="$3"
                py="$2.5"
                items="center"
                gap="$3"
                bg="$background"
              >
                <View
                  width={36}
                  height={36}
                  rounded={10}
                  bg="$blue9"
                  items="center"
                  justify="center"
                >
                  <Globe size={18} color="white" />
                </View>
                <YStack flex={1}>
                  <Text fontWeight="500">{t("settings.language")}</Text>
                </YStack>
                <Text color="$color8" fontSize="$3">
                  {currentLanguage?.name}
                </Text>
                <ChevronRight
                  size={16}
                  color="$color8"
                  style={{
                    transform: [{ rotate: langOpen ? "90deg" : "0deg" }],
                  }}
                />
              </XStack>
            </Pressable>
            {langOpen ? (
              <YStack px="$3" pb="$3" gap="$1.5">
                {LANGUAGE_OPTIONS.filter((lang) =>
                  availableLocales.includes(lang.code)
                ).map((lang) => {
                  const active = locale === lang.code;
                  return (
                    <Pressable
                      key={lang.code}
                      onPress={() => changeLocale(lang.code)}
                    >
                      <XStack
                        px="$3"
                        py="$2.5"
                        rounded="$4"
                        items="center"
                        gap="$3"
                        bg={active ? "$blue3" : "transparent"}
                      >
                        <Text fontSize="$5">{lang.flag}</Text>
                        <Text
                          flex={1}
                          fontWeight={active ? "700" : "500"}
                          color={active ? "$blue9" : "$color"}
                        >
                          {lang.name}
                        </Text>
                        {active ? (
                          <Check size={16} color="$blue9" />
                        ) : null}
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>
            ) : null}
          </SectionCard>

          {/* --- Listings & Activity --- */}
          <SectionCard title={t("settings.listingsActivity")}>
            {isAgent ? (
              <SettingsRow
                icon={<Package size={18} color="white" />}
                iconBg="$red8"
                label={t("profile.yourListings")}
                value={listingsLabel}
                showChevron
                onPress={() => router.push("/my-listings")}
              />
            ) : (
              <Pressable onPress={handleBecomeAgent} disabled={becomingAgent}>
                <XStack px="$3" py="$3" items="center" gap="$3" bg="$background">
                  <View
                    width={36}
                    height={36}
                    rounded={10}
                    bg="$blue9"
                    items="center"
                    justify="center"
                  >
                    <UserPlus size={18} color="white" />
                  </View>
                  <YStack flex={1} gap="$1">
                    <Text fontWeight="600">{t("agent.becomeAgent")}</Text>
                    <Text fontSize="$2" color="$color8">
                      {t("agent.becomeAgentDescription")}
                    </Text>
                  </YStack>
                  {becomingAgent ? (
                    <Spinner size="small" color="$blue9" />
                  ) : (
                    <ChevronRight size={16} color="$color8" />
                  )}
                </XStack>
              </Pressable>
            )}
            <SettingsRow
              icon={<FileText size={18} color="white" />}
              iconBg="$color9"
              label={t("profile.aboutTitle")}
              value={
                aboutText.length > 40
                  ? `${aboutText.slice(0, 40)}...`
                  : aboutText
              }
              isLast
            />
          </SectionCard>

          {/* --- Account & Security --- */}
          <SectionCard title={t("settings.accountSecurity")}>
            <SettingsRow
              icon={<KeyRound size={18} color="white" />}
              iconBg="$red9"
              label={t("settings.resetPassword")}
              showChevron
              onPress={() => router.push("/change-password")}
              isLast
            />
          </SectionCard>

          {/* --- Sign Out Button --- */}
          <Pressable onPress={handleSignOut}>
            <XStack
              bg="$red3"
              rounded="$6"
              py="$3.5"
              items="center"
              justify="center"
              gap="$2"
              borderWidth={1}
              borderColor="$red6"
            >
              <LogOut size={18} color="$red10" />
              <Text color="$red10" fontWeight="700" fontSize="$4">
                {t("auth.signOut")}
              </Text>
            </XStack>
          </Pressable>

          {/* --- App Version Footer --- */}
          <Text
            color="$color8"
            fontSize="$2"
            text="center"
            py="$2"
          >
            {t("settings.appVersion")}
          </Text>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
