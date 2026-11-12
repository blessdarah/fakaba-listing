import { useMemo } from "react";
import { agentAreas, agentFullName, summariesByAgent, type AgentUser, type ReviewSummary } from "lib/agents";
import { useSearchListings } from "lib/query/useListings";
import { useAllReviews } from "lib/query/useReviews";
import { useAgents } from "lib/query/useUsers";
import type { Listing } from "lib/types";

export type DirectoryEntry = {
  agent: AgentUser;
  id: string;
  name: string;
  listings: Listing[];
  areas: string[];
  categories: Set<string>;
  reviews: ReviewSummary | undefined;
};

/** Agents joined with their active listings and review summaries. */
export function useAgentDirectory() {
  const agents = useAgents();
  const reviews = useAllReviews();
  const pool = useSearchListings();

  const entries = useMemo<DirectoryEntry[]>(() => {
    const byOwner: Record<string, Listing[]> = {};
    for (const l of pool.data ?? []) (byOwner[l.ownerId] ??= []).push(l);
    const summaries = summariesByAgent(reviews.data);

    return ((agents.data ?? []) as AgentUser[])
      .filter((a) => a.id)
      .map((agent) => {
        const listings = byOwner[agent.id!] ?? [];
        return {
          agent,
          id: agent.id!,
          name: agentFullName(agent),
          listings,
          areas: agentAreas(agent, listings),
          categories: new Set(listings.map((l) => l.category)),
          reviews: summaries[agent.id!],
        };
      });
  }, [agents.data, reviews.data, pool.data]);

  return {
    entries,
    isPending: agents.isPending,
    isError: agents.isError && !agents.data,
    refetch: () => Promise.allSettled([agents.refetch(), reviews.refetch(), pool.refetch()]),
  };
}

/**
 * Rank: verified first, then active listings (what tenants can actually see),
 * then rating weighted by how many reviews back it up.
 */
export function rankEntries(list: DirectoryEntry[]) {
  const score = (e: DirectoryEntry) =>
    (e.agent.verified ? 1000 : 0) +
    Math.min(e.listings.length, 100) +
    (e.reviews?.average ?? 0) * Math.min(e.reviews?.count ?? 0, 10) * 3;
  return [...list].sort((a, b) => score(b) - score(a));
}
