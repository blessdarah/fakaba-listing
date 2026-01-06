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
    <YStack flex={1} p="$4" bg="$background" space="$4">
      <YStack gap="$2" p="$8">
        <H2>Settings</H2>
        <Separator />
      </YStack>

      <YStack gap="$3" pt="$4">
        <Text fontSize="$5" fontWeight="bold">
          Account
        </Text>
        {user && (
          <YStack gap="$2" bg="$white2" p="$3" rounded="$4">
            <Text color="gray">Email</Text>
            <Text fontSize="$4">{user.email}</Text>
            {user.displayName && (
              <>
                <Text color="gray" pt="$2">
                  Name
                </Text>
                <Text fontSize="$4">{user.displayName}</Text>
              </>
            )}
          </YStack>
        )}
      </YStack>

      <YStack pt="$4">
        <Button
          size="$4"
          onPress={handleSignOut}
          bg="$red10"
          pressStyle={{ bg: "$red9" }}
          color="white"
        >
          Sign Out
        </Button>
      </YStack>
    </YStack>
  );
}
