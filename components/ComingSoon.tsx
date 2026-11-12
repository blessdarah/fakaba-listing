import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spot, type SpotName } from "components/illustrations";
import { Text } from "components/ui/Text";
import { useTranslation } from "lib/i18n/useTranslation";
import { gutter } from "theme";

/** Temporary body for tabs that haven't been rebuilt for v2 yet. */
export function ComingSoon({
  title,
  spot,
  children,
}: {
  title: string;
  spot: SpotName;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text variant="display" accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.centre}>
        <Spot name={spot} size={88} />
        <Text variant="title" align="center">
          {t("soon.title")}
        </Text>
        <Text variant="base" color="inkMuted" align="center">
          {t("soon.body")}
        </Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: gutter },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingBottom: 60 },
});
