import { ScrollView, YStack, Text, Spinner } from "tamagui";
import { RefreshControl } from "react-native";
import ScreenContainer from "components/ScreenContainer";
import ListingCard from "components/ListingCard";
import { useListings } from "lib/query/useListings";
import { useLocalSearchParams } from "expo-router";

export default function ListingsIndexScreen() {
  const { type, category } = useLocalSearchParams<{
    type?: string;
    category?: string;
  }>();
  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useListings();

  const activeListings = listings.filter(
    (listing) => listing.status === "active"
  );
  const filteredListings = activeListings.filter((listing) => {
    const matchesType = type ? listing.type === type : true;
    const matchesCategory = category ? listing.category === category : true;
    return matchesType && matchesCategory;
  });

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <YStack gap="$4" pb="$6">
          <Text fontSize="$7" fontWeight="700">
            All Listings
          </Text>

          {isLoading ? (
            <YStack items="center" justify="center" py="$8" gap="$3">
              <Spinner size="large" color="$blue8" />
              <Text color="$color8">Loading listings...</Text>
            </YStack>
          ) : error ? (
            <Text color="$red8">{error.message}</Text>
          ) : filteredListings.length === 0 ? (
            <Text color="$color8">No public listings available.</Text>
          ) : (
            <YStack gap="$3">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} item={listing} />
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
