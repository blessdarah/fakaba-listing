import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviewsByAgent, createReview, getAllReviews, updateReview } from "../firestore/reviews";
import type { Review } from "../types";

export const reviewsKeys = {
  all: ["reviews"] as const,
  byAgent: (agentId: string) =>
    [...reviewsKeys.all, "agent", agentId] as const,
  everything: () => [...reviewsKeys.all, "everything"] as const,
};

/** All reviews, for agent ratings in lists. */
export function useAllReviews() {
  return useQuery({
    queryKey: reviewsKeys.everything(),
    queryFn: () => getAllReviews(),
    staleTime: 10 * 60 * 1000,
  });
}

/** Create, or update when `existing` is given (one review per person per agent). */
export function useSaveReview(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      existing?: Review | null;
      review: Parameters<typeof createReview>[0];
    }) => {
      if (input.existing) {
        const { rating, comment, tags, userName, userImage } = input.review;
        await updateReview(input.existing.id, { rating, comment, tags, userName, userImage });
        return input.existing.id;
      }
      return (await createReview(input.review)).id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.byAgent(agentId) });
      queryClient.invalidateQueries({ queryKey: reviewsKeys.everything() });
    },
  });
}

export function useReviewsByAgent(agentId: string) {
  return useQuery({
    queryKey: reviewsKeys.byAgent(agentId),
    queryFn: () => getReviewsByAgent(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReview(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.byAgent(agentId),
      });
    },
  });
}
