import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Icon } from "components/ui/Icon";
import { Text } from "components/ui/Text";
import { formatPrice } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { setFilters, type SearchFilters } from "lib/searchFilters";
import { gutter, radius, useTheme } from "theme";

type T = (key: string, options?: Record<string, unknown>) => string;

export function priceLabel(f: Pick<SearchFilters, "minPrice" | "maxPrice">, t: T) {
  if (f.minPrice != null && f.maxPrice != null)
    return t("search.between", { min: formatPrice(f.minPrice), max: formatPrice(f.maxPrice) });
  if (f.maxPrice != null) return t("search.under", { price: formatPrice(f.maxPrice) });
  if (f.minPrice != null) return t("search.over", { price: formatPrice(f.minPrice) });
  return "";
}

/** Removable pills for every active filter: "Rent ×  Apartments ×  Under 100 000 ×". */
export function FilterPills({ filters }: { filters: SearchFilters }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const pills: { key: string; label: string; remove: () => void }[] = [];
  if (filters.deal)
    pills.push({
      key: "deal",
      label: t(`filters.${filters.deal === "sale" ? "buy" : filters.deal}`),
      remove: () => setFilters({ deal: null }),
    });
  for (const c of filters.categories)
    pills.push({
      key: `cat-${c}`,
      label: t(`feed.categories.${c}`, { defaultValue: c }),
      remove: () => setFilters((s) => ({ categories: s.categories.filter((x) => x !== c) })),
    });
  if (filters.minPrice != null || filters.maxPrice != null)
    pills.push({ key: "price", label: priceLabel(filters, t), remove: () => setFilters({ minPrice: null, maxPrice: null }) });
  if (filters.minBedrooms != null)
    pills.push({
      key: "beds",
      label: t("search.bedsPlus", { count: filters.minBedrooms }),
      remove: () => setFilters({ minBedrooms: null }),
    });

  if (!pills.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {pills.map((p) => (
        <Pressable
          key={p.key}
          accessibilityRole="button"
          accessibilityLabel={t("search.remove", { label: p.label })}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            p.remove();
          }}
          style={[styles.pill, { backgroundColor: colors.signalTint, borderColor: colors.ink }]}
        >
          <Text variant="label">{p.label}</Text>
          <Icon name="close" size={11} weight="bold" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: gutter, gap: 8 },
  pill: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
});
