import { useState } from "react";
import {
  YStack,
  XStack,
  Button,
  H1,
  Text,
  Spinner,
  Circle,
  Paragraph,
  Input,
  Label,
  ScrollView,
} from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Mail, Lock, LogIn } from "@tamagui/lucide-icons-2";
import { useToastController } from "@tamagui/toast";

const { width, height } = Dimensions.get("window");

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function SignIn() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const toast = useToastController();
  const [loading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEmailSignIn = async () => {
    if (!validate()) return;

    try {
      setEmailLoading(true);
      await signInWithEmail(email.trim(), password);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      let errorMessage = "Invalid email or password.";

      switch (error?.code) {
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
      }

      toast.show("Invalid credentials", { message: errorMessage });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.show("Google Sign In Failed", {
        message: "Could not sign in with Google. Please try again.",
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
      <ScrollView
      flex={1}
      width={width}
      bg="$background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ minH: height }}
    >
      <YStack flex={1} width={width} minH={height}>
        <LinearGradient
          colors={["#4A9DEC", "#8B5CF6", "#EC4899"]}
          start={[0, 0]}
          end={[1, 1]}
          height={height * 0.35}
          width="100%"
        >
          <YStack flex={1} content="center" items="center" p="$6">
            <Circle
              size={100}
              bg="transparent"
              borderWidth={3}
              borderColor="white"
              mt="$4"
              justify="center"
              items="center"
              opacity={0.9}
            >
              <Text fontSize={50} color="white" fontWeight={700}>
                F
              </Text>
            </Circle>
            <H1 color="white" fontSize={36} fontWeight="800" items="center">
              Fakaba
            </H1>
            <Text
              color="white"
              fontSize={16}
              opacity={0.9}
              style={{ textAlign: "center" }}
            >
              Your marketplace companion
            </Text>
          </YStack>
        </LinearGradient>

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
                Welcome Back
              </H1>
              <Paragraph fontSize={16} color="gray">
                Sign in to access your account and continue your journey
              </Paragraph>
            </YStack>

            <YStack gap="$3" pt="$2">
              <YStack gap="$1">
                <Label htmlFor="signin-email" fontSize={14} fontWeight="600">
                  Email
                </Label>
                <XStack
                  borderWidth={1}
                  borderColor={errors.email ? "$red10" : "$borderColor"}
                  rounded="$6"
                  items="center"
                  px="$3"
                >
                  <Mail size={20} color={errors.email ? "$red10" : undefined} />
                  <Input
                    id="signin-email"
                    flex={1}
                    size={"$5"}
                    bg="transparent"
                    borderWidth={0}
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
                <Label htmlFor="signin-password" fontSize={14} fontWeight="600">
                  Password
                </Label>
                <XStack
                  borderWidth={1}
                  borderColor={errors.password ? "$red10" : "$borderColor"}
                  bg="$background"
                  rounded="$6"
                  items="center"
                  px="$3"
                >
                  <Lock size={20} color={errors.password ? "$red10" : "gray"} />
                  <Input
                    id="signin-password"
                    size={"$5"}
                    flex={1}
                    bg="$colorTransparent"
                    borderWidth={0}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="current-password"
                  />
                </XStack>
                {errors.password ? (
                  <Text color="$red10" fontSize={12} pl="$1" pt="$1">
                    {errors.password}
                  </Text>
                ) : null}
              </YStack>
            </YStack>
          </YStack>

          <YStack gap="$3" pb="$4">
            <Button
              size="$5"
              onPress={handleEmailSignIn}
              disabled={emailLoading || loading || googleLoading}
              bg="$blue10"
              rounded="$6"
              height={56}
              icon={emailLoading ? <Spinner color="white" /> : undefined}
              shadowColor="$blue10"
              shadowOpacity={0.3}
              shadowRadius={10}
            >
              <Button.Text
                fontSize="$4"
                fontWeight="bold"
                text="center"
                transform="uppercase"
              >
                {emailLoading ? "Signing in..." : "Sign In"}
              </Button.Text>
              <Button.Icon>
                <LogIn size={20} />
              </Button.Icon>
            </Button>

            {/* Divider */}
            <XStack items="center" gap="$3" py="$1">
              <XStack flex={1} height={1} bg="$borderColor" />
              <Text fontSize={13} color="$color8">
                or
              </Text>
              <XStack flex={1} height={1} bg="$borderColor" />
            </XStack>

            {/* Google sign-in */}
            <Button
              size="$5"
              onPress={handleGoogleSignIn}
              disabled={emailLoading || loading || googleLoading}
              bg="$background"
              borderWidth={1}
              borderColor="$borderColor"
              rounded="$6"
              height={56}
              icon={googleLoading ? <Spinner color="$color" /> : undefined}
            >
              <Button.Text fontSize="$4" fontWeight="600" color="$color">
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </Button.Text>
            </Button>

            <XStack justify="center" items="center" gap="$2" pt="$2">
              <Text fontSize={14} color="gray">
                Don't have an account?
              </Text>
              <Pressable onPress={() => router.push("/sign-up")}>
                <Text fontSize={14} color="$blue10" fontWeight="600">
                  Sign up
                </Text>
              </Pressable>
            </XStack>
            <XStack justify="center" items="center" gap="$2">
              <Text fontSize={12} color="gray">
                Testing only:
              </Text>
              <Pressable onPress={() => router.push("/setup")}>
                <Text fontSize={12} color="$blue10" fontWeight="600">
                  Go to setup
                </Text>
              </Pressable>
            </XStack>

            <Text
              fontSize={12}
              color="gray"
              px="$4"
              lineHeight={18}
              style={{ textAlign: "center" }}
            >
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </YStack>
        </YStack>
      </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
