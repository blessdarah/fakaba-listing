import { ScrollView, Text, View, YStack, styled, useTheme } from "tamagui";
import { Home, Building, Palmtree, Hotel, Castle } from "@tamagui/lucide-icons";

export const HOME_CATEGORIES = [
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

type HomeCategoriesProps = {
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

const HomeCategories = ({ activeId, onSelect }: HomeCategoriesProps) => {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: "$2", px: "$1" }}
    >
      {HOME_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeId === cat.id;

        return (
          <CategoryItem
            key={cat.id}
            onPress={() => onSelect?.(cat.id)}
            pressStyle={{ opacity: 0.6 }}
            accessibilityRole="button"
          >
            <Icon size={24} color={isActive ? theme.yellow9.val : "gray"} />
            <Text
              fontSize="$2"
              fontWeight="400"
              color={isActive ? theme.yellow9.val : "$accent5"}
            >
              {cat.name}
            </Text>
          </CategoryItem>
        );
      })}
    </ScrollView>
  );
};

export default HomeCategories;
