import React, { useState, useMemo } from "react";
import {
  YStack,
  XStack,
  Input,
  Text,
  View,
  Button,
  useTheme,
  Sheet,
  ScrollView,
  H5,
  Separator,
  AnimatePresence,
  Image,
} from "tamagui";
import { Slider } from "@tamagui/slider";
import { Search, Sliders, Check, ChevronRight } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { useListings } from "lib/query/useListings";
import { useTranslation } from "lib/i18n/useTranslation";
import { Listing } from "lib/types";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(0);
  const DEFAULT_TYPES: string[] = [];
  const DEFAULT_CATEGORIES: string[] = [];
  const DEFAULT_TOWNS: string[] = [];
  const DEFAULT_PRICE: [number, number] = [20000, 800000];
  const [selectedTypes, setSelectedTypes] =
    useState<string[]>(DEFAULT_TYPES);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedTowns, setSelectedTowns] =
    useState<string[]>(DEFAULT_TOWNS);
  const [draftTypes, setDraftTypes] = useState<string[]>(DEFAULT_TYPES);
  const [draftCategories, setDraftCategories] =
    useState<string[]>(DEFAULT_CATEGORIES);
  const [draftTowns, setDraftTowns] = useState<string[]>(DEFAULT_TOWNS);
  const [pickerOpen, setPickerOpen] = useState<
    "type" | "category" | "town" | null
  >(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE);
  const [draftPriceRange, setDraftPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: listings = [] } = useListings();

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return listings.filter((listing: Listing) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        listing.title.toLowerCase().includes(normalizedSearch) ||
        listing.description.toLowerCase().includes(normalizedSearch) ||
        listing.location.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(listing.category);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(listing.type);
      const matchesTown =
        selectedTowns.length === 0 || selectedTowns.includes(listing.location);
      const matchesPrice =
        typeof listing.price !== "number" ||
        (listing.price >= priceRange[0] && listing.price <= priceRange[1]);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesTown &&
        matchesPrice
      );
    });
  }, [
    listings,
    searchQuery,
    selectedCategories,
    selectedTypes,
    selectedTowns,
    priceRange,
  ]);

  const fallbackCoords = { latitude: 3.848, longitude: 11.502 };
  const mapCenter = useMemo(() => {
    const withCoords = filteredListings.find(
      (item: any) =>
        typeof item?.latitude === "number" && typeof item?.longitude === "number"
    ) as Listing | undefined;
    if (withCoords && typeof (withCoords as any).latitude === "number") {
      return {
        latitude: (withCoords as any).latitude,
        longitude: (withCoords as any).longitude,
      };
    }
    return fallbackCoords;
  }, [filteredListings]);

  const typeOptions = ["rent", "sale", "lease"];
  const categoryOptions = categories
    .filter((cat) => cat.id !== "all")
    .map((cat) => cat.id);
  const townOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        listings
          .map((listing) => listing.location)
          .filter((value) => typeof value === "string" && value.length > 0)
      )
    );
    return unique.length > 0
      ? unique
      : ["Yaounde", "Douala", "Buea", "Limbe"];
  }, [listings]);
  const formatLabel = (value: string) => {
    const match = categories.find((cat) => cat.id === value);
    return match ? t(match.translationKey) : value;
  };
  const formatType = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
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
  const getPicker = () => {
    if (pickerOpen === "type") {
      return {
        title: "Type",
        options: typeOptions,
        selected: draftTypes,
        setSelected: setDraftTypes,
        format: formatType,
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

  return (
    <View flex={1} bg="$background">
      <View flex={1} position="relative">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {filteredListings.map((listing: Listing, index: number) => {
            const latitude =
              typeof (listing as any)?.latitude === "number"
                ? (listing as any).latitude
                : fallbackCoords.latitude;
            const longitude =
              typeof (listing as any)?.longitude === "number"
                ? (listing as any).longitude
                : fallbackCoords.longitude;
            return (
              <Marker
                key={listing.id || `${listing.title}-${index}`}
                coordinate={{ latitude, longitude }}
                onPress={() => {
                  setSelectedListing(listing);
                  setSheetOpen(true);
                }}
              />
            );
          })}
        </MapView>

        <YStack position="absolute" t="$4" l="$4" r="$4" gap="$3">
          <YStack
            bg="$background"
            rounded="$6"
            p="$3"
            gap="$2"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize="$7" fontWeight="700">
              {t("common.search")}
            </Text>
            <XStack items="center" rounded={100} borderColor="$borderColor" borderWidth={1} px="$3">
              <Search size={20} color={theme.color8.val} style={{ marginRight: 8 }} />
              <Input
                flex={1}
                placeholder={t("home.searchPlaceholder")}
                bg="transparent"
                color={theme.color.val}
                borderWidth={0}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </XStack>
          </YStack>
        </YStack>

        <YStack position="absolute" b="$4" l="$4" r="$4">
          <XStack
            bg="$background"
            rounded="$6"
            p="$3"
            borderWidth={1}
            borderColor="$borderColor"
            items="center"
            justify="space-between"
          >
            <YStack>
              <Text fontWeight="700">
                {filteredListings.length} listing
                {filteredListings.length === 1 ? "" : "s"}
              </Text>
              <Text color="$color11">
                {filteredListings.length === 0
                  ? "Try another search or filter"
                  : "Tap a pin to preview"}
              </Text>
            </YStack>
            <Button
              size="$3"
              bg="$color10"
              color="white"
              iconAfter={<Sliders size={16} color="white" />}
              onPress={() => {
                setOpen(true);
                setPosition(0);
                setDraftTypes(selectedTypes);
                setDraftCategories(selectedCategories);
                setDraftTowns(selectedTowns);
                setDraftPriceRange(priceRange);
              }}
            >
              Filters
            </Button>
          </XStack>
        </YStack>
      </View>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[60, 40, 20, 0]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        zIndex={100_000}
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
            {selectedListing ? (
              <YStack gap="$4">
                <XStack gap="$3" items="center">
                  <View
                    width={96}
                    height={72}
                    rounded="$4"
                    overflow="hidden"
                    bg="$color2"
                  >
                    <Image
                      source={{ uri: selectedListing.imageUrls?.[0] }}
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                  </View>
                  <YStack flex={1} gap="$1">
                    <Text fontWeight="700" numberOfLines={1}>
                      {selectedListing.title}
                    </Text>
                    <Text color="$color11" numberOfLines={1}>
                      {selectedListing.location}
                    </Text>
                    <Text fontWeight="700">
                      {selectedListing.price.toLocaleString()}
                    </Text>
                  </YStack>
                </XStack>
                <Text color="$color11" numberOfLines={3}>
                  {selectedListing.description}
                </Text>
                <Button
                  bg="$blue9"
                  color="white"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(listings)/[id]",
                      params: { id: selectedListing.id },
                    })
                  }
                >
                  View Listing
                </Button>
              </YStack>
            ) : (
              <YStack justify="center" items="center" gap="$3" py="$10">
                <Text color="$color11">Tap a pin to view the listing</Text>
              </YStack>
            )}
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>

      <Sheet
        open={open}
        disableRemoveScroll={open}
        modal
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
        snapPointsMode="percent"
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
                              {formatType(item)}
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
    </View>
  );
}
