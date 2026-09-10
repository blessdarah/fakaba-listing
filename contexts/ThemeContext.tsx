import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@fakaba_theme";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: "light" | "dark";
  setThemePreference: (pref: ThemePreference) => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePref] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemePref(stored);
      }
      setReady(true);
    });
  }, []);

  const resolvedTheme: "light" | "dark" =
    themePreference === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  const setThemePreference = (pref: ThemePreference) => {
    setThemePref(pref);
    AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
  };

  return (
    <ThemeContext.Provider
      value={{ themePreference, resolvedTheme, setThemePreference, ready }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemePreference = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreference must be used within a ThemeProvider");
  }
  return context;
};
