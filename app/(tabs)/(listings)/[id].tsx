import {
  View,
  Text,
  ScrollView,
  YStack,
  XStack,
  Image,
  Button,
  Avatar,
  Paragraph,
  Circle,
  Separator,
  Spinner,
} from "tamagui";
import ListingCard from "components/ListingCard";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Map as MapIcon,
  BedDouble,
  Bath,
  Ruler,
  EyeOff,
  Eye,
  Trash2,
} from "@tamagui/lucide-icons-2";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  Alert,
  Share,
} from "react-native";
import { useListing, useListings, useUpdateListingStatus, useDeleteListing } from "lib/query/useListings";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import { formatRelativeTime } from "lib/utils";
import { useRouter } from "expo-router";
import { useToastController } from "@tamagui/toast";

const { width } = Dimensions.get("window");

const DEFAULT_AGENT_AVATAR =
  "https://www.gravatar.com/avatar/?d=mp&s=200";

const ListingDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeIndex, setActiveIndex] = useState(0);

  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToastController();

  // Use TanStack Query hooks
  const { data: listing, isLoading } = useListing(id);
  const { data: allListings = [] } = useListings();
  const { toggleFavorite, isFavorited } = useToggleFavorite();

  const isOwner = !!user && !!listing && listing.ownerId === user.uid;
  const userId = user?.uid ?? "";
  const updateStatusMutation = useUpdateListingStatus(userId);
  const deleteListingMutation = useDeleteListing(userId);

  const liked = isFavorited(id as string);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pricing = listing
    ? listing.type === "rent"
      ? listing.price / 1000 + "k/month"
      : listing.price / 1000 + "k"
    : "";

  const similarListings = allListings
    .filter((item) => item.id !== listing?.id)
    .filter((item) =>
      listing
        ? item.category === listing.category || item.type === listing.type
        : false
    )
    .slice(0, 10);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  async function sendWhatsAppMessage() {
    if (!listing) return;

    const ownerName = listing.owner?.firstName ?? "there";
    const message =
      `Hi ${ownerName}, I found your listing "${listing.title}" ` +
      `in ${listing.location} on Fakaba and I'm interested. ` +
      `Is the ${listing.type === "rent" ? "rental" : "property"} ` +
      `at ${pricing} FCFA still available? I'd love to know more details.`;

    const tel = "237672374414"; // TODO: use owner phone when available
    const encoded = encodeURIComponent(message);
    const deepLink = `whatsapp://send?phone=${tel}&text=${encoded}`;

    try {
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
        return;
      }

      await Linking.openURL(`https://wa.me/${tel}?text=${encoded}`);
    } catch {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  }

  async function handleShareListing() {
    if (!listing) return;

    const typeLabel = listing.type === "rent" ? "Rental" : "For Sale";
    const message =
      `Check out this listing on Fakaba!\n\n` +
      `${listing.title}\n` +
      `${typeLabel} — ${pricing} FCFA\n` +
      `${listing.address}, ${listing.location}\n` +
      `${listing.bedrooms} beds · ${listing.bathrooms} baths · ${listing.size} m²`;

    try {
      await Share.share({ message });
    } catch {
      // User cancelled or share failed — no action needed
    }
  }

  const handleToggleFavorite = () => {
    if (!id) return;
    toggleFavorite(id as string);

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 50,
        bounciness: 12,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
    ]).start();
  };

  if (isLoading || !listing) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View flex={1} justify="center" items="center" bg="$background">
          <Spinner size="large" color="$blue8" />
          <Text mt="$3" color="$color">
            Loading...
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: listing?.title }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        flex={1}
        bg="$background"
        contentContainerStyle={{ pb: 50 }}
      >
        {/* Hero Carousel */}
        <View height={300} width="100%" position="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {listing?.imageUrls.map((img: string, index: number) => (
              <Image key={index} src={img} width={width} height={300} />
            ))}
          </ScrollView>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              inset: 0,
              height: "100%",
              backgroundColor:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          <XStack
            position="absolute"
            t={60}
            l={20}
            r={20}
            justify="flex-end"
            items="flex-start"
            gap="$2"
          >
            <Button
              borderWidth={1}
              bg="$background"
              borderColor="$borderColor"
              size="$4"
              circular
              icon={<Share2 size={22} color="$color" />}
              onPress={handleShareListing}
            />
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Button
                borderWidth={1}
                bg="$background"
                borderColor="$borderColor"
                size="$4"
                circular
                icon={
                  <Heart
                    size={24}
                    color={liked ? "red" : "white"}
                    fill={liked ? "red" : "transparent"}
                  />
                }
                onPress={handleToggleFavorite}
              />
            </Animated.View>
          </XStack>

          {/* Bottom Overlay: Pagination Dots */}
          <XStack
            position="absolute"
            b={20}
            l={0}
            r={0}
            justify="center"
            gap="$2"
          >
            {listing?.imageUrls.map((_: any, index: number) => (
              <View
                key={index}
                width={8}
                height={8}
                rounded={4}
                bg={index === activeIndex ? "white" : "rgba(255,255,255,0.5)"}
              />
            ))}
          </XStack>
        </View>

        <YStack px="$4" pt="$4" gap="$5">
          {/* Price & Map Button */}
          <YStack gap="$1">
            <XStack justify="space-between" items="center">
              <Text fontSize="$7" fontWeight="bold" color="$color">
                {pricing}
              </Text>
              <Button
                size="$3"
                icon={<MapIcon size={16} color="#D4A017" />}
                borderColor="$borderColor"
                borderWidth={1}
              >
                <Button.Text>Map view</Button.Text>
              </Button>
            </XStack>
            <Text fontSize="$3" color="$white8">
              Posted:{" "}
              {listing?.updatedAt
                ? formatRelativeTime(listing.updatedAt.toDate())
                : ""}
            </Text>

            <XStack gap="$3" mt="$2">
              <View
                borderWidth={1}
                borderColor="gray"
                rounded="$4"
                px="$3"
                py="$2"
              >
                <Text color="gray">{listing?.location}</Text>
              </View>
              <XStack
                borderWidth={1}
                borderColor="gray"
                rounded="$4"
                px="$3"
                py="$2"
                gap="$1"
                items="center"
              >
                <Text color="#D4A017">★</Text>
                <Text fontWeight="600" color="gray">
                  {4.5}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <Separator my={1} />

          {/* Property Details */}
          <XStack gap="$4" justify="space-around">
            <XStack items="center" gap="$2">
              <BedDouble size={20} color="gray" />
              <Text fontSize="$4" color="gray">
                {listing?.bedrooms || 0} Beds
              </Text>
            </XStack>
            <XStack items="center" gap="$2">
              <Bath size={20} color="gray" />
              <Text fontSize="$4" color="gray">
                {listing?.bathrooms || 0} Baths
              </Text>
            </XStack>
            <XStack items="center" gap="$2">
              <Ruler size={20} color="gray" />
              <Text fontSize="$4" color="gray">
                {listing?.size || 0} m²
              </Text>
            </XStack>
          </XStack>

          <Separator my={1} />

          {/* Facilities */}
          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="600">
              Facilities
            </Text>

            <YStack gap="$0">
              {listing?.features.map((fac: any, index: number) => (
                <XStack items="center" gap="$2" key={`fac-${index}`}>
                  <Circle size={8} bg="$blue8" />
                  <Paragraph color="$color">{fac}</Paragraph>
                </XStack>
              ))}
            </YStack>

            <Text color="gray" lineHeight={24} fontSize="$3">
              {listing?.description}
            </Text>
          </YStack>

          <Separator />

          {/* Posted by */}
          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="600">
              Posted by
            </Text>
            <XStack justify="space-between" items="center">
              <XStack gap="$3" items="center">
                <Link href="/agents" asChild>
                  <Avatar
                    circular
                    size="$5"
                    borderWidth={2}
                    borderColor="#D4A017"
                  >
                    <Avatar.Image
                      src={
                        listing?.owner?.profileImage ||
                        (Array.isArray(listing?.owner?.imageUrls) &&
                        listing.owner.imageUrls.length > 0
                          ? listing.owner.imageUrls[0]
                          : DEFAULT_AGENT_AVATAR)
                      }
                    />
                    <Avatar.Fallback bg="gray" />
                  </Avatar>
                </Link>
                <YStack>
                  <Text fontSize="$4" fontWeight="600">
                    {`${listing?.owner?.firstName ?? "Agent"}`}
                  </Text>
                  <Text fontSize="$3" color="gray">
                    {listing?.owner?.location || "Location not available"}
                  </Text>
                </YStack>
              </XStack>
              <Button
                onPress={sendWhatsAppMessage}
                bg="#4CAF50"
                rounded="$10"
                icon={<MessageCircle size={18} />}
                px="$4"
              >
                WhatsApp
              </Button>
            </XStack>
          </YStack>

          {/* Owner Management */}
          {isOwner && (
            <>
              <Separator />
              <YStack gap="$3">
                <Text fontSize="$5" fontWeight="600">
                  {t("myListings.title")}
                </Text>
                <XStack gap="$3">
                  <Button
                    flex={1}
                    size="$4"
                    bg={listing.status === "active" ? "$color3" : "$blue3"}
                    rounded="$4"
                    icon={
                      listing.status === "active" ? (
                        <EyeOff size={16} color="$color" />
                      ) : (
                        <Eye size={16} color="$blue9" />
                      )
                    }
                    onPress={() => {
                      const newStatus =
                        listing.status === "active" ? "inactive" : "active";
                      updateStatusMutation.mutate(
                        { id: listing.id, status: newStatus },
                        {
                          onSuccess: () => {
                            toast.show(
                              newStatus === "active"
                                ? t("myListings.publishSuccess")
                                : t("myListings.unpublishSuccess")
                            );
                          },
                          onError: () => {
                            toast.show(t("common.error"), {
                              message: t("myListings.statusError"),
                            });
                          },
                        }
                      );
                    }}
                  >
                    <Button.Text
                      fontWeight="600"
                      color={
                        listing.status === "active" ? "$color" : "$blue9"
                      }
                    >
                      {listing.status === "active"
                        ? t("myListings.unpublish")
                        : t("myListings.publish")}
                    </Button.Text>
                  </Button>
                  <Button
                    flex={1}
                    size="$4"
                    bg="$red3"
                    rounded="$4"
                    icon={<Trash2 size={16} color="$red9" />}
                    onPress={() => {
                      Alert.alert(
                        t("myListings.deleteConfirmTitle"),
                        t("myListings.deleteConfirmMessage"),
                        [
                          { text: t("common.cancel"), style: "cancel" },
                          {
                            text: t("common.delete"),
                            style: "destructive",
                            onPress: () => {
                              deleteListingMutation.mutate(listing.id, {
                                onSuccess: () => {
                                  toast.show(t("myListings.deleteSuccess"));
                                  router.back();
                                },
                                onError: () => {
                                  toast.show(t("common.error"), {
                                    message: t("myListings.deleteError"),
                                  });
                                },
                              });
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Button.Text fontWeight="600" color="$red9">
                      {t("myListings.deleteListing")}
                    </Button.Text>
                  </Button>
                </XStack>
              </YStack>
            </>
          )}

          {/* Similar Listings */}
          {similarListings.length > 0 && (
            <YStack gap="$3" mt="$4">
              <Text fontSize="$5" fontWeight="600">
                Similar listings
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack>
                  {similarListings.map((item) => (
                    <View key={item.id} width={280} mr="$3">
                      <ListingCard item={item} />
                    </View>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </>
  );
};

export default ListingDetailsScreen;
