import "../firebase.config";
import "@tamagui/native/setup-expo-linear-gradient";

import { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  router,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { Provider } from "components/Provider";
import { useTheme } from "tamagui";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

const PUBLIC_SEGMENTS = ["sign-in", "sign-up", "setup"];

function useProtectedRoute(user: any, loading: boolean, needsSetup: boolean) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading) return;
    if (!navigationState?.key) return;

    const inPublicRoute = PUBLIC_SEGMENTS.includes(segments[0] as string);

    if (!user && !inPublicRoute) {
      router.replace("/sign-in");
    } else if (user && needsSetup && segments[0] !== "setup") {
      router.replace("/setup");
    } else if (user && !needsSetup && inPublicRoute) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, navigationState?.key, needsSetup]);
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { user, loading, needsSetup } = useAuth();

  useProtectedRoute(user, loading, needsSetup);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.background.val },
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(categories)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="setup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="agents"
          options={{
            headerShown: false,
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="create-listing"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="my-listings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
