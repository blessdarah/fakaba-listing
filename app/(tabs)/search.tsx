import React, { useState, useMemo, useCallback } from "react";
import {
  YStack,
  XStack,
  Input,
  Text,
  View,
  Button,
  Sheet,
  Separator,
  Spinner,
} from "tamagui";
import { Slider } from "@tamagui/slider";
import {
  Search,
  SlidersHorizontal,
  X,
  SearchX,
  ChevronLeft,
} from "@tamagui/lucide-icons-2";
import { FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import ListingCardCompact from "components/ListingCardCompact";
import { HOME_CATEGORIES } from "components/HomeCategories";
import { useListings, useListingsByUser } from "lib/query/useListings";
import { useTranslation } from "lib/i18n/useTranslation";
import type { Listing } from "lib/types";

// --- Constants ---

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

const DEFAULT_PRICE: [number, number] = [0, 1_000_000];
const PRICE_STEP = 5_000;
const PAGE_SIZE = 10;

// --- Chip component ---

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

// --- Active filter pill (dismissable) ---

function ActivePill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <XStack
      items="center"
      gap="$1.5"
      bg="$blue3"
      px="$2.5"
      py="$1"
      rounded="$10"
    >
      <Text fontSize="$2" fontWeight="600" color="$blue9">
        {label}
      </Text>
      <Pressable onPress={onRemove} hitSlop={6}>
        <X size={12} color="$blue9" />
      </Pressable>
    </XStack>
  );
}

// --- Section header in filter sheet ---

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <YStack gap="$2.5">
      <Text fontSize="$3" fontWeight="600" color="$color8" textTransform="uppercase" letterSpacing={0.5}>
        {title}
      </Text>
      {children}
    </YStack>
  );
}

// --- Main screen ---

export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ agentId?: string; agentName?: string }>();
  const agentId = params.agentId;
  const agentName = params.agentName;

  const allListingsQuery = useListings();
  const agentListingsQuery = useListingsByUser(agentId ?? "");

  const activeQuery = agentId ? agentListingsQuery : allListingsQuery;
  const { data: listings = [], isLoading, refetch } = activeQuery;

  // Search
  const [query, setQuery] = useState("");

  // Active filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTowns, setSelectedTowns] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE);

  // Draft filters (in sheet before apply)
  const [draftTypes, setDraftTypes] = useState<string[]>([]);
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftTowns, setDraftTowns] = useState<string[]>([]);
  const [draftPrice, setDraftPrice] = useState<[number, number]>(DEFAULT_PRICE);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // --- Helpers ---

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const formatPrice = useCallback(
    (value: number) => value.toLocaleString() + " FCFA",
    []
  );

  const hasPriceFilter =
    priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1];

  const activeFilterCount =
    selectedTypes.length +
    selectedCategories.length +
    selectedTowns.length +
    (hasPriceFilter ? 1 : 0);

  const hasAnyFilter = activeFilterCount > 0 || query.trim().length > 0;

  // --- Filtering ---

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing: Listing) => {
      // Text search — must match if query present
      if (q.length > 0) {
        const matchesText =
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          listing.location.toLowerCase().includes(q) ||
          listing.address.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(listing.type)) {
        return false;
      }

      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(listing.category)
      ) {
        return false;
      }

      // Town filter
      if (selectedTowns.length > 0) {
        const matchesTown = selectedTowns.some((town) =>
          listing.location.toLowerCase().includes(town.toLowerCase())
        );
        if (!matchesTown) return false;
      }

      // Price filter
      if (hasPriceFilter) {
        if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [listings, query, selectedTypes, selectedCategories, selectedTowns, priceRange, hasPriceFilter]);

  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  // --- Handlers ---

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearch = (text: string) => {
    setQuery(text);
    setVisibleCount(PAGE_SIZE);
  };

  const openSheet = () => {
    setDraftTypes(selectedTypes);
    setDraftCategories(selectedCategories);
    setDraftTowns(selectedTowns);
    setDraftPrice(priceRange);
    setSheetOpen(true);
  };

  const applyFilters = () => {
    setSelectedTypes(draftTypes);
    setSelectedCategories(draftCategories);
    setSelectedTowns(draftTowns);
    setPriceRange(draftPrice);
    setVisibleCount(PAGE_SIZE);
    setSheetOpen(false);
  };

  const resetFilters = () => {
    setDraftTypes([]);
    setDraftCategories([]);
    setDraftTowns([]);
    setDraftPrice(DEFAULT_PRICE);
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedTowns([]);
    setPriceRange(DEFAULT_PRICE);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  // Remove individual active filters
  const removeType = (id: string) => {
    setSelectedTypes((prev) => prev.filter((t) => t !== id));
    setVisibleCount(PAGE_SIZE);
  };
  const removeCategory = (id: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== id));
    setVisibleCount(PAGE_SIZE);
  };
  const removeTown = (town: string) => {
    setSelectedTowns((prev) => prev.filter((t) => t !== town));
    setVisibleCount(PAGE_SIZE);
  };
  const removePrice = () => {
    setPriceRange(DEFAULT_PRICE);
    setVisibleCount(PAGE_SIZE);
  };

  // --- Active filter pills ---

  const activeFilterPills: { key: string; label: string; onRemove: () => void }[] =
    [];

  selectedTypes.forEach((id) => {
    const opt = TYPE_OPTIONS.find((o) => o.id === id);
    if (opt)
      activeFilterPills.push({
        key: `type-${id}`,
        label: t(opt.labelKey),
        onRemove: () => removeType(id),
      });
  });
  selectedCategories.forEach((id) => {
    const opt = CATEGORY_OPTIONS.find((o) => o.id === id);
    if (opt)
      activeFilterPills.push({
        key: `cat-${id}`,
        label: opt.label,
        onRemove: () => removeCategory(id),
      });
  });
  selectedTowns.forEach((town) => {
    activeFilterPills.push({
      key: `town-${town}`,
      label: town,
      onRemove: () => removeTown(town),
    });
  });
  if (hasPriceFilter) {
    activeFilterPills.push({
      key: "price",
      label: `${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`,
      onRemove: removePrice,
    });
  }

  // --- Render ---

  const ListHeader = (
    <YStack gap="$3" pb="$3">
      {/* Active filter pills */}
      {activeFilterPills.length > 0 && (
        <XStack gap="$2" flexWrap="wrap">
          {activeFilterPills.map((pill) => (
            <ActivePill
              key={pill.key}
              label={pill.label}
              onRemove={pill.onRemove}
            />
          ))}
          <Pressable onPress={clearAllFilters}>
            <View px="$2.5" py="$1" rounded="$10">
              <Text fontSize="$2" fontWeight="600" color="$red9">
                {t("filter.reset")}
              </Text>
            </View>
          </Pressable>
        </XStack>
      )}

      {/* Results count */}
      {hasAnyFilter && (
        <Text fontSize="$3" color="$color8">
          {t("search.resultsCount", { count: filteredListings.length })}
        </Text>
      )}
    </YStack>
  );

  const EmptyComponent = (
    <YStack items="center" py="$10" gap="$3">
      <SearchX size={48} color="$color8" />
      <Text fontSize="$5" fontWeight="600" color="$color">
        {t("search.noResults")}
      </Text>
      <Text color="$color8" fontSize="$3" text="center" px="$6">
        {t("search.noResultsHint")}
      </Text>
    </YStack>
  );

  return (
    <>
      <YStack flex={1} bg="$background">
        {/* Header */}
        <YStack
          pt={insets.top + 8}
          pb="$3"
          px="$4"
          gap="$3"
          bg="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          {agentId ? (
            <XStack items="center" gap="$3">
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <ChevronLeft size={24} color="$color" />
              </Pressable>
              <YStack flex={1}>
                <Text fontSize="$6" fontWeight="700">
                  {agentName ?? t("search.title")}
                </Text>
                <Text fontSize="$2" color="$color10">
                  {listings.length} {listings.length === 1 ? "listing" : "listings"}
                </Text>
              </YStack>
            </XStack>
          ) : (
            <Text fontSize="$6" fontWeight="700">
              {t("search.title")}
            </Text>
          )}

          {/* Search bar + filter button */}
          <XStack
            bg="$color3"
            items="center"
            rounded="$6"
            px="$3"
            gap="$2"
          >
            <Search size={18} color="$color8" />
            <Input
              flex={1}
              size="$3"
              placeholder={t("search.placeholder")}
              value={query}
              onChangeText={handleSearch}
              bg="transparent"
              borderWidth={0}
              py="$2"
            />
            <Pressable onPress={openSheet} accessibilityRole="button" accessibilityLabel={t("filter.title")}>
              <View
                width={36}
                height={36}
                rounded={10}
                bg={activeFilterCount > 0 ? "$blue9" : "$color4"}
                items="center"
                justify="center"
                position="relative"
              >
                <SlidersHorizontal
                  size={18}
                  color={activeFilterCount > 0 ? "white" : "$color"}
                />
                {activeFilterCount > 0 && (
                  <View
                    position="absolute"
                    t={-4}
                    r={-4}
                    width={18}
                    height={18}
                    rounded={9}
                    bg="$red9"
                    items="center"
                    justify="center"
                  >
                    <Text fontSize={10} fontWeight="700" color="white">
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          </XStack>

          {/* Category quick-filter */}
          <FlatList
            horizontal
            data={CATEGORY_OPTIONS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selected={selectedCategories.includes(item.id)}
                onPress={() => {
                  setSelectedCategories((prev) => toggleItem(prev, item.id));
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            )}
          />
        </YStack>

        {/* Results */}
        {isLoading ? (
          <YStack flex={1} items="center" justify="center">
            <Spinner size="large" color="$blue9" />
          </YStack>
        ) : (
          <FlatList
            data={visibleListings}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 40,
            }}
            ItemSeparatorComponent={() => <View height={12} />}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={EmptyComponent}
            renderItem={({ item }) => <ListingCardCompact item={item} />}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={
              hasMore ? (
                <YStack items="center" pt="$4">
                  <Button
                    size="$4"
                    variant="outlined"
                    rounded="$4"
                    onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    <Button.Text fontWeight="600">
                      Load more ({filteredListings.length - visibleCount}{" "}
                      remaining)
                    </Button.Text>
                  </Button>
                </YStack>
              ) : null
            }
          />
        )}
      </YStack>

      {/* Filter bottom sheet */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[75]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay
          bg="rgba(0,0,0,0.5)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle bg="$borderColor" />
        <Sheet.Frame bg="$background" rounded="$6">
          <Sheet.ScrollView showsVerticalScrollIndicator={false}>
            <YStack p="$4" gap="$5" pb="$8">
              {/* Header */}
              <XStack items="center" justify="space-between">
                <Text fontSize="$6" fontWeight="700">
                  {t("filter.title")}
                </Text>
                <Pressable onPress={() => setSheetOpen(false)}>
                  <View
                    width={32}
                    height={32}
                    rounded={16}
                    bg="$color3"
                    items="center"
                    justify="center"
                  >
                    <X size={18} color="$color" />
                  </View>
                </Pressable>
              </XStack>

              {/* Type */}
              <FilterSection title={t("filter.type")}>
                <XStack gap="$2" flexWrap="wrap">
                  {TYPE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={t(opt.labelKey)}
                      selected={draftTypes.includes(opt.id)}
                      onPress={() =>
                        setDraftTypes((prev) => toggleItem(prev, opt.id))
                      }
                    />
                  ))}
                </XStack>
              </FilterSection>

              <Separator borderColor="$borderColor" />

              {/* Category */}
              <FilterSection title={t("filter.category")}>
                <XStack gap="$2" flexWrap="wrap">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      selected={draftCategories.includes(opt.id)}
                      onPress={() =>
                        setDraftCategories((prev) => toggleItem(prev, opt.id))
                      }
                    />
                  ))}
                </XStack>
              </FilterSection>

              <Separator borderColor="$borderColor" />

              {/* Town/City */}
              <FilterSection title={t("filter.townCity")}>
                <XStack gap="$2" flexWrap="wrap">
                  {TOWN_OPTIONS.map((town) => (
                    <Chip
                      key={town}
                      label={town}
                      selected={draftTowns.includes(town)}
                      onPress={() =>
                        setDraftTowns((prev) => toggleItem(prev, town))
                      }
                    />
                  ))}
                </XStack>
              </FilterSection>

              <Separator borderColor="$borderColor" />

              {/* Price Range */}
              <FilterSection title={t("filter.priceRange")}>
                <XStack items="center" justify="space-between">
                  <Text fontSize="$3" color="$color8">
                    {formatPrice(draftPrice[0])}
                  </Text>
                  <Text fontSize="$3" color="$color8">
                    {formatPrice(draftPrice[1])}
                  </Text>
                </XStack>
                <Slider
                  value={draftPrice}
                  min={0}
                  max={1_000_000}
                  step={PRICE_STEP}
                  minStepsBetweenThumbs={1}
                  onValueChange={(next) => setDraftPrice([next[0], next[1]])}
                >
                  <Slider.Track bg="$borderColor" height={3}>
                    <Slider.TrackActive bg="$blue8" />
                  </Slider.Track>
                  <Slider.Thumb
                    index={0}
                    circular
                    size="$1.5"
                    bg="$background"
                    borderWidth={2}
                    borderColor="$blue8"
                    elevation="$1"
                  />
                  <Slider.Thumb
                    index={1}
                    circular
                    size="$1.5"
                    bg="$background"
                    borderWidth={2}
                    borderColor="$blue8"
                    elevation="$1"
                  />
                </Slider>
              </FilterSection>

              {/* Action buttons */}
              <XStack gap="$3" mt="$2">
                <Button
                  flex={1}
                  size="$5"
                  bg="$color3"
                  rounded="$4"
                  onPress={resetFilters}
                >
                  <Button.Text fontWeight="600" color="$color">
                    {t("filter.reset")}
                  </Button.Text>
                </Button>
                <Button
                  flex={1}
                  size="$5"
                  bg="$blue9"
                  rounded="$4"
                  onPress={applyFilters}
                >
                  <Button.Text fontWeight="600" color="white">
                    {t("filter.apply")}
                  </Button.Text>
                </Button>
              </XStack>
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
