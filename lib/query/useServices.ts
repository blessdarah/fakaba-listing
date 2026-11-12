import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getService,
  uploadServiceImage,
  createService,
  updateService,
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

type ServiceDraft = Omit<Service, "id" | "createdAt" | "updatedAt" | "imageUrl">;

/**
 * Creates a service, or updates one when `id` is given. A local `imageUri`
 * (file://) is uploaded first; a remote URL or null is stored as-is.
 */
export function useSaveService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
      imageUri,
    }: {
      id?: string;
      formData: ServiceDraft;
      imageUri: string | null;
    }) => {
      const imageUrl = imageUri && !/^https?:/.test(imageUri) ? await uploadServiceImage(imageUri) : (imageUri ?? "");
      if (id) {
        await updateService(id, { ...formData, imageUrl });
        return id;
      }
      const created = await createService({ ...formData, imageUrl });
      return created.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(id) });
    },
  });
}
