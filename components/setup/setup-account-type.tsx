import { YStack, Text, Paragraph, View, H4 } from "tamagui";
import { TouchableOpacity } from "react-native";

const ACCOUNT_TYPES = ["Individual", "Company"] as const;

type SetupAccountTypeProps = {
  value: (typeof ACCOUNT_TYPES)[number] | null;
  onChange: (value: (typeof ACCOUNT_TYPES)[number]) => void;
};

export const SetupAccountType = ({ value, onChange }: SetupAccountTypeProps) => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Role
        </H4>
        <Paragraph text="center">
          Help us understand how you will be using Fakaba
        </Paragraph>

        <YStack gap={"$4"} mt={"$4"}>
          {ACCOUNT_TYPES.map((type) => {
            const selected = value === type;
            return (
              <TouchableOpacity key={type} onPress={() => onChange(type)}>
                <YStack
                  gap="$2"
                  p="$4"
                  bg={selected ? "$backgroundPress" : "$background"}
                  rounded="$4"
                  borderWidth={2}
                  items={"center"}
                  justify={"center"}
                  borderColor={selected ? "$borderColorFocus" : "$borderColor"}
                  shadowColor={selected ? "$shadowColor" : undefined}
                  shadowOpacity={selected ? 0.2 : 0}
                  shadowRadius={selected ? 8 : 0}
                  shadowOffset={selected ? { width: 0, height: 4 } : undefined}
                  elevation={selected ? 3 : 0}
                >
                  <Text fontSize={"$6"} fontWeight={"bold"}>
                    {type}
                  </Text>
                  <Paragraph fontSize="$5" text={"center"}>
                    {type === "Individual"
                      ? "I'm looking to buy, sell, or rent properties for personal use"
                      : "I represent a real estate agency, brokerage"}
                  </Paragraph>
                </YStack>
              </TouchableOpacity>
            );
          })}
        </YStack>
      </View>
    </>
  );
};
