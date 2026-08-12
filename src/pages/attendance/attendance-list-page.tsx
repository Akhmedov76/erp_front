import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendanceList } from "@/hooks/api/use-attendance";
import { useGroups } from "@/hooks/api/use-groups";
import { ATTENDANCE_STATUS_OPTIONS, ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Attendance } from "@/types/records";
import { MarkAttendancePanel } from "@/pages/attendance/mark-attendance-panel";

function AttendanceHistory() {
  const [page, setPage] = useState(1);
  const [groupId, setGroupId] = useState("");
  const [status, setStatus] = useState("");
  const { data: groups } = useGroups({ limit: 100 });
  const { data, isLoading } = useAttendanceList({
    page,
    limit: 20,
    group_id: groupId || undefined,
    status: status || undefined,
  });

  const columns: ColumnDef<Attendance, unknown>[] = [
    { accessorKey: "date", header: "Sana", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "studentName", header: "O'quvchi" },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "note", header: "Izoh", cell: ({ row }) => row.original.note || "—" },
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
        <Select value={status || "ALL"} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Holati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha holatlar</SelectItem>
            {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
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
        emptyTitle="Davomat ma'lumotlari topilmadi"
      />
    </div>
  );
}

export default function AttendanceListPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canMark = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;

  return (
    <div className="space-y-4">
      <PageHeader title="Davomat" description="Davomatni belgilash va tarixini ko'rish" />
      {canMark ? (
        <Tabs defaultValue="mark">
          <TabsList>
            <TabsTrigger value="mark">Belgilash</TabsTrigger>
            <TabsTrigger value="history">Tarix</TabsTrigger>
          </TabsList>
          <TabsContent value="mark">
            <MarkAttendancePanel />
          </TabsContent>
          <TabsContent value="history">
            <AttendanceHistory />
          </TabsContent>
        </Tabs>
      ) : (
        <AttendanceHistory />
      )}
    </div>
  );
}
