import { Container } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { H2 } from "tamagui";

export default function ListingsByCategory() {
  const { category } = useLocalSearchParams();
  console.log("category: ", category);
  return (
    <>
      <Stack.Screen options={{ title: `By ${category}` }} />
      <Container>
        <H2>Listing by: {category}</H2>
      </Container>
    </>
  );
}
