import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  Home,
  Heart,
  MapPinHouse,
  Briefcase,
  Settings,
} from "@tamagui/lucide-icons";

export default function TabLayout() {
  const theme = useTheme();

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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color as any} />,
          headerShown: false,
          // headerTransparent: false,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: false,
          tabBarIcon: ({ color }) => <Heart color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ color }) => <MapPinHouse color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          headerShown: false,
          tabBarIcon: ({ color }) => <Briefcase color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="(listings)"
        options={{
          href: null, // This hides the tab from the bottom navigation
        }}
      />
    </Tabs>
  );
}
