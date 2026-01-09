import React from "react";
import {
  Sheet,
  Avatar,
  Text,
  View,
  XStack,
  YStack,
  Input,
  Button,
  H5,
  Select,
  Separator,
  ScrollView,
} from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeCategories from "components/HomeCategories";
import HorizontalListing from "components/HorizontalListing";
import { Search, Sliders } from "@tamagui/lucide-icons";
import ScreenContainer from "components/ScreenContainer";
import { getListings } from "lib/firestore/listings";
import { useAuth } from "contexts/AuthContext";
import { Alert, StatusBar, useColorScheme } from "react-native";
import { Listing } from "lib/types";
import { useRouter } from "expo-router";
import { useTranslation } from "lib/i18n/useTranslation";

export default function TabOneScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState("rental");
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError(null);
        const fetchedListings = await getListings();
        console.log("listings: ", fetchedListings);
        setListings(fetchedListings);
      } catch (error: any) {
        console.error("Failed to load listings:", error);
        setError(error.message || "Failed to load listings");

        if (error.message.includes("Permission denied")) {
          Alert.alert(
            t("errors.authRequired"),
            t("errors.authRequiredMessage"),
            [{ text: t("common.ok") }]
          );
        } else {
          Alert.alert(
            t("common.error"),
            error.message || t("errors.loadListingsError"),
            [{ text: t("common.ok") }]
          );
        }
      } finally {
        setLoading(false);
      }
    }

    // Load public listings (no authentication required)
    loadListings();
  }, [user]);

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer>
          <XStack items="center" justify="space-between" width="100%">
            <YStack gap="$1.5">
              <Text fontSize="$7" fontWeight={"bold"}>
                {user?.isAnonymous || !user?.displayName
                  ? t("home.defaultGreeting")
                  : t("home.greeting", { name: user.displayName })}
              </Text>
              <Text fontSize="$5">{t("home.welcomeBack")}</Text>
            </YStack>

            <Avatar circular size="$4.5" borderColor="$blue10" borderWidth={2}>
              <Avatar.Image src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80" />
              <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
            </Avatar>
          </XStack>

          <XStack
            justify="space-between"
            items={"center"}
            width="100%"
            gap="$2"
            my="$3"
          >
            {/* <Search size="$1" color="$color" mr="$4" /> */}
            <View
              width="100%"
              items="center"
              flexDirection="row"
              justify="center"
              mb="$4"
              bg="#ececec"
              borderColor="$borderColor"
              rounded={100}
              borderWidth={1}
            >
              <Input
                flex={1}
                placeholder="Search property"
                bg="transparent"
                color="#333"
                borderWidth={0}
              />
              <Button
                rounded={100}
                size="$3"
                mr="$1.5"
                bg="white"
                onPress={() => router.push("/(modals)/filter")}
                icon={<Sliders size={12} />}
              ></Button>
            </View>
          </XStack>

          <View width="100%" items="center" justify="center" mb="$4">
            <HomeCategories />
          </View>

          <View width="100%" items="center" justify="center" mb="$4">
            <HorizontalListing
              title={t("home.popularRentals")}
              listings={listings}
              loading={loading}
              error={error}
            />
          </View>

          <View width="100%" items="center" justify="center" mb="$4">
            <HorizontalListing
              title={t("home.popularOnSale")}
              listings={listings}
              loading={loading}
              error={error}
            />
          </View>

          {/* bottom sheet */}
          <Sheet
            open={open}
            forceRemoveScrollEnabled={open}
            modal={true}
            onOpenChange={setOpen}
            snapPoints={[85, 50, 25]}
            snapPointsMode={"percent"}
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="medium"
          >
            <Sheet.Overlay
              animation="lazy"
              bg="$shadow6"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Sheet.Handle />
            <Sheet.Frame>
              <Sheet.ScrollView p="$4">
                <H5>{t("filter.title")}</H5>
                <Separator my="$2" />
                {/* <XStack gap="$4"> */}
                <Text>Type</Text>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <Select.Trigger>
                    <Select.Value placeholder={t("filter.selectType")} />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.ScrollUpButton />
                    <Select.Viewport>
                      <Select.Group>
                        <Select.Label>{t("filter.propertyType")}</Select.Label>
                        <Select.Item index={0} key={"rental"} value="rental">
                          <Select.ItemText>
                            {t("filter.rental")}
                          </Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} key={"sale"} value="sale">
                          <Select.ItemText>{t("filter.sale")}</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} key={"lease"} value="lease">
                          <Select.ItemText>{t("filter.lease")}</Select.ItemText>
                        </Select.Item>
                      </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton />
                  </Select.Content>
                </Select>
                {/* </XStack> */}
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </ScreenContainer>
      </ScrollView>
    </>
  );
}
