import { ScrollView, Text, View, YStack, styled } from "tamagui";
import { Link } from "expo-router";
import { Home, Building, Palmtree, Hotel, Castle } from "@tamagui/lucide-icons";

const categories = [
  { id: "Room", name: "Rooms", slug: "rooms", icon: Home },
  { id: "Apartment", name: "Apartments", slug: "apartments", icon: Building },
  { id: "House", name: "Houses", slug: "houses", icon: Castle },
  { id: "Commercial", name: "Commercial", slug: "commercial", icon: Hotel },
  { id: "Land", name: "Land", slug: "land", icon: Palmtree },
];

const CategoryItem = styled(View, {
  items: "center",
  justify: "center",
  py: "$2",
  px: "$3",
  gap: "$2",
  hoverStyle: {
    opacity: 0.8,
  },
  pressStyle: {
    opacity: 0.6,
  },
});

const HomeCategories = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: "$2", px: "$1" }}
    >
      {categories.map((cat) => {
        const Icon = cat.icon;

        return (
          <Link key={cat.id} href={`/(categories)/${cat.id}`} asChild>
            <CategoryItem>
              <Icon size={24} color="gray" />
              <Text fontSize="$2" fontWeight="400" color="$accent5">
                {cat.name}
              </Text>
            </CategoryItem>
          </Link>
        );
      })}
    </ScrollView>
  );
};

export default HomeCategories;
