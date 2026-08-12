import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiPost } from "@/lib/api-client";
import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Attendance, AttendanceInput, BulkAttendanceInput } from "@/types/records";

export const attendanceHooks = createCrudHooks<Attendance, AttendanceInput, Partial<AttendanceInput>>("attendance");

export const useAttendanceList = attendanceHooks.useList;
export const useAttendanceRecord = attendanceHooks.useDetail;
export const useCreateAttendance = attendanceHooks.useCreate;
export const useUpdateAttendance = attendanceHooks.useUpdate;
export const useDeleteAttendance = attendanceHooks.useRemove;

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkAttendanceInput) => apiPost<Attendance[], BulkAttendanceInput>("/attendance/bulk", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
