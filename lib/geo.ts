import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import type { Listing } from "lib/types";

/**
 * Where listings sit on the map.
 *
 * Listings don't store coordinates yet, so we geocode "address, town" on the
 * device (Apple / Android geocoder, no key) and fall back to the town centre,
 * nudged a little per listing so pins in the same town don't stack. Results are
 * cached on the device. Once listings carry `latitude`/`longitude`, those win.
 */

export type LatLng = { latitude: number; longitude: number };
export type Placed = LatLng & { approximate: boolean };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

/** Buea — where most early listings are. Used only when nothing else is known. */
export const DEFAULT_REGION: Region = { latitude: 4.1527, longitude: 9.2413, latitudeDelta: 0.12, longitudeDelta: 0.12 };

const STORAGE_KEY = "fakaba.geocode.v1";
const COUNTRY = "Cameroon";

// query -> coords, or null when the geocoder found nothing (so we don't ask again).
let cache: Record<string, LatLng | null> | null = null;
let loading: Promise<Record<string, LatLng | null>> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
// Apple's geocoder allows one request at a time and throttles bursts.
let queue: Promise<unknown> = Promise.resolve();

function loadCache() {
  if (cache) return Promise.resolve(cache);
  loading ??= AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => (cache = raw ? JSON.parse(raw) : {}))
    .catch(() => (cache = {}));
  return loading as Promise<Record<string, LatLng | null>>;
}

function persistSoon() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache ?? {})).catch(() => {});
  }, 800);
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

/** Geocode one free-text query. `undefined` = transient failure (try again later). */
async function geocode(query: string): Promise<LatLng | null | undefined> {
  const store = await loadCache();
  const key = norm(query);
  if (key in store) return store[key];

  const run = async () => {
    try {
      const [hit] = await Location.geocodeAsync(query);
      const value = hit ? { latitude: hit.latitude, longitude: hit.longitude } : null;
      store[key] = value;
      persistSoon();
      return value;
    } catch {
      // Throttled or offline: back off a little, don't cache.
      await new Promise((r) => setTimeout(r, 1500));
      return undefined;
    }
  };
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}

/** Small deterministic offset (≈ up to 600 m) so same-town pins fan out. */
function jitter(id: string, p: LatLng): LatLng {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h >>> 0) % 360) * (Math.PI / 180);
  const r = 0.0015 + (((h >>> 8) % 100) / 100) * 0.004;
  return { latitude: p.latitude + Math.sin(a) * r, longitude: p.longitude + Math.cos(a) * r };
}

const hasCoords = (l: Partial<Listing>) =>
  typeof l.latitude === "number" && typeof l.longitude === "number";

export async function placeListing(l: Listing): Promise<Placed | null | undefined> {
  if (hasCoords(l)) return { latitude: l.latitude!, longitude: l.longitude!, approximate: false };
  const town = l.location?.trim();
  const address = l.address?.trim();
  if (address) {
    const parts = [address, town && !norm(address).includes(norm(town)) ? town : null, COUNTRY];
    const hit = await geocode(parts.filter(Boolean).join(", "));
    if (hit) return { ...hit, approximate: false };
  }
  if (!town) return null;
  const centre = await geocode(`${town}, ${COUNTRY}`);
  if (centre === undefined) return undefined;
  return centre ? { ...jitter(l.id, centre), approximate: true } : null;
}

export async function geocodeTown(town: string) {
  return town.trim() ? ((await geocode(`${town.trim()}, ${COUNTRY}`)) ?? null) : null;
}

/**
 * Coordinates for a set of listings, filled in progressively as the geocoder
 * answers. Cached answers come back almost immediately.
 */
export function useListingCoords(listings: Listing[]) {
  const [placed, setPlaced] = useState<Record<string, Placed>>({});
  const [pending, setPending] = useState(0);
  const key = useMemo(() => listings.map((l) => l.id).join(","), [listings]);

  useEffect(() => {
    let cancelled = false;
    const todo = listings.filter((l) => !placed[l.id]);
    setPending(todo.length);
    (async () => {
      for (const l of todo) {
        if (cancelled) return;
        const p = await placeListing(l);
        if (cancelled) return;
        if (p) setPlaced((prev) => ({ ...prev, [l.id]: p }));
        setPending((n) => Math.max(0, n - 1));
      }
    })();
    return () => {
      cancelled = true;
    };
    // `placed` is read once per id set on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { placed, pending };
}

/** Region that fits every point, padded; falls back to `fallback`. */
export function regionFor(points: LatLng[], fallback: Region = DEFAULT_REGION): Region {
  if (!points.length) return fallback;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.02),
  };
}

export function inRegion(p: LatLng, r: Region) {
  return (
    Math.abs(p.latitude - r.latitude) <= r.latitudeDelta / 2 &&
    Math.abs(p.longitude - r.longitude) <= r.longitudeDelta / 2
  );
}

/** Great-circle distance in metres. */
export function distanceM(a: LatLng, b: LatLng) {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** The user's position if they've already granted location; never prompts. */
export function useKnownPosition() {
  const [pos, setPos] = useState<LatLng | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { granted } = await Location.getForegroundPermissionsAsync();
        if (!granted) return;
        const last = await Location.getLastKnownPositionAsync();
        if (alive && last) setPos({ latitude: last.coords.latitude, longitude: last.coords.longitude });
      } catch {
        // No position; distances just won't show.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return [pos, setPos] as const;
}

/** Ask for location (prompting if needed) and return the current position. */
export async function requestPosition(): Promise<LatLng | null> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;
    const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: p.coords.latitude, longitude: p.coords.longitude };
  } catch {
    return null;
  }
}
