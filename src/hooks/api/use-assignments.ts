import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { ListQueryParams } from "@/types/api";
import type {
  Assignment,
  AssignmentInput,
  AssignmentSubmission,
  GradeSubmissionInput,
} from "@/types/records";

const assignmentHooks = createCrudHooks<Assignment, AssignmentInput, Partial<AssignmentInput>>("assignments");

export const useAssignments = assignmentHooks.useList;
export const useAssignment = assignmentHooks.useDetail;
export const useDeleteAssignment = assignmentHooks.useRemove;

export type AssignmentFormInput = AssignmentInput & { attachments?: File[] };

/** Always submits as multipart/form-data — DRF's MultiPartParser handles the
 * plain fields fine, and it lets us attach files in the same request
 * without branching the request shape. Multiple files share the same
 * "attachments" field name, which is how request.FILES.getlist() on the
 * backend collects them. New attachments are additive (see
 * useRemoveAssignmentAttachment for removing one). */
function toAssignmentFormData(body: Partial<AssignmentFormInput>) {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (key === "attachments") return;
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  body.attachments?.forEach((file) => formData.append("attachments", file));
  return formData;
}

export function useRemoveAssignmentAttachment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => apiDelete(`/assignments/${assignmentId}/attachments/${attachmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignmentFormInput) =>
      apiPost<Assignment>("/assignments", toAssignmentFormData(body)),
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
    queryFn: () =>
      apiGetPaginated<AssignmentSubmission>(`/assignments/${assignmentId}/submissions`, { params }),
    enabled: Boolean(assignmentId),
  });
}

export function useMySubmission(assignmentId?: string) {
  return useQuery({
    queryKey: ["assignments", assignmentId, "my-submission"],
    queryFn: () => apiGet<AssignmentSubmission | null>(`/assignments/${assignmentId}/my-submission`),
    enabled: Boolean(assignmentId),
  });
}

export function useSubmitAssignment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { comment?: string; files?: File[] }) => {
      const formData = new FormData();
      if (body.comment) formData.append("comment", body.comment);
      body.files?.forEach((file) => formData.append("files", file));
      return apiPost<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", assignmentId, "my-submission"] });
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

export function useAllowResubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<AssignmentSubmission>(`/submissions/${id}/allow-resubmission`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments"] }),
  });
}
