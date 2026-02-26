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
import { TouchableOpacity } from "react-native";

type SetupRoleOption = {
  name: string;
  description: string;
  icon: any;
};

const roles: SetupRoleOption[] = [
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
type SetupRoleProps = {
  value: string | null;
  onChange: (value: string) => void;
};

export const SetupRole = ({ value, onChange }: SetupRoleProps) => {
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
          {roles.map((role) => {
            const selected = value === role.name;
            return (
              <TouchableOpacity key={role.name} onPress={() => onChange(role.name)}>
                <YStack
                  gap="$2"
                  p="$4"
                  bg={selected ? "$backgroundPress" : "$background"}
                  rounded="$4"
                  borderWidth={2}
                  borderColor={selected ? "$borderColorFocus" : "$borderColor"}
                  shadowColor={selected ? "$shadowColor" : undefined}
                  shadowOpacity={selected ? 0.2 : 0}
                  shadowRadius={selected ? 8 : 0}
                  shadowOffset={selected ? { width: 0, height: 4 } : undefined}
                  elevation={selected ? 3 : 0}
                >
                  <XStack gap="$3" flexWrap="wrap">
                    <Circle
                      size={48}
                      bg="$backgroundStrong"
                      borderWidth={1}
                      borderColor="$borderColor"
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
              </TouchableOpacity>
            );
          })}
        </YStack>
      </View>
    </>
  );
};
