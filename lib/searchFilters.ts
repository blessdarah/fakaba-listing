import { useSyncExternalStore } from "react";
import { dealType, toDate, type DealType } from "lib/format";
import type { Listing } from "lib/types";

export type SortKey = "newest" | "priceAsc" | "priceDesc";

export type SearchFilters = {
  query: string;
  deal: DealType | null;
  /** Listing `category` values: Room, Apartment, House, Commercial, Land. */
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  sort: SortKey;
};

export const EMPTY_FILTERS: SearchFilters = {
  query: "",
  deal: null,
  categories: [],
  minPrice: null,
  maxPrice: null,
  minBedrooms: null,
  sort: "newest",
};

/* -------------------------------------------------------------------------- */
/* Tiny shared store: Home, Search and the Filters sheet all read/write it.   */
/* -------------------------------------------------------------------------- */

let state: SearchFilters = EMPTY_FILTERS;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getFilters() {
  return state;
}

export function setFilters(next: Partial<SearchFilters> | ((s: SearchFilters) => Partial<SearchFilters>)) {
  const patch = typeof next === "function" ? next(state) : next;
  state = { ...state, ...patch };
  emit();
}

export function resetFilters(keep: Partial<SearchFilters> = {}) {
  state = { ...EMPTY_FILTERS, ...keep };
  emit();
}

export function useSearchFilters(): SearchFilters {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

/* -------------------------------------------------------------------------- */
/* Matching                                                                   */
/* -------------------------------------------------------------------------- */

function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function matchesFilters(l: Listing, f: SearchFilters, ignore: (keyof SearchFilters)[] = []) {
  const skip = (k: keyof SearchFilters) => ignore.includes(k);

  if (!skip("query") && f.query.trim()) {
    const haystack = normalise(`${l.title} ${l.address} ${l.location} ${l.category}`);
    const words = normalise(f.query)
      .split(/[\s,]+/)
      .filter(Boolean);
    if (!words.every((w) => haystack.includes(w))) return false;
  }
  if (!skip("deal") && f.deal && dealType(l) !== f.deal) return false;
  if (!skip("categories") && f.categories.length && !f.categories.includes(l.category)) return false;
  if (!skip("minPrice") && f.minPrice != null && (l.price ?? 0) < f.minPrice) return false;
  if (!skip("maxPrice") && f.maxPrice != null && (l.price ?? 0) > f.maxPrice) return false;
  if (!skip("minBedrooms") && f.minBedrooms != null && (l.bedrooms ?? 0) < f.minBedrooms) return false;
  return true;
}

export function applyFilters(listings: Listing[], f: SearchFilters) {
  const out = listings.filter((l) => matchesFilters(l, f));
  const time = (l: Listing) => toDate(l.createdAt)?.getTime() ?? 0;
  out.sort((a, b) => {
    if (f.sort === "priceAsc") return (a.price ?? 0) - (b.price ?? 0);
    if (f.sort === "priceDesc") return (b.price ?? 0) - (a.price ?? 0);
    return time(b) - time(a);
  });
  return out;
}

/** Number of active filter pills (drives the badge on the filter button). */
export function activeFilterCount(f: SearchFilters) {
  return (
    (f.deal ? 1 : 0) +
    f.categories.length +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    (f.minBedrooms != null ? 1 : 0)
  );
}
