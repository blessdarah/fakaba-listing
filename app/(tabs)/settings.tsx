import { YStack, Text, Button, H2, Separator } from "tamagui";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { Alert } from "react-native";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <YStack flex={1} padding="$4" bg="$background" space="$4">
      <YStack space="$2" paddingTop="$8">
        <H2>Settings</H2>
        <Separator />
      </YStack>

      <YStack space="$3" paddingTop="$4">
        <Text fontSize="$5" fontWeight="bold">
          Account
        </Text>
        {user && (
          <YStack space="$2" backgroundColor="$gray2" padding="$3" borderRadius="$4">
            <Text color="$gray11">Email</Text>
            <Text fontSize="$4">{user.email}</Text>
            {user.displayName && (
              <>
                <Text color="$gray11" paddingTop="$2">
                  Name
                </Text>
                <Text fontSize="$4">{user.displayName}</Text>
              </>
            )}
          </YStack>
        )}
      </YStack>

      <YStack paddingTop="$4">
        <Button
          size="$4"
          onPress={handleSignOut}
          backgroundColor="$red10"
          pressStyle={{ backgroundColor: "$red9" }}
          color="white"
        >
          Sign Out
        </Button>
      </YStack>
    </YStack>
  );
}
