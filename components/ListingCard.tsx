import { View, Text, YStack, XStack, Image, Card, Button } from "tamagui";
import { Heart } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Link } from "expo-router";

export type ListingItem = {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  time: string;
};

type ListingCardProps = {
  item: ListingItem;
};

const ListingCard = ({ item }: ListingCardProps) => {
  const [liked, setLiked] = useState(false);

  return (
    <Link href={`/listing/details/${item.id}`} asChild>
      <Card
        size="$3"
        bordered={false}
        animation="bouncy"
        scale={0.9}
        hoverStyle={{ scale: 0.925 }}
        pressStyle={{ scale: 0.875 }}
        borderRadius={16}
        // mb="$4"
        bg="transparent"
        p={3}
      >
        <Card.Header padded={false} mb="$2" p="$2">
          <View style={{ borderRadius: 10, overflow: "hidden" }}>
            <Image
              source={{ uri: item.image }}
              style={{ width: "auto", height: 200 }}
            />
            {/* Dark Overlay for better text readability */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            />

            <YStack
              style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}
            >
              <Text fontSize="$5" fontWeight="bold" color="white">
                {item.price}
              </Text>
              <Text fontSize="$3" color="#e4e4e7">
                {item.location}
              </Text>
            </YStack>

            <XStack
              style={{ position: "absolute", top: 12, right: 2, zIndex: 10 }}
            >
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
                onPress={(e) => {
                  e.stopPropagation();
                  setLiked(!liked);
                }}
              />
            </XStack>
          </View>
        </Card.Header>

        <Card.Footer padded={false} bg="transparent" px="$2.5" py="$1.5">
          <YStack gap="$1">
            <Text fontSize="$5" fontWeight="bold" color="black">
              {item.title}
            </Text>
            <Text fontSize="$2" color="gray">
              {item.time}
            </Text>
          </YStack>
        </Card.Footer>
      </Card>
    </Link>
  );
};

export default ListingCard;
