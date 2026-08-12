import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/api/use-audit-logs";
import { AUDIT_ACTION_OPTIONS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types/system";

const ACTION_VARIANT: Record<string, "default" | "destructive" | "success" | "warning" | "secondary"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "destructive",
  LOGIN: "secondary",
  LOGOUT: "secondary",
  PASSWORD_CHANGE: "secondary",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 25,
    entity: entity || undefined,
    action: action || undefined,
  });

  const columns: ColumnDef<AuditLog, unknown>[] = [
    {
      accessorKey: "action",
      header: "Amal",
      cell: ({ row }) => <Badge variant={ACTION_VARIANT[row.original.action] ?? "secondary"}>{row.original.action}</Badge>,
    },
    { accessorKey: "entity", header: "Obyekt" },
    { accessorKey: "entity_id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.entity_id?.slice(0, 8) ?? "—"}</span> },
    { accessorKey: "userEmail", header: "Foydalanuvchi", cell: ({ row }) => row.original.userEmail ?? "—" },
    { accessorKey: "ip", header: "IP", cell: ({ row }) => row.original.ip ?? "—" },
    { accessorKey: "created_at", header: "Vaqt", cell: ({ row }) => formatDateTime(row.original.created_at) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit jurnali" description="Tizimdagi barcha o'zgarishlar tarixi" />
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Obyekt nomi (masalan: Student)"
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          className="w-56"
        />
        <Select
          value={action || "ALL"}
          onValueChange={(v) => {
            setAction(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Amal turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha amallar</SelectItem>
            {AUDIT_ACTION_OPTIONS.map((opt) => (
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
        emptyTitle="Yozuvlar topilmadi"
      />
    </div>
  );
}
