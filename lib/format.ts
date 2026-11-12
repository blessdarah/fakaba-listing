import type { Listing } from "lib/types";

/** Prices use a (non-breaking) space as the thousands separator: 75 000, never "75k". */
export function formatPrice(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export type DealType = "rent" | "sale" | "lease";

export function dealType(listing: Pick<Listing, "type">): DealType {
  const t = (listing.type ?? "").toLowerCase();
  if (t.startsWith("sale") || t === "buy") return "sale";
  if (t.startsWith("lease")) return "lease";
  return "rent";
}

/** "Molyko, Buea" — neighbourhood (address) then town, without repeats. */
export function placeLine(listing: Pick<Listing, "address" | "location">) {
  const parts = [listing.address, listing.location].map((p) => p?.trim()).filter(Boolean) as string[];
  return Array.from(new Set(parts)).join(", ");
}

/** "2 bd · 1 ba · 64 m²" — skips zero/missing values. Land shows size only. */
export function specsLine(
  listing: Pick<Listing, "bedrooms" | "bathrooms" | "size" | "category">,
  labels: { bd: string; ba: string }
) {
  const parts: string[] = [];
  const isLand = listing.category === "Land";
  if (!isLand && listing.bedrooms) parts.push(`${listing.bedrooms} ${labels.bd}`);
  if (!isLand && listing.bathrooms) parts.push(`${listing.bathrooms} ${labels.ba}`);
  if (listing.size) parts.push(`${formatPrice(listing.size)} m²`);
  return parts.join(" · ");
}

export function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  const maybe = ts as { toDate?: () => Date; seconds?: number };
  if (typeof maybe.toDate === "function") return maybe.toDate();
  if (typeof maybe.seconds === "number") return new Date(maybe.seconds * 1000);
  return null;
}
