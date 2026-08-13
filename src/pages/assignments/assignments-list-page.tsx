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
import { useAssignments, useDeleteAssignment } from "@/hooks/api/use-assignments";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { ASSIGNMENT_TYPE_OPTIONS, ROLES } from "@/lib/constants";
import { formatDateTime, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Assignment } from "@/types/records";
import { AssignmentFormDialog } from "@/pages/assignments/assignment-form-dialog";
import { AssignmentTypeBadge } from "@/pages/assignments/assignment-type-badge";

export default function AssignmentsListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;
  const [assignmentType, setAssignmentType] = useState<string>("");
  const { page, setPage, search, setSearch, params } = useListQueryState({ assignment_type: assignmentType });
  const { data, isLoading } = useAssignments(params);
  const deleteAssignment = useDeleteAssignment();
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<Assignment, unknown>[] = [
    { accessorKey: "title", header: "Sarlavha" },
    {
      accessorKey: "assignment_type",
      header: "Turi",
      cell: ({ row }) => <AssignmentTypeBadge type={row.original.assignment_type} />,
    },
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
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Sarlavha bo'yicha qidirish..."
        filters={
          <Select value={assignmentType || "ALL"} onValueChange={(v) => setAssignmentType(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barcha turlar</SelectItem>
              {ASSIGNMENT_TYPE_OPTIONS.map((opt) => (
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
        emptyTitle="Topshiriqlar topilmadi"
        onRowClick={(row) => navigate(`/assignments/${row.id}`)}
      />
      {canManage && <AssignmentFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
