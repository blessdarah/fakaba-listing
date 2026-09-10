import { TamaguiProvider, type TamaguiProviderProps } from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { CurrentToast } from "./CurrentToast";
import { config } from "../tamagui.config";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider, useThemePreference } from "../contexts/ThemeContext";
import { TranslationProvider } from "../lib/i18n/useTranslation";
import { QueryProvider } from "../lib/query/queryClient";

function TamaguiWithTheme({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config" | "defaultTheme">) {
  const { resolvedTheme } = useThemePreference();

  return (
    <TamaguiProvider {...rest} config={config} defaultTheme={resolvedTheme}>
      {children}
    </TamaguiProvider>
  );
}

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config" | "defaultTheme">) {
  return (
    <ThemeProvider>
      <TamaguiWithTheme {...rest}>
        <QueryProvider>
          <TranslationProvider>
            <AuthProvider>
              <ToastProvider
                swipeDirection="horizontal"
                duration={4000}
                native={[]}
              >
                {children}
                <CurrentToast />
                <ToastViewport
                  bottom={100}
                  left={0}
                  right={0}
                  flexDirection="column-reverse"
                />
              </ToastProvider>
            </AuthProvider>
          </TranslationProvider>
        </QueryProvider>
      </TamaguiWithTheme>
    </ThemeProvider>
  );
}
