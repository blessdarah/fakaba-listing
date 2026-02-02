import {
  H4,
  Text,
  Paragraph,
  Input,
  View,
  YStack,
  Label,
  Avatar,
} from "tamagui";

export const SetupProfile = () => {
  return (
    <>
      <View>
        <H4 text="center" my={2}>
          Profile information
        </H4>
        <Paragraph text="center">Tell use a bit about yourself.</Paragraph>
        <YStack items="center" gap="$3" my={"$6"}>
          <Avatar circular size="$10" borderWidth={4}>
            <Avatar.Image
              aria-label="Cam"
              src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
            />
            <Avatar.Fallback bg="$blue10" />
          </Avatar>
          <Text fontWeight={"500"}>Upload a profile picture (optional)</Text>
        </YStack>
        <YStack gap={"$3"}>
          <YStack gap={"$1"}>
            <Label fontSize={"$5"}>First name</Label>
            <Input
              name="firstName"
              size={"$6"}
              bg="white"
              placeholder="John"
              placeholderTextColor="gray"
              color={"gray"}
              borderWidth={1}
              borderColor={"$white6"}
            />
          </YStack>
          <YStack gap={"$1"}>
            <Label fontSize={"$5"}>First name</Label>
            <Input
              name="lastName"
              size={"$6"}
              bg="white"
              placeholder="Doe"
              placeholderTextColor="gray"
              color={"gray"}
              borderWidth={1}
              borderColor={"$white6"}
            />
          </YStack>
        </YStack>
      </View>
    </>
  );
};
