export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalCourses: number;
  revenueThisMonth: string | number;
  attendanceRateToday: number | null;
}

export type PerformanceLevel = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "CRITICAL";

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  gradeScore: number;
  examScore: number;
  attendanceScore: number;
  assignmentScore: number;
  overallScore: number;
  level: PerformanceLevel | null;
}

export interface ImprovedStudent {
  studentId: string;
  studentName: string;
  previousScore: number;
  currentScore: number;
  improvement: number;
}

export interface GroupPerformance {
  groupId: string;
  groupName: string;
  studentCount: number;
  averageScore: number;
  students: StudentPerformance[];
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  studentCount: number;
  averageScore: number;
  groupCount: number;
}

export interface AttendanceAnalytics {
  total: number;
  breakdown: Record<string, number>;
  attendanceRate: number | null;
}

export interface GradeAnalyticsByType {
  grade_type: string;
  average: number;
  count: number;
}

export interface GradeAnalytics {
  totalGrades: number;
  byType: GradeAnalyticsByType[];
}
