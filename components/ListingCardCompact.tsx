import { View, Text, YStack, XStack, Image } from "tamagui";
import { Heart, MapPin, BedDouble, Bath, Ruler } from "@tamagui/lucide-icons-2";
import { Link } from "expo-router";
import type { Listing } from "lib/types";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useRef } from "react";
import { Animated, Pressable } from "react-native";

type ListingCardCompactProps = {
  item: Listing;
};

const ListingCardCompact = ({ item }: ListingCardCompactProps) => {
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  const liked = isFavorited(item.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggleFavorite = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id);

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

  const priceLabel =
    item.type === "rent"
      ? `${Math.round(item.price / 1000)}k/mo`
      : `${Math.round(item.price / 1000)}k`;

  return (
    <Link href={`/(listings)/${item.id}`} asChild>
      <Pressable>
        <XStack
          bg="$background"
          borderWidth={1}
          borderColor="$borderColor"
          rounded="$5"
          overflow="hidden"
        >
          {/* Thumbnail */}
          <View width={110} height={110} position="relative">
            <Image
              src={
                item.imageUrls[0] ??
                "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=200&h=200&dpr=2&q=80"
              }
              width={110}
              height={110}
            />
            {/* Type badge */}
            <View
              position="absolute"
              t={6}
              l={6}
              bg="rgba(0,0,0,0.6)"
              px="$1.5"
              py="$0.5"
              rounded="$2"
            >
              <Text fontSize={10} fontWeight="700" color="white" textTransform="uppercase">
                {item.type}
              </Text>
            </View>
          </View>

          {/* Details */}
          <YStack flex={1} p="$2.5" justify="space-between">
            {/* Top row: price + favorite */}
            <XStack items="center" justify="space-between">
              <Text fontSize="$5" fontWeight="700" color="$color">
                {priceLabel}
              </Text>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable onPress={handleToggleFavorite} hitSlop={8}>
                  <Heart
                    size={18}
                    color={liked ? "red" : "$color10"}
                    fill={liked ? "red" : "transparent"}
                  />
                </Pressable>
              </Animated.View>
            </XStack>

            {/* Title */}
            <Text
              fontSize="$3"
              fontWeight="600"
              color="$color"
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {/* Location */}
            <XStack gap="$1" items="center">
              <MapPin size={12} color="$color10" />
              <Text fontSize="$2" color="$color10" numberOfLines={1} flex={1}>
                {item.address}, {item.location}
              </Text>
            </XStack>

            {/* Stats row */}
            <XStack gap="$3" items="center">
              {item.bedrooms > 0 && (
                <XStack gap="$1" items="center">
                  <BedDouble size={12} color="$color10" />
                  <Text fontSize="$2" color="$color10">
                    {item.bedrooms}
                  </Text>
                </XStack>
              )}
              {item.bathrooms > 0 && (
                <XStack gap="$1" items="center">
                  <Bath size={12} color="$color10" />
                  <Text fontSize="$2" color="$color10">
                    {item.bathrooms}
                  </Text>
                </XStack>
              )}
              {item.size > 0 && (
                <XStack gap="$1" items="center">
                  <Ruler size={12} color="$color10" />
                  <Text fontSize="$2" color="$color10">
                    {item.size} m²
                  </Text>
                </XStack>
              )}
              <View flex={1} />
              <Text fontSize="$1" color="$color10">
                {item.category}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </Pressable>
    </Link>
  );
};

export default ListingCardCompact;
