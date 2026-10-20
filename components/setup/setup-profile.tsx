import { useState } from "react";
import {
  Text,
  Paragraph,
  Input,
  View,
  YStack,
  Label,
  Avatar,
  Spinner,
} from "tamagui";
import { Pressable } from "react-native";
import { Camera } from "@tamagui/lucide-icons-2";
import * as ImagePicker from "expo-image-picker";

type SetupProfileProps = {
  firstName: string;
  lastName: string;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  updateProfileImage: (uri: string) => Promise<void>;
};

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80";

export const SetupProfile = ({
  firstName,
  lastName,
  onChangeFirstName,
  onChangeLastName,
  updateProfileImage,
}: SetupProfileProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setUploading(true);
    try {
      await updateProfileImage(asset.uri);
    } catch (error) {
      console.error("Profile image upload error:", error);
      setImageUri(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Text fontSize="$8" fontWeight="800" mb="$2">
        Tell us about yourself
      </Text>
      <Paragraph color="$color8" fontSize="$4" mb="$6">
        This information will be visible on your profile
      </Paragraph>

      <YStack items="center" gap="$2" mb="$6">
        <Pressable onPress={handlePickImage} disabled={uploading}>
          <View>
            <Avatar circular size="$10" borderWidth={3} borderColor="$borderColor">
              <Avatar.Image
                aria-label="Profile"
                src={imageUri ?? PLACEHOLDER_AVATAR}
              />
              <Avatar.Fallback bg="$blue10" />
            </Avatar>
            {uploading ? (
              <View
                position="absolute"
                inset={0}
                rounded={999}
                bg="rgba(0,0,0,0.4)"
                items="center"
                justify="center"
              >
                <Spinner size="small" color="white" />
              </View>
            ) : (
              <View
                position="absolute"
                b={0}
                r={0}
                width={32}
                height={32}
                rounded={16}
                bg="$blue9"
                items="center"
                justify="center"
                borderWidth={2}
                borderColor="$background"
              >
                <Camera size={14} color="white" />
              </View>
            )}
          </View>
        </Pressable>
        <Text color="$color8" fontSize="$3">
          Tap to upload (optional)
        </Text>
      </YStack>

      <YStack gap="$4">
        <YStack gap="$2">
          <Label fontSize="$3" fontWeight="600" color="$color8">
            First name
          </Label>
          <Input
            name="firstName"
            size="$5"
            bg="$background"
            placeholder="John"
            placeholderTextColor="$color8"
            color="$color"
            borderWidth={1}
            borderColor={firstName.trim() ? "$blue8" : "$borderColor"}
            rounded="$5"
            value={firstName}
            onChangeText={onChangeFirstName}
          />
        </YStack>
        <YStack gap="$2">
          <Label fontSize="$3" fontWeight="600" color="$color8">
            Last name
          </Label>
          <Input
            name="lastName"
            size="$5"
            bg="$background"
            placeholder="Doe"
            placeholderTextColor="$color8"
            color="$color"
            borderWidth={1}
            borderColor={lastName.trim() ? "$blue8" : "$borderColor"}
            rounded="$5"
            value={lastName}
            onChangeText={onChangeLastName}
          />
        </YStack>
      </YStack>
    </View>
  );
};
