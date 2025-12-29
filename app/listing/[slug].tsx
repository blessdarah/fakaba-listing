import { View, Text } from "tamagui";
import { useLocalSearchParams, Stack } from "expo-router";

const ListingDetails = () => {
  const { slug } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: "Category" }} />
      <View flex={1} verticalAlign="center" justify="center">
        <Text fontSize="$6">Listing Category: {slug}</Text>
      </View>
    </>
  );
};

export default ListingDetails;
