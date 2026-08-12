import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type { ListQueryParams } from "@/types/api";

/**
 * Generic REST CRUD hook factory over a DRF ViewSet-backed resource.
 * Cuts the list/detail/create/update/delete boilerplate that would
 * otherwise be repeated for every one of the ~12 backend resources.
 */
export function createCrudHooks<TItem, TCreate = Partial<TItem>, TUpdate = Partial<TItem>>(resource: string) {
  const listKey = (params?: ListQueryParams) => [resource, "list", params ?? {}] as const;
  const detailKey = (id?: string) => [resource, "detail", id ?? ""] as const;

  function useList(params?: ListQueryParams) {
    return useQuery({
      queryKey: listKey(params),
      queryFn: () => apiGetPaginated<TItem>(`/${resource}`, { params }),
      placeholderData: (previous) => previous,
    });
  }

  function useDetail(id?: string) {
    return useQuery({
      queryKey: detailKey(id),
      queryFn: () => apiGet<TItem>(`/${resource}/${id}`),
      enabled: Boolean(id),
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body: TCreate) => apiPost<TItem, TCreate>(`/${resource}`, body),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }: { id: string; body: TUpdate }) =>
        apiPatch<TItem, TUpdate>(`/${resource}/${id}`, body),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
    });
  }

  function useRemove() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => apiDelete<void>(`/${resource}/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource] }),
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useRemove, listKey, detailKey, resource };
}
