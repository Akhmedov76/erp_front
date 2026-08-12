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
import { useDeleteGroup, useGroups } from "@/hooks/api/use-groups";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { ROLES } from "@/lib/constants";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Group } from "@/types/academic";
import { GroupFormDialog } from "@/pages/groups/group-form-dialog";

export default function GroupsListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const { page, setPage, search, setSearch, params } = useListQueryState();
  const { data, isLoading } = useGroups(params);
  const deleteGroup = useDeleteGroup();
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<Group, unknown>[] = [
    { accessorKey: "name", header: "Nomi" },
    { accessorKey: "courseName", header: "Kurs" },
    { accessorKey: "teacherName", header: "O'qituvchi", cell: ({ row }) => row.original.teacherName ?? "—" },
    { accessorKey: "studentCount", header: "O'quvchilar", cell: ({ row }) => `${row.original.studentCount}/${row.original.capacity}` },
    { accessorKey: "start_date", header: "Boshlanish", cell: ({ row }) => formatDate(row.original.start_date) },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Group } }) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  isPending={deleteGroup.isPending}
                  onConfirm={() =>
                    deleteGroup.mutate(row.original.id, {
                      onSuccess: () => toast.success("Guruh o'chirildi"),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    })
                  }
                />
              </div>
            ),
          } satisfies ColumnDef<Group, unknown>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Guruhlar"
        description="Barcha o'quv guruhlari"
        actions={
          isSuperAdmin ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Yangi guruh
            </Button>
          ) : undefined
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Guruh nomi bo'yicha qidirish..." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Guruhlar topilmadi"
        onRowClick={(row) => navigate(`/groups/${row.id}`)}
      />
      {isSuperAdmin && <GroupFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
