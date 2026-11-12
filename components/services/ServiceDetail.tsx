import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ServiceVisual } from "components/illustrations/services";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { FAKABA_PHONE } from "lib/account";
import { useTranslation } from "lib/i18n/useTranslation";
import type { Service } from "lib/types";
import { openWhatsApp } from "lib/whatsapp";
import { gutter, opacity, radius, useTheme } from "theme";

export type ServiceContent = Pick<
  Service,
  "title" | "description" | "imageUrl" | "illustration" | "highlights" | "faqs"
>;

/**
 * "62 — Service detail" body. Also used by the admin form's Preview, where
 * `preview` turns the contact buttons into inert placeholders.
 */
export function ServiceDetail({
  service,
  onBack,
  headerAction,
  preview,
}: {
  service: ServiceContent;
  onBack: () => void;
  headerAction?: React.ReactNode;
  preview?: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const highlights = (service.highlights ?? []).filter(Boolean);
  const faqs = (service.faqs ?? []).filter((f) => f.question.trim());

  async function ask() {
    const result = await openWhatsApp(FAKABA_PHONE, t("svc.message", { title: service.title }));
    if (result !== "opened") Alert.alert(t("svc.noWhatsApp"));
  }
  const call = () => Linking.openURL(`tel:${FAKABA_PHONE}`).catch(() => {});

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.surface, paddingTop: insets.top + 8 }]}>
          <View style={styles.heroBar}>
            <IconButton icon={preview ? "close" : "back"} tone="bg" accessibilityLabel={t("setup.back")} onPress={onBack} />
            {headerAction}
          </View>
          <Animated.View entering={FadeIn.duration(300)} style={styles.heroArt}>
            <ServiceVisual imageUrl={service.imageUrl} illustration={service.illustration} size={150} tile="transparent" />
          </Animated.View>
        </View>

        <View style={styles.body}>
          <Text variant="h1" accessibilityRole="header">
            {service.title || t("svc.untitled")}
          </Text>
          {service.description ? <Text variant="body">{service.description}</Text> : null}

          {highlights.length > 0 && (
            <View style={styles.ticks}>
              {highlights.map((h, i) => (
                <View key={`${h}-${i}`} style={styles.tick}>
                  <View style={[styles.tickDot, { backgroundColor: colors.palm }]}>
                    <Icon name="check" size={10} color="#FFFFFF" weight="bold" />
                  </View>
                  <Text variant="base" style={styles.tickText}>
                    {h}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {faqs.length > 0 && (
            <View style={styles.faqs}>
              <Text variant="caps" color="inkMuted">
                {t("svc.questions").toUpperCase()}
              </Text>
              {faqs.map((f, i) => {
                const expanded = openFaq === i;
                return (
                  <View key={`${f.question}-${i}`} style={[styles.faq, { borderBottomColor: colors.line }]}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() => setOpenFaq(expanded ? null : i)}
                      style={({ pressed }) => [styles.faqHead, pressed && { opacity: opacity.pressed }]}
                    >
                      <Text variant="base" weight="semibold" style={styles.faqQ}>
                        {f.question}
                      </Text>
                      <Icon name={expanded ? "chevronUp" : "chevronDown"} size={14} weight="semibold" />
                    </Pressable>
                    {expanded && f.answer ? (
                      <Text variant="sm" color="inkMuted" style={styles.faqA}>
                        {f.answer}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.line, backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("svc.call")}
          onPress={preview ? undefined : call}
          style={({ pressed }) => [styles.callBtn, { borderColor: colors.ink }, pressed && { opacity: opacity.pressed }]}
        >
          <Icon name="phone" size={20} />
        </Pressable>
        <Button
          label={t("svc.ask")}
          variant="palm"
          leading={<Icon name="chat" size={18} color="#FFFFFF" weight="semibold" />}
          onPress={preview ? undefined : ask}
          style={styles.ask}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 24 },
  hero: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingHorizontal: 16, paddingBottom: 24 },
  heroBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroArt: { alignItems: "center", marginTop: -16 },
  body: { paddingHorizontal: gutter + 4, paddingTop: 24, gap: 14 },
  ticks: { gap: 10, paddingTop: 2 },
  tick: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tickDot: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 2 },
  tickText: { flex: 1 },
  faqs: { paddingTop: 8 },
  faq: { borderBottomWidth: StyleSheet.hairlineWidth * 2 },
  faqHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  faqQ: { flex: 1 },
  faqA: { paddingBottom: 12, marginTop: -4 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: gutter, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth * 2 },
  callBtn: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  ask: { flex: 1 },
});
