import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { PageLoader } from "@/components/common/page-loader";
import { ProtectedRoute } from "@/routes/protected-route";
import { RoleRoute } from "@/routes/role-route";

const LoginPage = lazy(() => import("@/pages/auth/login-page"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page"));
const ProfilePage = lazy(() => import("@/pages/profile/profile-page"));

const StudentsListPage = lazy(() => import("@/pages/students/students-list-page"));
const StudentDetailPage = lazy(() => import("@/pages/students/student-detail-page"));

const TeachersListPage = lazy(() => import("@/pages/teachers/teachers-list-page"));
const TeacherDetailPage = lazy(() => import("@/pages/teachers/teacher-detail-page"));

const CoursesListPage = lazy(() => import("@/pages/courses/courses-list-page"));
const SubjectsListPage = lazy(() => import("@/pages/subjects/subjects-list-page"));

const GroupsListPage = lazy(() => import("@/pages/groups/groups-list-page"));
const GroupDetailPage = lazy(() => import("@/pages/groups/group-detail-page"));

const SchedulesListPage = lazy(() => import("@/pages/schedules/schedules-list-page"));
const AttendanceListPage = lazy(() => import("@/pages/attendance/attendance-list-page"));
const GradesListPage = lazy(() => import("@/pages/grades/grades-list-page"));

const AssignmentsListPage = lazy(() => import("@/pages/assignments/assignments-list-page"));
const AssignmentDetailPage = lazy(() => import("@/pages/assignments/assignment-detail-page"));

const PaymentsListPage = lazy(() => import("@/pages/payments/payments-list-page"));
const NotificationsPage = lazy(() => import("@/pages/notifications/notifications-page"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/analytics-page"));
const ReportsPage = lazy(() => import("@/pages/reports/reports-page"));
const AuditLogsPage = lazy(() => import("@/pages/audit-logs/audit-logs-page"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route element={<RoleRoute allow={["SUPERADMIN", "TEACHER"]} />}>
                <Route path="/students" element={<StudentsListPage />} />
              </Route>
              <Route path="/students/:id" element={<StudentDetailPage />} />

              <Route element={<RoleRoute allow={["SUPERADMIN"]} />}>
                <Route path="/teachers" element={<TeachersListPage />} />
                <Route path="/teachers/:id" element={<TeacherDetailPage />} />
                <Route path="/courses" element={<CoursesListPage />} />
                <Route path="/subjects" element={<SubjectsListPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>

              <Route element={<RoleRoute allow={["SUPERADMIN", "TEACHER"]} />}>
                <Route path="/groups" element={<GroupsListPage />} />
                <Route path="/groups/:id" element={<GroupDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              <Route path="/schedules" element={<SchedulesListPage />} />
              <Route path="/attendance" element={<AttendanceListPage />} />
              <Route path="/grades" element={<GradesListPage />} />
              <Route path="/assignments" element={<AssignmentsListPage />} />
              <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              <Route element={<RoleRoute allow={["SUPERADMIN", "STUDENT"]} />}>
                <Route path="/payments" element={<PaymentsListPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
