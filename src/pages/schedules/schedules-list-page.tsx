import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteSchedule, useSchedules } from "@/hooks/api/use-schedules";
import { ROLES } from "@/lib/constants";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Schedule } from "@/types/academic";
import { ScheduleFormDialog } from "@/pages/schedules/schedule-form-dialog";

export default function SchedulesListPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const [page, setPage] = useState(1);
  const [date, setDate] = useState("");
  const { data, isLoading } = useSchedules({ page, limit: 20, date: date || undefined });
  const deleteSchedule = useDeleteSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | undefined>();

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (schedule: Schedule) => {
    setEditing(schedule);
    setFormOpen(true);
  };

  const columns: ColumnDef<Schedule, unknown>[] = [
    { accessorKey: "date", header: "Sana", cell: ({ row }) => formatDate(row.original.date) },
    {
      id: "time",
      header: "Vaqt",
      cell: ({ row }) => `${row.original.start_time.slice(0, 5)}–${row.original.end_time.slice(0, 5)}`,
    },
    { accessorKey: "groupName", header: "Guruh" },
    { accessorKey: "subjectName", header: "Fan" },
    { accessorKey: "teacherName", header: "O'qituvchi" },
    { accessorKey: "room", header: "Xona", cell: ({ row }) => row.original.room || "—" },
    ...(isSuperAdmin
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Schedule } }) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDeleteDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  isPending={deleteSchedule.isPending}
                  onConfirm={() =>
                    deleteSchedule.mutate(row.original.id, {
                      onSuccess: () => toast.success("Dars jadvali o'chirildi"),
                      onError: (error) => toast.error(getErrorMessage(error)),
                    })
                  }
                />
              </div>
            ),
          } satisfies ColumnDef<Schedule, unknown>,
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dars jadvali"
        description="Guruhlar bo'yicha dars jadvali"
        actions={
          isSuperAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Yangi dars
            </Button>
          ) : undefined
        }
      />
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
        {date && (
          <Button variant="ghost" size="sm" onClick={() => setDate("")}>
            Tozalash
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Dars jadvali topilmadi"
      />
      {isSuperAdmin && <ScheduleFormDialog open={formOpen} onOpenChange={setFormOpen} schedule={editing} />}
    </div>
  );
}
