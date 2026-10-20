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
import { KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Mail, Key, LogIn } from "@tamagui/lucide-icons-2";
import { useToastController } from "@tamagui/toast";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignUp() {
  const { signUpWithEmail, signUpWithGoogle } = useAuth();
  const toast = useToastController();
  const [loading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password && confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEmailSignUp = async () => {
    if (!validate()) return;

    try {
      setEmailLoading(true);
      await signUpWithEmail(email.trim(), password);
    } catch (error: any) {
      console.error("Email sign up error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      switch (error?.code) {
        case "auth/email-already-in-use":
        case "auth/invalid-email":
          errorMessage = "Unable to create account with this email.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
      }

      toast.show("Sign Up Error", { message: errorMessage });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signUpWithGoogle();
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast.show("Google Sign Up Failed", {
        message: "Could not sign up with Google. Please try again.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
            <Label htmlFor="signup-email" fontSize={14} fontWeight="600">
              Email address
            </Label>
            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor={errors.email ? "$red10" : "$borderColor"}
              rounded="$6"
              px="$3"
            >
              <Mail size={20} color={errors.email ? "$red10" : undefined} />
              <Input
                flex={1}
                id="signup-email"
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Enter your email"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </XStack>
            {errors.email ? (
              <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                {errors.email}
              </Text>
            ) : null}
          </YStack>

          <YStack gap="$1">
            <Label htmlFor="signup-password" fontSize={14} fontWeight="600">
              Password
            </Label>
            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor={errors.password ? "$red10" : "$borderColor"}
              rounded="$6"
              px="$3"
            >
              <Key size={20} color={errors.password ? "$red10" : undefined} />
              <Input
                id="signup-password"
                flex={1}
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Enter your password"
                placeholderTextColor="$placeholderColor"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            </XStack>
            {errors.password ? (
              <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                {errors.password}
              </Text>
            ) : null}
          </YStack>

          <YStack gap="$1">
            <Label htmlFor="signup-confirmPassword" fontSize={14} fontWeight="600">
              Confirm Password
            </Label>

            <XStack
              pt="$1"
              items="center"
              borderWidth={1}
              borderColor={errors.confirmPassword ? "$red10" : "$borderColor"}
              rounded="$6"
              px="$3"
            >
              <Key size={20} color={errors.confirmPassword ? "$red10" : undefined} />
              <Input
                id="signup-confirmPassword"
                flex={1}
                bg="$colorTransparent"
                borderWidth={0}
                size={"$5"}
                placeholder="Confirm your password"
                placeholderTextColor="$placeholderColor"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: undefined }));
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            </XStack>
            {errors.confirmPassword ? (
              <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </YStack>
        </YStack>

        <Button
          size="$5"
          onPress={handleEmailSignUp}
          disabled={emailLoading || loading || googleLoading}
          bg="$blue10"
          rounded="$6"
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

        {/* Divider */}
        <XStack items="center" gap="$3">
          <XStack flex={1} height={1} bg="$borderColor" />
          <Text fontSize={13} color="$color8">
            or
          </Text>
          <XStack flex={1} height={1} bg="$borderColor" />
        </XStack>

        {/* Google sign-up */}
        <Button
          size="$5"
          onPress={handleGoogleSignUp}
          disabled={emailLoading || loading || googleLoading}
          bg="$background"
          borderWidth={1}
          borderColor="$borderColor"
          rounded="$6"
          icon={googleLoading ? <Spinner color="$color" /> : undefined}
        >
          <Button.Text fontSize="$4" fontWeight="600" color="$color">
            {googleLoading ? "Creating account..." : "Continue with Google"}
          </Button.Text>
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
    </KeyboardAvoidingView>
  );
}
