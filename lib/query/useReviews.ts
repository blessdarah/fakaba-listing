import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviewsByAgent, createReview } from "../firestore/reviews";

export const reviewsKeys = {
  all: ["reviews"] as const,
  byAgent: (agentId: string) =>
    [...reviewsKeys.all, "agent", agentId] as const,
};

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
