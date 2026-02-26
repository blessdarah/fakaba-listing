import { YStack, H1, Text } from "tamagui";
import { Pressable, StatusBar, useColorScheme } from "react-native";
import { Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "@tamagui/lucide-icons";
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <YStack flex={1} bg="$background" p={0} m={0}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      {/* Hero Section */}
      <YStack mt="$2">
        <YStack
          flexDirection="row"
          items="center"
          justify="space-between"
          height={Math.round(112 * 1.2) + insets.top}
          bg="white"
          borderBlockEndColor="$borderColor"
          borderBlockEndWidth={1}
          overflow="hidden"
          px="$4"
        >
          {/* Left side - Title */}
          <YStack justify="center" items="flex-start" pt={insets.top}>
            <H1 fontSize={32} fontWeight="bold" color="#1a3a52">
              Services
            </H1>
          </YStack>
          {/* Right side - Image */}
          <YStack
            width={Math.round(84 * 1.2)}
            height={Math.round(84 * 1.2)}
            overflow="hidden"
            mt={insets.top}
          >
            <Image
              source={require("../../../assets/images/service.png")}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          </YStack>
        </YStack>
      </YStack>

      {/* Content Section */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack p="$4" gap="$4">
          <Text fontSize={16} fontWeight="600" color="#333" mt="$4">
            We have a suit of services that should meet on your needs
          </Text>

          {/* Service Cards */}
          <YStack gap="$5">
            {SERVICES.map((service) => (
              <Pressable
                key={service.id.toString()}
                onPress={() => {
                  console.log("service-press", service.id);
                  router.push(`/services/${service.id}`);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <YStack
                  flexDirection="row"
                  bg="white"
                  rounded="$4"
                  items="center"
                  gap="$3"
                  borderColor="$borderColor"
                  borderWidth={1}
                  overflow="hidden"
                  hoverStyle={{ bg: "#f5f5f5" }}
                >
                  {/* Service Image */}
                  <YStack width={98} height={70} overflow="hidden">
                    <Image
                      source={service.icon}
                      style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "cover",
                      }}
                    />
                  </YStack>

                  {/* Service Title */}
                  <YStack flex={1} justify="center" p="$2">
                    <Text fontSize={16} fontWeight="600" color="#333">
                      {service.title}
                    </Text>
                  </YStack>

                  {/* Chevron */}
                  <ChevronRight size={24} color="#999" />
                </YStack>
              </Pressable>
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
