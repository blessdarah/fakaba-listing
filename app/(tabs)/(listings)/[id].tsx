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
} from "tamagui";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Map as MapIcon,
  BedDouble,
  Bath,
  Ruler,
} from "@tamagui/lucide-icons";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useListing } from "lib/query/useListings";
import { useToggleFavorite } from "lib/query/useFavorites";
import { formatRelativeTime } from "lib/utils";

const { width } = Dimensions.get("window");

const ListingDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeIndex, setActiveIndex] = useState(0);

  // Use TanStack Query hooks
  const { data: listing, isLoading } = useListing(id as string);
  const { toggleFavorite, isFavorited } = useToggleFavorite();

  const liked = isFavorited(id as string);
  const pricing = listing
    ? listing.type === "rent"
      ? listing.price / 1000 + "k/month"
      : listing.price / 1000 + "k"
    : "";

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  async function sendWhatsAppMessage() {
    // Deep link to the app first then fallback to web
    // with a default message
    const message = "Hello from Expo";
    // Linking.openURL(`whatsapp://send?phone=+237672374414&text=${message}`);
    const tel = "+237672374414";
    const url = `whatsapp://send?phone=${tel}&text=${encodeURIComponent(message || "")}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp Not Installed",
          "Please install WhatsApp to continue",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Install",
              onPress: () => {
                const storeUrl =
                  Platform.OS === "ios"
                    ? "https://apps.apple.com/app/whatsapp-messenger/id310633997"
                    : "https://play.google.com/store/apps/details?id=com.whatsapp";
                Linking.openURL(storeUrl);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open WhatsApp");
    }
  }

  const handleToggleFavorite = () => {
    if (!id) return;
    toggleFavorite(id as string);
  };

  if (isLoading || !listing) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View flex={1} justify="center" items="center">
          <Text>Loading...</Text>
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
        bg="white"
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
              <Image
                key={index}
                src={img}
                style={{ width: width, height: 300 }}
              />
            ))}
          </ScrollView>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "100%",
              backgroundColor:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          <XStack
            position="absolute"
            t={20}
            l={20}
            r={20}
            justify="flex-end"
            items="flex-start"
          >
            <Button
              size="$3"
              circular
              icon={
                <Heart
                  size={24}
                  color={liked ? "red" : "white"}
                  fill={liked ? "red" : "transparent"}
                />
              }
              chromeless
              unstyled
              onPress={handleToggleFavorite}
            />
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
              <Text fontSize="$7" fontWeight="bold" color="black">
                {pricing}
              </Text>
              <Button
                size="$3"
                icon={<MapIcon size={16} color="#D4A017" />}
                borderColor="#eee"
                borderWidth={1}
                bg="white"
              >
                Map view
              </Button>
            </XStack>
            <Text fontSize="$3" color="gray">
              Posted:{" "}
              {listing?.updatedAt
                ? formatRelativeTime(listing.updatedAt.toDate())
                : ""}
            </Text>

            <XStack gap="$3" mt="$2">
              <View
                borderWidth={1}
                borderColor="#eee"
                rounded="$4"
                px="$3"
                py="$2"
              >
                <Text color="gray">{listing?.location}</Text>
              </View>
              <XStack
                borderWidth={1}
                borderColor="#eee"
                rounded="$4"
                px="$3"
                py="$2"
                gap="$1"
                items="center"
              >
                <Text color="#D4A017">★</Text>
                <Text fontWeight="600">{4.5}</Text>
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
                  <Paragraph>{fac}</Paragraph>
                </XStack>
              ))}
            </YStack>

            <Text color="gray" lineHeight={24} fontSize="$3">
              {listing?.description}
            </Text>
          </YStack>

          <View height={1} bg="#f0f0f0" />

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
                          : undefined)
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

          {/* Similar Listings */}
          {/*   <YStack gap="$3" mt="$4"> */}
          {/*     <Text fontSize="$5" fontWeight="600"> */}
          {/*       Similar listings */}
          {/*     </Text> */}
          {/*     <HorizontalListing */}
          {/*       title="" */}
          {/*     /> */}
          {/*   </YStack> */}
        </YStack>
      </ScrollView>
    </>
  );
};

export default ListingDetailsScreen;
