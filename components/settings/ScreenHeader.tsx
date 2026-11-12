import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { useTranslation } from "lib/i18n/useTranslation";

/** Back button with an optional centred title ("53 — Edit profile"). */
export function ScreenHeader({ title, onBack }: { title?: string; onBack?: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <IconButton icon="back" accessibilityLabel={t("setup.back")} onPress={onBack ?? (() => router.back())} />
      {title ? (
        <Text variant="lg" weight="semibold" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.slot} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 40 },
  title: { flex: 1, textAlign: "center" },
  slot: { width: 40 },
});
