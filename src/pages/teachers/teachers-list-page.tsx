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
import { useDeleteTeacher, useTeachers } from "@/hooks/api/use-teachers";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { getErrorMessage } from "@/lib/utils";
import type { TeacherListItem } from "@/types/people";
import { TeacherFormDialog } from "@/pages/teachers/teacher-form-dialog";

export default function TeachersListPage() {
  const navigate = useNavigate();
  const { page, setPage, search, setSearch, params } = useListQueryState();
  const { data, isLoading } = useTeachers(params);
  const deleteTeacher = useDeleteTeacher();
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<TeacherListItem, unknown>[] = [
    { accessorKey: "fullName", header: "F.I.Sh" },
    { accessorKey: "specialization", header: "Mutaxassislik" },
    { accessorKey: "phone", header: "Telefon" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <ConfirmDeleteDialog
            trigger={
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            isPending={deleteTeacher.isPending}
            onConfirm={() =>
              deleteTeacher.mutate(row.original.id, {
                onSuccess: () => toast.success("O'qituvchi o'chirildi"),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="O'qituvchilar"
        description="Barcha o'qituvchilar ro'yxati"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Yangi o'qituvchi
          </Button>
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Ism, telefon yoki email bo'yicha qidirish..." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="O'qituvchilar topilmadi"
        onRowClick={(row) => navigate(`/teachers/${row.id}`)}
      />
      <TeacherFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
