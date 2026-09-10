import {
  Mail,
  MapPin,
  MessageCircle,
  ChevronLeft,
  Phone,
  Building2,
  Star,
  ChevronRight,
  Pen,
  X,
} from "@tamagui/lucide-icons-2";
import ListingCardCompact from "components/ListingCardCompact";
import { StartRating } from "components/StarRating";
import { useState } from "react";
import { Linking, Alert, Pressable } from "react-native";
import {
  ScrollView,
  Separator,
  Avatar,
  YStack,
  XStack,
  Paragraph,
  Text,
  View,
  Button,
  Spinner,
  Sheet,
  Input,
} from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "lib/query/useUsers";
import { useListingsByUser } from "lib/query/useListings";
import { useReviewsByAgent, useCreateReview } from "lib/query/useReviews";
import { useAuth } from "contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { User, Review } from "lib/types";

// ---------------------------------------------------------------------------
// Avatar color palette for review cards
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
  "$blue10",
  "$green10",
  "$orange10",
  "$purple10",
  "$red10",
  "$pink10",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatReviewDate(review: Review): string {
  if (!review.createdAt?.toDate) return "Just now";
  const now = new Date();
  const date = review.createdAt.toDate();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getAgentName(agent: User | null | undefined): string {
  if (!agent) return "Agent";
  const full =
    `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim();
  return full || "Agent";
}

function getMemberSinceYear(agent: User | null | undefined): string {
  if (!agent?.createdAt) return "—";
  try {
    return new Date(agent.createdAt.toDate()).getFullYear().toString();
  } catch {
    return "—";
  }
}

// ---------------------------------------------------------------------------
// ReviewCard sub-component
// ---------------------------------------------------------------------------
function ReviewCard({ review }: { review: Review }) {
  const color = getAvatarColor(review.userName);
  const initial = review.userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <YStack bg="$color2" rounded="$5" p="$4" gap="$3">
      <XStack gap="$3" items="center">
        <Avatar circular size="$5">
          <Avatar.Fallback
            bg={color as any}
            items="center"
            justify="center"
          >
            <Text color="white" fontSize="$5" fontWeight="700">
              {initial}
            </Text>
          </Avatar.Fallback>
        </Avatar>
        <YStack flex={1} gap="$1">
          <Text fontWeight="700" fontSize="$4">
            {review.userName}
          </Text>
          <XStack gap="$2" items="center">
            <StartRating count={review.rating} />
            <View width={4} height={4} rounded={2} bg="$color7" />
            <Text color="$color8" fontSize="$2">
              {formatReviewDate(review)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
      <Paragraph fontSize="$3" color="$color10" lineHeight={22}>
        {review.comment}
      </Paragraph>
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function AgentDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: agent, isLoading: agentLoading } = useUser(id || "");
  const { data: listings = [], isLoading: listingsLoading } =
    useListingsByUser(id || "");
  const { data: reviews = [], isLoading: reviewsLoading } =
    useReviewsByAgent(id || "");
  const createReviewMutation = useCreateReview(id || "");

  const isLoading = agentLoading || listingsLoading;

  // -- Computed review stats ------------------------------------------------
  const averageRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  // -- Review sheet state ---------------------------------------------------
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      Alert.alert("Rating required", "Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert("Review required", "Please write a short review.");
      return;
    }
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to leave a review.");
      return;
    }

    const userName =
      user.displayName || user.email?.split("@")[0] || "Anonymous";

    createReviewMutation.mutate(
      {
        userId: user.uid,
        agentId: id || "",
        rating: reviewRating,
        comment: reviewText.trim(),
        userName,
      },
      {
        onSuccess: () => {
          Alert.alert("Thank you!", "Your review has been submitted.");
          setReviewRating(0);
          setReviewText("");
          setReviewSheetOpen(false);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      }
    );
  };

  const agentName = getAgentName(agent);
  const agentImage =
    agent?.profileImage ?? agent?.imageUrls?.[0] ?? null;
  const agentLocation = agent?.location || "Location not available";
  const memberSinceYear = getMemberSinceYear(agent);
  const displayedListings = listings.slice(0, 3);

  // -- Contact handlers -----------------------------------------------------
  const handleWhatsApp = () => {
    const phone = (agent as any)?.phone;
    if (!phone) {
      Alert.alert("No phone number", "This agent has not added a phone number.");
      return;
    }
    const url = `whatsapp://send?phone=${phone}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open WhatsApp.")
    );
  };

  const handleEmail = () => {
    const email = agent?.email;
    if (!email) {
      Alert.alert("No email", "This agent has not added an email address.");
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleCall = () => {
    const phone = (agent as any)?.phone;
    if (!phone) {
      Alert.alert("No phone number", "This agent has not added a phone number.");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Could not make a call.")
    );
  };

  // -- Loading state --------------------------------------------------------
  if (isLoading) {
    return (
      <View flex={1} bg="$background" items="center" justify="center">
        <Spinner size="large" color="$blue9" />
        <Text mt="$3" color="$color8" fontSize="$3">
          Loading agent profile…
        </Text>
      </View>
    );
  }

  // -- Render ---------------------------------------------------------------
  return (
    <>
    <ScrollView bg="$background" showsVerticalScrollIndicator={false}>
      {/* ================================================================= */}
      {/* HERO PROFILE                                                      */}
      {/* ================================================================= */}
      <YStack bg="$color2" pt={insets.top + 12} pb="$5" items="center">
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 12,
            left: 16,
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <ChevronLeft size={22} color="white" />
        </Pressable>

        {/* Avatar */}
        <Avatar
          circular
          size="$12"
          borderColor="#EAB308"
          borderWidth={3}
          elevation="$3"
          mt="$6"
        >
          {agentImage ? <Avatar.Image src={agentImage} /> : null}
          <Avatar.Fallback bg="$blue10" items="center" justify="center">
            <Text color="white" fontSize="$10" fontWeight="700">
              {agentName.charAt(0).toUpperCase()}
            </Text>
          </Avatar.Fallback>
        </Avatar>

        {/* Name */}
        <Text fontSize="$8" fontWeight="800" mt="$3" text="center">
          {agentName}
        </Text>

        {/* Account type badge */}
        {agent?.accountType && (
          <XStack
            bg="$blue3"
            rounded="$10"
            px="$3"
            py="$1.5"
            mt="$2"
            gap="$1.5"
            items="center"
          >
            <Building2 size={14} color="$blue9" />
            <Text color="$blue9" fontSize="$2" fontWeight="600" textTransform="capitalize">
              {agent.accountType}
            </Text>
          </XStack>
        )}

        {/* Location */}
        <XStack gap="$1.5" items="center" mt="$2">
          <MapPin size={14} color="$color8" />
          <Text color="$color8" fontSize="$3">
            {agentLocation}
          </Text>
        </XStack>

        {/* Contact row */}
        <XStack gap="$6" mt="$5">
          {/* WhatsApp */}
          <YStack items="center" gap="$1.5">
            <Pressable onPress={handleWhatsApp}>
              <View
                width={52}
                height={52}
                rounded="$10"
                bg="$green9"
                items="center"
                justify="center"
              >
                <MessageCircle size={24} color="white" />
              </View>
            </Pressable>
            <Text fontSize="$1" color="$color8">
              WhatsApp
            </Text>
          </YStack>

          {/* Email */}
          <YStack items="center" gap="$1.5">
            <Pressable onPress={handleEmail}>
              <View
                width={52}
                height={52}
                rounded="$10"
                bg="$blue9"
                items="center"
                justify="center"
              >
                <Mail size={24} color="white" />
              </View>
            </Pressable>
            <Text fontSize="$1" color="$color8">
              Email
            </Text>
          </YStack>

          {/* Call */}
          <YStack items="center" gap="$1.5">
            <Pressable onPress={handleCall}>
              <View
                width={52}
                height={52}
                rounded="$10"
                bg="$color4"
                items="center"
                justify="center"
              >
                <Phone size={24} color="$color12" />
              </View>
            </Pressable>
            <Text fontSize="$1" color="$color8">
              Call
            </Text>
          </YStack>
        </XStack>
      </YStack>

      {/* ================================================================= */}
      {/* STATS BAR                                                         */}
      {/* ================================================================= */}
      <XStack
        bg="$background"
        py="$4"
        justify="space-around"
        items="center"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        {/* Rating */}
        <YStack items="center" gap="$1">
          <XStack gap="$1.5" items="center">
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text fontSize="$6" fontWeight="700">
              {(agent as any)?.stars ?? averageRating}
            </Text>
          </XStack>
          <Text fontSize="$2" color="$color8">
            Rating
          </Text>
        </YStack>

        {/* Divider */}
        <View width={1} height={40} bg="$borderColor" />

        {/* Listings */}
        <YStack items="center" gap="$1">
          <Text fontSize="$6" fontWeight="700">
            {listings.length}
          </Text>
          <Text fontSize="$2" color="$color8">
            Listings
          </Text>
        </YStack>

        {/* Divider */}
        <View width={1} height={40} bg="$borderColor" />

        {/* Member since */}
        <YStack items="center" gap="$1">
          <Text fontSize="$6" fontWeight="700">
            {memberSinceYear}
          </Text>
          <Text fontSize="$2" color="$color8">
            Member since
          </Text>
        </YStack>
      </XStack>

      {/* ================================================================= */}
      {/* ABOUT SECTION                                                     */}
      {/* ================================================================= */}
      <YStack px="$4" pt="$5" pb="$3" gap="$3">
        <Text fontSize="$5" fontWeight="700">
          About
        </Text>
        <Paragraph fontSize="$4" color="$color10" lineHeight={24}>
          {(agent as any)?.about ||
            "This agent is committed to helping you find the right property and guiding you through the process."}
        </Paragraph>

        {/* Interests / specialties pills */}
        {agent?.interests && agent.interests.length > 0 && (
          <YStack gap="$2" mt="$2">
            <Text fontSize="$4" fontWeight="600" color="$color9">
              Specialties
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {agent.interests.map((interest) => (
                <View
                  key={interest}
                  rounded="$10"
                  bg="$color3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  px="$3"
                  py="$1.5"
                >
                  <Text fontSize="$2" color="$color10">
                    {interest}
                  </Text>
                </View>
              ))}
            </XStack>
          </YStack>
        )}
      </YStack>

      <Separator mx="$4" />

      {/* ================================================================= */}
      {/* LISTINGS SECTION                                                  */}
      {/* ================================================================= */}
      <YStack px="$4" pt="$4" pb="$3" gap="$3">
        <XStack justify="space-between" items="center">
          <Text fontSize="$5" fontWeight="700">
            Listings
          </Text>
          <Text fontSize="$3" color="$color8">
            {listings.length} {listings.length === 1 ? "property" : "properties"}
          </Text>
        </XStack>

        {listings.length === 0 ? (
          /* Empty state */
          <YStack items="center" py="$6" gap="$2">
            <Building2 size={40} color="$color6" />
            <Text color="$color8" fontSize="$4" fontWeight="600">
              No listings yet
            </Text>
            <Text color="$color7" fontSize="$3" text="center">
              This agent hasn't posted any properties.
            </Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {displayedListings.map((listing) => (
              <ListingCardCompact key={listing.id} item={listing} />
            ))}

            {listings.length > 3 && (
              <Button
                bg="$color3"
                rounded="$6"
                size="$4"
                iconAfter={<ChevronRight size={18} color="$blue9" />}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/search",
                    params: { agentId: id, agentName: agentName },
                  })
                }
              >
                <Text color="$blue9" fontWeight="600">
                  View all {listings.length} listings
                </Text>
              </Button>
            )}
          </YStack>
        )}
      </YStack>

      <Separator mx="$4" />

      {/* ================================================================= */}
      {/* REVIEWS SECTION                                                   */}
      {/* ================================================================= */}
      <YStack px="$4" pt="$4" pb="$3" gap="$4">
        <Text fontSize="$5" fontWeight="700">
          Reviews
        </Text>

        {/* Rating summary card */}
        <YStack bg="$color2" rounded="$5" p="$4" items="center" gap="$2">
          <Text fontSize="$9" fontWeight="800">
            {averageRating}
          </Text>
          <StartRating count={Math.round(averageRating)} />
          <Text color="$color8" fontSize="$3" mt="$1">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"} from verified clients
          </Text>
        </YStack>

        {/* Individual review cards */}
        {reviewsLoading ? (
          <Spinner size="small" color="$blue9" />
        ) : reviews.length === 0 ? (
          <YStack items="center" py="$4" gap="$2">
            <Text color="$color8" fontSize="$3">
              No reviews yet. Be the first to leave one!
            </Text>
          </YStack>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}

        {/* Write a review button */}
        <Button
          bg="$blue9"
          color="white"
          rounded="$6"
          size="$5"
          icon={<Pen size={18} color="white" />}
          onPress={() => setReviewSheetOpen(true)}
        >
          Write a Review
        </Button>
      </YStack>

      {/* Bottom safe area spacing */}
      <View height={insets.bottom + 40} />
    </ScrollView>

    {/* =================================================================== */}
    {/* WRITE REVIEW BOTTOM SHEET                                           */}
    {/* =================================================================== */}
    <Sheet
        modal
        open={reviewSheetOpen}
        onOpenChange={setReviewSheetOpen}
        snapPoints={[65]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay
          bg="rgba(0,0,0,0.5)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle bg="$borderColor" />
        <Sheet.Frame bg="$background" rounded="$6">
          <Sheet.ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack p="$4" gap="$5" pb="$8">
              {/* Header */}
              <XStack items="center" justify="space-between">
                <Text fontSize="$6" fontWeight="700">
                  Write a Review
                </Text>
                <Pressable onPress={() => setReviewSheetOpen(false)}>
                  <View
                    width={32}
                    height={32}
                    rounded={16}
                    bg="$color3"
                    items="center"
                    justify="center"
                  >
                    <X size={18} color="$color" />
                  </View>
                </Pressable>
              </XStack>

              {/* Agent context */}
              <XStack gap="$3" items="center">
                <Avatar circular size="$4">
                  {agentImage ? <Avatar.Image src={agentImage} /> : null}
                  <Avatar.Fallback bg="$blue10" items="center" justify="center">
                    <Text color="white" fontSize="$4" fontWeight="700">
                      {agentName.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
                <Text fontSize="$4" fontWeight="600">
                  Reviewing {agentName}
                </Text>
              </XStack>

              <Separator borderColor="$borderColor" />

              {/* Star rating picker */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600">
                  Your Rating
                </Text>
                <XStack gap="$3" justify="center" py="$2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => setReviewRating(star)}>
                      <Star
                        size={36}
                        color="#EAB308"
                        fill={star <= reviewRating ? "#EAB308" : "transparent"}
                      />
                    </Pressable>
                  ))}
                </XStack>
                {reviewRating > 0 && (
                  <Text text="center" fontSize="$3" color="$color8">
                    {reviewRating === 1
                      ? "Poor"
                      : reviewRating === 2
                        ? "Fair"
                        : reviewRating === 3
                          ? "Good"
                          : reviewRating === 4
                            ? "Very Good"
                            : "Excellent"}
                  </Text>
                )}
              </YStack>

              <Separator borderColor="$borderColor" />

              {/* Review text */}
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600">
                  Your Review
                </Text>
                <Input
                  size="$5"
                  bg="$color2"
                  borderColor="$borderColor"
                  rounded="$4"
                  placeholder="Share your experience with this agent…"
                  placeholderTextColor="$color7"
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  height={120}
                  py="$3"
                />
              </YStack>

              {/* Submit button */}
              <Button
                bg="$blue9"
                color="white"
                rounded="$4"
                size="$5"
                onPress={handleSubmitReview}
                opacity={reviewRating === 0 ? 0.5 : 1}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <Button.Text fontWeight="600" color="white">
                    Submit Review
                  </Button.Text>
                )}
              </Button>
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
    </Sheet>
    </>
  );
}
