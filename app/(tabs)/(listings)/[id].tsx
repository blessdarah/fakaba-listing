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
  H5,
  Separator,
} from "tamagui";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { getListing } from "lib/firestore/listings";
import { Listing } from "lib/types";

const { width } = Dimensions.get("window");

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
};

const ListingDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [pricing, setPricing] = useState<string>("");

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  React.useEffect(() => {
    const loadListing = async (id: string) => {
      const listing = await getListing(id);
      console.log("listing detail: ", listing);
      setListing(listing);
      if (listing) {
        setPricing(
          listing.type === "rent"
            ? listing.price / 1000 + "k/month"
            : listing.price / 1000 + "k"
        );
      }
    };
    loadListing(id);
  }, []);

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
                source={{ uri: img }}
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
              onPress={() => setLiked(!liked)}
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
                color="gray"
                fontSize="$3"
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
          <XStack gap="$4" justifyContent="space-around">
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
                    <Avatar.Fallback backgroundColor="gray" />
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
                bg="#4CAF50"
                color="white"
                rounded="$10"
                icon={<MessageCircle size={18} />}
                px="$4"
              >
                Message
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
