import { Pressable } from "react-native";
import {
  Paragraph,
  Input,
  View,
  YStack,
  Label,
  Text,
  XStack,
} from "tamagui";
import { MapPin } from "@tamagui/lucide-icons-2";

const POPULAR_LOCATIONS = ["Douala", "Limbe", "Buea", "Yaounde"];

type SetupLocationProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectQuick: (value: string) => void;
};

export const SetupLocation = ({
  value,
  onChange,
  onSelectQuick,
}: SetupLocationProps) => {
  return (
    <View>
      <Text fontSize="$8" fontWeight="800" mb="$2">
        Where are you located?
      </Text>
      <Paragraph color="$color8" fontSize="$4" mb="$6">
        This helps us show you relevant properties and services
      </Paragraph>

      <YStack gap="$4">
        <YStack gap="$2">
          <Label fontSize="$3" fontWeight="600" color="$color8">
            Enter your city
          </Label>
          <XStack
            borderWidth={1}
            borderColor={value.trim() ? "$blue8" : "$borderColor"}
            rounded="$5"
            items="center"
            px="$3"
            bg="$background"
          >
            <MapPin size={18} color="$color8" />
            <Input
              flex={1}
              size="$5"
              bg="transparent"
              borderWidth={0}
              placeholder="e.g. Douala"
              placeholderTextColor="$color8"
              color="$color"
              value={value}
              onChangeText={onChange}
            />
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$color8" fontSize="$3">
            Popular locations
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {POPULAR_LOCATIONS.map((location) => {
              const selected = value === location;
              return (
                <Pressable
                  key={location}
                  onPress={() => onSelectQuick(location)}
                >
                  <XStack
                    rounded="$10"
                    py="$2.5"
                    px="$4"
                    bg={selected ? "$blue9" : "$background"}
                    borderWidth={1}
                    borderColor={selected ? "$blue9" : "$borderColor"}
                    gap="$1.5"
                    items="center"
                  >
                    <MapPin
                      size={14}
                      color={selected ? "white" : "$color8"}
                    />
                    <Text
                      fontWeight="600"
                      color={selected ? "white" : "$color"}
                    >
                      {location}
                    </Text>
                  </XStack>
                </Pressable>
              );
            })}
          </XStack>
        </YStack>
      </YStack>
    </View>
  );
};
