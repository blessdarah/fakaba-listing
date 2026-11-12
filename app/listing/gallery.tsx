import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions, type ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoFill } from "components/home/PhotoFill";
import { Button } from "components/ui/Button";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { areaOf, priceUnit } from "lib/listing";
import { useToggleFavorite } from "lib/query/useFavorites";
import { useListing } from "lib/query/useListings";
import { gutter, radius } from "theme";

const INK = "#121212";
const CHROME = "rgba(255,255,255,0.12)";

/** "35 — Listing · Gallery". Always dark: photos read best on black. */
export default function GalleryScreen() {
  const { id, index: startParam } = useLocalSearchParams<{ id: string; index?: string }>();
  const start = Number(startParam ?? 0) || 0;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { data: listing } = useListing(id);
  const { toggleFavorite, isFavorited } = useToggleFavorite();
  const [index, setIndex] = useState(start);
  const pager = useRef<FlatList<string>>(null);
  const thumbs = useRef<FlatList<string>>(null);

  const urls = listing?.imageUrls ?? [];
  const photoHeight = Math.min(height * 0.55, width * 1.1);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const i = viewableItems[0]?.index;
    if (i != null) {
      setIndex(i);
      thumbs.current?.scrollToIndex({ index: i, viewPosition: 0.5, animated: true });
    }
  }).current;

  const jump = useCallback((i: number) => {
    pager.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }, []);

  const saved = listing ? isFavorited(listing.id) : false;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <RoundButton icon="close" label={t("gallery.close")} onPress={() => router.back()} />
        <Text variant="base" weight="semibold" color="#FFFFFF">
          {urls.length ? `${index + 1} / ${urls.length}` : ""}
        </Text>
        <RoundButton
          icon={saved ? "heartFill" : "heart"}
          label={saved ? t("listing.unsave") : t("listing.save")}
          onPress={() => listing && toggleFavorite(listing.id)}
        />
      </View>

      <View style={styles.stage}>
        {urls.length ? (
          <FlatList
            ref={pager}
            data={urls}
            horizontal
            pagingEnabled
            initialScrollIndex={Math.min(start, Math.max(urls.length - 1, 0))}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(u, i) => `${i}-${u}`}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item, index: i }) => (
              <View style={{ width, height: photoHeight }}>
                <Image
                  source={{ uri: item }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                  accessibilityLabel={t("gallery.photo", { n: i + 1, total: urls.length })}
                />
              </View>
            )}
          />
        ) : (
          <PhotoFill seed={id} style={{ width, height: photoHeight, alignItems: "center", justifyContent: "center" }}>
            <Text variant="base" color="#FFFFFF">
              {t("gallery.noPhotos")}
            </Text>
          </PhotoFill>
        )}
      </View>

      {urls.length > 1 && (
        <FlatList
          ref={thumbs}
          data={urls}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(u, i) => `t-${i}-${u}`}
          contentContainerStyle={styles.thumbs}
          getItemLayout={(_, i) => ({ length: 62, offset: 16 + 62 * i, index: i })}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item, index: i }) => (
            <Pressable
              onPress={() => jump(i)}
              accessibilityRole="imagebutton"
              accessibilityLabel={t("gallery.photo", { n: i + 1, total: urls.length })}
              style={[styles.thumb, i === index && styles.thumbActive]}
            >
              <Image source={{ uri: item }} style={StyleSheet.absoluteFill} contentFit="cover" />
            </Pressable>
          )}
        />
      )}

      {listing && (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
          <View style={styles.flex}>
            <Text variant="h2" color="#FFFFFF" style={styles.price}>
              {formatPrice(listing.price)}
            </Text>
            <Text variant="label" color="#B9B9B4" style={styles.regular} numberOfLines={1}>
              {[priceUnit(listing, t), areaOf(listing)].filter(Boolean).join(" · ")}
            </Text>
          </View>
          {listing.status === "active" && (
            <Button
              label={t("listing.whatsapp")}
              variant="palm"
              leading={<Icon name="chat" size={20} color="#FFFFFF" />}
              onPress={() => router.push({ pathname: "/listing/contact", params: { id: listing.id } })}
            />
          )}
        </View>
      )}
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: "close" | "heart" | "heartFill"; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.round}>
      <Icon name={icon} size={18} color="#FFFFFF" weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: INK },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: CHROME, alignItems: "center", justifyContent: "center" },
  stage: { flex: 1, justifyContent: "center" },
  thumbs: { paddingHorizontal: 16, gap: 6, paddingBottom: 16 },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, overflow: "hidden", backgroundColor: "#2A2A2A", opacity: 0.6 },
  thumbActive: { borderWidth: 2, borderColor: "#FFFFFF", opacity: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 14,
    paddingHorizontal: gutter,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  flex: { flex: 1 },
  price: { fontSize: 22, lineHeight: 28 },
  regular: { fontFamily: "Inter_400Regular" },
});
