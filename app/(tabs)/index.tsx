import React from "react";
import {
  Sheet,
  Avatar,
  Text,
  View,
  XStack,
  YStack,
  Input,
  Button,
  Separator,
  ScrollView,
} from "tamagui";
import { Slider } from "@tamagui/slider";
import HomeCategories, { HOME_CATEGORIES } from "components/HomeCategories";
import HorizontalListing from "components/HorizontalListing";
import ListingCardCompact from "components/ListingCardCompact";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronRight,
  Plus,
} from "@tamagui/lucide-icons-2";
import ScreenContainer from "components/ScreenContainer";
import { useAuth } from "contexts/AuthContext";
import { FlatList, RefreshControl } from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "lib/i18n/useTranslation";
import { useListings } from "lib/query/useListings";
import { useFavorites } from "lib/query/useFavorites";
import { useAgents } from "lib/query/useUsers";
import { Link } from "expo-router";

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

// --- Chip (same as search screen) ---

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

export default function TabOneScreen() {
  const { user, isAgent } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Search + filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedTowns, setSelectedTowns] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>(DEFAULT_PRICE);

  // Draft filters (in sheet before apply)
  const [draftTypes, setDraftTypes] = React.useState<string[]>([]);
  const [draftCategories, setDraftCategories] = React.useState<string[]>([]);
  const [draftTowns, setDraftTowns] = React.useState<string[]>([]);
  const [draftPrice, setDraftPrice] = React.useState<[number, number]>(DEFAULT_PRICE);

  // Sheet + category state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);

  // --- Helpers ---

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const formatPrice = React.useCallback(
    (value: number) => value.toLocaleString() + " FCFA",
    []
  );

  const setCategoryFromHome = (id: string) => {
    setActiveCategoryId((prev) => (prev === id ? null : id));
    setSelectedCategories((prev) => (prev.includes(id) ? [] : [id]));
    setDraftCategories((prev) => (prev.includes(id) ? [] : [id]));
  };

  const hasPriceFilter =
    priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1];

  const activeFilterCount =
    selectedTypes.length +
    selectedCategories.length +
    selectedTowns.length +
    (hasPriceFilter ? 1 : 0);

  const hasActiveFilters =
    activeFilterCount > 0 ||
    activeCategoryId !== null ||
    searchQuery.trim().length > 0;

  // --- Sheet handlers ---

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
    setSheetOpen(false);
  };

  const resetFilters = () => {
    setDraftTypes([]);
    setDraftCategories([]);
    setDraftTowns([]);
    setDraftPrice(DEFAULT_PRICE);
  };

  // --- Data ---

  const { data: agents = [] } = useAgents();
  const agentColumns: (typeof agents)[] = [];
  for (let i = 0; i < agents.length; i += 4) {
    agentColumns.push(agents.slice(i, i + 4));
  }

  const {
    data: listings = [],
    isLoading: loading,
    error,
    refetch,
  } = useListings();
  const { refetch: refetchFavorites } = useFavorites();

  const handleRefresh = React.useCallback(() => {
    refetch();
    refetchFavorites();
  }, [refetch, refetchFavorites]);

  // --- Filtering (AND logic) ---

  const filteredListings = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((listing) => {
      if (q.length > 0) {
        const matchesText =
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          listing.location.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(listing.type)) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(listing.category)
      ) {
        return false;
      }

      if (selectedTowns.length > 0) {
        const matchesTown = selectedTowns.some((town) =>
          listing.location.toLowerCase().includes(town.toLowerCase())
        );
        if (!matchesTown) return false;
      }

      if (hasPriceFilter) {
        if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [listings, searchQuery, selectedTypes, selectedCategories, selectedTowns, priceRange, hasPriceFilter]);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <ScreenContainer>
          {/* Greeting + Avatar */}
          <XStack items="center" justify="space-between" width="100%">
            <YStack gap="$1.5">
              <Text fontSize="$7" fontWeight="bold" color="$color">
                {user?.isAnonymous || !user?.displayName
                  ? t("home.defaultGreeting")
                  : t("home.greeting", { name: user.displayName })}
              </Text>
              <Text color="$color" fontSize="$5">
                {t("home.welcomeBack")}
              </Text>
            </YStack>

            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              accessibilityRole="button"
              accessibilityLabel={t("profile.title")}
              hitSlop={10}
            >
              <Avatar
                circular
                size="$4.5"
                borderColor="$blue10"
                borderWidth={2}
              >
                <Avatar.Image
                  src={
                    user?.photoURL ||
                    "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                  }
                />
                <Avatar.Fallback delayMs={600} bg="$blue10" />
              </Avatar>
            </Pressable>
          </XStack>

          {/* Search bar + filter button */}
          <XStack
            bg="$color3"
            items="center"
            rounded="$6"
            px="$3"
            gap="$2"
            my="$3"
          >
            <Search size={18} color="$color8" />
            <Input
              flex={1}
              size="$3"
              placeholder={t("home.searchPlaceholder")}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
          <View width="100%" items="center" justify="center" mb="$5">
            <HomeCategories
              activeId={activeCategoryId}
              onSelect={setCategoryFromHome}
            />
          </View>

          {/* Default home content (no filters active) */}
          {!hasActiveFilters && (
            <>
              <View width="100%" items="center" justify="center" mb="$4">
                <HorizontalListing
                  title={t("home.popularRentals")}
                  listings={listings.filter((item) => item.type === "rent")}
                  filterType="rent"
                  loading={loading}
                  error={error?.message || null}
                />
              </View>

              <View width="100%" items="center" justify="center" mb="$4">
                <HorizontalListing
                  title={t("home.popularOnSale")}
                  listings={listings.filter((item) => item.type === "sale")}
                  filterType="sale"
                  loading={loading}
                  error={error?.message || null}
                />
              </View>
            </>
          )}

          {/* Filtered results */}
          {hasActiveFilters && (
            <YStack gap="$3" mb="$4">
              <XStack items="center" justify="space-between">
                <Text fontSize="$6" fontWeight="700" color="$color">
                  Results
                </Text>
                <Text fontSize="$3" color="$color8">
                  {filteredListings.length} found
                </Text>
              </XStack>
              <FlatList
                data={filteredListings}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => <ListingCardCompact item={item} />}
              />
              {filteredListings.length === 0 && (
                <Text color="$color8">No listings match your filters.</Text>
              )}
            </YStack>
          )}

          {/* Top agents */}
          <YStack gap="$3" mb="$4">
            <XStack justify="space-between" items="center">
              <Text fontSize="$6" fontWeight="700" color="$color">
                Top agents
              </Text>
              <Link href="/agents" asChild>
                <Text color="$blue8" fontWeight="600">
                  See all
                </Text>
              </Link>
            </XStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$3" pr="$2">
                {agentColumns.map((column, columnIndex) => (
                  <YStack key={`col-${columnIndex}`} gap="$3">
                    {column.map((agent) => (
                      <Link
                        key={agent.id}
                        href={{
                          pathname: "/agents/detail",
                          params: { id: agent.id },
                        }}
                        asChild
                      >
                        <XStack
                          gap="$3"
                          items="center"
                          bg="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                          rounded="$6"
                          p="$2.5"
                          width={260}
                        >
                          <Avatar
                            circular
                            size="$4.5"
                            borderColor="$yellow10"
                            borderWidth={2}
                          >
                            <Avatar.Image
                              src={
                                (agent as any).profileImage ||
                                (agent as any).photoURL ||
                                (agent as any).imageUrls?.[0] ||
                                "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                              }
                            />
                            <Avatar.Fallback delayMs={600} bg="$blue10" />
                          </Avatar>
                          <YStack flex={1} gap="$1">
                            <Text fontWeight="600">
                              {(agent as any).displayName ||
                                `${(agent as any).firstName ?? ""} ${(agent as any).lastName ?? ""}`.trim() ||
                                (agent as any).name ||
                                "Agent"}
                            </Text>
                            <XStack gap="$1" items="center">
                              <MapPin size={14} color="$color8" />
                              <Text color="$color8" fontSize="$2">
                                {(agent as any).location || "Location"}
                              </Text>
                            </XStack>
                          </YStack>
                          <ChevronRight size={18} color="$color8" />
                        </XStack>
                      </Link>
                    ))}
                  </YStack>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        </ScreenContainer>
      </ScrollView>

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
                  onPress={() => {
                    resetFilters();
                    setSelectedTypes([]);
                    setSelectedCategories([]);
                    setSelectedTowns([]);
                    setPriceRange(DEFAULT_PRICE);
                    setActiveCategoryId(null);
                    setSheetOpen(false);
                  }}
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

      {/* FAB — Create Listing (agents only) */}
      {isAgent && (
        <Pressable
          onPress={() => router.push("/create-listing")}
          accessibilityRole="button"
          accessibilityLabel="Create listing"
          style={{
            position: "absolute",
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#2563eb",
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Plus size={26} color="white" />
        </Pressable>
      )}
    </>
  );
}
