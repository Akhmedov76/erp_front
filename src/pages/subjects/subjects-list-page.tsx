import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useDeleteSubject, useSubjects } from "@/hooks/api/use-subjects";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { getErrorMessage } from "@/lib/utils";
import type { Subject } from "@/types/academic";
import { SubjectFormDialog } from "@/pages/subjects/subject-form-dialog";

export default function SubjectsListPage() {
  const { page, setPage, search, setSearch, params } = useListQueryState();
  const { data, isLoading } = useSubjects(params);
  const deleteSubject = useDeleteSubject();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | undefined>();

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setFormOpen(true);
  };

  const columns: ColumnDef<Subject, unknown>[] = [
    { accessorKey: "name", header: "Nomi" },
    { accessorKey: "courseName", header: "Kurs" },
    { accessorKey: "teacherName", header: "O'qituvchi", cell: ({ row }) => row.original.teacherName ?? "—" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
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
            isPending={deleteSubject.isPending}
            onConfirm={() =>
              deleteSubject.mutate(row.original.id, {
                onSuccess: () => toast.success("Fan o'chirildi"),
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
        title="Fanlar"
        description="Kurslar ichidagi fanlar ro'yxati"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yangi fan
          </Button>
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Fan nomi bo'yicha qidirish..." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Fanlar topilmadi"
      />
      <SubjectFormDialog open={formOpen} onOpenChange={setFormOpen} subject={editing} />
    </div>
  );
}
