import {
  House,
  Coins,
  UserPlus,
  Briefcase,
  CheckCircle,
} from "@tamagui/lucide-icons-2";
import { YStack, Text, XStack, Paragraph, View } from "tamagui";
import { Pressable } from "react-native";

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
    <View>
      <Text fontSize="$8" fontWeight="800" mb="$2">
        What's your role?
      </Text>
      <Paragraph color="$color8" fontSize="$4" mb="$6">
        This helps us personalize your experience
      </Paragraph>

      <YStack gap="$3">
        {roles.map((role) => {
          const selected = value === role.name;
          const Icon = role.icon;
          return (
            <Pressable key={role.name} onPress={() => onChange(role.name)}>
              <XStack
                gap="$3"
                p="$3.5"
                bg={selected ? "$blue3" : "$background"}
                rounded="$6"
                borderWidth={2}
                borderColor={selected ? "$blue8" : "$borderColor"}
                items="center"
              >
                <View
                  width={44}
                  height={44}
                  rounded={12}
                  bg={selected ? "$blue9" : "$color4"}
                  items="center"
                  justify="center"
                >
                  <Icon
                    size={20}
                    color={selected ? "white" : "$color11"}
                  />
                </View>
                <YStack flex={1} gap="$0.5">
                  <Text fontSize="$4" fontWeight="700">
                    {role.name}
                  </Text>
                  <Text color="$color8" fontSize="$3">
                    {role.description}
                  </Text>
                </YStack>
                {selected && <CheckCircle size={20} color="$blue9" />}
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </View>
  );
};
