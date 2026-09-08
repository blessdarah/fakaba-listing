import React, { useState, useMemo } from "react";
import {
  YStack,
  XStack,
  Input,
  Text,
  Separator,
  ScrollView,
  View,
  Button,
  useTheme,
} from "tamagui";
import { Search, Sliders } from "@tamagui/lucide-icons-2";
import { FlatList, RefreshControl, Pressable } from "react-native";
import ScreenContainer from "components/ScreenContainer";
import ListingCard from "components/ListingCard";
import { useListings } from "lib/query/useListings";
import { useTranslation } from "lib/i18n/useTranslation";
import { Listing } from "lib/types";

const categories = [
  { id: "all", translationKey: "categories.all", slug: "all" },
  { id: "Room", translationKey: "categories.room", slug: "rooms" },
  {
    id: "Apartment",
    translationKey: "categories.apartment",
    slug: "apartments",
  },
  { id: "House", translationKey: "categories.house", slug: "houses" },
  {
    id: "Commercial",
    translationKey: "categories.commercial",
    slug: "commercial",
  },
  { id: "Land", translationKey: "categories.land", slug: "land" },
];

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: listings = [], isLoading, refetch } = useListings();

  const filteredListings = useMemo(() => {
    return listings.filter((listing: Listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const renderCategoryButton = (category: (typeof categories)[0]) => (
    <Pressable
      key={category.id}
      onPress={() =>
        setSelectedCategory(
          category.id === "all"
            ? null
            : category.id === selectedCategory
              ? null
              : category.id
        )
      }
    >
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginRight: 8,
          borderRadius: 20,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor:
            (category.id === "all" && !selectedCategory) ||
            selectedCategory === category.id
              ? theme.blue8.val
              : theme.borderColor.val,
        }}
      >
        <Text
          fontSize="$3"
          fontWeight="600"
          style={{
            color:
              (category.id === "all" && !selectedCategory) ||
              selectedCategory === category.id
                ? theme.blue8.val
                : theme.color.val,
          }}
        >
          {t(category.translationKey)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.blue8.val}
          />
        }
      >
        <YStack gap="$4" pb="$8">
          <YStack gap="$3" pt="$4">
            <Text fontSize="$7" fontWeight="700">
              {t("common.search")}
            </Text>

            <XStack
              bg="#ececec"
              items="center"
              rounded={100}
              borderColor="$borderColor"
              background="$background"
              borderWidth={1}
              px="$3"
            >
              <Search size={20} color="#999" style={{ marginRight: 8 }} />
              <Input
                flex={1}
                placeholder={t("home.searchPlaceholder")}
                bg="transparent"
                color="#333"
                borderWidth={0}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </XStack>
          </YStack>

          <YStack gap="$2" mt="$4">
            <Text fontWeight="600" color="#666" fontSize="$3">
              {t("common.filter")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                marginHorizontal: -16,
                paddingHorizontal: 16,
                marginTop: 10,
              }}
            >
              {categories.map(renderCategoryButton)}
            </ScrollView>
          </YStack>

          <Separator />

          <YStack>
            {filteredListings.length === 0 ? (
              <YStack justify="center" items="center" gap="$3" py="$10">
                <Text color="#999" fontSize="$4">
                  {searchQuery || selectedCategory
                    ? t("common.error")
                    : "Search to find listings"}
                </Text>
              </YStack>
            ) : (
              <FlatList
                data={filteredListings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ListingCard item={item} />}
                scrollEnabled={false}
              />
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
