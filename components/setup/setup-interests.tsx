import {
  House,
  UserPlus,
  Map,
  Warehouse,
  Hotel,
  CheckCircle,
} from "@tamagui/lucide-icons-2";
import { YStack, Text, Circle, XStack, Paragraph, View, H4 } from "tamagui";
import { TouchableOpacity } from "react-native";

type Interest = {
  name: string;
  icon: any;
};

const interests: Interest[] = [
  {
    name: "Residential",
    icon: House,
  },
  {
    name: "Commercial",
    icon: UserPlus,
  },
  {
    name: "Investment Properties",
    icon: House,
  },
  {
    name: "International Properties",
    icon: Hotel,
  },
  {
    name: "Luxury Homes",
    icon: Warehouse,
  },
  {
    name: "Land & Lots",
    icon: Map,
  },
];

type SetupInterestsProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const SetupInterests = ({ value, onChange }: SetupInterestsProps) => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Property Interests
        </H4>
        <Paragraph text="center">
          Select the types of properties you're interested in.
        </Paragraph>

        <YStack gap={"$4"} mt={"$4"}>
          {interests.map((interest) => {
            const selected = value.includes(interest.name);
            return (
              <TouchableOpacity
                key={interest.name}
                onPress={() => {
                  if (selected) {
                    onChange(value.filter((item) => item !== interest.name));
                  } else {
                    onChange([...value, interest.name]);
                  }
                }}
              >
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
                  <XStack gap="$3" items="center" justify="space-between">
                    <XStack gap="$3" items="center" flex={1}>
                    <Circle
                      size={48}
                      bg="$backgroundStrong"
                      borderWidth={1}
                      borderColor="$borderColor"
                      justify="center"
                      items="center"
                    >
                      <interest.icon size={24} />
                    </Circle>
                    <Text fontSize={"$6"} fontWeight={"bold"}>
                      {interest.name}
                    </Text>
                    </XStack>
                    {selected && <CheckCircle size={20} color="$colorFocus" />}
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
