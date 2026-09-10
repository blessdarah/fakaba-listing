import {
  YStack,
  XStack,
  Text,
  View,
  Button,
  Image,
  Spinner,
} from "tamagui";
import {
  ChevronLeft,
  Plus,
  Eye,
  EyeOff,
  Trash2,
} from "@tamagui/lucide-icons-2";
import { Pressable, FlatList, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastController } from "@tamagui/toast";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "lib/i18n/useTranslation";
import {
  useMyListings,
  useUpdateListingStatus,
  useDeleteListing,
} from "lib/query/useListings";
import type { Listing } from "lib/types";

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToastController();
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.uid ?? "";

  const { data: listings = [], isLoading } = useMyListings(userId);
  const updateStatusMutation = useUpdateListingStatus(userId);
  const deleteListingMutation = useDeleteListing(userId);

  const handleToggleStatus = (listing: Listing) => {
    const newStatus = listing.status === "active" ? "inactive" : "active";
    updateStatusMutation.mutate(
      { id: listing.id, status: newStatus },
      {
        onSuccess: () => {
          toast.show(
            newStatus === "active"
              ? t("myListings.publishSuccess")
              : t("myListings.unpublishSuccess")
          );
        },
        onError: () => {
          toast.show(t("common.error"), {
            message: t("myListings.statusError"),
          });
        },
      }
    );
  };

  const handleDelete = (listing: Listing) => {
    Alert.alert(
      t("myListings.deleteConfirmTitle"),
      t("myListings.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            deleteListingMutation.mutate(listing.id, {
              onSuccess: () => {
                toast.show(t("myListings.deleteSuccess"));
              },
              onError: () => {
                toast.show(t("common.error"), {
                  message: t("myListings.deleteError"),
                });
              },
            });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const isActive = item.status === "active";
    const thumbUri = item.imageUrls?.[0];
    const pricing =
      item.type === "rent"
        ? `${item.price / 1000}k/mo`
        : `${item.price / 1000}k`;

    return (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        rounded="$5"
        bg="$background"
        overflow="hidden"
      >
        <Pressable
          onPress={() =>
            router.push({ pathname: "/(tabs)/(listings)/[id]", params: { id: item.id } })
          }
        >
          <XStack gap="$3" p="$3" items="center">
            {thumbUri ? (
              <Image
                src={thumbUri}
                width={72}
                height={72}
                rounded="$4"
              />
            ) : (
              <View
                width={72}
                height={72}
                rounded="$4"
                bg="$color3"
                items="center"
                justify="center"
              >
                <Text color="$color8" fontSize="$2">
                  No image
                </Text>
              </View>
            )}
            <YStack flex={1} gap="$1">
              <Text fontWeight="700" fontSize="$4" numberOfLines={1}>
                {item.title}
              </Text>
              <Text color="$color8" fontSize="$2" numberOfLines={1}>
                {item.location}
                {item.address ? ` — ${item.address}` : ""}
              </Text>
              <XStack gap="$2" items="center">
                <Text fontWeight="700" color="$blue9" fontSize="$3">
                  {pricing} FCFA
                </Text>
                <View
                  px="$2"
                  py="$0.5"
                  rounded="$10"
                  bg={isActive ? "$green3" : "$color3"}
                >
                  <Text
                    fontSize="$1"
                    fontWeight="600"
                    color={isActive ? "$green9" : "$color8"}
                  >
                    {isActive
                      ? t("myListings.active")
                      : t("myListings.inactive")}
                  </Text>
                </View>
              </XStack>
            </YStack>
          </XStack>
        </Pressable>

        {/* Action buttons */}
        <XStack
          borderTopWidth={1}
          borderTopColor="$borderColor"
          px="$3"
          py="$2"
          gap="$2"
        >
          <Button
            flex={1}
            size="$3"
            bg={isActive ? "$color3" : "$blue3"}
            rounded="$3"
            onPress={() => handleToggleStatus(item)}
            icon={
              isActive ? (
                <EyeOff size={14} color={isActive ? "$color" : "$blue9"} />
              ) : (
                <Eye size={14} color="$blue9" />
              )
            }
          >
            <Button.Text
              fontSize="$2"
              fontWeight="600"
              color={isActive ? "$color" : "$blue9"}
            >
              {isActive
                ? t("myListings.unpublish")
                : t("myListings.publish")}
            </Button.Text>
          </Button>
          <Button
            size="$3"
            bg="$red3"
            rounded="$3"
            onPress={() => handleDelete(item)}
            icon={<Trash2 size={14} color="$red9" />}
          >
            <Button.Text fontSize="$2" fontWeight="600" color="$red9">
              {t("myListings.deleteListing")}
            </Button.Text>
          </Button>
        </XStack>
      </YStack>
    );
  };

  return (
    <View flex={1} bg="$background">
      {/* Header */}
      <XStack
        pt={insets.top + 8}
        pb="$3"
        px="$4"
        items="center"
        gap="$3"
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} color="$color" />
        </Pressable>
        <Text fontSize="$6" fontWeight="700" flex={1}>
          {t("myListings.title")}
        </Text>
        <Pressable onPress={() => router.push("/create-listing")} hitSlop={10}>
          <View
            width={36}
            height={36}
            rounded={18}
            bg="$blue9"
            items="center"
            justify="center"
          >
            <Plus size={18} color="white" />
          </View>
        </Pressable>
      </XStack>

      {isLoading ? (
        <View flex={1} items="center" justify="center">
          <Spinner size="large" color="$blue8" />
        </View>
      ) : listings.length === 0 ? (
        <YStack flex={1} items="center" justify="center" gap="$3" px="$6">
          <Text color="$color8" fontSize="$4" text="center">
            {t("myListings.empty")}
          </Text>
          <Button
            size="$4"
            bg="$blue9"
            rounded="$4"
            onPress={() => router.push("/create-listing")}
            icon={<Plus size={18} color="white" />}
          >
            <Button.Text color="white" fontWeight="700">
              {t("myListings.createFirst")}
            </Button.Text>
          </Button>
        </YStack>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
