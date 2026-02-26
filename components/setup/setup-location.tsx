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

const POPULAR_LOCATIONS = ["Douala", "Limbe", "Buea", "Yaounde"];

type SetupLocationProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SetupLocation = ({ value, onChange }: SetupLocationProps) => {
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
            bg="$background"
            placeholder="Douala"
            placeholderTextColor="$color8"
            color={"$color"}
            borderWidth={1}
            borderColor={"$borderColor"}
            value={value}
            onChangeText={onChange}
          />
          <Text fontWeight={"bold"}>Popular locations</Text>
          <XStack gap={"$3"} flexWrap="wrap">
            {POPULAR_LOCATIONS.map((location) => {
              const selected = value === location;
              return (
                <TouchableOpacity
                  key={location}
                  onPress={() => onChange(location)}
                >
                  <Text
                    rounded={"$10"}
                    py="$3"
                    px="$4"
                    bg={selected ? "$backgroundPress" : "$backgroundStrong"}
                    borderWidth={selected ? 2 : 1}
                    borderColor={selected ? "$borderColorFocus" : "$borderColor"}
                    shadowColor={selected ? "$shadowColor" : undefined}
                    shadowOpacity={selected ? 0.2 : 0}
                    shadowRadius={selected ? 6 : 0}
                    shadowOffset={selected ? { width: 0, height: 3 } : undefined}
                    elevation={selected ? 2 : 0}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </XStack>
        </YStack>
      </View>
    </>
  );
};
