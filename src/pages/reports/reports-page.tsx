import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { InlineSpinner } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExportReport, type ReportEntity, type ReportFormat } from "@/hooks/api/use-reports";
import { ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const REPORTS: Array<{ entity: ReportEntity; label: string; description: string; superAdminOnly?: boolean }> = [
  { entity: "students", label: "O'quvchilar", description: "Barcha o'quvchilar hisobot ko'rinishida" },
  { entity: "groups", label: "Guruhlar", description: "Guruhlar va ularning to'ldirilganligi" },
  { entity: "teachers", label: "O'qituvchilar", description: "O'qituvchilar hisoboti", superAdminOnly: true },
  { entity: "courses", label: "Kurslar", description: "Kurslar ro'yxati va narxlari" },
  { entity: "attendance", label: "Davomat", description: "Davomat hisoboti" },
  { entity: "grades", label: "Baholar", description: "Baholar hisoboti" },
  { entity: "payments", label: "To'lovlar", description: "To'lovlar hisoboti", superAdminOnly: true },
];

export default function ReportsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const exportReport = useExportReport();
  const [formats, setFormats] = useState<Record<ReportEntity, ReportFormat>>({
    students: "xlsx",
    groups: "xlsx",
    teachers: "xlsx",
    courses: "xlsx",
    attendance: "xlsx",
    grades: "xlsx",
    payments: "xlsx",
  });

  const visibleReports = REPORTS.filter((r) => !r.superAdminOnly || isSuperAdmin);

  const handleExport = (entity: ReportEntity) => {
    exportReport.mutate(
      { entity, format: formats[entity] },
      { onError: (error) => toast.error(getErrorMessage(error)) },
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Hisobotlar" description="Ma'lumotlarni CSV, Excel yoki PDF formatida yuklab oling" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReports.map((report) => (
          <Card key={report.entity}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{report.label}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Select
                value={formats[report.entity]}
                onValueChange={(v) => setFormats((prev) => ({ ...prev, [report.entity]: v as ReportFormat }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleExport(report.entity)} disabled={exportReport.isPending} className="flex-1">
                {exportReport.isPending ? <InlineSpinner /> : <Download className="h-4 w-4" />}
                Yuklab olish
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
