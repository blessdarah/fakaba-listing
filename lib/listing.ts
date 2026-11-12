import { router } from "expo-router";
import { Share } from "react-native";
import { dealType, formatPrice, toDate } from "lib/format";
import { resetFilters } from "lib/searchFilters";
import type { Listing, User } from "lib/types";

type T = (key: string, options?: Record<string, unknown>) => string;

/** "today", "3 days ago", "2 weeks ago"… localised. */
export function relativeWhen(ts: unknown, t: T) {
  const d = toDate(ts);
  if (!d) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return t("listing.when.today");
  if (days === 1) return t("listing.when.yesterday");
  if (days < 7) return t("listing.when.days", { count: days });
  if (days < 30) return t("listing.when.weeks", { count: Math.floor(days / 7) });
  return t("listing.when.months", { count: Math.floor(days / 30) });
}

/** Neighbourhood if we have one, otherwise the town. Used in "similar in Molyko". */
export function areaOf(l: Pick<Listing, "address" | "location">) {
  return (l.address?.split(",")[0]?.trim() || l.location || "").trim();
}

export function ownerName(owner?: Partial<User> & { businessName?: string }) {
  if (!owner) return "";
  if (owner.accountType === "company" && owner.businessName) return owner.businessName;
  const n = `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim();
  return n || owner.email?.split("@")[0] || "";
}

export function ownerPhone(owner?: Partial<User> & { whatsapp?: string }) {
  return owner?.whatsapp || owner?.phone || null;
}

export function priceUnit(l: Listing, t: T) {
  return dealType(l) === "rent" ? t("listing.perMonthShort") : t("listing.fcfa");
}

export async function shareListing(l: Listing, t: T) {
  try {
    await Share.share({
      message: t("listing.shareText", { title: l.title, price: `${formatPrice(l.price)} FCFA` }),
    });
  } catch {
    // Share sheet dismissed or unavailable.
  }
}

export function openListing(id: string) {
  router.push({ pathname: "/listing/[id]", params: { id } });
}

type SimilarKey = { id: string; category?: string; area: string; type?: string };

/** Active places of the same category in the same area — "See 4 similar nearby". */
export function countSimilar(pool: Listing[], key: SimilarKey) {
  const area = key.area.toLowerCase();
  if (!area) return 0;
  return pool.filter(
    (l) =>
      l.id !== key.id &&
      l.category === key.category &&
      `${l.address} ${l.location}`.toLowerCase().includes(area)
  ).length;
}

/** Jump to Search pre-filtered to places like this one. */
export function searchSimilar(key: SimilarKey) {
  resetFilters({
    query: key.area,
    categories: key.category ? [key.category] : [],
    deal: dealType({ type: key.type ?? "" }),
  });
  router.navigate("/search");
}
