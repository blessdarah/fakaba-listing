import { View, Text, XStack, YStack, ScrollView, Spinner } from "tamagui";
import { Link } from "expo-router";
import ListingCard from "./ListingCard";
import { Listing } from "lib/types";
import { AlertCircle } from "@tamagui/lucide-icons";

type HorizontalListingProps = {
  title: string;
  listings: Listing[];
  loading?: boolean;
  error?: string | null;
};

const HorizontalListing = ({
  title,
  listings,
  loading = false,
  error = null,
}: HorizontalListingProps) => {
  // Loading state
  if (loading) {
    return (
      <YStack gap="$2" width="100%">
        <Text fontSize="$6" fontWeight="bold">
          {title}
        </Text>
        <YStack
          height={280}
          justify="center"
          items="center"
          bg="$background"
          rounded="$4"
        >
          <Spinner size="large" color="$blue8" />
          <Text fontSize="$4" color="#6b7280" mt="$3">
            Loading listings...
          </Text>
        </YStack>
      </YStack>
    );
  }

  // Error state
  if (error) {
    return (
      <YStack gap="$2" width="100%">
        <Text fontSize="$6" fontWeight="bold">
          {title}
        </Text>
        <YStack
          height={280}
          justify="center"
          items="center"
          bg="$red1"
          rounded="$4"
          borderColor="$red8"
          borderWidth={1}
          gap="$2"
        >
          <AlertCircle size={32} color="$red8" />
          <Text fontSize="$4" color="$red8" fontWeight="600">
            Error loading listings
          </Text>
          <YStack px="$4" items="center">
            <Text fontSize="$3" color="$red7">
              {error}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    );
  }

  // No data state
  if (!listings || listings.length === 0) {
    return (
      <YStack gap="$2" width="100%">
        <Text fontSize="$6" fontWeight="bold">
          {title}
        </Text>
        <YStack
          height={280}
          justify="center"
          items="center"
          bg="#f3f4f6"
          rounded="$4"
          borderColor="$borderColor"
          borderWidth={1}
        >
          <Text fontSize="$4" color="#6b7280" fontWeight="600">
            No listings available
          </Text>
          <Text fontSize="$3" color="#9ca3af" mt="$2">
            Check back soon for new listings
          </Text>
        </YStack>
      </YStack>
    );
  }

  // Normal state with data
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
