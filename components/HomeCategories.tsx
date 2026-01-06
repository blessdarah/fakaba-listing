import { ScrollView, Text, View, YStack, styled } from "tamagui";
import { Link } from "expo-router";
import {
  Home,
  Coffee,
  Utensils,
  Mountain,
  Waves,
  Tent,
  Building,
  Palmtree,
  Hotel,
  Castle,
  Warehouse,
} from "@tamagui/lucide-icons";

const categories = [
  { id: 1, name: "Tiny Homes", slug: "tiny-homes", icon: Home },
  { id: 2, name: "National Parks", slug: "national-parks", icon: Mountain },
  { id: 3, name: "Beachfront", slug: "beachfront", icon: Waves },
  { id: 4, name: "Cabins", slug: "cabins", icon: Tent },
  { id: 5, name: "Amazing Pools", slug: "amazing-pools", icon: Palmtree },
  { id: 6, name: "Mansions", slug: "mansions", icon: Building },
  { id: 7, name: "Historic Homes", slug: "historic-homes", icon: Castle },
  { id: 8, name: "Countryside", slug: "countryside", icon: Warehouse },
  { id: 9, name: "Surfing", slug: "surfing", icon: Waves },
  {
    id: 10,
    name: "Bed & Breakfasts",
    slug: "bed-and-breakfasts",
    icon: Coffee,
  },
  { id: 11, name: "Restaurants", slug: "restaurants", icon: Utensils },
  { id: 12, name: "Hotels", slug: "hotels", icon: Hotel },
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
          <Link key={cat.id} href={`/(listing)/${cat.slug}`} asChild>
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
