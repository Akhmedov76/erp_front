import { useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/common/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGroups } from "@/hooks/api/use-groups";
import { useSubjects } from "@/hooks/api/use-subjects";
import { useTeacher } from "@/hooks/api/use-teachers";
import { ROLES } from "@/lib/constants";
import { formatDate, formatMoney, initials } from "@/lib/utils";
import { AssignGroupDialog } from "@/pages/teachers/assign-group-dialog";
import { TeacherFormDialog } from "@/pages/teachers/teacher-form-dialog";
import { useAuthStore } from "@/stores/auth-store";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSuperAdmin = useAuthStore((state) => state.user?.role) === ROLES.SUPERADMIN;
  const [editOpen, setEditOpen] = useState(false);
  const [assignGroupOpen, setAssignGroupOpen] = useState(false);

  const { data: teacher, isLoading } = useTeacher(id);
  const { data: subjects } = useSubjects({ teacher_id: id, limit: 50 });
  const { data: groups } = useGroups({ teacher_id: id, limit: 50 });

  if (isLoading || !teacher) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </Button>

      <PageHeader
        title={teacher.fullName ?? `${teacher.first_name} ${teacher.last_name}`}
        description={teacher.specialization}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials(`${teacher.first_name} ${teacher.last_name}`)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">
              {teacher.first_name} {teacher.last_name}
            </CardTitle>
            <StatusBadge status={teacher.status} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Telefon" value={teacher.phone} />
            <InfoRow label="Email" value={teacher.email} />
            <InfoRow label="Tug'ilgan sana" value={formatDate(teacher.birth_date)} />
            <InfoRow label="Tajribasi" value={`${teacher.experience} yil`} />
            {teacher.salary && <InfoRow label="Maosh" value={formatMoney(teacher.salary)} />}
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fanlar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subjects?.items.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fan</TableHead>
                      <TableHead>Kurs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.items.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.courseName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="Fanlar biriktirilmagan" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Guruhlar</CardTitle>
              {isSuperAdmin && (
                <Button size="sm" onClick={() => setAssignGroupOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Guruhga biriktirish
                </Button>
              )}
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
                      <TableRow key={g.id} className="cursor-pointer" onClick={() => navigate(`/groups/${g.id}`)}>
                        <TableCell>{g.name}</TableCell>
                        <TableCell>{g.courseName}</TableCell>
                        <TableCell>
                          {g.studentCount}/{g.capacity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="Guruhlar biriktirilmagan" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TeacherFormDialog open={editOpen} onOpenChange={setEditOpen} teacher={teacher} />
      {isSuperAdmin && id && (
        <AssignGroupDialog
          open={assignGroupOpen}
          onOpenChange={setAssignGroupOpen}
          teacherId={id}
          currentGroupIds={groups?.items.map((g) => g.id) ?? []}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
