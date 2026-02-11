import { YStack, Text, Paragraph, View, H4 } from "tamagui";

export const SetupAccountType = () => {
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
          <YStack
            gap="$2"
            p="$4"
            bg="$blue2"
            rounded="$4"
            borderWidth={1}
            items={"center"}
            justify={"center"}
            borderColor="$blue6"
          >
            <Text fontSize={"$6"} fontWeight={"bold"}>
              Individual
            </Text>
            <Paragraph fontSize="$5" text={"center"}>
              I'm looking to buy, sell, or rent properties for personal use
            </Paragraph>
          </YStack>

          <YStack
            gap="$2"
            p="$4"
            bg="white"
            rounded="$4"
            borderWidth={1}
            items={"center"}
            justify={"center"}
            borderColor="$blue2"
          >
            <Text fontSize={"$6"} fontWeight={"bold"}>
              Company
            </Text>
            <Paragraph fontSize="$5" text={"center"}>
              I represent a real estate agency, brokerage,
            </Paragraph>
          </YStack>
        </YStack>
      </View>
    </>
  );
};
