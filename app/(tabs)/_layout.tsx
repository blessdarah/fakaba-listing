import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  Home,
  Heart,
  MapPinHouse,
  Briefcase,
  Settings,
} from "@tamagui/lucide-icons";
import { useTranslation } from "lib/i18n/useTranslation";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.blue8.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
        sceneStyle: { backgroundColor: theme.background.val },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => <Home color={color as any} />,
          headerShown: false,
          // headerTransparent: false,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("tabs.favorites"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Heart color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tabs.search"),
          headerShown: false,
          tabBarIcon: ({ color }) => <MapPinHouse color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t("tabs.services"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Briefcase color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <Settings color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="(listings)"
        options={{
          href: null, // This hides the tab from the bottom navigation
          headerShown: false,
        }}
      />

    </Tabs>
  );
}
