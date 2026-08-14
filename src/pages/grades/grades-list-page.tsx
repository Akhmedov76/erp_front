import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGrades } from "@/hooks/api/use-grades";
import { useGroups } from "@/hooks/api/use-groups";
import { GRADE_TYPE_OPTIONS, ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Grade } from "@/types/records";
import { BulkGradesPanel } from "@/pages/grades/bulk-grades-panel";

function GradesHistory() {
  const [page, setPage] = useState(1);
  const [groupId, setGroupId] = useState("");
  const [gradeType, setGradeType] = useState("");
  const { data: groups } = useGroups({ limit: 100 });
  const { data, isLoading } = useGrades({
    page,
    limit: 20,
    group_id: groupId || undefined,
    grade_type: gradeType || undefined,
  });

  const columns: ColumnDef<Grade, unknown>[] = [
    { accessorKey: "date", header: "Sana", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "studentName", header: "O'quvchi" },
    { accessorKey: "subjectName", header: "Fan" },
    { accessorKey: "grade_type", header: "Turi" },
    { id: "score", header: "Ball", cell: ({ row }) => `${row.original.score}/${row.original.max_score}` },
    { accessorKey: "comment", header: "Izoh", cell: ({ row }) => row.original.comment || "—" },
    {
      id: "source",
      header: "Manba",
      cell: ({ row }) =>
        row.original.fromSubmission ? (
          <Badge variant="secondary">Topshiriqdan</Badge>
        ) : (
          <span className="text-muted-foreground">Qo'lda</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={groupId || "ALL"} onValueChange={(v) => setGroupId(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Guruh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha guruhlar</SelectItem>
            {groups?.items.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gradeType || "ALL"} onValueChange={(v) => setGradeType(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha turlar</SelectItem>
            {GRADE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="Baholar topilmadi"
      />
    </div>
  );
}

export default function GradesListPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canGrade = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;

  return (
    <div className="space-y-4">
      <PageHeader title="Baholar" description="Baholarni qo'yish va tarixini ko'rish" />
      {canGrade ? (
        <Tabs defaultValue="mark">
          <TabsList>
            <TabsTrigger value="mark">Baholash</TabsTrigger>
            <TabsTrigger value="history">Tarix</TabsTrigger>
          </TabsList>
          <TabsContent value="mark">
            <BulkGradesPanel />
          </TabsContent>
          <TabsContent value="history">
            <GradesHistory />
          </TabsContent>
        </Tabs>
      ) : (
        <GradesHistory />
      )}
    </div>
  );
}
