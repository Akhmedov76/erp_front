import {
  BookOpen,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FilePlus2,
  GraduationCap,
  ListChecks,
  PlusCircle,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAssignments } from "@/hooks/api/use-assignments";
import { useDashboardStats, useLowPerformingStudents, useStudentPerformance, useTopStudents } from "@/hooks/api/use-analytics";
import { useAttendanceList } from "@/hooks/api/use-attendance";
import { useGrades } from "@/hooks/api/use-grades";
import { useGroups } from "@/hooks/api/use-groups";
import { useSchedules } from "@/hooks/api/use-schedules";
import { useStudents } from "@/hooks/api/use-students";
import { ROLES } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { AssignmentTypeBadge } from "@/pages/assignments/assignment-type-badge";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === ROLES.SUPERADMIN) return <SuperAdminDashboard />;
  if (role === ROLES.TEACHER) return <TeacherDashboard />;
  return <StudentDashboard />;
}

function QuickAction({ to, label, icon: Icon }: { to: string; label: string; icon: typeof PlusCircle }) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start gap-3 py-3">
      <Link to={to}>
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Link>
    </Button>
  );
}

function RankedStudentsTable({ students }: { students: { studentId: string; studentName: string; overallScore: number; level: string | null }[] | undefined }) {
  if (!students?.length) return <EmptyState title="Ma'lumot yo'q" />;
  return (
    <Table>
      <TableBody>
        {students.map((s, i) => (
          <TableRow key={s.studentId}>
            <TableCell className="w-8 text-muted-foreground">{i + 1}</TableCell>
            <TableCell>
              <Link to={`/students/${s.studentId}`} className="hover:underline">
                {s.studentName}
              </Link>
            </TableCell>
            <TableCell className="text-right font-medium">{s.overallScore}</TableCell>
            <TableCell className="w-28">{s.level && <StatusBadge status={s.level} />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SuperAdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: topStudents } = useTopStudents({ limit: 5 });
  const { data: lowStudents } = useLowPerformingStudents({ limit: 5 });

  if (isLoading || !stats) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Boshqaruv paneli" description="Tizim bo'yicha umumiy ko'rsatkichlar" />

      <div className="grid gap-2 sm:grid-cols-3">
        <QuickAction to="/students" label="Yangi o'quvchi qo'shish" icon={UserPlus} />
        <QuickAction to="/groups" label="Yangi guruh yaratish" icon={PlusCircle} />
        <QuickAction to="/payments" label="To'lov qayd etish" icon={Wallet} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="O'quvchilar" value={stats.totalStudents} icon={GraduationCap} />
        <StatCard label="O'qituvchilar" value={stats.totalTeachers} icon={Users} accent="success" />
        <StatCard label="Guruhlar" value={stats.totalGroups} icon={BookOpen} accent="warning" />
        <StatCard label="Kurslar" value={stats.totalCourses} icon={ListChecks} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Shu oydagi tushum" value={formatMoney(stats.revenueThisMonth)} icon={Wallet} accent="success" />
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                Bugungi davomat foizi
              </span>
              <span className="font-semibold">{stats.attendanceRateToday !== null ? `${stats.attendanceRateToday}%` : "—"}</span>
            </div>
            <Progress value={stats.attendanceRateToday ?? 0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eng yaxshi o'quvchilar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RankedStudentsTable students={topStudents} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diqqat talab qiluvchi o'quvchilar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RankedStudentsTable students={lowStudents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { data: groups } = useGroups({ limit: 5, status: "ACTIVE" });
  const today = new Date().toISOString().slice(0, 10);
  const { data: todaySchedules } = useSchedules({ date: today, limit: 10, ordering: "start_time" });
  const now = new Date().toTimeString().slice(0, 5);

  const totalStudents = groups?.items.reduce((sum, g) => sum + g.studentCount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Bosh sahifa" description="Bugungi darslar va guruhlaringiz" />

      <div className="grid gap-2 sm:grid-cols-3">
        <QuickAction to="/attendance" label="Davomat belgilash" icon={ClipboardCheck} />
        <QuickAction to="/grades" label="Baho qo'yish" icon={ListChecks} />
        <QuickAction to="/assignments" label="Topshiriq yaratish" icon={FilePlus2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Faol guruhlar" value={groups?.meta?.total ?? 0} icon={Users} />
        <StatCard label="Jami o'quvchilar" value={totalStudents} icon={GraduationCap} accent="success" />
        <StatCard label="Bugungi darslar" value={todaySchedules?.meta?.total ?? 0} icon={CalendarClock} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bugungi darslar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todaySchedules?.items.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vaqt</TableHead>
                    <TableHead>Guruh</TableHead>
                    <TableHead>Fan</TableHead>
                    <TableHead>Xona</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySchedules.items.map((s) => {
                    const isNow = now >= s.start_time.slice(0, 5) && now <= s.end_time.slice(0, 5);
                    const isPast = now > s.end_time.slice(0, 5);
                    return (
                      <TableRow key={s.id} className={isNow ? "bg-primary/5" : undefined}>
                        <TableCell className={isPast ? "text-muted-foreground" : "font-medium"}>
                          {s.start_time.slice(0, 5)}
                          {isNow && <span className="ml-2 text-xs text-primary">● hozir</span>}
                        </TableCell>
                        <TableCell>
                          <Link to={`/groups/${s.group}`} className="hover:underline">
                            {s.groupName}
                          </Link>
                        </TableCell>
                        <TableCell>{s.subjectName}</TableCell>
                        <TableCell>{s.room || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Bugun darslar yo'q" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guruhlaringiz</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {groups?.items.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guruh</TableHead>
                    <TableHead>Kurs</TableHead>
                    <TableHead>O'quvchilar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.items.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <Link to={`/groups/${g.id}`} className="text-primary hover:underline">
                          {g.name}
                        </Link>
                      </TableCell>
                      <TableCell>{g.courseName}</TableCell>
                      <TableCell>
                        {g.studentCount}/{g.capacity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Guruhlar mavjud emas" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { data: ownProfile } = useStudents({ limit: 1 });
  const studentId = ownProfile?.items[0]?.id;

  const { data: performance } = useStudentPerformance(studentId);
  const { data: grades } = useGrades({ limit: 5 });
  const { data: attendance } = useAttendanceList({ limit: 5 });
  const today = new Date().toISOString().slice(0, 10);
  const { data: todaySchedules } = useSchedules({ date: today, limit: 10, ordering: "start_time" });
  const { data: upcomingAssignments } = useAssignments({ limit: 3, ordering: "deadline" });

  return (
    <div className="space-y-6">
      <PageHeader title="Bosh sahifa" description="Sizning o'quv natijalaringiz" />

      {performance && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{performance.overallScore}</span>
                <span className="text-sm text-muted-foreground">/ 100 umumiy ball</span>
              </div>
              {performance.level && <StatusBadge status={performance.level} className="text-sm" />}
            </div>
            <Progress value={performance.overallScore} />
          </CardContent>
        </Card>
      )}

      {performance && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Baholar" value={performance.gradeScore} icon={GraduationCap} accent="success" />
          <StatCard label="Imtihonlar" value={performance.examScore} icon={ListChecks} />
          <StatCard label="Davomat" value={`${performance.attendanceScore}%`} icon={CalendarCheck} accent="warning" />
          <StatCard label="Topshiriqlar" value={performance.assignmentScore} icon={ClipboardList} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bugungi darslar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todaySchedules?.items.length ? (
              <Table>
                <TableBody>
                  {todaySchedules.items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.start_time.slice(0, 5)}</TableCell>
                      <TableCell>{s.subjectName}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{s.room || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Bugun darslar yo'q" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yaqinlashayotgan topshiriqlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingAssignments?.items.length ? (
              <Table>
                <TableBody>
                  {upcomingAssignments.items.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer">
                      <TableCell>
                        <Link to={`/assignments/${a.id}`} className="flex items-center gap-2">
                          <span className="hover:underline">{a.title}</span>
                          <AssignmentTypeBadge type={a.assignment_type} />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatDateTime(a.deadline)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Topshiriqlar mavjud emas" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">So'nggi baholar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {grades?.items.length ? (
              <Table>
                <TableBody>
                  {grades.items.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.subjectName}</TableCell>
                      <TableCell>
                        {g.score}/{g.max_score}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatDate(g.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Baholar mavjud emas" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">So'nggi davomat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attendance?.items.length ? (
              <Table>
                <TableBody>
                  {attendance.items.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Davomat mavjud emas" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
