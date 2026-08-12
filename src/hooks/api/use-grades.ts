import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiPost } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { BulkGradeInput, Grade, GradeInput } from "@/types/records";

export const gradeHooks = createCrudHooks<Grade, GradeInput, Partial<GradeInput>>("grades");

export const useGrades = gradeHooks.useList;
export const useGrade = gradeHooks.useDetail;
export const useCreateGrade = gradeHooks.useCreate;
export const useUpdateGrade = gradeHooks.useUpdate;
export const useDeleteGrade = gradeHooks.useRemove;

export function useBulkGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkGradeInput) => apiPost<Grade[], BulkGradeInput>("/grades/bulk", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grades"] }),
  });
}
