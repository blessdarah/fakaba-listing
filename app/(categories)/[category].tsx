import { Container } from "@tamagui/lucide-icons-2";
import { Stack, useLocalSearchParams } from "expo-router";
import { useListings } from "lib/query";
import { Card, H2, H3, Paragraph } from "tamagui";

export default function ListingsByCategory() {
  const { category } = useLocalSearchParams();
  const { data: listings = [] } = useListings();
  const listingsByCategory = listings.filter(
    (listing) => listing.category == category
  );

  return (
    <>
      <Stack.Screen options={{ title: `By ${category}` }} />
      <Container>
        <H2>Listing by: {category}</H2>
        {listingsByCategory.map((listing) => (
          <Card key={listing.id}>
            <H3>{listing.title}</H3>
            <Paragraph>{listing.description}</Paragraph>
          </Card>
        ))}
      </Container>
    </>
  );
}
