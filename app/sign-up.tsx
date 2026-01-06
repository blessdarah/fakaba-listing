import { useState } from "react";
import {
  YStack,
  XStack,
  Button,
  H1,
  Text,
  Spinner,
  Circle,
  useTheme,
} from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { Alert, Dimensions, Pressable } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const { signUpWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert(
        "Sign Up Error",
        "Failed to create account with Google. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} width={width} height={height} backgroundColor="$background">
      <LinearGradient
        colors={["#EC4899", "#8B5CF6", "#4A9DEC"]}
        start={[0, 0]}
        end={[1, 1]}
        flex={0.4}
        width="100%"
      >
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Circle
            size={100}
            backgroundColor="$backgroundTransparent"
            borderWidth={3}
            borderColor="white"
            marginBottom="$4"
            justifyContent="center"
            alignItems="center"
            opacity={0.9}
          >
            <Text fontSize={50} color="white">
              F
            </Text>
          </Circle>
          <H1 color="white" fontSize={36} fontWeight="800" textAlign="center">
            Fakaba
          </H1>
          <Text color="white" fontSize={16} opacity={0.9} textAlign="center" marginTop="$2">
            Your marketplace companion
          </Text>
        </YStack>
      </LinearGradient>

      <YStack
        flex={0.6}
        backgroundColor="$background"
        borderTopLeftRadius="$8"
        borderTopRightRadius="$8"
        marginTop={-30}
        padding="$6"
        justifyContent="space-between"
      >
        <YStack space="$4" paddingTop="$6">
          <YStack space="$2">
            <H1 fontSize={28} fontWeight="700">
              Create Account
            </H1>
            <Text fontSize={16} color="$gray11" lineHeight={24}>
              Join our community and start exploring amazing opportunities
            </Text>
          </YStack>

          <YStack space="$3" paddingTop="$4">
            <XStack space="$3" alignItems="center">
              <Circle size={8} backgroundColor="$pink10" />
              <Text fontSize={15} color="$gray11">
                Quick and secure setup
              </Text>
            </XStack>
            <XStack space="$3" alignItems="center">
              <Circle size={8} backgroundColor="$purple10" />
              <Text fontSize={15} color="$gray11">
                Save your favorite listings
              </Text>
            </XStack>
            <XStack space="$3" alignItems="center">
              <Circle size={8} backgroundColor="$blue10" />
              <Text fontSize={15} color="$gray11">
                Get personalized recommendations
              </Text>
            </XStack>
          </YStack>
        </YStack>

        <YStack space="$4" paddingBottom="$4">
          <Button
            size="$5"
            onPress={handleGoogleSignUp}
            disabled={loading}
            backgroundColor="$pink10"
            pressStyle={{
              backgroundColor: "$pink9",
              scale: 0.98,
            }}
            borderRadius="$6"
            height={56}
            icon={loading ? <Spinner color="white" /> : undefined}
            fontWeight="600"
            fontSize={16}
            elevate
            shadowColor="$pink10"
            shadowOpacity={0.3}
            shadowRadius={10}
          >
            {loading ? "Creating account..." : "Sign up with Google"}
          </Button>

          <XStack justifyContent="center" alignItems="center" space="$2" paddingTop="$2">
            <Text fontSize={14} color="$gray11">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text fontSize={14} color="$pink10" fontWeight="600">
                Sign in
              </Text>
            </Pressable>
          </XStack>

          <Text
            fontSize={12}
            color="$gray10"
            textAlign="center"
            paddingHorizontal="$4"
            lineHeight={18}
          >
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}