import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Subject, SubjectInput } from "@/types/academic";

export const subjectHooks = createCrudHooks<Subject, SubjectInput, Partial<SubjectInput>>("subjects");

export const useSubjects = subjectHooks.useList;
export const useSubject = subjectHooks.useDetail;
export const useCreateSubject = subjectHooks.useCreate;
export const useUpdateSubject = subjectHooks.useUpdate;
export const useDeleteSubject = subjectHooks.useRemove;
