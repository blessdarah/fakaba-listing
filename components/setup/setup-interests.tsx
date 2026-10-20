import {
  House,
  UserPlus,
  Map,
  Warehouse,
  Hotel,
  CheckCircle,
} from "@tamagui/lucide-icons-2";
import { YStack, Text, XStack, Paragraph, View } from "tamagui";
import { Pressable } from "react-native";

type Interest = {
  name: string;
  icon: any;
};

const interests: Interest[] = [
  { name: "Residential", icon: House },
  { name: "Commercial", icon: UserPlus },
  { name: "Investment Properties", icon: House },
  { name: "International Properties", icon: Hotel },
  { name: "Luxury Homes", icon: Warehouse },
  { name: "Land & Lots", icon: Map },
];

type SetupInterestsProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const SetupInterests = ({ value, onChange }: SetupInterestsProps) => {
  return (
    <View>
      <Text fontSize="$8" fontWeight="800" mb="$2">
        What interests you?
      </Text>
      <Paragraph color="$color8" fontSize="$4" mb="$6">
        Select one or more property types
      </Paragraph>

      <YStack gap="$3">
        {interests.map((interest) => {
          const selected = value.includes(interest.name);
          const Icon = interest.icon;
          return (
            <Pressable
              key={interest.name}
              onPress={() => {
                if (selected) {
                  onChange(value.filter((item) => item !== interest.name));
                } else {
                  onChange([...value, interest.name]);
                }
              }}
            >
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
                <Text flex={1} fontSize="$4" fontWeight="700">
                  {interest.name}
                </Text>
                {selected && <CheckCircle size={20} color="$blue9" />}
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </View>
  );
};
