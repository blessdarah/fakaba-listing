import { YStack, H1, Text, Button, ScrollView } from "tamagui";
import { Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  ChevronLeft,
} from "@tamagui/lucide-icons";
import { useState } from "react";

const servicesData: Record<string, any> = {
  "1": {
    id: 1,
    title: "Consulting",
    icon: require("../../../assets/images/consult.jpg"),
    description:
      "Our consulting service allows us to provide realtime support to our clients on issues about property management, documentation and to handle all the hurdles that come with the law in our current jurisdiction.",
    faqs: [
      {
        id: 1,
        question: "Do I need to pay for all sessions?",
        answer: "Yes! All sessions require you to pay a meeting fee.",
      },
      {
        id: 2,
        question: "What is the average session duration?",
        answer:
          "Each consulting session typically lasts between 30-60 minutes depending on your specific needs.",
      },
      {
        id: 3,
        question: "Can I schedule sessions in advance?",
        answer:
          "Yes, you can schedule sessions up to 3 months in advance through our booking system.",
      },
    ],
  },
  "2": {
    id: 2,
    title: "Property Management",
    icon: require("../../../assets/images/pm.jpg"),
    description:
      "We provide comprehensive property management services including tenant screening, maintenance coordination, rent collection, and financial reporting to maximize your property's potential.",
    faqs: [
      {
        id: 1,
        question: "What does property management include?",
        answer:
          "Our service includes tenant management, maintenance, rent collection, financial reporting, and legal compliance.",
      },
      {
        id: 2,
        question: "How much does property management cost?",
        answer:
          "Management fees typically range from 8-12% of monthly rental income depending on services required.",
      },
      {
        id: 3,
        question: "Can you handle emergency repairs?",
        answer:
          "Yes, we have 24/7 emergency response for critical maintenance issues affecting tenant safety.",
      },
    ],
  },
  "3": {
    id: 3,
    title: "Land certification",
    icon: require("../../../assets/images/lc.jpg"),
    description:
      "We assist with land certification and registration services, ensuring your property has proper legal documentation and government recognition.",
    faqs: [
      {
        id: 1,
        question: "How long does land certification take?",
        answer:
          "The certification process typically takes 4-8 weeks depending on local government processing times.",
      },
      {
        id: 2,
        question: "What documents do I need?",
        answer:
          "You'll need proof of ownership, survey plans, identification documents, and any previous certificates.",
      },
      {
        id: 3,
        question: "Is land certification mandatory?",
        answer:
          "Yes, proper land certification is essential for legal ownership protection and property transactions.",
      },
    ],
  },
  "4": {
    id: 4,
    title: "Construction",
    icon: require("../../../assets/images/construction.jpg"),
    description:
      "Our construction services include project planning, supervision, quality assurance, and completion of residential and commercial projects.",
    faqs: [
      {
        id: 1,
        question: "Do you provide construction supervision?",
        answer:
          "Yes, we offer full construction supervision from planning to final inspection and handover.",
      },
      {
        id: 2,
        question: "What is the timeline for a typical construction project?",
        answer:
          "Timeline varies based on project scope, but we provide detailed schedules during project initiation.",
      },
      {
        id: 3,
        question: "Can you help with permits and approvals?",
        answer:
          "Absolutely! We handle all necessary permits, approvals, and regulatory compliance throughout the project.",
      },
    ],
  },
  "5": {
    id: 5,
    title: "Property development",
    icon: require("../../../assets/images/pd.jpg"),
    description:
      "We handle complete property development from land acquisition to final sale, including planning, design, construction, and marketing.",
    faqs: [
      {
        id: 1,
        question: "What does property development involve?",
        answer:
          "It encompasses land acquisition, design, approvals, construction, and marketing of residential or commercial properties.",
      },
      {
        id: 2,
        question: "How are investors involved?",
        answer:
          "We work with investors from conception to completion, providing regular updates and financial reports.",
      },
      {
        id: 3,
        question: "What is the ROI typically for property development?",
        answer:
          "ROI varies based on project type and location, but typically ranges from 20-40% over the development period.",
      },
    ],
  },
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const service = servicesData[id as string];
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  if (!service) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <Text>Service not found</Text>
      </YStack>
    );
  }

  const toggleFAQ = (faqId: number) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <YStack flex={1} bg="$background" px={0} m={0}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <YStack height={212} overflow="hidden" position="relative">
          <Image
            source={service.icon}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 56,
              left: 16,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 20,
              padding: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={24} color="#1a3a52" />
          </Pressable>
        </YStack>

        {/* Content Section */}
        <YStack p="$4" gap="$4">
          {/* Service Title */}
          <YStack gap="$2">
            <H1 fontSize={32} fontWeight="bold" color="#1a3a52">
              {service.title}
            </H1>
          </YStack>

          {/* About Service */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="#333">
              About Service
            </Text>
            <Text fontSize={14} color="#666" lineHeight={22}>
              {service.description}
            </Text>
          </YStack>

          {/* FAQs Section */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="#333">
              FAQs
            </Text>

            {/* FAQ Items */}
            <YStack gap="$2">
              {service.faqs.map((faq: any) => (
                <YStack
                  key={faq.id}
                  bg="white"
                  rounded="$3"
                  borderColor="$borderColor"
                  borderWidth={1}
                  overflow="hidden"
                >
                  {/* FAQ Header */}
                  <YStack
                    flexDirection="row"
                    items="center"
                    justify="space-between"
                    p="$4"
                    bg={expandedFAQ === faq.id ? "#f9f9f9" : "white"}
                    onPress={() => toggleFAQ(faq.id)}
                    cursor="pointer"
                  >
                    <Text fontSize={14} fontWeight="600" color="#333" flex={1}>
                      {faq.question}
                    </Text>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp size={20} color="#666" />
                    ) : (
                      <ChevronDown size={20} color="#666" />
                    )}
                  </YStack>

                  {/* FAQ Answer */}
                  {expandedFAQ === faq.id && (
                    <YStack
                      p="$4"
                      borderTopColor="$borderColor"
                      borderTopWidth={1}
                      bg="white"
                    >
                      <Text fontSize={14} color="#666" lineHeight={20}>
                        {faq.answer}
                      </Text>
                    </YStack>
                  )}
                </YStack>
              ))}
            </YStack>
          </YStack>

          {/* Contact Button */}
          <Button
            size="$5"
            bg="#5B6FFF"
            color="white"
            fontWeight="bold"
            rounded="$3"
            mt="$4"
            mb="$4"
          >
            <YStack flexDirection="row" items="center" gap="$2">
              <Phone size={20} color="white" />
              <Text color="white" fontWeight="bold">
                Contact us
              </Text>
            </YStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
