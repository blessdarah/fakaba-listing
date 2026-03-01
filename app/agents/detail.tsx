import {
  Mail,
  MapPin,
  MessageCircle,
  ChevronLeft,
  Info,
  LayoutGrid,
} from "@tamagui/lucide-icons";
import ListingCard from "components/ListingCard";
import { StartRating } from "components/StarRating";
import React from "react";
import { Pressable } from "react-native";
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
  Image,
} from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "lib/query/useUsers";
import { useListingsByUser } from "lib/query/useListings";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AgentDetailScreen() {
  const [activeTab, setActiveTab] = React.useState("tab-about");
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
    "https://i.pravatar.cc/400?img=32";
  const agentLocation = (agent as any)?.location || "Location not available";
  const aboutText =
    (agent as any)?.about ||
    (agent as any)?.bio ||
    (agent as any)?.description ||
    "No bio data for now";
  const openingHoursRaw =
    (agent as any)?.openingHours ||
    (agent as any)?.hours ||
    (agent as any)?.availability;
  const openingHours = Array.isArray(openingHoursRaw)
    ? openingHoursRaw
        .map((item: any) => ({
          day: item?.day ?? item?.label ?? item?.name,
          time: item?.time ?? item?.value ?? item?.hours,
        }))
        .filter((item: any) => item.day && item.time)
    : openingHoursRaw && typeof openingHoursRaw === "object"
      ? Object.entries(openingHoursRaw).map(([day, time]) => ({
          day,
          time: String(time),
        }))
      : [];
  return (
    <ScrollView bg="$background" showsVerticalScrollIndicator={false}>
      <View pb={24}>
        <View height={360} width="100%">
          <Image
            source={{ uri: agentImage }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
          <View
            position="absolute"
            inset={0}
            style={{ backgroundColor: "rgba(5, 10, 18, 0.45)" }}
          />
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
            left={0}
            right={0}
            top={insets.top + 32}
            items="center"
            gap="$3"
          >
            <Avatar circular size="$10" borderColor="$yellow10" borderWidth={3}>
              <Avatar.Image src={agentImage} />
              <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
            </Avatar>
            <YStack
              bg="$background"
              px="$4"
              py="$3"
              rounded="$5"
              elevation="$3"
              items="center"
              gap="$1"
              width="84%"
            >
              <Paragraph fontWeight="800" fontSize="$7">
                {agentName}
              </Paragraph>
              <XStack gap="$2" items="center">
                <MapPin size={16} color="$color11" />
                <Text color="$color11">{agentLocation}</Text>
              </XStack>
              <StartRating count={(agent as any)?.stars ?? 4} />
              <XStack gap="$2" mt="$2" width="100%">
                <Button
                  flex={1}
                  bg="$green9"
                  color="white"
                  rounded="$7"
                  iconAfter={<MessageCircle size={18} color="white" />}
                >
                  WhatsApp
                </Button>
                <Button
                  flex={1}
                  bg="$blue10"
                  color="white"
                  rounded="$7"
                  iconAfter={<Mail size={18} color="white" />}
                >
                  Email
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </View>
      </View>

      {/* Tabs  */}
      <Tabs
        defaultValue="tab-about"
        orientation="horizontal"
        flexDirection="column"
        rounded="$6"
        borderWidth="$0.25"
        m="$2"
        mt={2}
        overflow="hidden"
        borderColor="$borderColor"
        bg="$background"
      >
        <Tabs.List
          disablePassBorderRadius="bottom"
          aria-label="Agent profile"
          bg="$color2"
          p="$1"
          mx="$3"
          my="$3"
          rounded="$8"
          gap="$1"
        >
          <Tabs.Tab
            focusStyle={{
              backgroundColor: "$blue8",
            }}
            flex={1}
            value="tab-about"
            active={activeTab === "tab-about"}
            onPress={() => setActiveTab("tab-about")}
            rounded="$7"
            bg={activeTab === "tab-about" ? "$blue9" : "transparent"}
          >
            <XStack gap="$2" items="center">
              <Info
                size={16}
                color={activeTab === "tab-about" ? "white" : "$color10"}
              />
              <SizableText
                fontFamily="$body"
                text="center"
                color={activeTab === "tab-about" ? "white" : "$color10"}
              >
                About
              </SizableText>
            </XStack>
          </Tabs.Tab>
          <Tabs.Tab
            focusStyle={{
              backgroundColor: "$color3",
            }}
            active={activeTab === "tab-listings"}
            flex={1}
            value="tab-listings"
            onPress={() => setActiveTab("tab-listings")}
            rounded="$7"
            bg={activeTab === "tab-listings" ? "$color10" : "transparent"}
          >
            <XStack gap="$2" items="center">
              <LayoutGrid
                size={16}
                color={activeTab === "tab-listings" ? "white" : "$color10"}
              />
              <SizableText
                fontFamily="$body"
                text="center"
                color={activeTab === "tab-listings" ? "white" : "$color10"}
              >
                Listings
              </SizableText>
            </XStack>
          </Tabs.Tab>
        </Tabs.List>
        <Separator />
        <Tabs.Content value="tab-about" p="$4">
          <H5>About</H5>
          <Paragraph fontSize="$5" color="$color11">
            {aboutText}
          </Paragraph>
          {openingHours.length > 0 ? (
            <>
              <Separator my="$5" />
              <H5>Opening hours</H5>
              <YStack gap="$4" mt="$4">
                {openingHours.map((item: any) => (
                  <OpeningHours
                    key={`${item.day}-${item.time}`}
                    day={item.day}
                    time={item.time}
                  />
                ))}
              </YStack>
            </>
          ) : null}
        </Tabs.Content>

        <Tabs.Content value="tab-listings" p="$4">
          <H5>Listings</H5>
          <Paragraph fontSize="$5" color="$color11">
            Listings posted by this agent.
          </Paragraph>
          <YStack gap="$3" mt="$3">
            {listings.length === 0 ? (
              <Text color="$color11">No listings yet.</Text>
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} item={listing} />
              ))
            )}
          </YStack>
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
      <Text fontSize="$3" color="$color11">
        {time}
      </Text>
    </XStack>
  );
}
