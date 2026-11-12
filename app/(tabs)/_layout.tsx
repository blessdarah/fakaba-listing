import { Tabs } from "expo-router";
import { TabBar } from "components/TabBar";
import { useTranslation } from "lib/i18n/useTranslation";
import { useTheme } from "theme";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.home") }} />
      <Tabs.Screen name="search" options={{ title: t("nav.search") }} />
      <Tabs.Screen name="saved" options={{ title: t("nav.saved") }} />
      <Tabs.Screen name="services" options={{ title: t("nav.services") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile") }} />
    </Tabs>
  );
}
