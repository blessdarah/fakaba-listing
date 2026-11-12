import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { areaOf } from "lib/listing";
import type { Listing } from "lib/types";

/**
 * What a listing looked like when it was saved. Lets the Saved tab say
 * "Was 85 000" and still name a place after its owner deletes it.
 * Kept on the device per user; favourites themselves live in Firestore.
 */
export type SavedSnapshot = {
  price: number;
  title: string;
  area: string;
  category: string;
  type: string;
  savedAt: number;
};

type Snapshots = Record<string, SavedSnapshot>;

const storageKey = (uid: string) => `fakaba.saved.snapshots.${uid}`;
export const snapshotsKey = (uid: string) => ["savedSnapshots", uid] as const;

async function read(uid: string): Promise<Snapshots> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    return raw ? (JSON.parse(raw) as Snapshots) : {};
  } catch {
    return {};
  }
}

function toSnapshot(l: Listing): SavedSnapshot {
  return {
    price: l.price,
    title: l.title,
    area: areaOf(l) || l.location || "",
    category: l.category,
    type: l.type,
    savedAt: Date.now(),
  };
}

/** Read-modify-write, then mirror into the query cache so the screen updates. */
async function update(qc: QueryClient, uid: string, fn: (s: Snapshots) => Snapshots) {
  const next = fn(await read(uid));
  qc.setQueryData(snapshotsKey(uid), next);
  try {
    await AsyncStorage.setItem(storageKey(uid), JSON.stringify(next));
  } catch {
    // Best effort; the Saved tab falls back to current prices.
  }
}

/** Find a listing anywhere in the listings cache (feed, search pool, detail…). */
export function findCachedListing(qc: QueryClient, id: string): Listing | undefined {
  for (const [, data] of qc.getQueriesData<unknown>({ queryKey: ["listings"] })) {
    if (Array.isArray(data)) {
      const hit = (data as Listing[]).find((l) => l?.id === id);
      if (hit) return hit;
    } else if (data && typeof data === "object" && (data as Listing).id === id) {
      return data as Listing;
    }
  }
  return undefined;
}

export function recordSnapshot(qc: QueryClient, uid: string, listing: Listing) {
  return update(qc, uid, (s) => ({ ...s, [listing.id]: toSnapshot(listing) }));
}

export function forgetSnapshot(qc: QueryClient, uid: string, id: string) {
  return update(qc, uid, (s) => {
    if (!(id in s)) return s;
    const { [id]: _, ...rest } = s;
    return rest;
  });
}

/** Baseline any saved listing we never got to snapshot (saved on another device, older app). */
export function ensureSnapshots(qc: QueryClient, uid: string, listings: Listing[]) {
  return update(qc, uid, (s) => {
    const missing = listings.filter((l) => !s[l.id]);
    if (!missing.length) return s;
    const next = { ...s };
    for (const l of missing) next[l.id] = toSnapshot(l);
    return next;
  });
}

export function useSavedSnapshots(uid: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: snapshotsKey(uid ?? ""),
    queryFn: () => read(uid!),
    enabled: !!uid,
    staleTime: Infinity,
  });
  return { snapshots: query.data, ready: query.isSuccess, qc };
}
