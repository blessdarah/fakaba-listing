import { Mail, MapPin, MessageCircle, ChevronLeft } from "@tamagui/lucide-icons";
import ListingCard from "components/ListingCard";
import { StartRating } from "components/StarRating";
import React from "react";
import { Dimensions, Pressable } from "react-native";
import {
  H5,
  SizableText,
  ScrollView,
  Separator,
  Avatar,
  YStack,
  XStack,
  Paragraph,
  Tabs,
  Text,
  Circle,
  View,
  Button,
} from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "lib/query/useUsers";
import { useListingsByUser } from "lib/query/useListings";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AgentDetailScreen() {
  const [activeTab, setActiveTab] = React.useState("tab-about");
  const deviceWidth = Dimensions.get("window").width;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: agent } = useUser(id || "");
  const { data: listings = [] } = useListingsByUser(id || "");

  const agentName =
    (agent as any)?.displayName ||
    `${(agent as any)?.firstName ?? ""} ${(agent as any)?.lastName ?? ""}`.trim() ||
    (agent as any)?.name ||
    "Agent";
  const agentImage =
    (agent as any)?.profileImage ||
    (agent as any)?.photoURL ||
    (agent as any)?.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80";
  const agentLocation = (agent as any)?.location || "Location not available";
  return (
    <ScrollView bg="$background" showsVerticalScrollIndicator={false}>
      <View pb="$2">
        <View height={220} width="100%">
          <View position="absolute" inset={0} bg="$color1" />
          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 16,
              zIndex: 10,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              borderRadius: 20,
              padding: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={22} color="white" />
          </Pressable>
          <YStack
            position="absolute"
            inset={0}
            pt={insets.top + 24}
            px="$4"
            pb="$4"
            justify="space-between"
          >
            <XStack items="center" justify="space-between">
              <Circle bg="$green8" size={42}>
                <MessageCircle size={24} color="white" />
              </Circle>
              <Circle bg="$blue10" size={42}>
                <Mail size={24} color="white" />
              </Circle>
            </XStack>
            <YStack items="center" gap="$2">
              <Avatar circular size="$8" borderColor="$yellow10" borderWidth={3}>
                <Avatar.Image src={agentImage} />
                <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
              </Avatar>
              <Paragraph fontWeight="700" fontSize="$6" color="$color">
                {agentName}
              </Paragraph>
            </YStack>
            <XStack items="center" justify="space-between">
              <XStack gap="$1" items="center">
                <MapPin size={16} color="$color8" />
                <Text color="$color8">{agentLocation}</Text>
              </XStack>
              <StartRating count={(agent as any)?.stars ?? 4} />
            </XStack>
          </YStack>
        </View>
      </View>

      {/* Tabs  */}
      <Tabs
        defaultValue="tab-about"
        orientation="horizontal"
        flexDirection="column"
        rounded="$4"
        borderWidth="$0.25"
        m="$2"
        mt={0}
        overflow="hidden"
        borderColor="$borderColor"
        bg="$background"
      >
        <Tabs.List disablePassBorderRadius="bottom" aria-label="Agent profile">
          <Tabs.Tab
            focusStyle={{
              backgroundColor: "$blue8",
            }}
            flex={1}
            value="tab-about"
            active={activeTab === "tab-about"}
            onPress={() => setActiveTab("tab-about")}
          >
            <SizableText fontFamily="$body" text="center">
              About
            </SizableText>
          </Tabs.Tab>
          <Tabs.Tab
            focusStyle={{
              backgroundColor: "$color3",
            }}
            active={activeTab === "tab-listings"}
            flex={1}
            value="tab-listings"
            onPress={() => setActiveTab("tab-listings")}
          >
            <SizableText fontFamily="$body" text="center">
              Listings
            </SizableText>
          </Tabs.Tab>
          <Tabs.Tab
            focusStyle={{
              backgroundColor: "$color3",
            }}
            active={activeTab === "tab-reviews"}
            flex={1}
            value="tab-reviews"
            onPress={() => setActiveTab("tab-reviews")}
          >
            <SizableText fontFamily="$body" text="center">
              Reviews
            </SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Separator />
        <Tabs.Content value="tab-about" p="$4">
          <H5>About</H5>
          <Paragraph fontSize="$5" color="$color10">
            {(agent as any)?.about ||
              "This agent is committed to helping you find the right property and guiding you through the process."}
          </Paragraph>
          <Separator my="$5" />
          <H5>Opening hours</H5>
          <YStack gap="$4" mt="$4">
            <OpeningHours day="Monday" time="9:00 AM - 5:00 PM" />
            <OpeningHours day="Tuesday" time="9:00 AM - 5:00 PM" />
            <OpeningHours day="Friday" time="9:00 AM - 5:00 PM" />
          </YStack>
        </Tabs.Content>

        <Tabs.Content value="tab-listings" p="$4">
          <H5>Listings</H5>
          <Paragraph fontSize="$5" color="$color10">
            Listings posted by this agent.
          </Paragraph>
          <YStack gap="$3" mt="$3">
            {listings.length === 0 ? (
              <Text color="$color8">No listings yet.</Text>
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} item={listing} />
              ))
            )}
          </YStack>
        </Tabs.Content>

        <Tabs.Content value="tab-reviews" p="$4">
          <ScrollView showsVerticalScrollIndicator={false} height={400}>
            <YStack maxW={deviceWidth}>
              {/* Review card */}
              <XStack gap="$4" my="$4">
                <Avatar
                  circular
                  size="$6"
                  borderColor="$yellow10"
                  borderWidth={3}
                  elevation="$2"
                >
                  <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$2" width={deviceWidth - 120}>
                  <H5>Bless Darah</H5>
                  <Paragraph fontStyle="italic" flexWrap="wrap">
                    I worked with him for a land purchase and his approach was
                    very professional.
                  </Paragraph>
                  <XStack justify="space-between">
                    <Text color="$color8">2 days ago</Text>
                    <StartRating count={4} />
                  </XStack>
                </YStack>
              </XStack>
              {/* Review card */}

              {/* Review card */}
              <XStack gap="$4" my="$4">
                <Avatar
                  circular
                  size="$6"
                  borderColor="$yellow10"
                  borderWidth={3}
                  elevation="$2"
                >
                  <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$2" width={deviceWidth - 120}>
                  <H5>Raymond Snow</H5>
                  <Paragraph fontStyle="italic" flexWrap="wrap">
                    He is very professional and has a great approach to the job.
                  </Paragraph>
                  <XStack justify="space-between">
                    <Text color="$color8">3 days ago</Text>
                    <StartRating count={3} />
                  </XStack>
                </YStack>
              </XStack>
              {/* Review card */}
              {/* Review card */}
              <XStack gap="$4" my="$4">
                <Avatar
                  circular
                  size="$6"
                  borderColor="$yellow10"
                  borderWidth={3}
                  elevation="$2"
                >
                  <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$2" width={deviceWidth - 120}>
                  <H5>William Smith</H5>
                  <Paragraph fontStyle="italic" flexWrap="wrap">
                    He was so poor and I had to call him several times before
                    getting support
                  </Paragraph>
                  <XStack justify="space-between">
                    <Text color="$color8">1 week ago</Text>
                    <StartRating count={1} />
                  </XStack>
                </YStack>
              </XStack>
              {/* Review card */}
              {/* Review card */}
              <XStack gap="$4" my="$4">
                <Avatar
                  circular
                  size="$6"
                  borderColor="$yellow10"
                  borderWidth={3}
                  elevation="$2"
                >
                  <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$2" width={deviceWidth - 120}>
                  <H5>Bless Darah</H5>
                  <Paragraph fontStyle="italic" flexWrap="wrap">
                    I worked with him for a land purchase and his approach was
                    very professional.
                  </Paragraph>
                  <XStack justify="space-between">
                    <Text color="$color8">2 days ago</Text>
                    <StartRating count={4} />
                  </XStack>
                </YStack>
              </XStack>
              {/* Review card */}
            </YStack>
          </ScrollView>
          <Button mx="$6" bg={"$blue9"} color="white" rounded="$5" size={"$5"}>
            Write Review
          </Button>
        </Tabs.Content>
      </Tabs>
    </ScrollView>
  );
}

function OpeningHours({ day, time }: { day: string; time: string }) {
  return (
    <XStack gap="$2" items="center" justify={"space-between"}>
      <Text fontSize="$5" fontWeight="600">
        {day}
      </Text>
      <Text fontSize="$3" color="$color8">
        {time}
      </Text>
    </XStack>
  );
}
