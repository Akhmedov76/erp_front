import { useQuery } from "@tanstack/react-query";

import { apiGetPaginated } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { ListQueryParams } from "@/types/api";
import type { Payment } from "@/types/records";
import type { Student, StudentCreateInput, StudentListItem, StudentUpdateInput } from "@/types/people";

export const studentHooks = createCrudHooks<Student, StudentCreateInput, StudentUpdateInput>("students");

export const useStudents = studentHooks.useList;
export const useStudent = studentHooks.useDetail;
export const useCreateStudent = studentHooks.useCreate;
export const useUpdateStudent = studentHooks.useUpdate;
export const useDeleteStudent = studentHooks.useRemove;

export function useStudentPayments(studentId?: string, params?: ListQueryParams) {
  return useQuery({
    queryKey: ["students", studentId, "payments", params ?? {}],
    queryFn: () => apiGetPaginated<Payment>(`/students/${studentId}/payments`, { params }),
    enabled: Boolean(studentId),
  });
}

export type { Student, StudentListItem, StudentCreateInput, StudentUpdateInput };
