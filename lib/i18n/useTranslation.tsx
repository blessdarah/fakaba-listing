import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate, setLocale, getCurrentLocale, getAvailableLocales } from './index';
import * as Localization from 'expo-localization';

interface TranslationContextType {
  t: (key: string, options?: any) => string;
  locale: string;
  changeLocale: (newLocale: string) => void;
  availableLocales: string[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setCurrentLocale] = useState(getCurrentLocale());
  const availableLocales = getAvailableLocales();

  useEffect(() => {
    // Set initial locale based on device settings
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
    if (availableLocales.includes(deviceLocale)) {
      changeLocale(deviceLocale);
    }
  }, []);

  const changeLocale = (newLocale: string) => {
    if (availableLocales.includes(newLocale)) {
      setLocale(newLocale);
      setCurrentLocale(newLocale);
    }
  };

  const t = (key: string, options?: any) => {
    return translate(key, options);
  };

  return (
    <TranslationContext.Provider
      value={{
        t,
        locale,
        changeLocale,
        availableLocales,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};