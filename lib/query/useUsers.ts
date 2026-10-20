import { useQuery } from "@tanstack/react-query";
import { getAgents, getUserById } from "../firestore/users";

export const usersKeys = {
  all: ["users"] as const,
  agents: () => [...usersKeys.all, "agents"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};

export function useAgents() {
  return useQuery({
    queryKey: usersKeys.agents(),
    queryFn: () => getAgents(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
