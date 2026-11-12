import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AgentCard } from "components/home/AgentCard";
import { HomeSkeleton } from "components/home/HomeSkeleton";
import { FeedCard, ListingRow, SaleCard } from "components/home/ListingCards";
import { NearYouCard } from "components/home/NearYouCard";
import { SectionHeader } from "components/home/SectionHeader";
import { PublishedArt, Spot } from "components/illustrations";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { useAuth } from "contexts/AuthContext";
import { dealType, toDate } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useListings } from "lib/query/useListings";
import { useAgents } from "lib/query/useUsers";
import { openListing } from "lib/listing";
import { openAgent } from "lib/agents";
import { resetFilters } from "lib/searchFilters";
import type { Listing } from "lib/types";
import { gutter, radius, useTheme } from "theme";

const CATEGORIES = ["Room", "Apartment", "House", "Commercial", "Land"] as const;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** Scroll offset where the hero search has gone under the status bar. */
const STICKY_AT = 210;

/** "10 — Home", "10b — Full scroll", "10c — Scrolled (sticky header)", "77 — Loading", "82 — Dark". */
export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user, userProfile } = useAuth();

  const listingsQuery = useListings();
  const agentsQuery = useAgents();
  const { toggleFavorite, isFavorited } = useToggleFavorite();

  const [category, setCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = userProfile?.firstName?.trim() || user?.displayName?.split(" ")[0] || "";
  const fullName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName ?? ""}`
    : (user?.displayName ?? user?.email ?? "");
  const town: string = userProfile?.location?.trim() ?? "";

  const sections = useMemo(() => {
    const all = (listingsQuery.data ?? []).filter((l) => !category || l.category === category);
    const rentals = all.filter((l) => dealType(l) !== "sale");
    const forSale = all.filter((l) => dealType(l) === "sale");
    const byNewest = [...all].sort(
      (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
    );
    const thisWeek = byNewest.filter((l) => {
      const d = toDate(l.createdAt);
      return d && Date.now() - d.getTime() < WEEK_MS;
    });
    const nearby = town
      ? all.filter((l) => `${l.location} ${l.address}`.toLowerCase().includes(town.toLowerCase()))
      : [];
    return {
      all,
      rentals,
      forSale,
      fresh: (thisWeek.length ? thisWeek : byNewest).slice(0, 3),
      nearby,
    };
  }, [listingsQuery.data, category, town]);

  const agents = useMemo(() => {
    const list = agentsQuery.data ?? [];
    const local = town ? list.filter((a) => a.location?.toLowerCase().includes(town.toLowerCase())) : [];
    return (local.length ? local : list).slice(0, 10);
  }, [agentsQuery.data, town]);

  const listingCountByOwner = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of listingsQuery.data ?? []) counts[l.ownerId] = (counts[l.ownerId] ?? 0) + 1;
    return counts;
  }, [listingsQuery.data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([listingsQuery.refetch(), agentsQuery.refetch()]);
    setRefreshing(false);
  }, [listingsQuery, agentsQuery]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const goSearch = () => router.navigate("/search");
  /** "See all" style links carry the current context into Search. */
  const searchWith = (deal?: "rent" | "sale") => {
    resetFilters({ deal: deal ?? null, categories: category ? [category] : [] });
    goSearch();
  };
  /** "Open map": the map shares Search's filters, so start it on the user's town. */
  const openMap = () => {
    resetFilters({ query: town, categories: category ? [category] : [] });
    router.push("/map");
  };
  const onOpen = useCallback((l: Listing) => openListing(l.id), []);
  const goProfile = () => router.navigate("/profile");
  const comingSoon = () => Alert.alert(t("soon.title"), t("soon.body"));

  const renderFeed = useCallback(
    ({ item }: { item: Listing }) => (
      <FeedCard listing={item} saved={isFavorited(item.id)} onToggleSave={toggleFavorite} onPress={onOpen} />
    ),
    [isFavorited, toggleFavorite, onOpen]
  );
  const renderSale = useCallback(({ item }: { item: Listing }) => <SaleCard listing={item} onPress={onOpen} />, [onOpen]);

  const loading = listingsQuery.isPending;
  const failed = listingsQuery.isError && !listingsQuery.data;
  const nothing = !loading && !failed && sections.all.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <StickyHeader
        scrollY={scrollY}
        town={town}
        name={fullName}
        photo={userProfile?.profileImage ?? user?.photoURL}
        onSearch={goSearch}
        onProfile={goProfile}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.inkMuted} />}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.townRow} onPress={goSearch} accessibilityRole="button" hitSlop={8}>
            <Icon name="pin" size={18} />
            <Text variant="base" weight="semibold">
              {town || t("nav.search")}
            </Text>
            <Icon name="chevronDown" size={13} weight="bold" />
          </Pressable>
          <Pressable onPress={goProfile} accessibilityRole="button" accessibilityLabel={t("nav.profile")}>
            <Avatar name={fullName} uri={userProfile?.profileImage ?? user?.photoURL} size={40} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text variant="display" accessibilityRole="header">
            {firstName ? t("feed.greeting", { name: firstName }) : t("feed.greetingNoName")}
          </Text>
          <SearchPill placeholder={t("feed.searchPlaceholder")} onPress={goSearch} />
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip label={t("feed.all")} selected={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={t(`feed.categories.${c}`)}
              selected={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <HomeSkeleton />
        ) : failed ? (
          <Message
            title={t("feed.errorTitle")}
            body={t("feed.errorBody")}
            action={t("feed.retry")}
            onAction={() => listingsQuery.refetch()}
          />
        ) : nothing ? (
          <Message title={t("feed.empty")} body={t("feed.emptyBody")} />
        ) : (
          <Animated.View entering={FadeIn.duration(250)}>
            {sections.rentals.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={t("feed.popularRentals")}
                  action={t("feed.seeAll")}
                  onAction={() => searchWith("rent")}
                  style={styles.sectionHeader}
                />
                <FlatList
                  horizontal
                  data={sections.rentals}
                  keyExtractor={(l) => l.id}
                  renderItem={renderFeed}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  snapToInterval={312}
                  decelerationRate="fast"
                />
              </View>
            )}

            {town ? (
              <View style={[styles.section, styles.padded, styles.sectionLoose]}>
                <SectionHeader title={t("feed.nearYou")} action={t("feed.openMap")} onAction={openMap} />
                <NearYouCard
                  listings={sections.nearby.length ? sections.nearby : sections.all}
                  title={t("feed.nearCount", { count: sections.nearby.length, town })}
                  subtitle={t("feed.nearSub")}
                  onPress={openMap}
                />
              </View>
            ) : null}

            {sections.forSale.length > 0 && (
              <View style={[styles.section, styles.sectionLoose]}>
                <SectionHeader
                  title={t("feed.forSale")}
                  action={t("feed.seeAll")}
                  onAction={() => searchWith("sale")}
                  style={styles.sectionHeader}
                />
                <FlatList
                  horizontal
                  data={sections.forSale}
                  keyExtractor={(l) => l.id}
                  renderItem={renderSale}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                />
              </View>
            )}

            {agents.length > 0 && (
              <View style={[styles.section, styles.sectionLoose]}>
                <SectionHeader
                  title={town ? t("feed.topAgents", { town }) : t("feed.topAgentsNoTown")}
                  action={t("feed.allAgents", { count: agentsQuery.data?.length ?? agents.length })}
                  onAction={() => router.push("/agents")}
                  style={styles.sectionHeader}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                  {agents.map((a) => (
                    <AgentCard
                      key={a.id}
                      agent={a}
                      onPress={a.id ? () => openAgent(a.id!) : undefined}
                      meta={
                        listingCountByOwner[a.id ?? ""]
                          ? t("feed.places", { count: listingCountByOwner[a.id ?? ""] })
                          : a.location
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {sections.fresh.length > 0 && (
              <View style={[styles.section, styles.padded, styles.sectionLoose, styles.tightGap]}>
                <SectionHeader title={t("feed.newThisWeek")} action={t("feed.seeAll")} onAction={() => searchWith()} />
                <View>
                  {sections.fresh.map((l, i) => (
                    <ListingRow
                      key={l.id}
                      listing={l}
                      saved={isFavorited(l.id)}
                      onToggleSave={toggleFavorite}
                      onPress={onOpen}
                      last={i === sections.fresh.length - 1}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Services teaser */}
            <View style={[styles.padded, styles.teaserWrap]}>
              <Pressable
                onPress={() => router.navigate("/services")}
                accessibilityRole="button"
                style={({ pressed }) => [styles.teaser, { backgroundColor: "#1300A7" }, pressed && { opacity: 0.9 }]}
              >
                <Spot name="land" size={56} />
                <View style={styles.teaserText}>
                  <Text variant="base" weight="semibold" color="#FFFFFF">
                    {t("feed.servicesTitle")}
                  </Text>
                  <Text variant="label" color={colors.onBrandMuted} style={styles.regular}>
                    {t("feed.servicesSub")}
                  </Text>
                </View>
                <Icon name="forward" size={16} color="#FFFFFF" weight="semibold" />
              </Pressable>
            </View>

            {/* List your property */}
            <View style={styles.listCta}>
              <PublishedArt />
              <Text variant="h2" align="center">
                {t("feed.listTitle")}
              </Text>
              <Text variant="base" color="inkMuted" align="center" style={styles.listBody}>
                {t("feed.listBody")}
              </Text>
              <Button label={t("feed.listCta")} variant="outline" size="md" onPress={comingSoon} style={styles.listButton} />
            </View>

            <View style={styles.end}>
              <View style={[styles.endRule, { backgroundColor: colors.line }]} />
              <Text variant="xs" color="inkSubtle">
                {town ? t("feed.caughtUp", { town }) : t("feed.caughtUpNoTown")}
              </Text>
              <View style={[styles.endRule, { backgroundColor: colors.line }]} />
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

function SearchPill({
  placeholder,
  title,
  subtitle,
  onPress,
}: {
  placeholder?: string;
  title?: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={title ?? placeholder}
      style={[styles.pill, { backgroundColor: colors.surface }]}
    >
      <Icon name="search" size={20} />
      <View style={styles.pillText}>
        {title ? (
          <>
            <Text variant="base" weight="semibold" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="xs" color="inkSubtle" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </>
        ) : (
          <Text variant="base" color="inkSubtle" numberOfLines={1}>
            {placeholder}
          </Text>
        )}
      </View>
      <View style={[styles.filterButton, { backgroundColor: colors.ink }]}>
        <Icon name="filters" size={18} color="onInk" />
      </View>
    </Pressable>
  );
}

function StickyHeader({
  scrollY,
  town,
  name,
  photo,
  onSearch,
  onProfile,
}: {
  scrollY: SharedValue<number>;
  town: string;
  name: string;
  photo?: string | null;
  onSearch: () => void;
  onProfile: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const style = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [STICKY_AT - 30, STICKY_AT], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: (1 - p) * -8 }] };
  });
  // Mirror visibility into React state so taps pass through while it's hidden.
  const [interactive, setInteractive] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > STICKY_AT - 10,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setInteractive, now);
    }
  );

  return (
    <Animated.View
      pointerEvents={interactive ? "auto" : "none"}
      style={[
        styles.sticky,
        { paddingTop: insets.top + 6, backgroundColor: colors.bg, borderBottomColor: colors.line },
        style,
      ]}
    >
      <View style={styles.stickyPill}>
        <SearchPill title={town || t("feed.searchPlaceholder")} onPress={onSearch} />
      </View>
      <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel={t("nav.profile")}>
        <Avatar name={name} uri={photo} size={40} />
      </Pressable>
    </Animated.View>
  );
}

function Message({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.message}>
      <Text variant="title" align="center">
        {title}
      </Text>
      <Text variant="base" color="inkMuted" align="center">
        {body}
      </Text>
      {action && <Button label={action} variant="quiet" size="md" onPress={onAction} style={styles.messageButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: gutter,
    paddingTop: 4,
  },
  townRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hero: { paddingHorizontal: gutter, paddingTop: 20, gap: 20 },
  pill: {
    height: 52,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 8,
    gap: 12,
  },
  pillText: { flex: 1 },
  filterButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  chips: { paddingHorizontal: gutter, paddingTop: 20, gap: 8 },
  section: { paddingTop: 28, gap: 14 },
  sectionLoose: { paddingTop: 40 },
  tightGap: { gap: 6 },
  sectionHeader: { paddingHorizontal: gutter },
  padded: { paddingHorizontal: gutter },
  rail: { paddingHorizontal: gutter, gap: 12 },
  teaserWrap: { paddingTop: 32 },
  teaser: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14, borderRadius: radius.lg },
  teaserText: { flex: 1, gap: 2 },
  regular: { fontFamily: "Inter_400Regular" },
  listCta: { alignItems: "center", paddingTop: 56, paddingHorizontal: 40, gap: 10 },
  listBody: { maxWidth: 300 },
  listButton: { marginTop: 10, borderRadius: radius.md },
  end: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 56, paddingBottom: 24 },
  endRule: { width: 40, height: 1 },
  sticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: gutter,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  stickyPill: { flex: 1 },
  message: { paddingHorizontal: 40, paddingTop: 72, gap: 8, alignItems: "center" },
  messageButton: { marginTop: 12 },
});
