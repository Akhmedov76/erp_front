import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteStudent, useStudents } from "@/hooks/api/use-students";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { ROLES, STUDENT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { StudentListItem } from "@/types/people";
import { StudentFormDialog } from "@/pages/students/student-form-dialog";

export default function StudentsListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const [status, setStatus] = useState<string>("");

  const { page, setPage, search, setSearch, params } = useListQueryState({ status });
  const { data, isLoading } = useStudents(params);
  const deleteStudent = useDeleteStudent();

  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<StudentListItem, unknown>[] = [
    { accessorKey: "fullName", header: "F.I.Sh" },
    { accessorKey: "phone", header: "Telefon" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "enrollment_date", header: "Ro'yxatga olingan", cell: ({ row }) => formatDate(row.original.enrollment_date) },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: StudentListItem } }) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  isPending={deleteStudent.isPending}
                  onConfirm={() =>
                    deleteStudent.mutate(row.original.id, {
                      onSuccess: () => toast.success("O'quvchi o'chirildi"),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    })
                  }
                />
              </div>
            ),
          } satisfies ColumnDef<StudentListItem, unknown>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="O'quvchilar"
        description="Barcha o'quvchilar ro'yxati"
        actions={
          isSuperAdmin ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Yangi o'quvchi
            </Button>
          ) : undefined
        }
      />
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ism, telefon yoki email bo'yicha qidirish..."
        filters={
          <Select value={status || "ALL"} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Holati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barcha holatlar</SelectItem>
              {STUDENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="O'quvchilar topilmadi"
        onRowClick={(row) => navigate(`/students/${row.id}`)}
      />
      {isSuperAdmin && <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
