import { YStack, H2, Separator, ScrollView, View } from "tamagui";
import { Timestamp } from "firebase/firestore";
import ListingCard from "components/ListingCard";
import ScreenContainer from "components/ScreenContainer";

export default function FavoritesScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} flex={1}>
      <ScreenContainer>
        <YStack>
          <View minW={320}>
            <ListingCard
              item={{
                id: "8230sf",
                price: 200_000,
                location: "Bonaberi, Douala",
                title: "3 bedroom apartment",
                time: Timestamp.fromDate(new Date()),
                imageUrls: [
                  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
                ],
                bedrooms: 3,
                bathrooms: 2,
                address: "Upstation",
                category: "Apartment",
                ownerId: "JSkKh3hnAfb95eDxgnoZH3MMcZm1",
                status: "active",
                size: 300,
                type: "rent",
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
              }}
            />
          </View>
        </YStack>
      </ScreenContainer>
    </ScrollView>
  );
}
