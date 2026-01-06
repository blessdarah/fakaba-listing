import { Mail, MapPin, MessageCircle } from "@tamagui/lucide-icons";
import ListingCard from "components/ListingCard";
import { StartRating } from "components/StarRating";
import React from "react";
import { Dimensions } from "react-native";
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

export default function AgentDetailScreen() {
  const [activeTab, setActiveTab] = React.useState("tab-about");
  const deviceWidth = Dimensions.get("window").width;
  return (
    <ScrollView bg="white">
      <View pb="$2">
        {/* header section */}
        <XStack items="center" justify="space-between" px="$10" pt="$8">
          <Circle bg="$green8" size={42}>
            <MessageCircle size={24} color="white" />
          </Circle>
          <YStack items="center" gap="$2">
            <Avatar circular size="$8" borderColor="$yellow10" borderWidth={3}>
              <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
              <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
            </Avatar>
            <Paragraph fontWeight="bold" fontSize="$6" color="gray">
              Tua Manuera
            </Paragraph>
          </YStack>
          <Circle bg="$white9" size={42}>
            <Mail size={24} color="white" />
          </Circle>
        </XStack>

        {/* location and star rating */}
        <XStack
          gap="$3"
          mt="$2"
          items="center"
          justify="space-between"
          mx="$4"
          py="$2"
        >
          <XStack gap="$1">
            <MapPin size={16} color="gray" />
            <Text color="gray">Molyko, Buea</Text>
          </XStack>
          <StartRating count={4} />
        </XStack>
        {/* End location and star rating */}
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
        bg={"white"}
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
          <Paragraph fontSize="$5" color="gray">
            Ab nulla molestiae reiciendis fuga provident tenetur. Amet sit
            tempore ut dolores. Repellendus omnis aut quod reiciendis molestiae
            eligendi et suscipit sed. Qui labore omnis quod minima. Ipsum
            debitis sint veniam architecto quo eos. Et ratione nihil quia
            voluptas.
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
          <Paragraph fontSize="$5" color="gray">
            This is a collection of all listings posted/created by the agent.
          </Paragraph>
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
              <View minW={320}>
                <ListingCard
                  item={{
                    id: 1,
                    title: "1 Bedroom studio",
                    location: "Molyko, Buea",
                    price: "120k Monthly",
                    image:
                      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
                    time: "2 days ago",
                  }}
                />
              </View>
            </YStack>
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="tab-reviews">
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
                    <Text>2 days ago</Text>
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
                    <Text>3 days ago</Text>
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
                    <Text>1 week ago</Text>
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
                    <Text>2 days ago</Text>
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
      <Text fontSize="$3" color="gray">
        {time}
      </Text>
    </XStack>
  );
}
