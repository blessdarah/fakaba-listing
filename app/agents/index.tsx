import { ChevronRight, MapPin, Search, Users, ChevronLeft } from "@tamagui/lucide-icons";
import { StartRating } from "components/StarRating";
import { Link } from "expo-router";
import { Image, ScrollView, Pressable } from "react-native";
import {
  Avatar,
  Input,
  Text,
  XStack,
  YStack,
  View,
} from "tamagui";
import { useAgents } from "lib/query/useUsers";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function AgentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: agents = [] } = useAgents();
  const [query, setQuery] = useState("");

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((agent) => {
      const name =
        (agent as any).displayName ||
        `${(agent as any).firstName ?? ""} ${(agent as any).lastName ?? ""}`.trim() ||
        (agent as any).name ||
        "";
      const location = (agent as any).location || "";
      return (
        name.toLowerCase().includes(q) || location.toLowerCase().includes(q)
      );
    });
  }, [agents, query]);

  return (
    <YStack flex={1} bg="$background">
      <View height={220} width="100%">
        <Image
          source={require("../../assets/images/service.png")}
          style={{ width: "100%", height: "100%", resizeMode: "cover" }}
        />
        <View position="absolute" inset={0} bg="rgba(0,0,0,0.55)" />
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
          px="$4"
          pt={insets.top + 16}
          pb="$4"
          justify="flex-end"
          gap="$3"
        >
          <XStack items="center" gap="$2">
            <Users size={20} color="white" />
            <Text color="white" fontWeight="700">
              Agents
            </Text>
          </XStack>
          <XStack
            bg="rgba(255,255,255,0.9)"
            items="center"
            rounded={999}
            borderWidth={1}
            borderColor="rgba(255,255,255,0.5)"
            px="$3"
            py="$2"
          >
            <Search size={18} color="#1f2937" />
            <Input
              flex={1}
              placeholder="Search agents"
              value={query}
              onChangeText={setQuery}
              bg="transparent"
              borderWidth={0}
              color="#111827"
            />
          </XStack>
        </YStack>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <YStack gap="$3">
          {filteredAgents.map((agent) => (
            <Link
              key={(agent as any).id}
              href={{
                pathname: "/agents/detail",
                params: { id: (agent as any).id },
              }}
              asChild
            >
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
                  size="$6"
                  borderColor="$yellow10"
                  borderWidth={2}
                >
                  <Avatar.Image
                    src={
                      (agent as any).profileImage ||
                      (agent as any).photoURL ||
                      (agent as any).imageUrls?.[0] ||
                      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
                    }
                  />
                  <Avatar.Fallback delayMs={600} bg="$blue10" />
                </Avatar>
                <YStack gap="$1" flex={1}>
                  <Text fontSize="$5" fontWeight="700">
                    {(agent as any).displayName ||
                      `${(agent as any).firstName ?? ""} ${(agent as any).lastName ?? ""}`.trim() ||
                      (agent as any).name ||
                      "Agent"}
                  </Text>
                  <StartRating count={(agent as any).stars ?? 4} />
                  <XStack gap="$1" items="center">
                    <MapPin size={16} color="$color8" />
                    <Text color="$color8">
                      {(agent as any).location || "Location"}
                    </Text>
                  </XStack>
                </YStack>
                <ChevronRight size={20} color="$color8" />
              </XStack>
            </Link>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
