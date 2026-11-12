import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { LocationArt } from "components/illustrations";
import { OptionCard } from "components/onboarding/OptionCard";
import { ScreenTitle } from "components/onboarding/ScreenTitle";
import { Avatar, initialsOf } from "components/ui/Avatar";
import { Chip } from "components/ui/Chip";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useTranslation } from "lib/i18n/useTranslation";
import { radius, useTheme } from "theme";
import { INTERESTS, ROLES, TOWNS } from "./options";

/* ---------------------------------------------------------------- 1 · Type */

export function AccountTypeStep({
  value,
  onChange,
}: {
  value: "individual" | "company" | null;
  onChange: (v: "individual" | "company") => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.step}>
      <ScreenTitle title={t("setup.accountType.title")} lead={t("setup.accountType.lead")} />
      <View style={styles.list} accessibilityRole="radiogroup">
        <OptionCard
          layout="large"
          spot="individual"
          title={t("setup.accountType.individual")}
          subtitle={t("setup.accountType.individualSub")}
          selected={value === "individual"}
          onPress={() => onChange("individual")}
        />
        <OptionCard
          layout="large"
          spot="company"
          title={t("setup.accountType.company")}
          subtitle={t("setup.accountType.companySub")}
          selected={value === "company"}
          onPress={() => onChange("company")}
        />
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- 2 · Role */

export function RoleStep({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.step}>
      <ScreenTitle title={t("setup.role.title")} lead={t("setup.role.lead")} />
      <View style={styles.listTight} accessibilityRole="radiogroup">
        {ROLES.map((r) => (
          <OptionCard
            key={r.id}
            spot={r.spot}
            title={t(`setup.role.${r.id}`)}
            subtitle={t(`setup.role.${r.id}Sub`)}
            selected={value === r.id}
            onPress={() => onChange(r.id)}
          />
        ))}
      </View>
    </View>
  );
}

/* ---------------------------------------------------- 2 (company) · Business */

export type BusinessDraft = {
  name: string;
  registration: string;
  areas: string[];
  logoUri: string | null;
};

export function BusinessStep({
  value,
  onChange,
  onPickLogo,
  uploading,
}: {
  value: BusinessDraft;
  onChange: (v: BusinessDraft) => void;
  onPickLogo: () => void;
  uploading: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toggleArea = (town: string) =>
    onChange({
      ...value,
      areas: value.areas.includes(town) ? value.areas.filter((a) => a !== town) : [...value.areas, town],
    });

  return (
    <View style={styles.step}>
      <ScreenTitle title={t("setup.business.title")} lead={t("setup.business.lead")} />

      <View style={styles.photoRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("setup.business.logo")}
          onPress={onPickLogo}
          style={styles.logoWrap}
        >
          {value.logoUri ? (
            <Image source={{ uri: value.logoUri }} style={styles.logo} contentFit="cover" />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#121212" }]}>
              <Text variant="h1" color="#FFD700">
                {value.name.trim() ? initialsOf(value.name) : "—"}
              </Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.bg, borderColor: colors.ink }]}>
            {uploading ? <ActivityIndicator size="small" color={colors.ink} /> : <Icon name="camera" size={13} />}
          </View>
        </Pressable>
        <View style={styles.photoText}>
          <Text variant="base" weight="semibold">
            {t("setup.business.logo")}
          </Text>
          <Text variant="label" color="inkMuted" style={styles.regular}>
            {t("setup.business.logoHint")}
          </Text>
        </View>
      </View>

      <View style={styles.fields}>
        <TextField
          label={t("setup.business.name")}
          value={value.name}
          onChangeText={(name) => onChange({ ...value, name })}
          placeholder={t("setup.business.namePlaceholder")}
          autoCapitalize="words"
          textContentType="organizationName"
        />
        <TextField
          label={t("setup.business.reg")}
          labelAccessory={
            <Text variant="label" color="inkSubtle" style={styles.regular}>
              {t("setup.business.optional")}
            </Text>
          }
          value={value.registration}
          onChangeText={(registration) => onChange({ ...value, registration })}
          placeholder={t("setup.business.regPlaceholder")}
          autoCapitalize="characters"
        />
        <View style={styles.chipsBlock}>
          <Text variant="label">{t("setup.business.areas")}</Text>
          <View style={styles.chips}>
            {TOWNS.map((town) => (
              <Chip
                key={town}
                label={town}
                checkWhenSelected
                selected={value.areas.includes(town)}
                onPress={() => toggleArea(town)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------ 3 · Location */

export function LocationStep({
  value,
  onChange,
  company,
}: {
  value: string;
  onChange: (v: string) => void;
  company?: boolean;
}) {
  const { t } = useTranslation();
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  async function locateMe() {
    setLocating(true);
    setDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDenied(true);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      const town = place?.city ?? place?.subregion ?? place?.region;
      if (town) onChange(town);
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  }

  return (
    <View style={styles.step}>
      <View style={styles.art}>
        <LocationArt />
      </View>
      <ScreenTitle title={t(company ? "setup.location.companyTitle" : "setup.location.title")} />
      <View style={styles.fields}>
        <TextField
          shape="pill"
          leadingIcon={<Icon name="search" size={20} />}
          value={value}
          onChangeText={onChange}
          placeholder={t("setup.location.placeholder")}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="addressCity"
          returnKeyType="done"
          accessibilityLabel={t("setup.location.placeholder")}
        />
        <Pressable
          accessibilityRole="button"
          onPress={locateMe}
          disabled={locating}
          style={styles.locate}
          hitSlop={6}
        >
          {locating ? (
            <ActivityIndicator size="small" />
          ) : (
            <Icon name="locate" size={18} color="palm" />
          )}
          <Text variant="base" weight="semibold" color="palm">
            {locating ? t("setup.location.locating") : t("setup.location.useCurrent")}
          </Text>
        </Pressable>
        {denied && (
          <Text variant="sm" color="inkMuted">
            {t("setup.location.denied")}
          </Text>
        )}
        <View style={styles.chipsBlock}>
          <Text variant="caps" color="inkMuted">
            {t("setup.location.popular").toUpperCase()}
          </Text>
          <View style={styles.chips}>
            {TOWNS.map((town) => (
              <Chip
                key={town}
                label={town}
                checkWhenSelected
                selected={value.trim().toLowerCase() === town.toLowerCase()}
                onPress={() => onChange(town)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------- 4 · Profile */

export type ProfileDraft = { firstName: string; lastName: string; phone: string };

export function ProfileStep({
  value,
  onChange,
  photoUri,
  onPickPhoto,
  uploading,
  uploadFailed,
  showPhoto,
}: {
  value: ProfileDraft;
  onChange: (v: ProfileDraft) => void;
  photoUri: string | null;
  onPickPhoto: () => void;
  uploading: boolean;
  uploadFailed: boolean;
  showPhoto: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.step}>
      <ScreenTitle title={t("setup.profile.title")} lead={t("setup.profile.lead")} />

      {showPhoto && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photoUri ? t("setup.profile.changePhoto") : t("setup.profile.addPhoto")}
          onPress={onPickPhoto}
          style={styles.photoRow}
        >
          <View>
            {photoUri ? (
              <Avatar uri={photoUri} size={96} />
            ) : (
              <View style={[styles.photo, { borderColor: colors.inkSubtle, backgroundColor: colors.surface }]}>
                <Icon name="person" size={30} color="ink" weight="regular" />
              </View>
            )}
            <View style={[styles.plusBadge, { borderColor: colors.bg }]}>
              {uploading ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <Icon name="plus" size={14} color="#121212" weight="bold" />
              )}
            </View>
          </View>
          <View style={styles.photoText}>
            <Text variant="base" weight="semibold">
              {photoUri ? t("setup.profile.changePhoto") : t("setup.profile.addPhoto")}
            </Text>
            <Text variant="label" color={uploadFailed ? "danger" : "inkMuted"} style={styles.regular}>
              {uploading
                ? t("setup.profile.uploading")
                : uploadFailed
                  ? t("setup.profile.uploadFailed")
                  : t("setup.profile.photoHint")}
            </Text>
          </View>
        </Pressable>
      )}

      <View style={styles.fields}>
        <View style={styles.nameRow}>
          <View style={styles.flex}>
            <TextField
              label={t("setup.profile.firstName")}
              value={value.firstName}
              onChangeText={(firstName) => onChange({ ...value, firstName })}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label={t("setup.profile.lastName")}
              value={value.lastName}
              onChangeText={(lastName) => onChange({ ...value, lastName })}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
            />
          </View>
        </View>
        <TextField
          label={t("setup.profile.whatsapp")}
          labelAccessory={
            <Text variant="label" color="inkSubtle" style={styles.regular}>
              {t("setup.profile.optional")}
            </Text>
          }
          prefix="CM +237"
          value={value.phone}
          onChangeText={(phone) => onChange({ ...value, phone: phone.replace(/[^\d ]/g, "") })}
          placeholder="6XX XX XX XX"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={12}
        />
      </View>
    </View>
  );
}

/* ----------------------------------------------------------- 5 · Interests */

export function InterestsStep({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { t } = useTranslation();
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const rows: (typeof INTERESTS)[] = [];
  for (let i = 0; i < INTERESTS.length; i += 2) rows.push(INTERESTS.slice(i, i + 2));

  return (
    <View style={styles.step}>
      <ScreenTitle title={t("setup.interests.title")} lead={t("setup.interests.lead")} />
      <View style={styles.grid}>
        {rows.map((row, i) => (
          <View key={i} style={styles.gridRow}>
            {row.map((opt) => (
              <OptionCard
                key={opt.id}
                layout="tile"
                multi
                spot={opt.spot}
                title={t(`setup.interests.${opt.id}`)}
                selected={value.includes(opt.id)}
                onPress={() => toggle(opt.id)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- helpers */

export async function pickSquareImage(): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return res.canceled ? null : (res.assets[0]?.uri ?? null);
}

const styles = StyleSheet.create({
  step: { gap: 28 },
  list: { gap: 12 },
  listTight: { gap: 10, marginTop: -6 },
  fields: { gap: 18 },
  art: { alignItems: "center", marginBottom: -8 },
  locate: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", marginTop: -4 },
  chipsBlock: { gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFD700",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: { width: 84, height: 84 },
  logo: { width: 84, height: 84, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cameraBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: { flex: 1, gap: 2 },
  regular: { fontFamily: "Inter_400Regular" },
  nameRow: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  grid: { gap: 12, marginTop: -4 },
  gridRow: { flexDirection: "row", gap: 12 },
});
