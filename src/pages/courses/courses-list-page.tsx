import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/common/status-badge";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { useCourses, useDeleteCourse } from "@/hooks/api/use-courses";
import { useListQueryState } from "@/hooks/use-list-query-state";
import { formatMoney, getErrorMessage } from "@/lib/utils";
import type { Course } from "@/types/academic";
import { CourseFormDialog } from "@/pages/courses/course-form-dialog";

export default function CoursesListPage() {
  const { page, setPage, search, setSearch, params } = useListQueryState();
  const { data, isLoading } = useCourses(params);
  const deleteCourse = useDeleteCourse();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>();

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (course: Course) => {
    setEditing(course);
    setFormOpen(true);
  };

  const columns: ColumnDef<Course, unknown>[] = [
    { accessorKey: "name", header: "Nomi" },
    { accessorKey: "duration", header: "Davomiyligi", cell: ({ row }) => `${row.original.duration} hafta` },
    { accessorKey: "price", header: "Narxi", cell: ({ row }) => formatMoney(row.original.price) },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
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
            isPending={deleteCourse.isPending}
            onConfirm={() =>
              deleteCourse.mutate(row.original.id, {
                onSuccess: () => toast.success("Kurs o'chirildi"),
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
        title="Kurslar"
        description="O'quv markazi taklif qiladigan kurslar ro'yxati"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yangi kurs
          </Button>
        }
      />
      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Kurs nomi bo'yicha qidirish..." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Kurslar topilmadi"
      />
      <CourseFormDialog open={formOpen} onOpenChange={setFormOpen} course={editing} />
    </div>
  );
}
