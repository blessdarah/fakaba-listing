import { useState } from "react";
import {
  ScrollView,
  YStack,
  XStack,
  Text,
  Input,
  Button,
  View,
  Spinner,
  Separator,
  Image,
} from "tamagui";
import {
  ChevronLeft,
  X,
  ImagePlus,
  Plus,
  Trash2,
} from "@tamagui/lucide-icons-2";
import { Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastController } from "@tamagui/toast";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "lib/i18n/useTranslation";
import { useCreateService } from "lib/query/useServices";
import { ServiceFAQ } from "lib/types";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="$3"
      fontWeight="600"
      color="$color8"
      textTransform="uppercase"
      letterSpacing={0.5}
    >
      {children}
    </Text>
  );
}

export default function CreateServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToastController();
  const { t } = useTranslation();
  const createServiceMutation = useCreateService();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [faqs, setFaqs] = useState<ServiceFAQ[]>([]);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    imageUri !== null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), t("profile.photoPermissionDenied"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleUpdateFaq = (
    index: number,
    field: keyof ServiceFAQ,
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!imageUri) return;

    const validFaqs = faqs.filter(
      (f) => f.question.trim().length > 0 && f.answer.trim().length > 0
    );

    createServiceMutation.mutate(
      {
        formData: {
          title: title.trim(),
          description: description.trim(),
          faqs: validFaqs,
          status: "active",
        },
        imageUri,
      },
      {
        onSuccess: () => {
          toast.show(t("services.serviceCreated"));
          router.back();
        },
        onError: () => {
          Alert.alert(t("common.error"), t("services.serviceCreateFailed"));
        },
      }
    );
  };

  return (
    <View flex={1} bg="$background">
      {/* Header */}
      <XStack
        pt={insets.top + 8}
        pb="$3"
        px="$4"
        items="center"
        gap="$3"
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} color="$color" />
        </Pressable>
        <Text fontSize="$6" fontWeight="700" flex={1}>
          {t("services.createService")}
        </Text>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack p="$4" gap="$5" pb={insets.bottom + 32}>
          {/* --- Image --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("services.serviceImage")}</SectionLabel>
            {imageUri ? (
              <View position="relative" style={{ alignSelf: "flex-start" }}>
                <Image
                  src={imageUri}
                  width={160}
                  height={120}
                  rounded="$4"
                />
                <Pressable
                  onPress={() => setImageUri(null)}
                  style={{ position: "absolute", top: -6, right: -6 }}
                >
                  <View
                    width={22}
                    height={22}
                    rounded={11}
                    bg="$red9"
                    items="center"
                    justify="center"
                  >
                    <X size={12} color="white" />
                  </View>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={handlePickImage}>
                <View
                  width={160}
                  height={120}
                  rounded="$4"
                  borderWidth={2}
                  borderColor="$borderColor"
                  borderStyle="dashed"
                  items="center"
                  justify="center"
                  gap="$1"
                >
                  <ImagePlus size={24} color="$color8" />
                  <Text fontSize="$2" color="$color8">
                    {t("services.addImage")}
                  </Text>
                </View>
              </Pressable>
            )}
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- Title --- */}
          <YStack gap="$2">
            <Text fontWeight="500">{t("services.serviceTitle")}</Text>
            <Input
              size="$4"
              placeholder={t("services.serviceTitlePlaceholder")}
              value={title}
              onChangeText={setTitle}
              bg="$color3"
              borderColor="$borderColor"
            />
          </YStack>

          {/* --- Description --- */}
          <YStack gap="$2">
            <Text fontWeight="500">{t("services.serviceDescription")}</Text>
            <Input
              size="$4"
              placeholder={t("services.serviceDescriptionPlaceholder")}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              bg="$color3"
              borderColor="$borderColor"
              textAlignVertical="top"
              height={120}
            />
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- FAQs --- */}
          <YStack gap="$3">
            <SectionLabel>{t("services.faqs")}</SectionLabel>

            {faqs.map((faq, index) => (
              <YStack
                key={index}
                gap="$2"
                p="$3"
                rounded="$4"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <XStack items="center" justify="space-between">
                  <Text fontSize="$2" fontWeight="600" color="$color8">
                    FAQ {index + 1}
                  </Text>
                  <Pressable onPress={() => handleRemoveFaq(index)} hitSlop={6}>
                    <Trash2 size={16} color="$red9" />
                  </Pressable>
                </XStack>
                <Input
                  size="$4"
                  placeholder={t("services.faqQuestion")}
                  value={faq.question}
                  onChangeText={(v) => handleUpdateFaq(index, "question", v)}
                  bg="$color3"
                  borderColor="$borderColor"
                />
                <Input
                  size="$4"
                  placeholder={t("services.faqAnswer")}
                  value={faq.answer}
                  onChangeText={(v) => handleUpdateFaq(index, "answer", v)}
                  multiline
                  numberOfLines={3}
                  bg="$color3"
                  borderColor="$borderColor"
                  textAlignVertical="top"
                  height={80}
                />
              </YStack>
            ))}

            <Button
              size="$4"
              variant="outlined"
              borderColor="$borderColor"
              rounded="$4"
              onPress={handleAddFaq}
            >
              <XStack items="center" gap="$2">
                <Plus size={16} color="$color" />
                <Button.Text fontWeight="600">{t("services.addFaq")}</Button.Text>
              </XStack>
            </Button>
          </YStack>

          {/* --- Submit --- */}
          <Button
            size="$5"
            bg={canSubmit ? "$blue9" : "$color5"}
            rounded="$4"
            disabled={!canSubmit || createServiceMutation.isPending}
            onPress={handleSubmit}
            mt="$2"
          >
            {createServiceMutation.isPending ? (
              <XStack gap="$2" items="center">
                <Spinner size="small" color="white" />
                <Button.Text color="white" fontWeight="700">
                  {t("services.publishing")}
                </Button.Text>
              </XStack>
            ) : (
              <Button.Text color="white" fontWeight="700">
                {t("services.publishService")}
              </Button.Text>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
}
