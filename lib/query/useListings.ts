import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListings, getListing, getListingByUserId } from '../firestore/listings';
import { Listing } from '../types';

// Query keys for cache management
export const listingsKeys = {
  all: ['listings'] as const,
  lists: () => [...listingsKeys.all, 'list'] as const,
  list: (filters?: string) => [...listingsKeys.lists(), { filters }] as const,
  details: () => [...listingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingsKeys.details(), id] as const,
  byUser: (userId: string) => [...listingsKeys.all, 'user', userId] as const,
};

/**
 * Hook to fetch all listings with caching
 */
export function useListings() {
  return useQuery({
    queryKey: listingsKeys.lists(),
    queryFn: () => getListings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single listing by ID
 */
export function useListing(id: string) {
  return useQuery({
    queryKey: listingsKeys.detail(id),
    queryFn: () => getListing(id),
    enabled: !!id, // Only run if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch listings by user ID
 */
export function useListingsByUser(userId: string) {
  return useQuery({
    queryKey: listingsKeys.byUser(userId),
    queryFn: () => getListingByUserId(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to manually refetch listings
 */
export function useRefetchListings() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
  };
}

/**
 * Hook to prefetch a listing (useful for optimistic navigation)
 */
export function usePrefetchListing() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: listingsKeys.detail(id),
      queryFn: () => getListing(id),
    });
  };
}
