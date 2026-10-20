import { YStack, H1, Text, XStack, View, Spinner } from "tamagui";
import { Pressable, StatusBar, useColorScheme, Image } from "react-native";
import { ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { ChevronRight, Sparkles, Plus } from "@tamagui/lucide-icons-2";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useServices } from "lib/query/useServices";
import { useAuth } from "contexts/AuthContext";

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { data: services = [], isLoading } = useServices();
  const { isAdmin } = useAuth();

  return (
    <YStack flex={1} bg="$background" p={0} m={0}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      {/* Hero Section */}
      <View height={260} width="100%">
        <Image
          source={require("../../../assets/images/service.png")}
          style={{ width: "100%", height: "100%", resizeMode: "cover" }}
        />
        <View position="absolute" inset={0} bg="rgba(0,0,0,0.6)" />
        <YStack
          position="absolute"
          inset={0}
          px="$4"
          pt={insets.top + 16}
          pb="$4"
          justify="space-between"
        >
          <YStack gap="$2">
            <H1 fontSize={36} fontWeight="900" color="white">
              Services
            </H1>
            <Text color="white" opacity={0.9}>
              Everything you need to buy, manage, and grow your property.
            </Text>
          </YStack>
          <XStack gap="$2" items="center">
            <View
              width={32}
              height={32}
              rounded={16}
              bg="rgba(255,255,255,0.2)"
              items="center"
              justify="center"
            >
              <Sparkles size={16} color="white" />
            </View>
            <Text color="white" fontWeight="600">
              Expert-backed services
            </Text>
          </XStack>
        </YStack>
      </View>

      {/* Content Section */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack p="$4" gap="$4">
          <Text fontSize={16} fontWeight="600" color="$color">
            We have a suite of services designed for every step of your journey.
          </Text>

          {isLoading ? (
            <YStack items="center" justify="center" py="$6">
              <Spinner size="large" color="$blue9" />
            </YStack>
          ) : services.length === 0 ? (
            <YStack items="center" justify="center" py="$8" gap="$3">
              <Text fontSize={16} fontWeight="600" color="$color8">
                No services available
              </Text>
              <Text fontSize={14} color="$color8" textAlign="center">
                Services will appear here once they are added.
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  asChild
                >
                  <Pressable
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <YStack
                      bg="$background"
                      rounded="$6"
                      overflow="hidden"
                      borderColor="$borderColor"
                      borderWidth={1}
                    >
                      <XStack items="center" gap="$3" p="$3">
                        <View
                          width={92}
                          height={70}
                          rounded="$4"
                          overflow="hidden"
                        >
                          <Image
                            source={{ uri: service.imageUrl }}
                            style={{
                              width: "100%",
                              height: "100%",
                              resizeMode: "cover",
                            }}
                          />
                        </View>
                        <YStack flex={1} gap="$1">
                          <Text fontSize={16} fontWeight="700" color="$color">
                            {service.title}
                          </Text>
                          <Text fontSize="$3" color="$color8">
                            Learn more about this service
                          </Text>
                        </YStack>
                        <ChevronRight size={20} color="$color8" />
                      </XStack>
                    </YStack>
                  </Pressable>
                </Link>
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* FAB for admins */}
      {isAdmin && (
        <Pressable
          onPress={() => router.push("/create-service")}
          style={{
            position: "absolute",
            bottom: insets.bottom + 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#3B82F6",
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Plus size={24} color="white" />
        </Pressable>
      )}
    </YStack>
  );
}
