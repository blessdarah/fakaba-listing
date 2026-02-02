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
  Paragraph,
  Input,
  Label,
  ScrollView,
} from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";
import { Alert, Dimensions, Pressable } from "react-native";
import { Mail, Lock } from "@tamagui/lucide-icons";

const { width, height } = Dimensions.get("window");

export default function SignIn() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert(
        "Sign In Error",
        "Failed to sign in with Google. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmail(email, password);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      let errorMessage = "Failed to sign in. Please try again.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }

      Alert.alert("Sign In Error", errorMessage);
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
                  <Mail size={20} />
                  <Input
                    id="email"
                    flex={1}
                    bg="transparent"
                    borderWidth={0}
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
                    value={password}
                    onChangeText={setPassword}
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
              onPress={handleEmailSignIn}
              disabled={emailLoading || loading}
              bg="$blue10"
              pressStyle={{
                bg: "$blue9",
                scale: 0.98,
              }}
              rounded="$6"
              height={56}
              icon={emailLoading ? <Spinner color="white" /> : undefined}
              shadowColor="$blue10"
              shadowOpacity={0.3}
              shadowRadius={10}
            >
              <Text fontSize="$4" fontWeight="bold">
                {emailLoading ? "Signing in..." : "Sign In"}
              </Text>
            </Button>

            <XStack items="center" gap="$3">
              <YStack flex={1} height={1} bg="$borderColor" />
              <Text fontSize={14} color="$white8">
                OR
              </Text>
              <YStack flex={1} height={1} bg="$borderColor" />
            </XStack>

            <Button
              size="$5"
              onPress={handleGoogleSignIn}
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
              {loading ? "Signing in..." : "Continue with Google"}
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
  );
}
