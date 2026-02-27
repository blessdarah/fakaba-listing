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
  H5,
  Separator,
  ScrollView,
  useTheme,
  AnimatePresence,
} from "tamagui";
import { Slider } from "@tamagui/slider";
import HomeCategories, { HOME_CATEGORIES } from "components/HomeCategories";
import HorizontalListing from "components/HorizontalListing";
import ListingCard from "components/ListingCard";
import { Sliders, MapPin, Check, ChevronRight } from "@tamagui/lucide-icons";
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

export default function TabOneScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const DEFAULT_TYPES = [];
  const DEFAULT_CATEGORIES = [];
  const DEFAULT_TOWNS = [];
  const DEFAULT_PRICE: [number, number] = [20000, 800000];

  const [selectedTypes, setSelectedTypes] =
    React.useState<string[]>(DEFAULT_TYPES);
  const [selectedCategories, setSelectedCategories] =
    React.useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedTowns, setSelectedTowns] =
    React.useState<string[]>(DEFAULT_TOWNS);
  const [draftTypes, setDraftTypes] = React.useState<string[]>(DEFAULT_TYPES);
  const [draftCategories, setDraftCategories] =
    React.useState<string[]>(DEFAULT_CATEGORIES);
  const [draftTowns, setDraftTowns] = React.useState<string[]>(DEFAULT_TOWNS);
  const [pickerOpen, setPickerOpen] = React.useState<
    "type" | "category" | "town" | null
  >(null);
  const [pickerQuery, setPickerQuery] = React.useState("");
  const [priceRange, setPriceRange] =
    React.useState<[number, number]>(DEFAULT_PRICE);
  const [draftPriceRange, setDraftPriceRange] =
    React.useState<[number, number]>(DEFAULT_PRICE);
  const theme = useTheme();
  const typeOptions = ["Rental", "Sale", "Lease"];
  const categoryOptions = HOME_CATEGORIES.map((cat) => cat.id);
  const townOptions = ["Yaounde", "Douala", "Buea", "Limbe"];
  const formatLabel = (value: string) =>
    HOME_CATEGORIES.find((cat) => cat.id === value)?.name ?? value;
  const toggleMulti = (
    list: string[],
    value: string,
    setter: (next: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null
  );
  const setCategoryFromHome = (id: string) => {
    setActiveCategoryId((prev) => (prev === id ? null : id));
    setSelectedCategories((prev) => (prev.includes(id) ? [] : [id]));
    setDraftCategories((prev) => (prev.includes(id) ? [] : [id]));
  };
  const hasActiveFilters =
    selectedTypes.join("|") !== DEFAULT_TYPES.join("|") ||
    selectedCategories.join("|") !== DEFAULT_CATEGORIES.join("|") ||
    selectedTowns.join("|") !== DEFAULT_TOWNS.join("|") ||
    priceRange[0] !== DEFAULT_PRICE[0] ||
    priceRange[1] !== DEFAULT_PRICE[1] ||
    activeCategoryId !== null ||
    searchQuery.trim().length > 0;
  const getPicker = () => {
    if (pickerOpen === "type") {
      return {
        title: "Type",
        options: typeOptions,
        selected: draftTypes,
        setSelected: setDraftTypes,
        format: (v: string) => v,
      };
    }
    if (pickerOpen === "category") {
      return {
        title: "Category",
        options: categoryOptions,
        selected: draftCategories,
        setSelected: setDraftCategories,
        format: formatLabel,
      };
    }
    if (pickerOpen === "town") {
      return {
        title: "Town/City",
        options: townOptions,
        selected: draftTowns,
        setSelected: setDraftTowns,
        format: (v: string) => v,
      };
    }
    return null;
  };
  const picker = getPicker();
  const filteredPickerOptions =
    picker?.options.filter((option) =>
      pickerQuery.trim().length === 0
        ? true
        : picker
            .format(option)
            .toLowerCase()
            .includes(pickerQuery.trim().toLowerCase())
    ) ?? [];
  const formatPrice = React.useCallback(
    (value: number) => value.toLocaleString(),
    []
  );

  const { data: agents = [] } = useAgents();
  const agentColumns: (typeof agents)[] = [];
  for (let i = 0; i < agents.length; i += 4) {
    agentColumns.push(agents.slice(i, i + 4));
  }

  // Use TanStack Query hooks
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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const typeMap: Record<string, string> = {
    Rental: "rent",
    Sale: "sale",
    Lease: "lease",
  };
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      normalizedSearch.length > 0 &&
      (listing.title.toLowerCase().includes(normalizedSearch) ||
        listing.description.toLowerCase().includes(normalizedSearch) ||
        listing.location.toLowerCase().includes(normalizedSearch));

    const matchesType =
      selectedTypes.length > 0 &&
      selectedTypes.map((t) => typeMap[t] ?? t).includes(listing.type);

    const matchesCategory =
      selectedCategories.length > 0 &&
      selectedCategories.includes(listing.category);

    const matchesTown =
      selectedTowns.length > 0 &&
      selectedTowns.some((town) =>
        listing.location.toLowerCase().includes(town.toLowerCase())
      );

    const hasPriceFilter =
      priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1];
    const matchesPrice =
      hasPriceFilter &&
      listing.price >= priceRange[0] &&
      listing.price <= priceRange[1];

    return (
      matchesSearch ||
      matchesType ||
      matchesCategory ||
      matchesTown ||
      matchesPrice
    );
  });

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <ScreenContainer>
          <XStack items="center" justify="space-between" width="100%">
            <YStack gap="$1.5">
              <Text fontSize="$7" fontWeight={"bold"} color="$color">
                {user?.isAnonymous || !user?.displayName
                  ? t("home.defaultGreeting")
                  : t("home.greeting", { name: user.displayName })}
              </Text>
              <Text color="$color" fontSize="$5">
                {t("home.welcomeBack")}
              </Text>
            </YStack>

            <Pressable
              onPress={() => router.push("/profile")}
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

          <XStack
            justify="space-between"
            items={"center"}
            width="100%"
            gap="$2"
            my="$3"
          >
            {/* <Search size="$1" color="$color" mr="$4" /> */}
            <View
              width="100%"
              items="center"
              flexDirection="row"
              justify="center"
              mb="$4"
              // bg="#ececec"
              borderColor="$borderColor"
              rounded={100}
              borderWidth={1}
            >
              <Input
                flex={1}
                size="$5"
                placeholder="Search property"
                bg="transparent"
                color="#333"
                borderWidth={0}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Button
                circular
                size="$4"
                mr="$1.5"
                bg={hasActiveFilters ? "$blue8" : "$background"}
                onPress={() => {
                  setDraftTypes(selectedTypes);
                  setDraftCategories(selectedCategories);
                  setDraftTowns(selectedTowns);
                  setDraftPriceRange(priceRange);
                  setPosition(0);
                  setOpen(true);
                }}
                icon={
                  <Sliders
                    size={18}
                    fontWeight={500}
                    color={hasActiveFilters ? "white" : "$color"}
                  />
                }
              ></Button>
            </View>
          </XStack>

          <View width="100%" items="center" justify="center" mb="$5">
            <HomeCategories
              activeId={activeCategoryId}
              onSelect={setCategoryFromHome}
            />
          </View>

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

          {hasActiveFilters && (
            <YStack gap="$3" mb="$4">
              <Text fontSize="$6" fontWeight="700" color="$color">
                Results
              </Text>
              <FlatList
                data={filteredListings}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => <ListingCard item={item} />}
              />
              {filteredListings.length === 0 && (
                <Text color="$color8">No listings match your filters.</Text>
              )}
            </YStack>
          )}

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
      {/* bottom sheet */}
      <Sheet
        open={open}
        disableRemoveScroll={open}
        modal={true}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setDraftTypes(selectedTypes);
            setDraftCategories(selectedCategories);
            setDraftTowns(selectedTowns);
            setDraftPriceRange(priceRange);
          }
          if (next) {
            setPosition(0);
          }
        }}
        snapPoints={[70, 45, 25, 0]}
        snapPointsMode={"percent"}
        dismissOnSnapToBottom
        zIndex={100_000}
        position={position}
        onPositionChange={setPosition}
        defaultPosition={0}
      >
        <Sheet.Overlay
          bg="rgba(0,0,0,0.6)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <XStack justify="center" py="$2">
          <Sheet.Handle bg="$borderColor" width={48} height={6} rounded={999} />
        </XStack>
        <Sheet.Frame>
          <Sheet.ScrollView p="$4">
            <YStack gap="$4" pb="$10">
              <XStack items="center" justify="space-between">
                <H5>Filters</H5>
                <Button
                  size="$3"
                  circular
                  bg="$background"
                  onPress={() => setOpen(false)}
                >
                  <Button.Text fontWeight="600">×</Button.Text>
                </Button>
              </XStack>

              <YStack
                bg="$background"
                rounded="$6"
                p="$4"
                gap="$4"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <YStack gap="$2">
                  <XStack items="center" justify="space-between">
                    <Text color="$color" fontSize="$4">
                      Type
                    </Text>
                    <Pressable onPress={() => setPickerOpen("type")}>
                      <XStack items="center" gap="$2">
                        <Text fontSize="$3" color="$color8">
                          Select
                        </Text>
                        <ChevronRight size={18} color={"$color"} />
                      </XStack>
                    </Pressable>
                  </XStack>
                  {draftTypes.length > 0 && (
                    <XStack flexWrap="wrap" gap="$2" mt="$1">
                      {draftTypes.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() =>
                            toggleMulti(draftTypes, item, setDraftTypes)
                          }
                        >
                          <View
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 14,
                              backgroundColor: theme.blue8.val,
                            }}
                          >
                            <Text fontSize="$2" color="white">
                              {item}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </XStack>
                  )}
                </YStack>

                <Separator />

                <YStack gap="$2">
                  <XStack items="center" justify="space-between">
                    <Text color="$color" fontSize="$4">
                      Category
                    </Text>
                    <Pressable onPress={() => setPickerOpen("category")}>
                      <XStack items="center" gap="$2">
                        <Text fontSize="$3" color="$color8">
                          Select
                        </Text>
                        <ChevronRight size={18} color={"$color"} />
                      </XStack>
                    </Pressable>
                  </XStack>
                  {draftCategories.length > 0 && (
                    <XStack flexWrap="wrap" gap="$2" mt="$1">
                      {draftCategories.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() =>
                            toggleMulti(
                              draftCategories,
                              item,
                              setDraftCategories
                            )
                          }
                        >
                          <View
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 14,
                              backgroundColor: theme.blue8.val,
                            }}
                          >
                            <Text fontSize="$2" color="white">
                              {formatLabel(item)}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </XStack>
                  )}
                </YStack>

                <Separator />

                <YStack gap="$2">
                  <XStack items="center" justify="space-between">
                    <Text color="$color" fontSize="$4">
                      Town/City
                    </Text>
                    <Pressable onPress={() => setPickerOpen("town")}>
                      <XStack items="center" gap="$2">
                        <Text fontSize="$3" color="$color8">
                          Select
                        </Text>
                        <ChevronRight size={18} color={"$color"} />
                      </XStack>
                    </Pressable>
                  </XStack>
                  {draftTowns.length > 0 && (
                    <XStack flexWrap="wrap" gap="$2" mt="$1">
                      {draftTowns.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() =>
                            toggleMulti(draftTowns, item, setDraftTowns)
                          }
                        >
                          <View
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 14,
                              backgroundColor: theme.blue8.val,
                            }}
                          >
                            <Text fontSize="$2" color="white">
                              {item}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </XStack>
                  )}
                </YStack>
              </YStack>

              <YStack
                bg="$background"
                rounded="$6"
                p="$5"
                gap="$4"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text color="$color" fontSize="$4">
                  Price
                </Text>
                <XStack items="center" gap="$4">
                  <View
                    flex={1}
                    px="$4"
                    py="$3"
                    bg="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    rounded="$4"
                  >
                    <Text fontWeight="600">
                      {formatPrice(draftPriceRange[0])}
                    </Text>
                  </View>
                  <Text color="$color8">-</Text>
                  <View
                    flex={1}
                    px="$4"
                    py="$3"
                    bg="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    rounded="$4"
                  >
                    <Text fontWeight="600">
                      {formatPrice(draftPriceRange[1])}
                    </Text>
                  </View>
                </XStack>
                <Slider
                  value={draftPriceRange}
                  min={0}
                  max={1000000}
                  step={5000}
                  minStepsBetweenThumbs={1}
                  onValueChange={(next) =>
                    setDraftPriceRange([next[0], next[1]])
                  }
                >
                  <Slider.Track bg="$borderColor" height={2}>
                    <Slider.TrackActive bg="$blue8" />
                  </Slider.Track>
                  <Slider.Thumb
                    index={0}
                    circular
                    size="$1"
                    bg="$background"
                    borderWidth={2}
                    borderColor="$blue8"
                  />
                  <Slider.Thumb
                    index={1}
                    circular
                    size="$1"
                    bg="$background"
                    borderWidth={2}
                    borderColor="$blue8"
                  />
                </Slider>
              </YStack>

              <XStack gap="$3" justify="space-between" mt="$2">
                <Button
                  flex={1}
                  size="$5"
                  bg="$background"
                  onPress={() => {
                    setDraftTypes(DEFAULT_TYPES);
                    setDraftCategories(DEFAULT_CATEGORIES);
                    setDraftTowns(DEFAULT_TOWNS);
                    setDraftPriceRange(DEFAULT_PRICE);
                    setSelectedTypes(DEFAULT_TYPES);
                    setSelectedCategories(DEFAULT_CATEGORIES);
                    setSelectedTowns(DEFAULT_TOWNS);
                    setPriceRange(DEFAULT_PRICE);
                    setActiveCategoryId(null);
                    setOpen(false);
                  }}
                >
                  <Button.Text fontWeight="600">Reset</Button.Text>
                </Button>
                <Button
                  flex={1}
                  size="$5"
                  bg="$blue8"
                  onPress={() => {
                    setSelectedTypes(draftTypes);
                    setSelectedCategories(draftCategories);
                    setSelectedTowns(draftTowns);
                    setPriceRange(draftPriceRange);
                    setOpen(false);
                  }}
                >
                  <Button.Text fontWeight="600" color="white">
                    Apply
                  </Button.Text>
                </Button>
              </XStack>
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>

      <Sheet
        open={pickerOpen !== null}
        modal
        onOpenChange={(next) => {
          if (!next) {
            setPickerOpen(null);
            setPickerQuery("");
          }
        }}
        snapPoints={[80, 50, 0]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        zIndex={100_001}
      >
        <Sheet.Overlay
          bg="rgba(0,0,0,0.6)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <XStack justify="center" py="$2">
          <Sheet.Handle bg="$borderColor" width={48} height={6} rounded={999} />
        </XStack>
        <Sheet.Frame>
          <Sheet.ScrollView p="$4">
            <YStack gap="$4" pb="$8">
              <XStack items="center" justify="space-between">
                <H5>{picker?.title ?? "Select"}</H5>
                <Button
                  size="$3"
                  circular
                  onPress={() => {
                    setPickerOpen(null);
                    setPickerQuery("");
                  }}
                >
                  <Button.Text fontWeight="600">×</Button.Text>
                </Button>
              </XStack>
              <Input
                size="$5"
                placeholder={`Search ${picker?.title ?? ""}`}
                value={pickerQuery}
                onChangeText={setPickerQuery}
                bg="$background"
                borderWidth={1}
                borderColor="$borderColor"
                placeholderTextColor="$color8"
              />
              <YStack gap="$2">
                {picker &&
                  filteredPickerOptions.map((option) => {
                    const selected = picker.selected.includes(option);
                    return (
                      <Pressable
                        key={option}
                        onPress={() =>
                          toggleMulti(
                            picker.selected,
                            option,
                            picker.setSelected
                          )
                        }
                      >
                        <XStack
                          items="center"
                          justify="space-between"
                          p="$3"
                          bg="$background"
                          rounded="$4"
                          borderWidth={1}
                          borderColor={
                            selected ? "$borderColorFocus" : "$borderColor"
                          }
                        >
                          <Text fontWeight="600">{picker.format(option)}</Text>
                          <AnimatePresence>
                            {selected ? (
                              <YStack
                                animation="quick"
                                enterStyle={{ opacity: 0, scale: 0.8 }}
                                exitStyle={{ opacity: 0, scale: 0.8 }}
                              >
                                <Check size={18} color={"$color"} />
                              </YStack>
                            ) : null}
                          </AnimatePresence>
                        </XStack>
                      </Pressable>
                    );
                  })}
              </YStack>
              <XStack gap="$3" justify="space-between" mt="$2">
                <Button
                  flex={1}
                  size="$5"
                  bg="$background"
                  onPress={() => {
                    setPickerOpen(null);
                    setPickerQuery("");
                  }}
                >
                  <Button.Text fontWeight="600">Done</Button.Text>
                </Button>
              </XStack>
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
