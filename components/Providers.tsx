import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "contexts/AuthContext";
import { ThemeProvider } from "contexts/ThemeContext";
import { TranslationProvider } from "lib/i18n/useTranslation";
import { QueryProvider } from "lib/query/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <TranslationProvider>
            <AuthProvider>{children}</AuthProvider>
          </TranslationProvider>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
