import { useState } from "react";
import { ArrowLeft, Pencil, Plus, UserMinus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { PageHeader } from "@/components/common/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGroup, useGroupStudents, useRemoveGroupStudent } from "@/hooks/api/use-groups";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { AddStudentDialog } from "@/pages/groups/add-student-dialog";
import { GroupFormDialog } from "@/pages/groups/group-form-dialog";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: group, isLoading } = useGroup(id);
  const { data: roster } = useGroupStudents(id, { limit: 100 });
  const removeStudent = useRemoveGroupStudent(id ?? "");

  if (isLoading || !group) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </Button>

      <PageHeader
        title={group.name}
        description={`${group.courseName} · ${group.teacherName ?? "O'qituvchi biriktirilmagan"}`}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sig'imi</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {group.studentCount}/{group.capacity}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Xona</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{group.room || "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Holati</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={group.status} className="text-sm" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">O'quvchilar ro'yxati</CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={group.studentCount >= group.capacity}>
            <Plus className="h-4 w-4" />
            Qo'shish
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {roster?.items.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>F.I.Sh</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Qo'shilgan sana</TableHead>
                  <TableHead>Holati</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.items.map((membership) => (
                  <TableRow
                    key={membership.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/students/${membership.student.id}`)}
                  >
                    <TableCell>{membership.student.fullName}</TableCell>
                    <TableCell>{membership.student.phone}</TableCell>
                    <TableCell>{formatDate(membership.joined_at)}</TableCell>
                    <TableCell>
                      <StatusBadge status={membership.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ConfirmDeleteDialog
                        trigger={
                          <Button variant="ghost" size="icon">
                            <UserMinus className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                        title="O'quvchini guruhdan chiqarish"
                        description="Bu o'quvchi guruh tarkibidan chiqariladi."
                        isPending={removeStudent.isPending}
                        onConfirm={() =>
                          removeStudent.mutate(membership.student.id, {
                            onSuccess: () => toast.success("O'quvchi guruhdan chiqarildi"),
                            onError: (error) => toast.error(getErrorMessage(error)),
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Guruhda o'quvchilar yo'q" />
          )}
        </CardContent>
      </Card>

      <GroupFormDialog open={editOpen} onOpenChange={setEditOpen} group={group} />
      {id && <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} groupId={id} />}
    </div>
  );
}
