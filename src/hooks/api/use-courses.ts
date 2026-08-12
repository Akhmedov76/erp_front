import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Course, CourseInput } from "@/types/academic";

export const courseHooks = createCrudHooks<Course, CourseInput, Partial<CourseInput>>("courses");

export const useCourses = courseHooks.useList;
export const useCourse = courseHooks.useDetail;
export const useCreateCourse = courseHooks.useCreate;
export const useUpdateCourse = courseHooks.useUpdate;
export const useDeleteCourse = courseHooks.useRemove;
