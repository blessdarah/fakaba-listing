import { View, Text, YStack, XStack, Image, Card, Button } from "tamagui";
import { Heart } from "@tamagui/lucide-icons-2";
import { Link } from "expo-router";
import { Listing } from "lib/types";
import { useToggleFavorite } from "lib/query/useFavorites";
import { formatRelativeTime } from "lib/utils";
import { useRef } from "react";
import { Animated } from "react-native";

type ListingCardProps = {
  item: Listing;
};

const ListingCard = ({ item }: ListingCardProps) => {
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

  return (
    <Link href={`/(listings)/${item.id}`} asChild>
      <Card
        size="$3"
        scale={0.9}
        borderWidth={1}
        borderColor={"$borderColor"}
        rounded="$6"
        p={3}
      >
        <Card.Header mb="$2" p="$2">
          <View style={{ borderRadius: 10, overflow: "hidden" }}>
            <Image
              src={
                item.imageUrls[0] ??
                "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
              }
              width="auto"
              height={200}
            />
            {/* Dark Overlay for better text readability */}
            <View
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            />

            <YStack
              style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}
            >
              {item.type === "rent" ? (
                <Text fontSize="$5" fontWeight="bold" color="white">
                  {Math.round(item.price / 1000)}k/Monthly
                </Text>
              ) : (
                <Text fontSize="$5" fontWeight="bold" color="white">
                  {Math.round(item.price / 1000)}k
                </Text>
              )}
              <Text fontSize="$3" color="#e4e4e7">
                {item.address}, {item.location}
              </Text>
            </YStack>

            <XStack
              style={{ position: "absolute", top: 12, right: 2, zIndex: 10 }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Button
                  size="$3"
                  circular
                  icon={
                    <Heart
                      size={20}
                      color={liked ? "red" : "white"}
                      fill={liked ? "red" : "transparent"}
                    />
                  }
                  chromeless
                  unstyled
                  onPress={handleToggleFavorite}
                />
              </Animated.View>
            </XStack>
          </View>
        </Card.Header>

        <Card.Footer bg="transparent" px="$2.5" py="$1.5">
          <YStack gap="$1">
            <Text fontSize="$5" fontWeight="bold">
              {item.title}
            </Text>
            <Text fontSize="$2" color="gray">
              {formatRelativeTime(item.createdAt.toDate())}
            </Text>
          </YStack>
        </Card.Footer>
      </Card>
    </Link>
  );
};

export default ListingCard;
