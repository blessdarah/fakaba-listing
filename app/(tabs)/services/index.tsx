import { YStack, H1, Text, XStack, View } from "tamagui";
import { Pressable, StatusBar, useColorScheme } from "react-native";
import { Image, ScrollView } from "react-native";
import { Link } from "expo-router";
import { ChevronRight, Sparkles } from "@tamagui/lucide-icons-2";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SERVICES = [
  {
    id: 1,
    title: "Consulting",
    icon: require("../../../assets/images/consult.jpg"),
  },
  {
    id: 2,
    title: "Property Management",
    icon: require("../../../assets/images/pm.jpg"),
  },
  {
    id: 3,
    title: "Land certification",
    icon: require("../../../assets/images/lc.jpg"),
  },
  {
    id: 4,
    title: "Construction",
    icon: require("../../../assets/images/construction.jpg"),
  },
  {
    id: 5,
    title: "Property development",
    icon: require("../../../assets/images/pd.jpg"),
  },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

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

          {/* Service Cards */}
          <YStack gap="$3">
            {SERVICES.map((service) => (
              <Link
                key={service.id.toString()}
                href={`/services/${service.id}`}
                asChild
              >
                <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                  <YStack
                    bg="$background"
                    rounded="$6"
                    overflow="hidden"
                    borderColor="$borderColor"
                    borderWidth={1}
                  >
                    <XStack items="center" gap="$3" p="$3">
                      <View width={92} height={70} rounded="$4" overflow="hidden">
                        <Image
                          source={service.icon}
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
        </YStack>
      </ScrollView>
    </YStack>
  );
}
