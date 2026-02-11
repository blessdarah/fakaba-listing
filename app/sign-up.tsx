import { useState } from "react";
import {
  YStack,
  XStack,
  Label,
  Button,
  H1,
  Text,
  Spinner,
  Input,
  ScrollView,
  Paragraph,
} from "tamagui";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { Alert, Dimensions, Pressable } from "react-native";
import { Mail, Key, LogIn } from "@tamagui/lucide-icons";

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
    <ScrollView>
      <YStack gap="$6" p="$4" mt="$12" justify={"center"}>
        <YStack>
          <H1 fontSize={28} fontWeight="700">
            Create Account
          </H1>
          <Paragraph size="$5">
            Quickly setup your account and start exploring amazing opportunities
          </Paragraph>
        </YStack>
        <YStack gap="$3">
          <YStack gap="$1">
            <Label htmlFor="email" fontSize={14} fontWeight="600">
              Email address
            </Label>
            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor="$borderColor"
              rounded="$6"
              px="$3"
            >
              <Mail size={20} />
              <Input
                flex={1}
                id="email"
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </XStack>
          </YStack>

          <YStack gap="$1">
            <Label htmlFor="password" fontSize={14} fontWeight="600">
              Password
            </Label>
            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor="$borderColor"
              rounded="$6"
              px="$3"
            >
              <Key size={20} />
              <Input
                id="password"
                flex={1}
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Enter your password"
                placeholderTextColor="$placeholderColor"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </XStack>
          </YStack>

          <YStack gap="$1">
            <Label htmlFor="confirmPassword" fontSize={14} fontWeight="600">
              Confirm Password
            </Label>

            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor="$borderColor"
              rounded="$6"
              px="$3"
            >
              <Key size={20} />
              <Input
                id="confirmPassword"
                flex={1}
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Confirm your password"
                placeholderTextColor="$placeholderColor"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </XStack>
          </YStack>
        </YStack>

        <Button
          size="$5"
          onPress={handleEmailSignUp}
          disabled={emailLoading || loading}
          bg="$blue10"
          rounded="$6"
          // height={56}
          icon={emailLoading ? <Spinner color="white" /> : undefined}
          shadowColor="$blue8"
        >
          <Button.Text color="white" fontWeight={500} text={"center"}>
            {emailLoading ? "Creating account..." : "Sign Up"}
          </Button.Text>

          <Button.Icon>
            <LogIn size={20} />
          </Button.Icon>
        </Button>

        <XStack justify="center" items="center" gap="$2" pt="$3">
          <Text fontSize={14} color="gray">
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push("/sign-in")}>
            <Text fontSize={14} color="$blue10" fontWeight="600" px="$2">
              Sign in
            </Text>
          </Pressable>
        </XStack>

        <Text fontSize={12} color="gray" text="center" px="$4" lineHeight={18}>
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </Text>
      </YStack>
    </ScrollView>
  );
}
