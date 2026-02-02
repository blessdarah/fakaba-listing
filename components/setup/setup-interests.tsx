import { House, UserPlus, Map, Warehouse, Hotel } from "@tamagui/lucide-icons";
import { YStack, Text, Circle, XStack, Paragraph, View, H4 } from "tamagui";

type Interest = {
  name: string;
  icon: any;
};

const roles: Interest[] = [
  {
    name: "Residential",
    icon: House,
  },
  {
    name: "Commercial",
    icon: UserPlus,
  },
  {
    name: "Investment Properties",
    icon: House,
  },
  {
    name: "International Properties",
    icon: Hotel,
  },
  {
    name: "Luxury Homes",
    icon: Warehouse,
  },
  {
    name: "Land & Lots",
    icon: Map,
  },
];
export const SetupInterests = ({ show }: Props) => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Property Interests
        </H4>
        <Paragraph text="center">
          Select the types of properties you're interested in.
        </Paragraph>

        <YStack gap={"$4"} mt={"$4"}>
          {roles.map((role) => (
            <YStack
              key={role.name}
              gap="$2"
              p="$4"
              bg="$blue2"
              rounded="$4"
              borderWidth={1}
              borderColor="$blue6"
            >
              <XStack gap="$3" items="center" flexWrap="wrap">
                <Circle
                  size={48}
                  bg="$white4"
                  borderWidth={1}
                  borderColor="$white8"
                  justify="center"
                  items="center"
                >
                  <role.icon size={24} />
                </Circle>
                <Text fontSize={"$6"} fontWeight={"bold"}>
                  {role.name}
                </Text>
              </XStack>
            </YStack>
          ))}
        </YStack>
      </View>
    </>
  );
};
