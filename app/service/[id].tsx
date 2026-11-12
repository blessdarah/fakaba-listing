import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ServiceDetail } from "components/services/ServiceDetail";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { useService } from "lib/query/useServices";
import { opacity, radius, useTheme } from "theme";

/** "62 — Service detail". Admins get an Edit button in the hero. */
export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { data: service, isPending, isError, refetch } = useService(id);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/services"));

  if (isPending) {
    return (
      <View style={[styles.state, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.inkMuted} />
      </View>
    );
  }

  if (isError || !service) {
    return (
      <View style={[styles.state, { backgroundColor: colors.bg }]}>
        <Text variant="title" align="center">
          {isError ? t("svc.errorTitle") : t("svc.notFound")}
        </Text>
        {isError && <Button label={t("common.retry")} variant="outline" size="md" onPress={() => refetch()} />}
        <Button label={t("common.back")} variant="link" onPress={back} />
      </View>
    );
  }

  return (
    <ServiceDetail
      service={service}
      onBack={back}
      headerAction={
        isAdmin ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/service/edit", params: { id: service.id } })}
            style={({ pressed }) => [styles.edit, { backgroundColor: colors.bg }, pressed && { opacity: opacity.pressed }]}
          >
            <Icon name="pencil" size={14} weight="semibold" />
            <Text variant="sm" weight="semibold">
              {t("common.edit")}
            </Text>
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  state: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  edit: { flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingHorizontal: 14, borderRadius: radius.full },
});
