import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type {
  AttendanceAnalytics,
  CoursePerformance,
  DashboardStats,
  GradeAnalytics,
  GroupPerformance,
  ImprovedStudent,
  StudentPerformance,
} from "@/types/analytics";

export interface RankingParams {
  limit?: number;
  groupId?: string;
  courseId?: string;
  from?: string;
  to?: string;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => apiGet<DashboardStats>("/analytics/dashboard"),
  });
}

export function useStudentPerformance(studentId?: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["analytics", "student", studentId, params ?? {}],
    queryFn: () => apiGet<StudentPerformance>(`/analytics/students/${studentId}`, { params }),
    enabled: Boolean(studentId),
  });
}

export function useTopStudents(params?: RankingParams) {
  return useQuery({
    queryKey: ["analytics", "top-students", params ?? {}],
    queryFn: () => apiGet<StudentPerformance[]>("/analytics/top-students", { params }),
  });
}

export function useLowPerformingStudents(params?: RankingParams) {
  return useQuery({
    queryKey: ["analytics", "low-performing", params ?? {}],
    queryFn: () => apiGet<StudentPerformance[]>("/analytics/low-performing-students", { params }),
  });
}

export function useMostImprovedStudents(params?: RankingParams) {
  return useQuery({
    queryKey: ["analytics", "most-improved", params ?? {}],
    queryFn: () => apiGet<ImprovedStudent[]>("/analytics/most-improved", { params }),
  });
}

export function useGroupPerformance(groupId?: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["analytics", "group", groupId, params ?? {}],
    queryFn: () => apiGet<GroupPerformance>(`/analytics/groups/${groupId}`, { params }),
    enabled: Boolean(groupId),
  });
}

export function useCoursePerformance(courseId?: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["analytics", "course", courseId, params ?? {}],
    queryFn: () => apiGet<CoursePerformance>(`/analytics/courses/${courseId}`, { params }),
    enabled: Boolean(courseId),
  });
}

export function useAttendanceAnalytics(params?: { groupId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["analytics", "attendance", params ?? {}],
    queryFn: () => apiGet<AttendanceAnalytics>("/analytics/attendance", { params }),
  });
}

export function useGradeAnalytics(params?: { groupId?: string; subjectId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["analytics", "grades", params ?? {}],
    queryFn: () => apiGet<GradeAnalytics>("/analytics/grades", { params }),
  });
}
