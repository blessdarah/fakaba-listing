import { Button, Text, XStack, YStack } from "tamagui";
import { useState } from "react";
import ScreenContainer from "components/ScreenContainer";
import { ScrollView } from "react-native";
import { SetupAccountType } from "components/setup/setup-account-type";
import { SetupRole } from "components/setup/setup-role";
import { SetupLocation } from "components/setup/setup-location";
import { SetupProfile } from "components/setup/setup-profile";
import { SetupInterests } from "components/setup/setup-interests";
import { ArrowLeft, ArrowRight, CheckCircle } from "@tamagui/lucide-icons";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

export default function SetupScreen() {
  const [step, setStep] = useState(1);
  const { completeSetup } = useAuth();

  function updateInfo() {
    // TODO: Update user info
    completeSetup();
    router.replace("/(tabs)");
  }

  return (
    <ScrollView>
      <ScreenContainer>
        <YStack flex={1} justify="center" items="center">
          {/* Step 1: Account type */}
          {step == 1 && <SetupAccountType />}

          {/* Step 2: User role */}
          {step == 2 && <SetupRole />}

          {/* Step 3: Location */}
          {step == 3 && <SetupLocation />}

          {/* Step 4: Profile information */}
          {step == 4 && <SetupProfile />}

          {/* Step 5: Interests */}
          {step == 5 && <SetupInterests />}

          {/* Controls  */}
          <XStack mt={"$8"} justify="space-between">
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
              >
                <Button.Text fontSize="$5" fontWeight={"bold"}>
                  Finish
                </Button.Text>
              </Button>
            )}
          </XStack>
        </YStack>
      </ScreenContainer>
    </ScrollView>
  );
}
