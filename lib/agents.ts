import { router } from "expo-router";
import { toDate } from "lib/format";
import type { Listing, Review, User } from "lib/types";

/** "What stood out" chips on a review. Keys map to i18n `reviews.tags.*`. */
export const REVIEW_TAGS = ["repliedFast", "accuratePhotos", "noVisitFee", "onTime", "fairPrice"] as const;
export type ReviewTag = (typeof REVIEW_TAGS)[number];

export type AgentUser = User & {
  businessName?: string;
  verified?: boolean;
  serviceAreas?: string[];
};

export type ReviewSummary = {
  count: number;
  average: number | null;
  /** Count of 5★, 4★, 3★, 2★, 1★ (index 0 = 5 stars). */
  distribution: [number, number, number, number, number];
  /** Share (0–1) of reviews that picked each tag, most mentioned first. */
  tags: { tag: string; share: number }[];
};

export function summarise(reviews: Review[] | undefined): ReviewSummary {
  const list = reviews ?? [];
  const distribution: ReviewSummary["distribution"] = [0, 0, 0, 0, 0];
  const tagCounts: Record<string, number> = {};
  let total = 0;
  for (const r of list) {
    const stars = Math.min(5, Math.max(1, Math.round(r.rating ?? 0)));
    distribution[5 - stars]++;
    total += r.rating ?? 0;
    for (const t of r.tags ?? []) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  }
  return {
    count: list.length,
    average: list.length ? total / list.length : null,
    distribution,
    tags: Object.entries(tagCounts)
      .map(([tag, n]) => ({ tag, share: n / list.length }))
      .sort((a, b) => b.share - a.share),
  };
}

/** Group every review by agent for list screens. */
export function summariesByAgent(reviews: Review[] | undefined) {
  const grouped: Record<string, Review[]> = {};
  for (const r of reviews ?? []) (grouped[r.agentId] ??= []).push(r);
  const out: Record<string, ReviewSummary> = {};
  for (const [id, list] of Object.entries(grouped)) out[id] = summarise(list);
  return out;
}

export function agentFullName(a?: Partial<AgentUser>) {
  if (!a) return "";
  if (a.accountType === "company" && a.businessName) return a.businessName;
  const n = `${a.firstName ?? ""} ${a.lastName ?? ""}`.replace(/\s+/g, " ").trim();
  return n || a.email?.split("@")[0] || (a.accountType === "company" ? "Agency" : "Agent");
}

/** "Brenda N." — how reviewers are shown publicly. */
export function publicName(first?: string | null, last?: string | null, fallback = "") {
  const f = first?.trim();
  const l = last?.trim();
  if (!f) return fallback;
  return l ? `${f} ${l[0].toUpperCase()}.` : f;
}

/** Neighbourhoods an agent works in: declared areas, else where their listings are. */
export function agentAreas(agent: AgentUser, listings: Listing[]) {
  if (agent.serviceAreas?.length) return agent.serviceAreas;
  const set = new Set<string>();
  for (const l of listings) {
    const area = (l.address?.split(",")[0] || l.location || "").trim();
    if (area) set.add(area);
  }
  if (!set.size && agent.location) set.add(agent.location);
  return Array.from(set);
}

/** Whole years (or months while new) since the account was created. */
export function tenure(createdAt: unknown): { value: number; unit: "years" | "months" } | null {
  const d = toDate(createdAt);
  if (!d) return null;
  const months = Math.max(0, Math.floor((Date.now() - d.getTime()) / (30.44 * 86_400_000)));
  return months >= 12 ? { value: Math.floor(months / 12), unit: "years" } : { value: Math.max(months, 1), unit: "months" };
}

export function openAgent(id: string) {
  router.push({ pathname: "/agents/[id]", params: { id } });
}
