import { useState } from "react";
import {
  YStack,
  XStack,
  Button,
  H1,
  Text,
  Spinner,
  Circle,
  Input,
  Label,
  ScrollView,
  Paragraph,
} from "tamagui";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { Alert, Dimensions, Pressable } from "react-native";
import { Mail, Lock } from "@tamagui/lucide-icons";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const { signUpWithGoogle, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert(
        "Sign Up Error",
        "Failed to create account with Google. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      setEmailLoading(true);
      await signUpWithEmail(email, password);
    } catch (error: any) {
      console.error("Email sign up error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      }

      Alert.alert("Sign Up Error", errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <ScrollView
      flex={1}
      width={width}
      bg="$background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ minH: height }}
    >
      <YStack flex={1} width={width} minH={height}>
        <YStack flex={1} justify="center" items="center" p="$6">
          <Circle
            size={100}
            bg="transparent"
            borderWidth={3}
            borderColor="white"
            mb="$4"
            justify="center"
            items="center"
            opacity={0.9}
          >
            <Text fontSize={50} color="white">
              F
            </Text>
          </Circle>
          <H1 color="white" fontSize={36} fontWeight="800" text="center">
            Fakaba
          </H1>
          <Text color="white" fontSize={16} opacity={0.9} text="center" mt="$2">
            Your marketplace companion
          </Text>
        </YStack>
        <YStack
          flex={1}
          bg="$background"
          borderTopLeftRadius="$8"
          borderTopRightRadius="$8"
          mt={-30}
          p="$6"
          gap="$4"
        >
          <YStack gap="$4" pt="$4">
            <YStack>
              <H1 fontSize={28} fontWeight="700">
                Create Account
              </H1>
              <Paragraph size="$5">
                Join our community and start exploring amazing opportunities
              </Paragraph>
            </YStack>

            <YStack gap="$3" pt="$2">
              <YStack gap="$2">
                <Label htmlFor="email" fontSize={14} fontWeight="600">
                  Email
                </Label>
                <XStack
                  bg="$white1"
                  borderWidth={1}
                  borderColor="$borderColor"
                  rounded="$4"
                  items="center"
                  px="$3"
                  height={50}
                >
                  <Mail size={20} color="gray" />
                  <Input
                    id="email"
                    flex={1}
                    borderWidth={0}
                    bg="transparent"
                    color="black"
                    placeholderTextColor="black"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Label htmlFor="password" fontSize={14} fontWeight="600">
                  Password
                </Label>
                <XStack
                  bg="$white1"
                  borderWidth={1}
                  borderColor="$borderColor"
                  rounded="$4"
                  items="center"
                  px="$3"
                  height={50}
                >
                  <Lock size={20} color="gray" />
                  <Input
                    id="password"
                    flex={1}
                    borderWidth={0}
                    bg="transparent"
                    placeholder="Enter your password"
                    placeholderTextColor="black"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Label htmlFor="confirmPassword" fontSize={14} fontWeight="600">
                  Confirm Password
                </Label>
                <XStack
                  bg="$white1"
                  borderWidth={1}
                  borderColor="$borderColor"
                  rounded="$4"
                  items="center"
                  px="$3"
                  height={50}
                >
                  <Lock size={20} color="gray" />
                  <Input
                    id="confirmPassword"
                    flex={1}
                    borderWidth={0}
                    bg="transparent"
                    placeholder="Confirm your password"
                    placeholderTextColor="black"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </XStack>
              </YStack>
            </YStack>
          </YStack>

          <YStack gap="$3" pb="$4">
            <Button
              size="$5"
              onPress={handleEmailSignUp}
              disabled={emailLoading || loading}
              bg="$blue10"
              pressStyle={{
                bg: "pink",
                scale: 0.98,
              }}
              rounded="$6"
              height={56}
              icon={emailLoading ? <Spinner color="white" /> : undefined}
              // text={16}
              // elevate
              shadowColor="$blue8"
              shadowOpacity={0.3}
              shadowRadius={10}
            >
              {emailLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <XStack items="center" gap="$3">
              <YStack flex={1} height={1} bg="$borderColor" />
              <Text fontSize={14} color="gray">
                OR
              </Text>
              <YStack flex={1} height={1} bg="$borderColor" />
            </XStack>

            <Button
              size="$5"
              onPress={handleGoogleSignUp}
              disabled={loading || emailLoading}
              bg="white"
              borderWidth={1}
              borderColor="$borderColor"
              pressStyle={{
                bg: "$white2",
                scale: 0.98,
              }}
              rounded="$6"
              height={56}
              icon={loading ? <Spinner /> : undefined}
            >
              {loading ? "Creating account..." : "Sign up with Google"}
            </Button>

            <XStack justify="center" items="center" gap="$2" pt="$2">
              <Text fontSize={14} color="gray">
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push("/sign-in")}>
                <Text fontSize={14} color="$blue10" fontWeight="600">
                  Sign in
                </Text>
              </Pressable>
            </XStack>

            <Text
              fontSize={12}
              color="gray"
              text="center"
              px="$4"
              lineHeight={18}
            >
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
