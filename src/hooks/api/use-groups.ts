import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGetPaginated, apiPost } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { ListQueryParams } from "@/types/api";
import type { Group, GroupInput, GroupStudent } from "@/types/academic";

export const groupHooks = createCrudHooks<Group, GroupInput, Partial<GroupInput>>("groups");

export const useGroups = groupHooks.useList;
export const useGroup = groupHooks.useDetail;
export const useCreateGroup = groupHooks.useCreate;
export const useUpdateGroup = groupHooks.useUpdate;
export const useDeleteGroup = groupHooks.useRemove;

export function useGroupStudents(groupId?: string, params?: ListQueryParams) {
  return useQuery({
    queryKey: ["groups", groupId, "students", params ?? {}],
    queryFn: () => apiGetPaginated<GroupStudent>(`/groups/${groupId}/students`, { params }),
    enabled: Boolean(groupId),
  });
}

export function useAddGroupStudent(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => apiPost(`/groups/${groupId}/students`, { studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "detail", groupId] });
    },
  });
}

/** Same endpoint as useAddGroupStudent, but for flows where the student is
 * fixed and the group is picked at call time (e.g. "add this student to
 * another group" from their own profile) rather than the other way round. */
export function useAddStudentToGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
      apiPost(`/groups/${groupId}/students`, { studentId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useRemoveGroupStudent(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => apiDelete(`/groups/${groupId}/students/${studentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId, "students"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "detail", groupId] });
    },
  });
}
