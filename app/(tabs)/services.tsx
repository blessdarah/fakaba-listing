import { router } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spot } from "components/illustrations";
import { ServiceVisual } from "components/illustrations/services";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { useServices } from "lib/query/useServices";
import type { Service } from "lib/types";
import { gutter, opacity, radius, useTheme } from "theme";

/** "61 — Services". Admins also get a "New service" entry ("63"). */
export default function ServicesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { data, isPending, isError, refetch, isRefetching } = useServices();

  const services = data ?? [];
  const featured = services.find((s) => s.featured);
  const rest = services.filter((s) => s !== featured);
  const open = (s: Service) => router.push({ pathname: "/service/[id]", params: { id: s.id } });

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.inkMuted} />}
    >
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <Text variant="display" accessibilityRole="header" style={styles.title}>
            {t("nav.services")}
          </Text>
          {isAdmin && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("svc.new")}
              hitSlop={8}
              onPress={() => router.push("/service/edit")}
              style={({ pressed }) => [styles.newBtn, { backgroundColor: colors.ink }, pressed && { opacity: opacity.pressed }]}
            >
              <Icon name="plus" size={14} color="onInk" weight="bold" />
              <Text variant="sm" weight="semibold" color="onInk">
                {t("svc.newShort")}
              </Text>
            </Pressable>
          )}
        </View>
        <Text variant="base" color="inkMuted">
          {t("svc.lead")}
        </Text>
      </View>

      {isPending ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.inkMuted} />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Icon name="offline" size={28} color="inkMuted" />
          <Text variant="title" align="center">
            {t("svc.errorTitle")}
          </Text>
          <Button label={t("common.retry")} variant="outline" size="md" onPress={() => refetch()} />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.state}>
          <Spot name="agent" size={88} />
          <Text variant="title" align="center">
            {t("svc.emptyTitle")}
          </Text>
          <Text variant="base" color="inkMuted" align="center">
            {t("svc.emptyBody")}
          </Text>
        </View>
      ) : (
        <>
          {featured && (
            <Pressable
              accessibilityRole="button"
              onPress={() => open(featured)}
              style={({ pressed }) => [styles.hero, { backgroundColor: colors.brand }, pressed && { opacity: opacity.pressed }]}
            >
              <View style={styles.heroText}>
                <View style={[styles.badge, { backgroundColor: colors.signal }]}>
                  <Text variant="tag" color="#121212" style={styles.badgeText}>
                    {t("svc.mostAsked").toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.heroTitle} color="onBrand">
                  {featured.title}
                </Text>
                <Text variant="label" color="onBrandMuted" style={styles.heroBody} numberOfLines={3}>
                  {featured.tagline || featured.description}
                </Text>
              </View>
              <ServiceVisual imageUrl={featured.imageUrl} illustration={featured.illustration} size={72} />
            </Pressable>
          )}

          <View style={styles.list}>
            {rest.map((s, i) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => open(s)}
                style={({ pressed }) => [
                  styles.row,
                  i < rest.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
                  pressed && { opacity: opacity.pressed },
                ]}
              >
                <ServiceVisual imageUrl={s.imageUrl} illustration={s.illustration} size={52} />
                <View style={styles.rowText}>
                  <Text variant="body" weight="semibold" style={styles.rowTitle} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text variant="label" color="inkMuted" style={styles.rowSub} numberOfLines={1}>
                    {s.tagline || s.description}
                  </Text>
                </View>
                <Icon name="forward" size={16} weight="semibold" />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: gutter, paddingBottom: 32, flexGrow: 1 },
  head: { gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { letterSpacing: -1.4, flexShrink: 1 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: radius.full },
  hero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: radius.lg, marginTop: 20 },
  heroText: { flex: 1, gap: 8, alignItems: "flex-start" },
  badge: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: radius.xs },
  badgeText: { fontSize: 11, lineHeight: 14, letterSpacing: 0.88 },
  heroTitle: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 22, lineHeight: 26, letterSpacing: -0.44 },
  heroBody: { fontFamily: "Inter_400Regular", lineHeight: 19 },
  list: { paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 16, lineHeight: 20 },
  rowSub: { fontFamily: "Inter_400Regular" },
  state: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 60 },
});
