import "../firebase.config";

import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import Feather from "@expo/vector-icons/Feather";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { BrandSplash } from "components/brand";
import { Providers } from "components/Providers";
import { useAuth } from "contexts/AuthContext";
import { useThemePreference } from "contexts/ThemeContext";
import { useTheme } from "theme";

export { ErrorBoundary } from "expo-router";

// Keep the native splash up until fonts are ready; BrandSplash takes over
// (same blue, same mark) while Firebase restores the session.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Feather.font,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}

function RootNavigator() {
  const { user, loading, needsSetup, needsEmailVerification } = useAuth();
  const { ready: themeReady } = useThemePreference();
  const { colors, isDark } = useTheme();

  if (loading || !themeReady) {
    return (
      <>
        <StatusBar style="light" />
        <BrandSplash />
      </>
    );
  }

  const signedIn = !!user;
  const verifying = signedIn && needsEmailVerification;
  const settingUp = signedIn && !needsEmailVerification && needsSetup;
  const ready = signedIn && !needsEmailVerification && !needsSetup;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        {/* Signed out: welcome, sign in/up, forgot password. */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        </Stack.Protected>

        <Stack.Protected guard={verifying}>
          <Stack.Screen name="verify-email" options={{ animation: "fade" }} />
        </Stack.Protected>

        {/* Onboarding answers. Saving them flips needsSetup and lands on home. */}
        <Stack.Protected guard={settingUp}>
          <Stack.Screen name="setup" options={{ animation: "fade", gestureEnabled: false }} />
        </Stack.Protected>

        <Stack.Protected guard={ready}>
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="service" />
          <Stack.Screen name="agents" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen
            name="listing/gallery"
            options={{ presentation: "fullScreenModal", animation: "fade", contentStyle: { backgroundColor: "#121212" } }}
          />
          <Stack.Screen
            name="listing/contact"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: "fitToContents",
              sheetGrabberVisible: true,
              sheetCornerRadius: 24,
            }}
          />
          <Stack.Screen
            name="filters"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: "fitToContents",
              sheetGrabberVisible: true,
              sheetCornerRadius: 24,
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}
