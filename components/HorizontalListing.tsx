import { View, Text, XStack, YStack, ScrollView } from "tamagui";
import { Link } from "expo-router";
import ListingCard from "./ListingCard";
import { Listing } from "lib/types";

type HorizontalListingProps = {
  title: string;
  listings: Listing[];
};

const HorizontalListing = ({ title, listings }: HorizontalListingProps) => {
  return (
    <YStack gap="$2" width="100%">
      <XStack justify="space-between" items="center">
        <Text fontSize="$6" fontWeight="bold">
          {title}
        </Text>
        <Link href="/(listings)" asChild>
          <Text color="$blue8" fontWeight="600">
            See all
          </Text>
        </Link>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack>
          {listings.map((item) => (
            <View key={item.id} width={280}>
              <ListingCard item={item} />
            </View>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
};

export default HorizontalListing;
