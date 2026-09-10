import { ChevronRight, MapPin, Search, ChevronLeft } from "@tamagui/lucide-icons-2";
import { StartRating } from "components/StarRating";
import { Link } from "expo-router";
import { FlatList, Pressable } from "react-native";
import {
  Avatar,
  Button,
  Input,
  Text,
  XStack,
  YStack,
  View,
  Spinner,
} from "tamagui";
import { useAgents } from "lib/query/useUsers";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { User } from "lib/types";

const PAGE_SIZE = 10;

function getAgentName(agent: User): string {
  const full =
    `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim();
  return full || "Agent";
}

export default function AgentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: agents = [], isLoading } = useAgents();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedAndFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? agents.filter((agent) => {
          const name = getAgentName(agent).toLowerCase();
          const location = (agent.location || "").toLowerCase();
          return name.includes(q) || location.includes(q);
        })
      : [...agents];

    list.sort((a, b) => getAgentName(a).localeCompare(getAgentName(b)));
    return list;
  }, [agents, query]);

  const visibleAgents = sortedAndFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAndFiltered.length;

  const handleLoadMore = () => {
    setVisibleCount((c) => c + PAGE_SIZE);
  };

  // Reset visible count when search changes
  const handleSearch = (text: string) => {
    setQuery(text);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <YStack flex={1} bg="$background">
      {/* Compact header */}
      <YStack
        bg="$background"
        pt={insets.top + 8}
        pb="$3"
        px="$4"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <XStack items="center" gap="$3">
          <Pressable onPress={() => router.back()}>
            <View
              width={36}
              height={36}
              rounded={18}
              bg="$color3"
              items="center"
              justify="center"
            >
              <ChevronLeft size={20} color="$color" />
            </View>
          </Pressable>
          <Text fontSize="$6" fontWeight="700" flex={1}>
            Agents
          </Text>
          <Text color="$color8" fontSize="$3">
            {sortedAndFiltered.length} found
          </Text>
        </XStack>

        <XStack
          bg="$color3"
          items="center"
          rounded="$4"
          px="$3"
          gap="$2"
        >
          <Search size={16} color="$color8" />
          <Input
            flex={1}
            size="$3"
            placeholder="Search by name or location"
            value={query}
            onChangeText={handleSearch}
            bg="transparent"
            borderWidth={0}
            py="$2"
          />
        </XStack>
      </YStack>

      {/* Agent list */}
      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" color="$blue9" />
        </YStack>
      ) : (
        <FlatList
          data={visibleAgents}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
          ItemSeparatorComponent={() => <View height={12} />}
          renderItem={({ item: agent }) => (
            <Link
              href={{
                pathname: "/agents/detail",
                params: { id: agent.id! },
              }}
              asChild
            >
              <Pressable>
                <XStack
                  gap="$3"
                  items="center"
                  bg="$background"
                  borderColor="$borderColor"
                  borderWidth={1}
                  rounded="$6"
                  p="$3"
                >
                  <Avatar
                    circular
                    size="$5"
                    borderColor="$yellow10"
                    borderWidth={2}
                  >
                    {(agent.profileImage || agent.imageUrls?.[0]) ? (
                      <Avatar.Image
                        src={agent.profileImage || agent.imageUrls?.[0]!}
                      />
                    ) : null}
                    <Avatar.Fallback bg="$blue10" items="center" justify="center">
                      <Text color="white" fontSize="$5" fontWeight="700">
                        {getAgentName(agent).charAt(0).toUpperCase()}
                      </Text>
                    </Avatar.Fallback>
                  </Avatar>
                  <YStack gap="$0.5" flex={1}>
                    <Text fontSize="$4" fontWeight="700">
                      {getAgentName(agent)}
                    </Text>
                    <StartRating count={(agent as any).stars ?? 4} />
                    <XStack gap="$1" items="center">
                      <MapPin size={14} color="$color8" />
                      <Text color="$color8" fontSize="$3">
                        {agent.location || "Location"}
                      </Text>
                    </XStack>
                  </YStack>
                  <ChevronRight size={18} color="$color8" />
                </XStack>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            <YStack items="center" py="$8" gap="$2">
              <Text color="$color8" fontSize="$4">
                No agents found
              </Text>
              {query ? (
                <Text color="$color8" fontSize="$3">
                  Try a different search term
                </Text>
              ) : null}
            </YStack>
          }
          ListFooterComponent={
            hasMore ? (
              <YStack items="center" pt="$4">
                <Button
                  size="$4"
                  variant="outlined"
                  rounded="$4"
                  onPress={handleLoadMore}
                >
                  <Button.Text fontWeight="600">
                    Load more ({sortedAndFiltered.length - visibleCount} remaining)
                  </Button.Text>
                </Button>
              </YStack>
            ) : null
          }
        />
      )}
    </YStack>
  );
}
