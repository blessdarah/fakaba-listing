import { YStack, Text, Paragraph, View } from "tamagui";
import { Pressable } from "react-native";
import { User, Building2 } from "@tamagui/lucide-icons-2";

const ACCOUNT_TYPES = [
  {
    id: "Individual" as const,
    icon: User,
    description:
      "I'm looking to buy, sell, or rent properties for personal use",
  },
  {
    id: "Company" as const,
    icon: Building2,
    description: "I represent a real estate agency or brokerage",
  },
];

type AccountTypeValue = "Individual" | "Company";

type SetupAccountTypeProps = {
  value: AccountTypeValue | null;
  onChange: (value: AccountTypeValue) => void;
};

export const SetupAccountType = ({
  value,
  onChange,
}: SetupAccountTypeProps) => {
  return (
    <View>
      <Text fontSize="$8" fontWeight="800" mb="$2">
        How will you use Fakaba?
      </Text>
      <Paragraph color="$color8" fontSize="$4" mb="$6">
        Select the option that best describes you
      </Paragraph>

      <YStack gap="$3">
        {ACCOUNT_TYPES.map((type) => {
          const selected = value === type.id;
          const Icon = type.icon;
          return (
            <Pressable key={type.id} onPress={() => onChange(type.id)}>
              <YStack
                gap="$3"
                p="$4"
                bg={selected ? "$blue3" : "$background"}
                rounded="$6"
                borderWidth={2}
                borderColor={selected ? "$blue8" : "$borderColor"}
                flexDirection="row"
                items="center"
              >
                <View
                  width={48}
                  height={48}
                  rounded={14}
                  bg={selected ? "$blue9" : "$color4"}
                  items="center"
                  justify="center"
                >
                  <Icon
                    size={22}
                    color={selected ? "white" : "$color11"}
                  />
                </View>
                <YStack flex={1} gap="$1">
                  <Text fontSize="$5" fontWeight="700">
                    {type.id}
                  </Text>
                  <Text color="$color8" fontSize="$3" lineHeight={18}>
                    {type.description}
                  </Text>
                </YStack>
              </YStack>
            </Pressable>
          );
        })}
      </YStack>
    </View>
  );
};
