import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getService,
  uploadServiceImage,
  createService,
} from "../firestore/services";
import { Service } from "../types";

export const servicesKeys = {
  all: ["services"] as const,
  lists: () => [...servicesKeys.all, "list"] as const,
  details: () => [...servicesKeys.all, "detail"] as const,
  detail: (id: string) => [...servicesKeys.details(), id] as const,
};

export function useServices() {
  return useQuery({
    queryKey: servicesKeys.lists(),
    queryFn: () => getServices(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => getService(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      imageUri,
    }: {
      formData: Omit<Service, "id" | "createdAt" | "updatedAt" | "imageUrl">;
      imageUri: string;
    }) => {
      const imageUrl = await uploadServiceImage(imageUri);
      return createService({ ...formData, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
}
