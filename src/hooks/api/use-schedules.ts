import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Schedule, ScheduleInput } from "@/types/academic";

export const scheduleHooks = createCrudHooks<Schedule, ScheduleInput, Partial<ScheduleInput>>("schedules");

export const useSchedules = scheduleHooks.useList;
export const useSchedule = scheduleHooks.useDetail;
export const useCreateSchedule = scheduleHooks.useCreate;
export const useUpdateSchedule = scheduleHooks.useUpdate;
export const useDeleteSchedule = scheduleHooks.useRemove;
