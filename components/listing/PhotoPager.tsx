import { Image } from "expo-image";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions, type ViewToken } from "react-native";
import { PhotoFill } from "components/home/PhotoFill";
import { Text } from "components/ui/Text";
import { radius } from "theme";

/**
 * Swipeable listing photos with a "1 / 12" counter. Falls back to the warm
 * gradient placeholder when a listing has no photos.
 */
export function PhotoPager({
  seed,
  urls,
  height,
  onPressPhoto,
  bottomInset = 0,
}: {
  seed: string;
  urls: string[];
  height: number;
  onPressPhoto?: (index: number) => void;
  /** Lift the counter above an overlapping sheet. */
  bottomInset?: number;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const onViewable = useState(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const first = viewableItems[0];
        if (first?.index != null) setIndex(first.index);
      }
  )[0];

  if (!urls.length) {
    return <PhotoFill seed={seed} style={{ width, height }} />;
  }

  return (
    <View style={{ width, height }}>
      <FlatList
        data={urls}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(u, i) => `${i}-${u}`}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index: i }) => (
          <Pressable onPress={onPressPhoto ? () => onPressPhoto(i) : undefined} accessibilityRole="imagebutton">
            <PhotoFill seed={seed} style={{ width, height }}>
              <Image source={{ uri: item }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            </PhotoFill>
          </Pressable>
        )}
      />
      {urls.length > 1 && (
        <View style={[styles.counter, { bottom: bottomInset + 14 }]} pointerEvents="none">
          <Text variant="xs" weight="semibold" color="#FFFFFF">
            {index + 1} / {urls.length}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: "absolute",
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: "rgba(18,18,18,0.6)",
  },
});
