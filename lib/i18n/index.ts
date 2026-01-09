import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

// Import translation files
import en from "./locales/en.json";
import fr from "./locales/fr.json";

// Create a new I18n instance
const i18n = new I18n({
  en,
  fr,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0]?.languageCode ?? "en";

// Enable fallback to English
i18n.enableFallback = true;
i18n.defaultLocale = "en";

// Export the translation function
export const translate = (key: string, options?: any) => i18n.t(key, options);

// Export locale utilities
export const getCurrentLocale = () => i18n.locale;
export const setLocale = (locale: string) => {
  i18n.locale = locale;
};
export const getAvailableLocales = () => Object.keys(i18n.translations);

export default i18n;

