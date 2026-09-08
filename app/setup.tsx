import { Button, Text, XStack, YStack } from "tamagui";
import { useEffect, useRef, useState } from "react";
import ScreenContainer from "components/ScreenContainer";
import { Animated, ScrollView } from "react-native";
import { SetupAccountType } from "components/setup/setup-account-type";
import { SetupRole } from "components/setup/setup-role";
import { SetupLocation } from "components/setup/setup-location";
import { SetupProfile } from "components/setup/setup-profile";
import { SetupInterests } from "components/setup/setup-interests";
import { ArrowLeft, ArrowRight, CheckCircle } from "@tamagui/lucide-icons-2";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

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
  const progress = step / totalSteps;

  const canProceed =
    (step === 1 && accountType !== null) ||
    (step === 2 && role !== null) ||
    (step === 3 && location.trim().length > 0) ||
    (step === 4 && firstName.trim().length > 0 && lastName.trim().length > 0) ||
    (step === 5 && interests.length > 0);

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
    console.log("setup-values", {
      accountType,
      role,
      location,
      firstName,
      lastName,
      interests,
    });
    // TODO: Update user info online
    await completeSetup();
    router.replace("/(tabs)");
  }

  return (
    <YStack flex={1}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <ScreenContainer>
          <YStack flex={1} justify="center" items="center">
            <YStack width="100%" gap="$2" mt="$4" mb="$6">
              <Text fontSize="$4" fontWeight="600" mb="$2" color="$color">
                Step {step} of {totalSteps}
              </Text>
              <YStack
                width="100%"
                height={6}
                bg="$borderColor"
                rounded="$10"
                overflow="hidden"
              >
                <YStack
                  width={`${Math.round(progress * 100)}%`}
                  height="100%"
                  bg="$colorFocus"
                />
              </YStack>
            </YStack>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: "100%",
              }}
            >
              {/* Step 1: Account type */}
              {step == 1 && (
                <SetupAccountType
                  value={accountType}
                  onChange={setAccountType}
                />
              )}

              {/* Step 2: User role */}
              {step == 2 && <SetupRole value={role} onChange={setRole} />}

              {/* Step 3: Location */}
              {step == 3 && (
                <SetupLocation value={location} onChange={setLocation} />
              )}

              {/* Step 4: Profile information */}
              {step == 4 && (
                <SetupProfile
                  firstName={firstName}
                  lastName={lastName}
                  onChangeFirstName={setFirstName}
                  onChangeLastName={setLastName}
                />
              )}

              {/* Step 5: Interests */}
              {step == 5 && (
                <SetupInterests value={interests} onChange={setInterests} />
              )}
            </Animated.View>
          </YStack>
        </ScreenContainer>
      </ScrollView>

      {/* Controls  */}
      <XStack
        position="absolute"
        bottom={10}
        left={0}
        right={0}
        py="$6"
        px="$4"
        bg="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        justify="space-between"
      >
        {step > 1 && (
          <Button
            size={"$5"}
            onPress={() => setStep(step - 1)}
            variant="outlined"
            icon={<ArrowLeft />}
          >
            <Button.Text fontSize="$5" fontWeight={"bold"}>
              Previous
            </Button.Text>
          </Button>
        )}
        {step < 5 && (
          <Button
            size={"$5"}
            onPress={() => setStep(step + 1)}
            variant="outlined"
            icon={<ArrowRight />}
            disabled={!canProceed}
            opacity={canProceed ? 1 : 0.5}
          >
            <Button.Text fontSize="$5" fontWeight={"bold"}>
              Next
            </Button.Text>
          </Button>
        )}
        {step == 5 && (
          <Button
            size={"$5"}
            bg={"$green8"}
            onPress={() => updateInfo()}
            iconAfter={<CheckCircle />}
            disabled={!canProceed}
            opacity={canProceed ? 1 : 0.5}
          >
            <Button.Text fontSize="$5" fontWeight={"bold"}>
              Finish
            </Button.Text>
          </Button>
        )}
      </XStack>
    </YStack>
  );
}
