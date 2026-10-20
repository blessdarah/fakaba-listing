import {
  YStack,
  H1,
  Text,
  Button,
  ScrollView,
  XStack,
  View,
  AnimatePresence,
  Spinner,
} from "tamagui";
import { Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  ChevronLeft,
} from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useService } from "lib/query/useServices";
import { ServiceFAQ } from "lib/types";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: service, isLoading } = useService(id as string);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <Spinner size="large" color="$blue9" />
      </YStack>
    );
  }

  if (!service) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <Text>Service not found</Text>
      </YStack>
    );
  }

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <YStack flex={1} bg="$background" px={0} m={0}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <YStack height={260} overflow="hidden" position="relative">
          <Image
            source={{ uri: service.imageUrl }}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
          <View position="absolute" inset={0} bg="rgba(0,0,0,0.45)" />
          {/* Back Button */}
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
          <YStack position="absolute" bottom={16} left={16} right={16} gap="$1">
            <H1 fontSize={30} fontWeight="800" color="white">
              {service.title}
            </H1>
            <Text color="white" opacity={0.9}>
              Learn more about this service
            </Text>
          </YStack>
        </YStack>

        {/* Content Section */}
        <YStack p="$4" gap="$4">
          {/* About Service */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="700" color="$color">
              About Service
            </Text>
            <Text fontSize={14} color="$color10" lineHeight={22}>
              {service.description}
            </Text>
          </YStack>

          {/* FAQs Section */}
          {service.faqs && service.faqs.length > 0 && (
            <YStack gap="$3">
              <Text fontSize={16} fontWeight="700" color="$color">
                FAQs
              </Text>

              <YStack gap="$2">
                {service.faqs.map((faq: ServiceFAQ, index: number) => (
                  <YStack
                    key={index}
                    bg="$background"
                    rounded="$5"
                    borderColor="$borderColor"
                    borderWidth={1}
                    overflow="hidden"
                  >
                    <YStack
                      flexDirection="row"
                      items="center"
                      justify="space-between"
                      p="$4"
                      bg={
                        expandedFAQ === index
                          ? "$backgroundStrong"
                          : "$background"
                      }
                      onPress={() => toggleFAQ(index)}
                      cursor="pointer"
                    >
                      <Text fontSize={14} fontWeight="600" color="$color" flex={1}>
                        {faq.question}
                      </Text>
                      {expandedFAQ === index ? (
                        <ChevronUp size={20} color="$color8" />
                      ) : (
                        <ChevronDown size={20} color="$color8" />
                      )}
                    </YStack>

                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <YStack
                          p="$4"
                          borderTopColor="$borderColor"
                          borderTopWidth={1}
                          bg="$background"
                          animation="quick"
                          enterStyle={{ opacity: 0, scale: 0.98 }}
                          exitStyle={{ opacity: 0, scale: 0.98 }}
                        >
                          <Text fontSize={14} color="$color10" lineHeight={20}>
                            {faq.answer}
                          </Text>
                        </YStack>
                      )}
                    </AnimatePresence>
                  </YStack>
                ))}
              </YStack>
            </YStack>
          )}

          {/* Contact Button */}
          <Button
            size="$5"
            bg="$blue9"
            color="white"
            fontWeight="bold"
            rounded="$6"
            mt="$4"
            mb="$4"
          >
            <XStack items="center" gap="$2">
              <Phone size={20} color="white" />
              <Text color="white" fontWeight="bold">
                Contact us
              </Text>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
