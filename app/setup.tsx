import { Button, Text, XStack, YStack, View } from "tamagui";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ScrollView } from "react-native";
import { SetupAccountType } from "components/setup/setup-account-type";
import { SetupRole } from "components/setup/setup-role";
import { SetupLocation } from "components/setup/setup-location";
import { SetupProfile } from "components/setup/setup-profile";
import { SetupInterests } from "components/setup/setup-interests";
import { ArrowLeft, ArrowRight, CheckCircle } from "@tamagui/lucide-icons-2";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetupScreen() {
  const [step, setStep] = useState(1);
  const { completeSetup } = useAuth();
  const [accountType, setAccountType] = useState<
    "Individual" | "Company" | null
  >(null);
  const [role, setRole] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const prevStep = useRef(step);
  const totalSteps = 5;

  const canProceed =
    (step === 1 && accountType !== null) ||
    (step === 2 && role !== null) ||
    (step === 3 && location.trim().length > 0) ||
    (step === 4 && firstName.trim().length > 0 && lastName.trim().length > 0) ||
    (step === 5 && interests.length > 0);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, totalSteps));
  }, []);

  useEffect(() => {
    const direction = step > prevStep.current ? 1 : -1;
    fadeAnim.setValue(0);
    slideAnim.setValue(12 * direction);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    prevStep.current = step;
  }, [step, fadeAnim, slideAnim]);

  async function updateInfo() {
    await completeSetup({
      accountType: accountType ?? "Individual",
      role: role ?? "client",
      location,
      firstName,
      lastName,
      interests,
    });
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1}>
        {/* Header */}
        <YStack px="$5" pt="$4" pb="$2" gap="$3">
          <XStack items="center" justify="space-between">
            {step > 1 ? (
              <Button
                size="$3"
                circular
                variant="outlined"
                onPress={() => setStep(step - 1)}
                icon={<ArrowLeft size={18} />}
              />
            ) : (
              <View width={36} />
            )}
            <Text fontSize="$3" color="$color8" fontWeight="500">
              {step} of {totalSteps}
            </Text>
            <View width={36} />
          </XStack>

          {/* Progress bar */}
          <XStack gap="$1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <YStack
                key={i}
                flex={1}
                height={4}
                rounded="$10"
                bg={i < step ? "$blue9" : "$borderColor"}
              />
            ))}
          </XStack>
        </YStack>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} px="$5" pt="$4">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: "100%",
              }}
            >
              {step === 1 && (
                <SetupAccountType
                  value={accountType}
                  onChange={(v) => {
                    setAccountType(v);
                    setTimeout(goNext, 300);
                  }}
                />
              )}

              {step === 2 && (
                <SetupRole
                  value={role}
                  onChange={(v) => {
                    setRole(v);
                    setTimeout(goNext, 300);
                  }}
                />
              )}

              {step === 3 && (
                <SetupLocation
                  value={location}
                  onChange={setLocation}
                  onSelectQuick={(v) => {
                    setLocation(v);
                    setTimeout(goNext, 300);
                  }}
                />
              )}

              {step === 4 && (
                <SetupProfile
                  firstName={firstName}
                  lastName={lastName}
                  onChangeFirstName={setFirstName}
                  onChangeLastName={setLastName}
                />
              )}

              {step === 5 && (
                <SetupInterests value={interests} onChange={setInterests} />
              )}
            </Animated.View>
          </YStack>
        </ScrollView>

        {/* Bottom controls */}
        <YStack
          position="absolute"
          b={0}
          l={0}
          r={0}
          py="$4"
          px="$5"
          bg="$background"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          gap="$3"
        >
          {step < 5 ? (
            <Button
              size="$5"
              bg={canProceed ? "$blue9" : "$color4"}
              rounded="$4"
              onPress={goNext}
              disabled={!canProceed}
              iconAfter={<ArrowRight size={18} color="white" />}
            >
              <Button.Text
                fontWeight="700"
                color="white"
              >
                Continue
              </Button.Text>
            </Button>
          ) : (
            <Button
              size="$5"
              bg={canProceed ? "$green9" : "$color4"}
              rounded="$4"
              onPress={() => updateInfo()}
              disabled={!canProceed}
              iconAfter={<CheckCircle size={18} color="white" />}
            >
              <Button.Text
                fontWeight="700"
                color="white"
              >
                Finish
              </Button.Text>
            </Button>
          )}
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
