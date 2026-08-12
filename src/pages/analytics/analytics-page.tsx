import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  useAttendanceAnalytics,
  useGradeAnalytics,
  useGroupPerformance,
  useLowPerformingStudents,
  useMostImprovedStudents,
  useTopStudents,
} from "@/hooks/api/use-analytics";
import { useGroups } from "@/hooks/api/use-groups";
import { ROLES } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { Group } from "@/types/academic";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export default function AnalyticsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isTeacher = role === ROLES.TEACHER;
  const [groupId, setGroupId] = useState("");
  const { data: groups } = useGroups({ limit: 100 });

  const params = { limit: 5, groupId: groupId || undefined };
  const { data: topStudents, isLoading: topLoading } = useTopStudents(params);
  const { data: lowStudents } = useLowPerformingStudents(params);
  const { data: improved } = useMostImprovedStudents(params);
  const { data: attendanceAnalytics } = useAttendanceAnalytics({ groupId: groupId || undefined });
  const { data: gradeAnalytics } = useGradeAnalytics({ groupId: groupId || undefined });

  if (topLoading) return <PageLoader />;

  const attendanceChartData = attendanceAnalytics
    ? Object.entries(attendanceAnalytics.breakdown).map(([status, count]) => ({ name: status, value: count }))
    : [];

  const gradeChartData =
    gradeAnalytics?.byType.map((item) => ({ name: item.grade_type, average: Number(item.average.toFixed(1)) })) ?? [];

  return (
    <div className="space-y-4">
      <PageHeader title="Analitika" description="O'quvchilar samaradorligi va statistika" />

      <Select value={groupId || "ALL"} onValueChange={(v) => setGroupId(v === "ALL" ? "" : v)}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Guruh bo'yicha filtrlash" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Barcha guruhlar</SelectItem>
          {groups?.items.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isTeacher && groups?.items.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guruhlarim bo'yicha o'rtacha ball</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.items.map((g) => (
              <GroupScoreCard key={g.id} group={g} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Davomat taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceChartData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={attendanceChartData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {attendanceChartData.map((_entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Ma'lumot yo'q" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Baholar turi bo'yicha o'rtacha</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeChartData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={gradeChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Ma'lumot yo'q" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RankingCard title="Eng yaxshi o'quvchilar">
          {topStudents?.length ? (
            <Table>
              <TableBody>
                {topStudents.map((s, i) => (
                  <TableRow key={s.studentId}>
                    <TableCell className="w-8 text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>{s.studentName}</TableCell>
                    <TableCell className="text-right font-medium">{s.overallScore}</TableCell>
                    <TableCell>{s.level && <StatusBadge status={s.level} />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Ma'lumot yo'q" />
          )}
        </RankingCard>

        <RankingCard title="Yordam kerak bo'lgan o'quvchilar">
          {lowStudents?.length ? (
            <Table>
              <TableBody>
                {lowStudents.map((s, i) => (
                  <TableRow key={s.studentId}>
                    <TableCell className="w-8 text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>{s.studentName}</TableCell>
                    <TableCell className="text-right font-medium">{s.overallScore}</TableCell>
                    <TableCell>{s.level && <StatusBadge status={s.level} />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Ma'lumot yo'q" />
          )}
        </RankingCard>

        <RankingCard title="Eng ko'p rivojlangan o'quvchilar">
          {improved?.length ? (
            <Table>
              <TableBody>
                {improved.map((s) => (
                  <TableRow key={s.studentId}>
                    <TableCell>{s.studentName}</TableCell>
                    <TableCell className="text-right font-medium text-success">
                      +{s.improvement}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Ma'lumot yo'q" />
          )}
        </RankingCard>
      </div>
    </div>
  );
}

function RankingCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function GroupScoreCard({ group }: { group: Group }) {
  const { data: performance } = useGroupPerformance(group.id);
  const score = performance?.averageScore ?? 0;

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{group.name}</span>
        <span className="text-muted-foreground">{group.studentCount} o'quvchi</span>
      </div>
      <Progress value={score} />
      <p className="text-right text-sm font-semibold">{performance ? score : "—"}</p>
    </div>
  );
}
