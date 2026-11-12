import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RangeSlider } from "components/search/RangeSlider";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { IconButton } from "components/ui/IconButton";
import { Text } from "components/ui/Text";
import { formatPrice, type DealType } from "lib/format";
import { useTranslation } from "lib/i18n/useTranslation";
import { useSearchListings } from "lib/query/useListings";
import {
  EMPTY_FILTERS,
  applyFilters,
  getFilters,
  matchesFilters,
  setFilters,
  type SearchFilters,
} from "lib/searchFilters";
import { fonts, gutter, radius, useTheme } from "theme";

const DEALS: { id: DealType; key: string }[] = [
  { id: "rent", key: "filters.rent" },
  { id: "sale", key: "filters.buy" },
  { id: "lease", key: "filters.lease" },
];
const TYPES = ["Room", "Apartment", "House", "Commercial", "Land"];
const BEDS: (number | null)[] = [null, 1, 2, 3, 4];
const BINS = 16;
/** Gap between the status bar and the sheet's top edge. */
const SHEET_TOP_GAP = 24;

/** "32 — Search · Filters". Edits a draft; "Show N places" commits it. */
export default function FiltersSheet() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const { data: pool = [] } = useSearchListings();
  const [draft, setDraft] = useState<SearchFilters>(() => getFilters());
  const patch = (p: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...p }));

  // Price domain + histogram over listings that match everything except price.
  const { ceiling, step, bins, most } = useMemo(() => {
    const prices = pool
      .filter((l) => matchesFilters(l, draft, ["minPrice", "maxPrice", "sort"]))
      .map((l) => l.price ?? 0)
      .filter((p) => p > 0);
    const top = Math.max(...prices, draft.deal === "sale" ? 50_000_000 : 500_000);
    const magnitude = Math.pow(10, Math.floor(Math.log10(top)) - 1);
    const ceil = Math.ceil(top / (magnitude * 5)) * magnitude * 5;
    const counts = Array.from({ length: BINS }, () => 0);
    for (const p of prices) counts[Math.min(BINS - 1, Math.floor((p / ceil) * BINS))]++;
    // "Most: 40 000 – 80 000" — the middle half of prices.
    let most: [number, number] | null = null;
    // Only meaningful within one deal type — rent and sale prices differ by 1000×.
    if (draft.deal && prices.length >= 4) {
      const sorted = [...prices].sort((a, b) => a - b);
      const q = (f: number) => sorted[Math.floor(f * (sorted.length - 1))];
      // Round to the scale of the range itself (e.g. 5 000s for rents), not the
      // slider ceiling, which one pricey outlier can blow up.
      const unit = Math.max(Math.pow(10, Math.floor(Math.log10(Math.max(q(0.75), 1))) - 1) * 5, 1000);
      const lo = Math.floor(q(0.25) / unit) * unit;
      const hi = Math.ceil(q(0.75) / unit) * unit;
      if (hi > lo) most = [lo, hi];
    }
    return { ceiling: ceil, step: Math.max(ceil / 100, 1000), bins: counts, most };
  }, [pool, draft]);

  const low = draft.minPrice ?? 0;
  const high = draft.maxPrice ?? ceiling;
  const maxBin = Math.max(...bins, 1);
  const resultCount = useMemo(() => applyFilters(pool, draft).length, [pool, draft]);

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  return (
    // iOS formSheet quirks (react-native-screens 4.x):
    // - The content gets no height from the sheet, so `flex: 1` collapses. The route
    //   uses `fitToContents` and we size the sheet here: screen minus status bar and a
    //   peek of the page behind, like the design (774 of 844).
    // - If the ScrollView ends up a direct child of the sheet's container (because
    //   layout-only wrappers get flattened away), react-native-screens resizes it to
    //   the whole sheet and it covers the header. `collapsable={false}` keeps these
    //   wrappers as real views so our own layout stands.
    <View
      collapsable={false}
      style={{ height: windowHeight - insets.top - SHEET_TOP_GAP, backgroundColor: colors.bg }}
    >
      <View collapsable={false} style={styles.header}>
        <View style={styles.headerSide}>
          <IconButton
            icon="close"
            iconSize={18}
            accessibilityLabel={t("filters.close")}
            onPress={() => router.back()}
          />
        </View>
        <Text variant="title" style={styles.title} accessibilityRole="header">
          {t("filters.title")}
        </Text>
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          onPress={() => setDraft({ ...EMPTY_FILTERS, query: draft.query, sort: draft.sort })}
          style={[styles.headerSide, styles.headerEnd]}
        >
          <Text variant="sm" weight="semibold" underline align="right">
            {t("filters.reset")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.body}>
          <Section label={t("filters.lookingTo")}>
            <Segmented
              options={DEALS.map((d) => ({ id: d.id, label: t(d.key) }))}
              value={draft.deal}
              onChange={(deal) => patch({ deal: deal === draft.deal ? null : deal, minPrice: null, maxPrice: null })}
            />
          </Section>

          <Section label={t("filters.propertyType")}>
            <View style={styles.chips}>
              {TYPES.map((c) => {
                const on = draft.categories.includes(c);
                return (
                  <Chip
                    key={c}
                    label={t(`setup.interests.${c}`)}
                    selected={on}
                    checkWhenSelected
                    onPress={() =>
                      patch({ categories: on ? draft.categories.filter((x) => x !== c) : [...draft.categories, c] })
                    }
                  />
                );
              })}
            </View>
          </Section>

          <Section
            label={draft.deal === "rent" ? t("filters.pricePerMonth") : t("filters.price")}
            aside={most ? t("filters.most", { low: formatPrice(most[0]), high: formatPrice(most[1]) }) : undefined}
            gap={12}
          >
            <View style={styles.histogram} accessibilityElementsHidden>
              {bins.map((n, i) => {
                const binStart = (i / BINS) * ceiling;
                const inRange = binStart >= low - ceiling / BINS && binStart <= high;
                return (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: 4 + (n / maxBin) * 52,
                        backgroundColor: inRange ? colors.ink : colors.line,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <RangeSlider
              min={0}
              max={ceiling}
              step={step}
              low={low}
              high={high}
              onChange={(lo, hi) => patch({ minPrice: lo <= 0 ? null : lo, maxPrice: hi >= ceiling ? null : hi })}
            />
            <View style={styles.priceRow}>
              <PriceBox
                label={t("filters.min")}
                value={draft.minPrice}
                placeholder="0 FCFA"
                onChange={(v) => patch({ minPrice: v })}
              />
              <View style={[styles.dash, { backgroundColor: colors.inkSubtle }]} />
              <PriceBox
                label={t("filters.max")}
                value={draft.maxPrice}
                placeholder={t("filters.noMax")}
                onChange={(v) => patch({ maxPrice: v })}
              />
            </View>
          </Section>

          {draft.categories.length === 1 && draft.categories[0] === "Land" ? null : (
            <Section label={t("filters.bedrooms")}>
              <View style={styles.beds}>
                {BEDS.map((b) => {
                  const on = draft.minBedrooms === b;
                  return (
                    <Pressable
                      key={String(b)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        patch({ minBedrooms: b });
                      }}
                      style={[
                        styles.bed,
                        on ? { backgroundColor: colors.ink, borderColor: colors.ink } : { borderColor: colors.line },
                      ]}
                    >
                      <Text variant="sm" weight={on ? "semibold" : "medium"} color={on ? "onInk" : "ink"}>
                        {b == null ? t("filters.any") : b === 1 ? "1" : `${b}+`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
        <Button
          label={t("filters.clear")}
          variant="quiet"
          onPress={() => {
            setFilters({ ...EMPTY_FILTERS, query: draft.query, sort: draft.sort });
            router.back();
          }}
          style={styles.clear}
        />
        <Button
          label={t("filters.show", { count: resultCount })}
          disabled={resultCount === 0}
          onPress={apply}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

function Section({
  label,
  aside,
  gap = 10,
  children,
}: {
  label: string;
  aside?: string;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap }}>
      <View style={styles.sectionHead}>
        <Text variant="caps" color="inkMuted">
          {label.toUpperCase()}
        </Text>
        {aside ? (
          <Text variant="label" color="inkMuted" style={styles.regular}>
            {aside}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surface }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            style={[
              styles.segment,
              on && {
                backgroundColor: colors.bg,
                shadowColor: "#121212",
                shadowOpacity: 0.12,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              },
            ]}
          >
            <Text variant="sm" weight={on ? "semibold" : "medium"} color={on ? "ink" : "inkMuted"} style={styles.segmentLabel}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PriceBox({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  placeholder: string;
  onChange: (v: number | null) => void;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.priceBox,
        focused ? { backgroundColor: colors.bg, borderColor: colors.ink } : { backgroundColor: colors.surface, borderColor: "transparent" },
      ]}
    >
      <Text variant="xs" color="inkMuted" style={styles.priceLabel}>
        {label}
      </Text>
      <TextInput
        value={value == null ? "" : `${formatPrice(value)} FCFA`}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, "");
          onChange(digits ? Number(digits) : null);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.ink}
        keyboardType="number-pad"
        selectionColor={colors.ink}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.priceInput, { color: colors.ink }]}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontFamily: fonts.regular },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: gutter,
    paddingTop: 22,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.44 },
  headerSide: { width: 64 },
  headerEnd: { alignItems: "flex-end" },
  scrollView: { flex: 1, overflow: "hidden" },
  scroll: { paddingBottom: 24 },
  body: { paddingHorizontal: gutter, paddingTop: 14, gap: 26 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  segmented: { flexDirection: "row", padding: 4, borderRadius: radius.md },
  segment: { flex: 1, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segmentLabel: { lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  histogram: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 56, paddingHorizontal: 10 },
  bar: { flex: 1, borderRadius: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dash: { width: 12, height: 2 },
  priceBox: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 2, paddingHorizontal: 12, justifyContent: "center" },
  priceLabel: { fontSize: 11, lineHeight: 14 },
  priceInput: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 18, padding: 0 },
  beds: { flexDirection: "row", gap: 8 },
  bed: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: gutter,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  clear: { width: 110 },
});
