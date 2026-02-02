import { House, Coins, UserPlus, Briefcase } from "@tamagui/lucide-icons";
import {
  YStack,
  Text,
  Circle,
  SizableText,
  XStack,
  Paragraph,
  View,
  H4,
} from "tamagui";

type SetupRole = {
  name: string;
  description: string;
  icon: any;
};

const roles: SetupRole[] = [
  {
    name: "Client",
    description: "Looking to purchase property",
    icon: House,
  },
  {
    name: "Agent",
    description: "Real estate professional",
    icon: UserPlus,
  },
  {
    name: "Renter",
    description: "Looking for property to rent",
    icon: House,
  },
  {
    name: "Seller",
    description: "Looking to sell property directly",
    icon: Coins,
  },
  {
    name: "Investor",
    description: "Looking to invest in property and real estate",
    icon: Briefcase,
  },
];
export const SetupRole = () => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Account type
        </H4>
        <Paragraph text="center">
          Help us understand how you will be using Fakaba
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
              <XStack gap="$3" flexWrap="wrap">
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
                <YStack>
                  <Text fontSize={"$6"} fontWeight={"bold"}>
                    {role.name}
                  </Text>
                  <SizableText fontSize="$5" text={"center"}>
                    {role.description}
                  </SizableText>
                </YStack>
              </XStack>
            </YStack>
          ))}
        </YStack>
      </View>
    </>
  );
};
