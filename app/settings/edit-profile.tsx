import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { BottomSheet } from "components/settings/BottomSheet";
import { ScreenHeader } from "components/settings/ScreenHeader";
import { SheetOption } from "components/settings/SheetOption";
import { TOWNS } from "components/setup/options";
import { pickSquareImage } from "components/setup/steps";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { displayNameOf, groupLocalDigits, localDigitsOf } from "lib/account";
import { useTranslation } from "lib/i18n/useTranslation";
import { opacity, radius, useTheme } from "theme";

/** "53 — Edit profile". The WhatsApp row on Profile opens this focused on the phone. */
export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const { user, userProfile, updateUserProfile, updateProfileImage } = useAuth();
  const isCompany = userProfile?.accountType === "company";

  const [firstName, setFirstName] = useState(userProfile?.firstName ?? "");
  const [lastName, setLastName] = useState(userProfile?.lastName ?? "");
  const [businessName, setBusinessName] = useState(userProfile?.businessName ?? "");
  const [phone, setPhone] = useState(groupLocalDigits(localDigitsOf(userProfile?.phone)));
  const [town, setTown] = useState(userProfile?.location ?? "");
  const [photoUri, setPhotoUri] = useState<string | null>(userProfile?.profileImage ?? user?.photoURL ?? null);

  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [townSheet, setTownSheet] = useState(false);
  const lastRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const digits = phone.replace(/\D/g, "");
  const towns = town && !TOWNS.includes(town) ? [town, ...TOWNS] : TOWNS;
  const canSave =
    !uploading &&
    (isCompany ? businessName.trim().length > 1 : firstName.trim().length > 0 && lastName.trim().length > 0);

  async function pickPhoto() {
    const uri = await pickSquareImage();
    if (!uri) return;
    const previous = photoUri;
    setPhotoUri(uri);
    setUploading(true);
    setPhotoError(false);
    try {
      await updateProfileImage(uri);
    } catch {
      setPhotoUri(previous);
      setPhotoError(true);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (digits && digits.length !== 9) {
      setPhoneError(t("account.edit.phoneInvalid"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: digits ? `+237${digits}` : "",
        location: town.trim(),
        ...(isCompany ? { businessName: businessName.trim() } : {}),
      });
      router.back();
    } catch {
      setError(t("account.edit.saveError"));
      setSaving(false);
    }
  }

  const name = isCompany ? businessName : `${firstName} ${lastName}`;

  return (
    <OnboardingScreen
      header={
        <View style={styles.header}>
          <ScreenHeader title={t("account.editProfile")} />
        </View>
      }
      contentStyle={styles.content}
      footer={
        <>
          {error && (
            <Text variant="sm" color="danger" align="center">
              {error}
            </Text>
          )}
          <Button label={t("account.edit.save")} disabled={!canSave} loading={saving} onPress={save} />
        </>
      }
    >
      {/* Photo */}
      <View style={styles.photoBlock}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("account.edit.changePhoto")}
          onPress={pickPhoto}
          disabled={uploading}
        >
          <Avatar
            name={name.trim() || displayNameOf(userProfile, user?.displayName)}
            uri={photoUri}
            size={104}
            kind={isCompany ? "company" : "person"}
          />
          <View style={[styles.camera, { backgroundColor: colors.ink, borderColor: colors.bg }]}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.onInk} />
            ) : (
              <Icon name="camera" size={14} color="onInk" weight="semibold" />
            )}
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={pickPhoto} disabled={uploading}>
          <Text variant="sm" weight="semibold" underline>
            {isCompany ? t("account.edit.changeLogo") : t("account.edit.changePhoto")}
          </Text>
        </Pressable>
        {photoError && (
          <Text variant="sm" color="danger" align="center">
            {t("account.edit.photoError")}
          </Text>
        )}
      </View>

      <View style={styles.fields}>
        {isCompany && (
          <TextField
            label={t("setup.business.name")}
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
            textContentType="organizationName"
          />
        )}
        <View style={styles.nameRow}>
          <View style={styles.half}>
            <TextField
              label={t("account.edit.firstName")}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              textContentType="givenName"
              returnKeyType="next"
              onSubmitEditing={() => lastRef.current?.focus()}
            />
          </View>
          <View style={styles.half}>
            <TextField
              ref={lastRef}
              label={t("account.edit.lastName")}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              textContentType="familyName"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>
        </View>

        <TextField
          ref={phoneRef}
          label={t("account.whatsapp")}
          labelAccessory={
            <Text variant="xs" color="inkMuted">
              {t("account.edit.phoneHint")}
            </Text>
          }
          prefix="CM +237"
          value={phone}
          onChangeText={(v) => {
            setPhone(groupLocalDigits(v));
            if (phoneError) setPhoneError(null);
          }}
          placeholder="6XX XX XX XX"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoFocus={focus === "phone"}
          error={phoneError}
        />

        <View style={styles.select}>
          <Text variant="label">{t("account.edit.town")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("account.edit.town")}, ${town || t("account.edit.chooseTown")}`}
            onPress={() => setTownSheet(true)}
            style={({ pressed }) => [
              styles.selectField,
              { backgroundColor: colors.surface },
              pressed && { opacity: opacity.pressed },
            ]}
          >
            <Text variant="body" color={town ? "ink" : "inkSubtle"} style={styles.selectValue}>
              {town || t("account.edit.chooseTown")}
            </Text>
            <Icon name="chevronDown" size={16} weight="semibold" />
          </Pressable>
        </View>

        <View style={[styles.email, { borderTopColor: colors.line }]}>
          <View style={styles.emailText}>
            <Text variant="xs" color="inkMuted" style={styles.emailLabel}>
              {t("account.edit.emailLabel")}
            </Text>
            <Text variant="body" weight="medium" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <Icon name="lock" size={16} color="inkSubtle" />
        </View>
      </View>

      <BottomSheet visible={townSheet} onClose={() => setTownSheet(false)} title={t("account.edit.town")}>
        <View style={styles.townList} accessibilityRole="radiogroup">
          {towns.map((name) => (
            <SheetOption
              key={name}
              title={name}
              selected={name === town}
              onPress={() => {
                setTown(name);
                setTownSheet(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  content: { paddingTop: 12 },
  photoBlock: { alignItems: "center", gap: 12, paddingBottom: 24 },
  camera: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  fields: { gap: 18 },
  nameRow: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  select: { gap: 8 },
  selectField: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectValue: { flex: 1 },
  email: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingTop: 16,
  },
  emailText: { flex: 1, gap: 2 },
  emailLabel: { fontSize: 13 },
  townList: { gap: 8 },
});
