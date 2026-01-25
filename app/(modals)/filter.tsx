import { Pressable } from "react-native";
import { Text, YStack, XStack, Button, Input, Separator } from "tamagui";
import { useRouter, Stack } from "expo-router";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { useState } from "react";

export default function FilterModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const [type, setType] = useState("Rental");
  const [category, setCategory] = useState("Apartment");
  const [location, setLocation] = useState("Yaounde");
  const [minPrice, setMinPrice] = useState("20,000");
  const [maxPrice, setMaxPrice] = useState("800,000");

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={() => router.back()}
      >
        <YStack flex={1} justify="flex-end">
          <YStack
            bg="$background"
            p="$5"
            pb="$8"
            gap="$5"
            borderTopLeftRadius="$9"
            borderTopRightRadius="$9"
            onPress={(e) => e.stopPropagation()}
          >
            <YStack
              width={48}
              height={5}
              bg="#ccc"
              style={{ borderRadius: 2, alignSelf: "center" }}
              mb="$2"
            />

            <Text fontSize="$7" fontWeight="700">
              {t("filter.title")}
            </Text>
            <YStack bg="#f5f5f5" style={{ borderRadius: 12 }} p="$4" pb="$2">
              <FilterItem
                label={t("filter.type")}
                value={type}
                showChevron
                onPress={() => {}}
              />
              <Separator />
              <FilterItem
                label={t("filter.category")}
                value={category}
                showChevron
                onPress={() => {}}
              />
              <Separator />
              <FilterItem
                label={t("filter.location")}
                value={location}
                onPress={() => {}}
              />
            </YStack>
            <YStack bg="#f5f5f5" style={{ borderRadius: 12 }} p="$4" gap="$3">
              <Text fontWeight="600" color="#333" fontSize="$3">
                {t("filter.price")}
              </Text>
              <XStack items="center" gap="$3">
                <Input
                  flex={1}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  bg="$background"
                  borderWidth={1}
                  borderColor="#ddd"
                  style={{ borderRadius: 6 }}
                  height="$4"
                  px="$3"
                  fontSize="$4"
                  keyboardType="numeric"
                />
                <Text color="#999">-</Text>
                <Input
                  flex={1}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  bg="$background"
                  borderWidth={1}
                  borderColor="#ddd"
                  style={{ borderRadius: 6 }}
                  height="$4"
                  px="$3"
                  fontSize="$4"
                  keyboardType="numeric"
                />
              </XStack>
            </YStack>
            <XStack gap="$3" mt="$2">
              <Button
                flex={1}
                bg="#e9ecef"
                color="#333"
                style={{ borderRadius: 8, height: 50 }}
                onPress={() => router.back()}
                fontWeight="700"
                fontSize="$4"
              >
                {t("common.cancel")}
              </Button>
              <Button
                flex={1}
                bg="#5c7cfa"
                color="white"
                style={{ borderRadius: 8, height: 50 }}
                onPress={() => router.back()}
                fontWeight="700"
                fontSize="$4"
              >
                {t("common.apply")}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Pressable>
    </>
  );
}

function FilterItem({
  label,
  value,
  showChevron = false,
  onPress,
}: {
  label: string;
  value: string;
  showChevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <XStack justify="space-between" items="center" py="$3">
        <Text color="#333" fontSize="$4" fontWeight="500">
          {label}
        </Text>
        <XStack items="center" gap="$2">
          <Text fontWeight="600" fontSize="$4">
            {value}
          </Text>
          {showChevron && <ChevronRight size={18} color="#999" />}
        </XStack>
      </XStack>
    </Pressable>
  );
}
