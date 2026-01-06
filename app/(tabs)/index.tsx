import React from "react";
import {
  Sheet,
  Avatar,
  Text,
  View,
  XStack,
  YStack,
  Input,
  Button,
  H5,
  Select,
  Separator,
  ScrollView,
} from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeCategories from "components/HomeCategories";
import HorizontalListing from "components/HorizontalListing";
import { Sliders } from "@tamagui/lucide-icons";
import ScreenContainer from "components/ScreenContainer";
import { getListings } from "lib/firestore/listings";
import { useAuth } from "contexts/AuthContext";
import { Alert, StatusBar } from "react-native";
import { Listing } from "lib/types";
import { useRouter } from "expo-router";

export default function TabOneScreen() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState("rental");
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [_, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        const fetchedListings = await getListings();
        console.log("listings: ", fetchedListings);
        setListings(fetchedListings);
      } catch (error: any) {
        console.error("Failed to load listings:", error);

        if (error.message.includes("Permission denied")) {
          Alert.alert(
            "Authentication Required",
            "Please sign in to view listings.",
            [{ text: "OK" }],
          );
        } else {
          Alert.alert(
            "Error",
            error.message || "Failed to load listings. Please try again.",
            [{ text: "OK" }],
          );
        }
      } finally {
        setLoading(false);
      }
    }

    // Load public listings (no authentication required)
    loadListings();
  }, [user]);

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer>
          <XStack items="center" justify="space-between" width="100%">
            <YStack gap="$1.5">
              <Text fontSize="$7" fontWeight={"bold"}>
                Hi, Georges
              </Text>
              <Text fontSize="$5">Good morning</Text>
            </YStack>

            <Avatar circular size="$5" borderColor="$blue10" borderWidth={2}>
              <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
              <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
            </Avatar>
          </XStack>

          <XStack
            justify="space-between"
            items={"center"}
            width="100%"
            bg="$background"
            gap="$2"
            my="$3"
          >
            {/* <Search size="$1" color="$color" mr="$4" /> */}
            <Input flex={1} placeholder="Search property" bg="transparent" />
            <Button
              onPress={() => router.push("/(modals)/filter")}
              icon={<Sliders size={16} />}
            ></Button>
          </XStack>

          <View width="100%" items="center" justify="center" mb="$4">
            <HomeCategories />
          </View>

          <View width="100%" items="center" justify="center" mb="$4">
            <HorizontalListing title="Popular rentals" listings={listings} />
          </View>

          <View width="100%" items="center" justify="center" mb="$4">
            <HorizontalListing title="Popular on sale" listings={listings} />
          </View>

          {/* bottom sheet */}
          <Sheet
            open={open}
            forceRemoveScrollEnabled={open}
            modal={true}
            onOpenChange={setOpen}
            snapPoints={[85, 50, 25]}
            snapPointsMode={"percent"}
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="medium"
          >
            <Sheet.Overlay
              animation="lazy"
              bg="$shadow6"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Sheet.Handle />
            <Sheet.Frame>
              <Sheet.ScrollView p="$4">
                <H5>Filter</H5>
                <Separator my="$2" />
                {/* <XStack gap="$4"> */}
                <Text>Type</Text>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select type..." />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.ScrollUpButton />
                    <Select.Viewport>
                      <Select.Group>
                        <Select.Label>Property Type</Select.Label>
                        <Select.Item index={0} key={"rental"} value="rental">
                          <Select.ItemText>Rental</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} key={"sale"} value="sale">
                          <Select.ItemText>Sale</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} key={"lease"} value="lease">
                          <Select.ItemText>Lease</Select.ItemText>
                        </Select.Item>
                      </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton />
                  </Select.Content>
                </Select>
                {/* </XStack> */}
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </ScreenContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
