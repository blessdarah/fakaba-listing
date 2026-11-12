import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInRight, FadeOut } from "react-native-reanimated";
import { DoneArt } from "components/illustrations";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { ProgressHeader } from "components/onboarding/ProgressHeader";
import { defaultInterestsFor } from "components/setup/options";
import {
  AccountTypeStep,
  BusinessStep,
  InterestsStep,
  LocationStep,
  pickSquareImage,
  ProfileStep,
  RoleStep,
  type BusinessDraft,
  type ProfileDraft,
} from "components/setup/steps";
import { Button } from "components/ui/Button";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { useTheme } from "theme";

const TOTAL = 5;
type Step = 1 | 2 | 3 | 4 | 5 | "done";

/**
 * "23–27 — Setup 1–5", "68 — Setup · Company details", "28 — You're in".
 * Answers stay local until "Show me places" saves them; that flips
 * `needsSetup` and the root navigator lands on home.
 */
export default function SetupScreen() {
  const { t } = useTranslation();
  const { user, userProfile, completeSetup, updateProfileImage } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [accountType, setAccountType] = useState<"individual" | "company" | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessDraft>({
    name: "",
    registration: "",
    areas: [],
    logoUri: null,
  });
  const [location, setLocation] = useState(userProfile?.location ?? "");
  const [profile, setProfile] = useState<ProfileDraft>(() => {
    const [first = "", ...rest] = (user?.displayName ?? "").split(" ");
    return { firstName: userProfile?.firstName ?? first, lastName: userProfile?.lastName ?? rest.join(" "), phone: "" };
  });
  const [photoUri, setPhotoUri] = useState<string | null>(user?.photoURL ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const isCompany = accountType === "company";

  const canContinue =
    (step === 1 && accountType !== null) ||
    (step === 2 && (isCompany ? business.name.trim().length > 1 : role !== null)) ||
    (step === 3 && location.trim().length > 1) ||
    (step === 4 && profile.firstName.trim().length > 0 && profile.lastName.trim().length > 0) ||
    (step === 5 && interests.length > 0);

  function go(next: Step) {
    setDirection(next === "done" || (typeof step === "number" && next > step) ? 1 : -1);
    setStep(next);
  }

  function next() {
    if (step === 2 && isCompany && business.areas.length && !location) setLocation(business.areas[0]);
    if (step === 2 && !isCompany && interests.length === 0) setInterests(defaultInterestsFor(role));
    if (step === 5) go("done");
    else if (typeof step === "number") go((step + 1) as Step);
  }

  async function uploadImage(uri: string, onLocal: (uri: string) => void) {
    onLocal(uri);
    setUploading(true);
    setUploadFailed(false);
    try {
      await updateProfileImage(uri);
    } catch {
      setUploadFailed(true);
    } finally {
      setUploading(false);
    }
  }

  async function pickPhoto() {
    const uri = await pickSquareImage();
    if (uri) uploadImage(uri, setPhotoUri);
  }

  async function pickLogo() {
    const uri = await pickSquareImage();
    if (uri) uploadImage(uri, (u) => setBusiness((b) => ({ ...b, logoUri: u })));
  }

  async function finish() {
    setSaving(true);
    setSaveError(false);
    const digits = profile.phone.replace(/\D/g, "");
    try {
      await completeSetup({
        accountType: accountType ?? "individual",
        role: isCompany ? "agent" : (role ?? "renter"),
        location: location.trim(),
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        interests,
        phone: digits ? `+237${digits}` : undefined,
        businessName: isCompany ? business.name.trim() : undefined,
        registrationNumber: isCompany ? business.registration.trim() : undefined,
        serviceAreas: isCompany ? business.areas : undefined,
      });
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  }

  if (step === "done") {
    return (
      <DoneScreen
        name={profile.firstName.trim()}
        lookingTo={isCompany ? business.name.trim() : role ? t(`setup.role.${role}`) : ""}
        lookingToLabel={isCompany ? t("setup.done.business") : t("setup.done.lookingTo")}
        town={location.trim()}
        showing={interests.map((i) => t(`setup.interests.${i}`)).join(", ")}
        saving={saving}
        error={saveError ? t("setup.saveError") : null}
        onFinish={finish}
      />
    );
  }

  const entering = (direction === 1 ? FadeInRight : FadeInLeft).duration(240);

  return (
    <OnboardingScreen
      header={
        <ProgressHeader
          step={step}
          total={TOTAL}
          backLabel={t("setup.back")}
          onBack={step > 1 ? () => go((step - 1) as Step) : undefined}
        />
      }
      contentStyle={styles.content}
      footer={
        <Button
          label={
            step === 5
              ? interests.length
                ? t("setup.finishCount", { count: interests.length })
                : t("setup.finish")
              : t("setup.continue")
          }
          disabled={!canContinue || uploading}
          onPress={next}
        />
      }
    >
      <Animated.View key={step} entering={entering} exiting={FadeOut.duration(120)}>
        {step === 1 && <AccountTypeStep value={accountType} onChange={setAccountType} />}
        {step === 2 &&
          (isCompany ? (
            <BusinessStep value={business} onChange={setBusiness} onPickLogo={pickLogo} uploading={uploading} />
          ) : (
            <RoleStep value={role} onChange={setRole} />
          ))}
        {step === 3 && <LocationStep value={location} onChange={setLocation} company={isCompany} />}
        {step === 4 && (
          <ProfileStep
            value={profile}
            onChange={setProfile}
            photoUri={photoUri}
            onPickPhoto={pickPhoto}
            uploading={uploading}
            uploadFailed={uploadFailed}
            showPhoto={!isCompany}
          />
        )}
        {step === 5 && <InterestsStep value={interests} onChange={setInterests} />}
      </Animated.View>
    </OnboardingScreen>
  );
}

function DoneScreen({
  name,
  lookingTo,
  lookingToLabel,
  town,
  showing,
  saving,
  error,
  onFinish,
}: {
  name: string;
  lookingTo: string;
  lookingToLabel: string;
  town: string;
  showing: string;
  saving: boolean;
  error: string | null;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const rows = [
    { label: lookingToLabel, value: lookingTo },
    { label: t("setup.done.in"), value: town },
    { label: t("setup.done.showing"), value: showing },
  ].filter((r) => r.value);

  return (
    <OnboardingScreen
      contentStyle={styles.done}
      footer={
        <>
          {error && (
            <Text variant="sm" color="danger" align="center">
              {error}
            </Text>
          )}
          <Button
            label={t("setup.done.cta")}
            variant="strong"
            trailingIcon="arrowRight"
            trailingIconColor={colors.signal}
            loading={saving}
            onPress={onFinish}
          />
        </>
      }
    >
      <Animated.View entering={FadeIn.duration(400)} style={styles.doneArt}>
        <DoneArt />
      </Animated.View>
      <View style={styles.doneCopy}>
        <Text variant="display" style={styles.doneTitle} accessibilityRole="header">
          {name ? t("setup.done.title", { name }) : t("setup.done.titleNoName")}
        </Text>
        <Text variant="body" color="inkMuted">
          {t("setup.done.lead")}
        </Text>
      </View>
      <View>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={[
              styles.summaryRow,
              i < rows.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
            ]}
          >
            <Text variant="sm" color="inkMuted">
              {r.label}
            </Text>
            <Text variant="base" weight="semibold" align="right" style={styles.summaryValue} numberOfLines={2}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24 },
  done: { paddingTop: 40, gap: 24 },
  doneArt: { alignItems: "center" },
  doneCopy: { gap: 12 },
  doneTitle: { fontSize: 42, lineHeight: 44, letterSpacing: -1.6 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    gap: 16,
  },
  summaryValue: { flex: 1 },
});
