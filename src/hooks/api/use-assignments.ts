import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { ListQueryParams } from "@/types/api";
import type { Assignment, AssignmentInput, AssignmentSubmission, GradeSubmissionInput } from "@/types/records";

const assignmentHooks = createCrudHooks<Assignment, AssignmentInput, Partial<AssignmentInput>>("assignments");

export const useAssignments = assignmentHooks.useList;
export const useAssignment = assignmentHooks.useDetail;
export const useDeleteAssignment = assignmentHooks.useRemove;

export type AssignmentFormInput = AssignmentInput & { attachment?: File | null };

/** Always submits as multipart/form-data — DRF's MultiPartParser handles the
 * plain fields fine, and it lets us attach a file in the same request
 * without branching the request shape. */
function toAssignmentFormData(body: Partial<AssignmentFormInput>) {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (key === "attachment") return;
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  if (body.attachment) formData.append("attachment", body.attachment);
  return formData;
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignmentFormInput) => apiPost<Assignment>("/assignments", toAssignmentFormData(body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AssignmentFormInput> }) =>
      apiPatch<Assignment>(`/assignments/${id}`, toAssignmentFormData(body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useAssignmentSubmissions(assignmentId?: string, params?: ListQueryParams) {
  return useQuery({
    queryKey: ["assignments", assignmentId, "submissions", params ?? {}],
    queryFn: () => apiGetPaginated<AssignmentSubmission>(`/assignments/${assignmentId}/submissions`, { params }),
    enabled: Boolean(assignmentId),
  });
}

export function useSubmitAssignment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { comment?: string; file?: File }) => {
      const formData = new FormData();
      if (body.comment) formData.append("comment", body.comment);
      if (body.file) formData.append("file", body.file);
      return apiPost<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId, "submissions"] });
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GradeSubmissionInput }) =>
      apiPatch<AssignmentSubmission, GradeSubmissionInput>(`/submissions/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}
