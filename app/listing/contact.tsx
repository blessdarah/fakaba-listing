import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { areaOf, ownerName, ownerPhone } from "lib/listing";
import { useListing, useListingsByUser } from "lib/query/useListings";
import { openWhatsApp } from "lib/whatsapp";
import { fonts, gutter, radius, useTheme } from "theme";

/** "36 — Contact agent" and "37 — Contact · No WhatsApp". Presented as a form sheet. */
export default function ContactSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: listing, isPending } = useListing(id);
  const owner = listing?.owner as
    | (NonNullable<NonNullable<typeof listing>["owner"]> & { businessName?: string; verified?: boolean; whatsapp?: string })
    | undefined;
  const { data: ownerListings } = useListingsByUser(listing?.ownerId ?? "");

  const name = ownerName(owner);
  const firstName = owner?.accountType === "company" ? name : (owner?.firstName ?? name);
  const phone = ownerPhone(owner);

  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listing && !message) {
      setMessage(
        t("contact.message", {
          name: firstName || "",
          title: listing.title,
          area: areaOf(listing) || listing.location,
          price: formatPrice(listing.price),
        })
      );
    }
  }, [listing, firstName, message, t]);

  if (isPending || !listing) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.inkMuted} />
      </View>
    );
  }

  const email = owner?.email;
  const subject = t("contact.emailSubject", { title: listing.title });
  const sendEmail = () =>
    email &&
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`);
  const call = () => phone && Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);

  async function sendWhatsApp() {
    setError(null);
    const res = await openWhatsApp(phone, message);
    if (res === "opened") router.back();
    else setError(t("contact.unavailable"));
  }

  const listed = ownerListings?.length ?? 0;
  const roleLabel =
    owner?.accountType === "company"
      ? t("listing.role.company")
      : owner?.role === "agent"
        ? t("listing.role.agent")
        : t("listing.role.owner");
  const subtitle = [roleLabel, listed ? t("contact.listedPlaces", { count: listed }) : null].filter(Boolean).join(" · ");

  return (
    <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.header}>
        <Avatar
          name={name}
          uri={owner?.profileImage}
          size={52}
          kind={owner?.accountType === "company" ? "company" : "person"}
        />
        <View style={styles.flex}>
          <View style={styles.inline}>
            <Text variant="title" numberOfLines={1} style={styles.name}>
              {name || roleLabel}
            </Text>
            {owner?.verified && <Icon name="verified" size={16} color="palm" />}
          </View>
          <Text variant="label" color="inkMuted" style={styles.regular}>
            {subtitle}
          </Text>
        </View>
      </View>

      {phone ? (
        <>
          <View style={styles.messageHead}>
            <Text variant="caps" color="inkMuted">
              {t("contact.yourMessage").toUpperCase()}
            </Text>
            <Pressable hitSlop={10} onPress={() => setEditing((e) => !e)} accessibilityRole="button">
              <Text variant="label" underline>
                {editing ? t("contact.done") : t("contact.edit")}
              </Text>
            </Pressable>
          </View>
          <View style={[styles.message, { backgroundColor: colors.palmTint }]}>
            {editing ? (
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                autoFocus
                style={[styles.messageInput, { color: colors.ink }]}
                selectionColor={colors.ink}
              />
            ) : (
              <Text variant="base">{message}</Text>
            )}
          </View>
          {error && (
            <Text variant="sm" color="danger">
              {error}
            </Text>
          )}
          <Button
            label={t("contact.sendWhatsApp")}
            variant="palm"
            leading={<Icon name="chat" size={20} color="#FFFFFF" />}
            onPress={sendWhatsApp}
          />
          <View style={styles.row}>
            <Button
              label={t("contact.call")}
              variant="outline"
              leading={<Icon name="phone" size={18} />}
              onPress={call}
              style={styles.flex}
            />
            {email ? (
              <Button
                label={t("contact.email")}
                variant="quiet"
                leading={<Icon name="mail" size={18} />}
                onPress={sendEmail}
                style={styles.flex}
              />
            ) : null}
          </View>
        </>
      ) : (
        <>
          <View style={[styles.notice, { backgroundColor: colors.surface }]}>
            <Icon name="chat" size={20} color="inkMuted" />
            <View style={styles.flex}>
              <Text variant="base" weight="semibold">
                {t("contact.noWhatsAppTitle")}
              </Text>
              <Text variant="sm" color="inkMuted">
                {t("contact.noWhatsAppBody", { name: firstName || roleLabel })}
              </Text>
            </View>
          </View>
          {email ? (
            <Button
              label={t("contact.sendEmail")}
              variant="strong"
              leading={<Icon name="mail" size={18} color="onInk" />}
              onPress={sendEmail}
            />
          ) : null}
        </>
      )}

      <View style={styles.safety}>
        <Icon name="shield" size={16} color="inkMuted" style={styles.safetyIcon} />
        <Text variant="label" color="inkMuted" style={[styles.flex, styles.regular]}>
          {t("contact.safety")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { height: 240, alignItems: "center", justifyContent: "center" },
  sheet: { paddingTop: 28, paddingHorizontal: gutter, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontFamily: fonts.display, flexShrink: 1 },
  flex: { flex: 1 },
  regular: { fontFamily: fonts.regular },
  messageHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: -6 },
  message: { borderRadius: radius.md, padding: 16 },
  messageInput: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, minHeight: 66, padding: 0 },
  row: { flexDirection: "row", gap: 12 },
  notice: { flexDirection: "row", gap: 12, padding: 16, borderRadius: radius.md },
  safety: { flexDirection: "row", gap: 10, paddingTop: 4 },
  safetyIcon: { marginTop: 1 },
});
