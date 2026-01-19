import { YStack, Text, ScrollView, View, Spinner, XStack } from "tamagui";
import React from "react";
import ListingCard from "components/ListingCard";
import ScreenContainer from "components/ScreenContainer";
import { Heart } from "@tamagui/lucide-icons";
import { RefreshControl } from "react-native";
import { useListings } from "lib/query/useListings";
import { useFavorites } from "lib/query/useFavorites";

export default function FavoritesScreen() {
  // Use TanStack Query hooks
  const {
    data: listings = [],
    isLoading: loading,
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

  if (loading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="$blue8"
          />
        }
      >
        <ScreenContainer>
          <YStack flex={1} justify="center" items="center" py="$10">
            <Spinner size="large" color="$blue8" />
            <Text fontSize="$4" color="gray" mt="$3">
              Loading your favorites...
            </Text>
          </YStack>
        </ScreenContainer>
      </ScrollView>
    );
  }

  if (favoriteListings.length === 0) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="$blue8"
          />
        }
      >
        <ScreenContainer>
          <YStack flex={1} justify="center" items="center" py="$10" gap="$3">
            <Heart size={64} color="gray" />
            <Text fontSize="$6" fontWeight="bold" color="black">
              No Favorites Yet
            </Text>
            <Text fontSize="$4" color="gray" text="center" px="$4">
              Start adding listings to your favorites to see them here
            </Text>
          </YStack>
        </ScreenContainer>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      flex={1}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor="$blue8"
        />
      }
    >
      <ScreenContainer>
        <YStack gap="$3" py="$3">
          <Text fontSize="$6" fontWeight="bold" mb="$2">
            Your Favorites ({favoriteListings.length})
          </Text>
          {favoriteListings.map((listing) => (
            <View key={listing.id} width="100%">
              <ListingCard item={listing} />
            </View>
          ))}
        </YStack>
      </ScreenContainer>
    </ScrollView>
  );
}
