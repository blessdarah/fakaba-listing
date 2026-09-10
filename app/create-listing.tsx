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
} from "@tamagui/lucide-icons-2";
import { Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastController } from "@tamagui/toast";
import * as ImagePicker from "expo-image-picker";
import { HOME_CATEGORIES } from "components/HomeCategories";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { useCreateListing } from "lib/query/useListings";

const TYPE_OPTIONS = [
  { id: "rent", labelKey: "filter.rental" },
  { id: "sale", labelKey: "filter.sale" },
  { id: "lease", labelKey: "filter.lease" },
];

const CATEGORY_OPTIONS = HOME_CATEGORIES.map((cat) => ({
  id: cat.id,
  label: cat.name,
}));

const TOWN_OPTIONS = ["Yaounde", "Douala", "Buea", "Limbe"];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View
        px="$3"
        py="$1.5"
        rounded="$10"
        bg={selected ? "$blue3" : "transparent"}
        borderWidth={1.5}
        borderColor={selected ? "$blue8" : "$borderColor"}
      >
        <Text
          fontSize="$3"
          fontWeight={selected ? "700" : "500"}
          color={selected ? "$blue9" : "$color"}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function FeatureChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <XStack
      px="$3"
      py="$1.5"
      rounded="$10"
      bg="$blue3"
      borderWidth={1.5}
      borderColor="$blue8"
      items="center"
      gap="$1.5"
    >
      <Text fontSize="$3" fontWeight="600" color="$blue9">
        {label}
      </Text>
      <Pressable onPress={onRemove} hitSlop={6}>
        <X size={14} color="$blue9" />
      </Pressable>
    </XStack>
  );
}

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

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToastController();
  const { user } = useAuth();
  const { t } = useTranslation();
  const createListingMutation = useCreateListing(user?.uid ?? "");

  // --- Form state ---
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  const canSubmit =
    title.trim().length > 0 &&
    category.length > 0 &&
    type.length > 0 &&
    location.length > 0 &&
    Number(price) > 0 &&
    imageUris.length > 0;

  // --- Handlers ---

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), t("profile.photoPermissionDenied"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10 - imageUris.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUris((prev) =>
        [...prev, ...result.assets.map((a) => a.uri)].slice(0, 10)
      );
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed.length > 0 && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setFeatureInput("");
    }
  };

  const handleSubmit = () => {
    createListingMutation.mutate(
      {
        formData: {
          title: title.trim(),
          description: description.trim(),
          category,
          type,
          location,
          address: address.trim(),
          price: Number(price),
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          size: Number(size) || 0,
          features,
          ownerId: user?.uid ?? "",
          status: "active",
          isPublic: true,
        },
        imageUris,
      },
      {
        onSuccess: () => {
          toast.show(t("createListing.success"));
          router.back();
        },
        onError: () => {
          Alert.alert(t("common.error"), t("createListing.error"));
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
          {t("createListing.title")}
        </Text>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack p="$4" gap="$5" pb={insets.bottom + 32}>
          {/* --- Photos --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("createListing.photos")}</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2.5">
                {imageUris.map((uri, idx) => (
                  <View key={uri} position="relative">
                    <Image
                      src={uri}
                      width={90}
                      height={90}
                      rounded="$4"
                    />
                    <Pressable
                      onPress={() => handleRemoveImage(idx)}
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
                ))}
                {imageUris.length < 10 && (
                  <Pressable onPress={handlePickImages}>
                    <View
                      width={90}
                      height={90}
                      rounded="$4"
                      borderWidth={2}
                      borderColor="$borderColor"
                      borderStyle="dashed"
                      items="center"
                      justify="center"
                      gap="$1"
                    >
                      <ImagePlus size={24} color="$color8" />
                      <Text fontSize="$1" color="$color8">
                        {t("createListing.addPhoto")}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </XStack>
            </ScrollView>
            <Text fontSize="$1" color="$color8">
              {t("createListing.photosLimit")}
            </Text>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- Basic Info --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("createListing.basicInfo")}</SectionLabel>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.titleLabel")}</Text>
              <Input
                size="$4"
                placeholder={t("createListing.titlePlaceholder")}
                value={title}
                onChangeText={setTitle}
                bg="$color3"
                borderColor="$borderColor"
              />
            </YStack>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.descriptionLabel")}</Text>
              <Input
                size="$4"
                placeholder={t("createListing.descriptionPlaceholder")}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                bg="$color3"
                borderColor="$borderColor"
                textAlignVertical="top"
                height={100}
              />
            </YStack>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.categoryLabel")}</Text>
              <XStack gap="$2" flexWrap="wrap">
                {CATEGORY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    selected={category === opt.id}
                    onPress={() => setCategory(opt.id)}
                  />
                ))}
              </XStack>
            </YStack>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.typeLabel")}</Text>
              <XStack gap="$2" flexWrap="wrap">
                {TYPE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={t(opt.labelKey)}
                    selected={type === opt.id}
                    onPress={() => setType(opt.id)}
                  />
                ))}
              </XStack>
            </YStack>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- Location --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("createListing.locationSection")}</SectionLabel>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.townLabel")}</Text>
              <XStack gap="$2" flexWrap="wrap">
                {TOWN_OPTIONS.map((town) => (
                  <Chip
                    key={town}
                    label={town}
                    selected={location === town}
                    onPress={() => setLocation(town)}
                  />
                ))}
              </XStack>
            </YStack>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.addressLabel")}</Text>
              <Input
                size="$4"
                placeholder={t("createListing.addressPlaceholder")}
                value={address}
                onChangeText={setAddress}
                bg="$color3"
                borderColor="$borderColor"
              />
            </YStack>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- Property Details --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("createListing.propertyDetails")}</SectionLabel>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.priceLabel")}</Text>
              <Input
                size="$4"
                placeholder={t("createListing.pricePlaceholder")}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                bg="$color3"
                borderColor="$borderColor"
              />
            </YStack>
            <XStack gap="$3">
              <YStack gap="$2" flex={1}>
                <Text fontWeight="500">{t("createListing.bedroomsLabel")}</Text>
                <Input
                  size="$4"
                  placeholder="0"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                  bg="$color3"
                  borderColor="$borderColor"
                />
              </YStack>
              <YStack gap="$2" flex={1}>
                <Text fontWeight="500">{t("createListing.bathroomsLabel")}</Text>
                <Input
                  size="$4"
                  placeholder="0"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                  bg="$color3"
                  borderColor="$borderColor"
                />
              </YStack>
            </XStack>
            <YStack gap="$2">
              <Text fontWeight="500">{t("createListing.sizeLabel")}</Text>
              <Input
                size="$4"
                placeholder="0"
                value={size}
                onChangeText={setSize}
                keyboardType="numeric"
                bg="$color3"
                borderColor="$borderColor"
              />
            </YStack>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* --- Features --- */}
          <YStack gap="$2.5">
            <SectionLabel>{t("createListing.featuresSection")}</SectionLabel>
            <XStack gap="$2" items="center">
              <Input
                flex={1}
                size="$4"
                placeholder={t("createListing.featurePlaceholder")}
                value={featureInput}
                onChangeText={setFeatureInput}
                onSubmitEditing={handleAddFeature}
                bg="$color3"
                borderColor="$borderColor"
              />
              <Button
                size="$4"
                bg="$blue9"
                rounded="$4"
                onPress={handleAddFeature}
                disabled={featureInput.trim().length === 0}
              >
                <Button.Text color="white" fontWeight="600">
                  {t("createListing.addFeature")}
                </Button.Text>
              </Button>
            </XStack>
            {features.length > 0 && (
              <XStack gap="$2" flexWrap="wrap">
                {features.map((f) => (
                  <FeatureChip
                    key={f}
                    label={f}
                    onRemove={() =>
                      setFeatures((prev) => prev.filter((x) => x !== f))
                    }
                  />
                ))}
              </XStack>
            )}
          </YStack>

          {/* --- Submit --- */}
          <Button
            size="$5"
            bg={canSubmit ? "$blue9" : "$color5"}
            rounded="$4"
            disabled={!canSubmit || createListingMutation.isPending}
            onPress={handleSubmit}
            mt="$2"
          >
            {createListingMutation.isPending ? (
              <XStack gap="$2" items="center">
                <Spinner size="small" color="white" />
                <Button.Text color="white" fontWeight="700">
                  {t("createListing.publishing")}
                </Button.Text>
              </XStack>
            ) : (
              <Button.Text color="white" fontWeight="700">
                {t("createListing.submit")}
              </Button.Text>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
}
