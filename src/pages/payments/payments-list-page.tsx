import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayments } from "@/hooks/api/use-payments";
import { PAYMENT_STATUS_OPTIONS, ROLES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Payment } from "@/types/records";
import { PaymentFormDialog } from "@/pages/payments/payment-form-dialog";

export default function PaymentsListPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, isLoading } = usePayments({ page, limit: 20, status: status || undefined });
  const [formOpen, setFormOpen] = useState(false);

  const columns: ColumnDef<Payment, unknown>[] = [
    { accessorKey: "invoice_number", header: "Invoys" },
    ...(isSuperAdmin ? [{ accessorKey: "studentName", header: "O'quvchi" } satisfies ColumnDef<Payment, unknown>] : []),
    { accessorKey: "amount", header: "Summasi", cell: ({ row }) => formatMoney(row.original.amount) },
    { accessorKey: "payment_method", header: "Usuli" },
    { accessorKey: "status", header: "Holati", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "payment_date", header: "Sana", cell: ({ row }) => formatDate(row.original.payment_date) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="To'lovlar"
        description={isSuperAdmin ? "Barcha to'lovlar tarixi" : "Sizning to'lovlaringiz"}
        actions={
          isSuperAdmin ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Yangi to'lov
            </Button>
          ) : undefined
        }
      />
      <Select
        value={status || "ALL"}
        onValueChange={(v) => {
          setStatus(v === "ALL" ? "" : v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Holati" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Barcha holatlar</SelectItem>
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyTitle="To'lovlar topilmadi"
      />
      {isSuperAdmin && <PaymentFormDialog open={formOpen} onOpenChange={setFormOpen} />}
    </div>
  );
}
