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
import { useAssignments, useDeleteAssignment } from "@/hooks/api/use-assignments";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { ROLES } from "@/lib/constants";
import { formatDateTime, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Assignment } from "@/types/records";
import { AssignmentFormDialog } from "@/pages/assignments/assignment-form-dialog";

export default function AssignmentsListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;
  const { page, setPage, search, setSearch, params } = useListQueryState();
  const { data, isLoading } = useAssignments(params);
  const deleteAssignment = useDeleteAssignment();
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<Assignment, unknown>[] = [
    { accessorKey: "title", header: "Sarlavha" },
    { accessorKey: "groupName", header: "Guruh" },
    { accessorKey: "subjectName", header: "Fan" },
    { accessorKey: "deadline", header: "Muddat", cell: ({ row }) => formatDateTime(row.original.deadline) },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Assignment } }) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  isPending={deleteAssignment.isPending}
                  onConfirm={() =>
                    deleteAssignment.mutate(row.original.id, {
                      onSuccess: () => toast.success("Topshiriq o'chirildi"),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    })
                  }
                />
              </div>
            ),
          } satisfies ColumnDef<Assignment, unknown>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Topshiriqlar"
        description="Guruhlar uchun topshiriqlar ro'yxati"
        actions={
          canManage ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Yangi topshiriq
            </Button>
          ) : undefined
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Sarlavha bo'yicha qidirish..." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Topshiriqlar topilmadi"
        onRowClick={(row) => navigate(`/assignments/${row.id}`)}
      />
      {canManage && <AssignmentFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
