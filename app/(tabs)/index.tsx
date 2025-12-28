import { ExternalLink, Home } from "@tamagui/lucide-icons";
import { Avatar, Text, View, XStack, YStack, ScrollView } from "tamagui";
import SearchBar from "components/SearchBar";
import HomeCategories from "components/HomeCategories";
import HorizontalListing from "components/HorizontalListing";
import { ListingItem } from "components/ListingCard";


const popularRentals: ListingItem[] = [
  {
    id: 1,
    price: '120k Monthly',
    location: 'Molyko, Buea',
    title: '1 Bedroom studio',
    time: '2 days ago',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80',
  },
  {
    id: 2,
    price: '200k Monthly',
    location: 'Bonaberi, Douala',
    title: '3 bedroom apartment',
    time: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
  },
]

const popularOnSale: ListingItem[] = [
  {
    id: 3,
    price: '20 Million',
    location: 'Bota land, Limbe',
    title: '500msqr plot',
    time: '3 days ago',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
  },
  {
    id: 4,
    price: '200k Monthly',
    location: 'Bonaberi, Douala',
    title: '3 bedroom apartment',
    time: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
  },
]

export default function TabOneScreen() {
  return (
    <ScrollView flex={1} bg="$background" contentContainerStyle={{ pb: 50 }}>
      <YStack items="center" gap="$4" pt="$10" width="100%">
        <XStack items="center" justify="space-between" width="100%" px="$5" pt="$5">
          <YStack gap="$1.5">
            <Text fontSize="$5">Hi, Georges</Text>
            <Text fontSize="$5">Good morning</Text>
          </YStack>

          <Avatar circular size="$4" borderColor="$blue10" borderWidth={2}>
            <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
          </Avatar>
        </XStack>

        <View width="100%" items="center" justify="center" px="$5" my="$5">
          <SearchBar placeholder="Filter by location, price and type" />
        </View>

        <View width="100%" items="center" justify="center" px="$3" mb="$4">
          <HomeCategories />
        </View>

        <View width="100%" items="center" justify="center" px="$3" mb="$4">
          <HorizontalListing title="Popular rentals" listings={popularRentals} />
        </View>

        <View width="100%" items="center" justify="center" px="$3" mb="$4">
          <HorizontalListing title="Popular on sale" listings={popularOnSale} />
        </View>
      </YStack>
    </ScrollView>
  );
}
