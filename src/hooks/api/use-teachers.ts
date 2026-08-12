import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Teacher, TeacherCreateInput, TeacherUpdateInput } from "@/types/people";

export const teacherHooks = createCrudHooks<Teacher, TeacherCreateInput, TeacherUpdateInput>("teachers");

export const useTeachers = teacherHooks.useList;
export const useTeacher = teacherHooks.useDetail;
export const useCreateTeacher = teacherHooks.useCreate;
export const useUpdateTeacher = teacherHooks.useUpdate;
export const useDeleteTeacher = teacherHooks.useRemove;
