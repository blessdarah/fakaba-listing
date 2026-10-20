import { YStack, Text, View, Spinner, Button } from "tamagui";
import React from "react";
import ListingCardCompact from "components/ListingCardCompact";
import { Heart, Search } from "@tamagui/lucide-icons-2";
import { FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useListings } from "lib/query/useListings";
import { useFavorites } from "lib/query/useFavorites";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data: listings = [],
    isLoading,
    refetch: refetchListings,
  } = useListings();
  const { data: userFavorites = [], refetch: refetchFavorites } =
    useFavorites();

  const handleRefresh = React.useCallback(() => {
    refetchListings();
    refetchFavorites();
  }, [refetchListings, refetchFavorites]);

  const favoriteListings = listings.filter((listing) =>
    userFavorites.includes(listing.id)
  );

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <YStack
        pt={insets.top + 8}
        pb="$3"
        px="$4"
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize="$6" fontWeight="700">
          Favorites{favoriteListings.length > 0 ? ` (${favoriteListings.length})` : ""}
        </Text>
      </YStack>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" color="$blue9" />
        </YStack>
      ) : (
        <FlatList
          data={favoriteListings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 40,
          }}
          ItemSeparatorComponent={() => <View height={12} />}
          renderItem={({ item }) => <ListingCardCompact item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={
            <YStack items="center" py="$10" gap="$3">
              <Heart size={48} color="$color8" />
              <Text fontSize="$5" fontWeight="600" color="$color">
                No Favorites Yet
              </Text>
              <Text color="$color8" fontSize="$3" text="center" px="$6">
                Start adding listings to your favorites to see them here
              </Text>
              <Button
                size="$4"
                bg="$blue9"
                rounded="$4"
                mt="$2"
                icon={<Search size={16} color="white" />}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Button.Text fontWeight="600" color="white">
                  Browse Listings
                </Button.Text>
              </Button>
            </YStack>
          }
        />
      )}
    </YStack>
  );
}
