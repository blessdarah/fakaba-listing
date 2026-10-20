import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUsers } from "../firestore/users";
import { useAuth } from "../../contexts/AuthContext";
import { listingsKeys } from "./useListings";

// Query keys for favorites
export const favoritesKeys = {
  all: ["favorites"] as const,
  user: (userId: string) => [...favoritesKeys.all, userId] as const,
};

/**
 * Hook to fetch user's favorite listing IDs
 */
export function useFavorites() {
  const { user } = useAuth();
  const { getUserById } = useUsers();

  return useQuery({
    queryKey: favoritesKeys.user(user?.uid || ""),
    queryFn: async () => {
      if (!user) return [];
      const userData = await getUserById(user.uid);
      return userData?.favorites || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute - favorites change frequently
  });
}

/**
 * Hook to add a listing to favorites with optimistic updates
 */
export function useAddToFavorites() {
  const { user } = useAuth();
  const { addToFavorites } = useUsers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error("User not authenticated");
      const success = await addToFavorites(user.uid, listingId);
      if (!success) throw new Error("Failed to add to favorites");
      return listingId;
    },
    // Optimistic update - immediately update UI before server confirms
    onMutate: async (listingId: string) => {
      if (!user) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: favoritesKeys.user(user.uid),
      });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<string[]>(
        favoritesKeys.user(user.uid)
      );

      // Optimistically update to new value
      queryClient.setQueryData<string[]>(
        favoritesKeys.user(user.uid),
        (old) => [...(old || []), listingId]
      );

      // Return context with previous value
      return { previousFavorites };
    },
    // If mutation fails, use context to roll back
    onError: (err, listingId, context) => {
      if (user && context?.previousFavorites) {
        queryClient.setQueryData(
          favoritesKeys.user(user.uid),
          context.previousFavorites
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: favoritesKeys.user(user.uid),
        });
      }
    },
  });
}

/**
 * Hook to remove a listing from favorites with optimistic updates
 */
export function useRemoveFromFavorites() {
  const { user } = useAuth();
  const { removeFromFavorites } = useUsers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error("User not authenticated");
      const success = await removeFromFavorites(user.uid, listingId);
      if (!success) throw new Error("Failed to remove from favorites");
      return listingId;
    },
    // Optimistic update
    onMutate: async (listingId: string) => {
      if (!user) return;

      await queryClient.cancelQueries({
        queryKey: favoritesKeys.user(user.uid),
      });

      const previousFavorites = queryClient.getQueryData<string[]>(
        favoritesKeys.user(user.uid)
      );

      queryClient.setQueryData<string[]>(favoritesKeys.user(user.uid), (old) =>
        (old || []).filter((id) => id !== listingId)
      );

      return { previousFavorites };
    },
    onError: (err, listingId, context) => {
      if (user && context?.previousFavorites) {
        queryClient.setQueryData(
          favoritesKeys.user(user.uid),
          context.previousFavorites
        );
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: favoritesKeys.user(user.uid),
        });
      }
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const { data: favorites = [] } = useFavorites();

  return {
    toggleFavorite: (listingId: string) => {
      const isFavorited = favorites.includes(listingId);
      return isFavorited
        ? removeFromFavorites.mutate(listingId)
        : addToFavorites.mutate(listingId);
    },
    isFavorited: (listingId: string) => favorites.includes(listingId),
    isLoading: addToFavorites.isPending || removeFromFavorites.isPending,
  };
}
