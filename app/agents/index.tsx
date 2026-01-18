import { ChevronRight, MapPin, Search } from "@tamagui/lucide-icons";
import { StartRating } from "components/StarRating";
import { Link } from "expo-router";
import {
  Avatar,
  Input,
  Label,
  ListItem,
  ScrollView,
  Text,
  XStack,
  YStack,
} from "tamagui";

const agents = [
  {
    id: 1,
    name: "Bless Darah",
    location: "Molyko, Buea",
    image:
      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80",
    stars: 3,
  },
  {
    id: 2,
    name: "James Bond",
    location: "Bonaberi, Douala",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
    stars: 5,
  },
  {
    id: 3,
    name: "Winston Churchill",
    location: "Bonaberi, Douala",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
    stars: 4,
  },
];

export default function AgentsScreen() {
  return (
    <ScrollView
      flex={1}
      bg="$background"
      contentContainerStyle={{ pb: 50, px: 10 }}
      width="100%"
    >
      <XStack gap="$2" items="center" borderColor="gray">
        <Label htmlFor="search">
          <Search size={24} color="gray" />
        </Label>
        <Input id="search" placeholder="Search agents" my="$2" flex={1} />
      </XStack>
      {/* <Text fontSize="$8">Agents</Text> */}

      <YStack gap="$4" mt="$4">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={{
              pathname: "/agents/detail",
              params: { id: agent.id },
            }}
            asChild
          >
            <ListItem
              key={agent.id}
              bg="transparent"
              iconAfter={<ChevronRight size={20} color="gray" />}
            >
              <XStack gap="$3" verticalAlign="center">
                <Avatar
                  circular
                  size="$7"
                  borderColor="$yellow10"
                  borderWidth={3}
                >
                  <Avatar.Image src={agent.image} />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$1" justify="center">
                  <Text fontSize="$6">{agent.name}</Text>
                  <StartRating count={agent.stars} />
                  <XStack gap="$1">
                    <MapPin size={16} color="gray" />
                    <Text color="gray">{agent.location}</Text>
                  </XStack>
                </YStack>
              </XStack>
            </ListItem>
          </Link>
        ))}
      </YStack>
    </ScrollView>
  );
}
