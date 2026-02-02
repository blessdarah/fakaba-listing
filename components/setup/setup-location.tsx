import { TouchableOpacity } from "react-native";
import {
  H4,
  Paragraph,
  Input,
  View,
  YStack,
  Label,
  Text,
  XStack,
} from "tamagui";

export const SetupLocation = () => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Your location
        </H4>
        <Paragraph text="center">
          This helps us show you relevant properties and services.
        </Paragraph>

        <YStack gap={"$4"}>
          <Label fontSize={"$5"}>
            Where are you primarily looking for properties?
          </Label>
          <Input
            size={"$6"}
            bg="white"
            placeholder="Douala"
            placeholderTextColor="gray"
            color={"gray"}
            borderWidth={1}
            borderColor={"$white6"}
          />
          <Text fontWeight={"bold"}>Popular locations</Text>
          <XStack gap={"$3"}>
            <TouchableOpacity>
              <Text rounded={"$10"} py="$3" px="$4" bg={"$white4"}>
                Douala
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text rounded={"$10"} py="$3" px="$4" bg={"$white4"}>
                Limbe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text rounded={"$10"} py="$3" px="$4" bg={"$white4"}>
                Buea
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text rounded={"$10"} py="$3" px="$4" bg={"$white4"}>
                Yaounde
              </Text>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </View>
    </>
  );
};
