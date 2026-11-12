import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { SERVICE_ART, ServiceArt, ServiceVisual } from "components/illustrations/services";
import { OnboardingScreen } from "components/onboarding/OnboardingScreen";
import { BottomSheet } from "components/settings/BottomSheet";
import { ServiceDetail } from "components/services/ServiceDetail";
import { pickSquareImage } from "components/setup/steps";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { IconButton } from "components/ui/IconButton";
import { SignTag } from "components/ui/SignTag";
import { Text } from "components/ui/Text";
import { TextField } from "components/ui/TextField";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { useSaveService, useService } from "lib/query/useServices";
import type { ServiceFAQ } from "lib/types";
import { art, fonts, opacity, radius, useTheme } from "theme";

/** "63 — Create service (admin)". With `?id=` it edits an existing service. */
export default function EditServiceScreen() {
  const { isAdmin } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: existing, isPending } = useService(id ?? "");
  const { colors } = useTheme();

  if (!isAdmin) return <Redirect href="/services" />;
  if (id && isPending) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.inkMuted} />
      </View>
    );
  }
  return <ServiceForm id={id} initial={existing ?? undefined} />;
}

type Initial = NonNullable<ReturnType<typeof useService>["data"]>;
type FaqEdit = { index: number | null; question: string; answer: string };

function ServiceForm({ id, initial }: { id?: string; initial?: Initial }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const save = useSaveService();

  const [imageUri, setImageUri] = useState<string | null>(initial?.imageUrl || null);
  const [illustration, setIllustration] = useState<string | null>(initial?.illustration ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join("\n"));
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [faqs, setFaqs] = useState<ServiceFAQ[]>(initial?.faqs ?? []);

  const [coverSheet, setCoverSheet] = useState(false);
  const [faqEdit, setFaqEdit] = useState<FaqEdit | null>(null);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Any edit after mount marks the form dirty so closing asks first.
  useEffect(() => setDirty(true), [imageUri, illustration, title, tagline, description, highlights, featured, faqs]);
  useEffect(() => setDirty(false), []);

  const highlightList = highlights.split("\n").map((h) => h.trim()).filter(Boolean);
  const canPublish = title.trim().length > 1 && description.trim().length > 9 && !save.isPending;
  const draft = {
    title: title.trim(),
    description: description.trim(),
    imageUrl: imageUri ?? "",
    illustration: illustration ?? undefined,
    highlights: highlightList,
    faqs,
  };

  function close() {
    if (!dirty) return router.back();
    Alert.alert(t("svc.form.discardTitle"), undefined, [
      { text: t("svc.form.keepEditing"), style: "cancel" },
      { text: t("svc.form.discard"), style: "destructive", onPress: () => router.back() },
    ]);
  }

  async function choosePhoto() {
    const uri = await pickSquareImage();
    if (uri) {
      setImageUri(uri);
      setIllustration(null);
      setCoverSheet(false);
    }
  }

  function saveFaq() {
    if (!faqEdit || !faqEdit.question.trim()) return;
    const faq = { question: faqEdit.question.trim(), answer: faqEdit.answer.trim() };
    setFaqs((list) =>
      faqEdit.index === null ? [...list, faq] : list.map((f, i) => (i === faqEdit.index ? faq : f))
    );
    setFaqEdit(null);
  }

  function deleteFaq() {
    if (faqEdit?.index == null) return;
    setFaqs((list) => list.filter((_, i) => i !== faqEdit.index));
    setFaqEdit(null);
  }

  async function publish() {
    try {
      const savedId = await save.mutateAsync({
        id,
        imageUri,
        formData: {
          title: draft.title,
          description: draft.description,
          tagline: tagline.trim(),
          illustration: illustration ?? "",
          highlights: highlightList,
          featured,
          faqs,
          status: "active",
        },
      });
      setDirty(false);
      if (id) router.back();
      else router.replace({ pathname: "/service/[id]", params: { id: savedId } });
    } catch (e) {
      Alert.alert(t("svc.form.saveError"), e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <OnboardingScreen
      footer={
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setPreview(true)} disabled={!title.trim()}>
            <Text variant="base" weight="semibold" underline color={title.trim() ? "ink" : "inkSubtle"}>
              {t("svc.form.preview")}
            </Text>
          </Pressable>
          <Button
            label={id ? t("svc.form.save") : t("svc.form.publish")}
            disabled={!canPublish}
            loading={save.isPending}
            onPress={publish}
            style={styles.publish}
          />
        </View>
      }
    >
      <View style={styles.topBar}>
        <IconButton icon="close" accessibilityLabel={t("common.cancel")} onPress={close} />
        <SignTag label={t("svc.form.admin").toUpperCase()} tone="sale" />
      </View>
      <Text variant="h1" accessibilityRole="header" style={styles.title}>
        {id ? t("svc.form.editTitle") : t("svc.form.newTitle")}
      </Text>

      {/* Cover */}
      <Pressable accessibilityRole="button" onPress={() => setCoverSheet(true)} style={styles.coverRow}>
        {imageUri || illustration ? (
          <ServiceVisual imageUrl={imageUri} illustration={illustration} size={84} />
        ) : (
          <View style={[styles.coverEmpty, { borderColor: colors.inkSubtle }]}>
            <Icon name="plus" size={24} weight="semibold" />
          </View>
        )}
        <View style={styles.coverText}>
          <Text variant="base" weight="semibold">
            {t("svc.form.cover")}
          </Text>
          <Text variant="label" color="inkMuted" style={styles.regular}>
            {t("svc.form.coverHint")}
          </Text>
        </View>
      </Pressable>

      <View style={styles.fields}>
        <TextField
          label={t("svc.form.title")}
          value={title}
          onChangeText={setTitle}
          placeholder={t("svc.form.titlePlaceholder")}
          autoCapitalize="sentences"
        />
        <TextField
          label={t("svc.form.tagline")}
          labelAccessory={<Optional />}
          value={tagline}
          onChangeText={setTagline}
          placeholder={t("svc.form.taglinePlaceholder")}
          maxLength={60}
        />
        <AreaField
          label={t("svc.form.description")}
          value={description}
          onChangeText={setDescription}
          placeholder={t("svc.form.descriptionPlaceholder")}
        />
        <AreaField
          label={t("svc.form.highlights")}
          accessory={<Optional />}
          hint={t("svc.form.highlightsHint")}
          value={highlights}
          onChangeText={setHighlights}
          placeholder={t("svc.form.highlightsPlaceholder")}
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: featured }}
          onPress={() => setFeatured((f) => !f)}
          style={styles.check}
        >
          <View
            style={[
              styles.box,
              featured ? { backgroundColor: colors.ink, borderColor: colors.ink } : { borderColor: colors.inkSubtle },
            ]}
          >
            {featured && <Icon name="check" size={13} color="onInk" weight="bold" />}
          </View>
          <View style={styles.checkText}>
            <Text variant="base" weight="semibold">
              {t("svc.form.featured")}
            </Text>
            <Text variant="sm" color="inkMuted">
              {t("svc.form.featuredHint")}
            </Text>
          </View>
        </Pressable>

        {/* FAQs */}
        <View style={styles.faqBlock}>
          <View style={styles.faqHead}>
            <Text variant="label">{t("svc.form.faqs", { count: faqs.length })}</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setFaqEdit({ index: null, question: "", answer: "" })}
            >
              <Text variant="label" underline>
                {t("svc.form.addQuestion")}
              </Text>
            </Pressable>
          </View>
          {faqs.map((f, i) => (
            <Pressable
              key={`${f.question}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`${t("common.edit")}: ${f.question}`}
              onPress={() => setFaqEdit({ index: i, question: f.question, answer: f.answer })}
              style={({ pressed }) => [styles.faqRow, { borderColor: colors.line }, pressed && { opacity: opacity.pressed }]}
            >
              <Text variant="base" weight="medium" numberOfLines={1} style={styles.faqText}>
                {f.question}
              </Text>
              <Icon name="pencil" size={15} color="inkMuted" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Cover picker */}
      <BottomSheet visible={coverSheet} onClose={() => setCoverSheet(false)} title={t("svc.form.cover")}>
        <Button label={t("svc.form.choosePhoto")} variant="strong" leading={<Icon name="photo" size={18} color="onInk" />} onPress={choosePhoto} />
        <Text variant="caps" color="inkMuted">
          {t("svc.form.orIllustration").toUpperCase()}
        </Text>
        <View style={styles.artGrid}>
          {SERVICE_ART.map((name) => {
            const selected = !imageUri && illustration === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={t(`svc.art.${name}`)}
                onPress={() => {
                  setIllustration(name);
                  setImageUri(null);
                  setCoverSheet(false);
                }}
                style={[styles.artTile, { borderColor: selected ? colors.ink : "transparent" }]}
              >
                <ServiceArt name={name} size={56} tile={art.surface} />
              </Pressable>
            );
          })}
        </View>
        {(imageUri || illustration) && (
          <Button
            label={t("svc.form.removeCover")}
            variant="link"
            onPress={() => {
              setImageUri(null);
              setIllustration(null);
              setCoverSheet(false);
            }}
          />
        )}
      </BottomSheet>

      {/* FAQ editor */}
      <BottomSheet
        visible={!!faqEdit}
        onClose={() => setFaqEdit(null)}
        title={faqEdit?.index == null ? t("svc.form.addQuestion") : t("svc.form.editQuestion")}
      >
        <TextField
          label={t("svc.form.question")}
          value={faqEdit?.question ?? ""}
          onChangeText={(question) => setFaqEdit((f) => (f ? { ...f, question } : f))}
          placeholder={t("svc.form.questionPlaceholder")}
          autoFocus
        />
        <AreaField
          label={t("svc.form.answer")}
          value={faqEdit?.answer ?? ""}
          onChangeText={(answer) => setFaqEdit((f) => (f ? { ...f, answer } : f))}
          minHeight={88}
        />
        <Button label={t("common.done")} disabled={!faqEdit?.question.trim()} onPress={saveFaq} />
        {faqEdit?.index != null && (
          <Button label={t("svc.form.deleteQuestion")} variant="destructive" size="md" onPress={deleteFaq} />
        )}
      </BottomSheet>

      {/* Preview */}
      <Modal visible={preview} animationType="slide" onRequestClose={() => setPreview(false)}>
        <ServiceDetail service={draft} onBack={() => setPreview(false)} preview />
      </Modal>
    </OnboardingScreen>
  );
}

function Optional() {
  const { t } = useTranslation();
  return (
    <Text variant="label" color="inkSubtle" style={styles.regular}>
      {t("setup.business.optional")}
    </Text>
  );
}

/** Multi-line twin of TextField (same surface, 2px ink focus ring). */
function AreaField({
  label,
  accessory,
  hint,
  minHeight = 96,
  ...rest
}: TextInputProps & { label: string; accessory?: React.ReactNode; hint?: string; minHeight?: number }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.area}>
      <View style={styles.areaLabel}>
        <Text variant="label">{label}</Text>
        {accessory}
      </View>
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.inkSubtle}
        selectionColor={colors.ink}
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.areaInput,
          { minHeight, color: colors.ink, backgroundColor: focused ? colors.bg : colors.surface },
          { borderColor: focused ? colors.ink : "transparent" },
        ]}
        {...rest}
      />
      {hint ? (
        <Text variant="xs" color="inkMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { marginTop: 20 },
  coverRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 20 },
  coverEmpty: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  coverText: { flex: 1, gap: 2 },
  regular: { fontFamily: fonts.regular },
  fields: { gap: 18, paddingTop: 24 },
  check: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkText: { flex: 1, gap: 2 },
  faqBlock: { gap: 10 },
  faqHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  faqText: { flex: 1 },
  footer: { flexDirection: "row", alignItems: "center", gap: 20 },
  publish: { flex: 1 },
  artGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  artTile: { borderRadius: radius.md + 4, borderWidth: 2, padding: 2 },
  area: { gap: 8 },
  areaLabel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaInput: {
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
  },
});
