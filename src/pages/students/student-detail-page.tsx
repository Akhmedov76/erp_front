import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/common/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/empty-state";
import { useAttendanceList } from "@/hooks/api/use-attendance";
import { useGrades } from "@/hooks/api/use-grades";
import { useStudent, useStudentPayments } from "@/hooks/api/use-students";
import { ROLES } from "@/lib/constants";
import { formatDate, formatMoney, initials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { StudentFormDialog } from "@/pages/students/student-form-dialog";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === ROLES.SUPERADMIN;
  const [editOpen, setEditOpen] = useState(false);

  const { data: student, isLoading } = useStudent(id);
  const { data: grades } = useGrades({ student_id: id, limit: 10 });
  const { data: attendance } = useAttendanceList({ student_id: id, limit: 10 });
  const { data: payments } = useStudentPayments(id, { limit: 10 });

  if (isLoading || !student) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </Button>

      <PageHeader
        title={student.fullName ?? `${student.first_name} ${student.last_name}`}
        description={student.email}
        actions={
          isSuperAdmin ? (
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Tahrirlash
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials(`${student.first_name} ${student.last_name}`)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">
              {student.first_name} {student.last_name}
            </CardTitle>
            <StatusBadge status={student.status} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Telefon" value={student.phone} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Tug'ilgan sana" value={formatDate(student.birth_date)} />
            <InfoRow label="Jinsi" value={student.gender === "MALE" ? "Erkak" : student.gender === "FEMALE" ? "Ayol" : "—"} />
            <InfoRow label="Manzil" value={student.address || "—"} />
            <InfoRow label="Ro'yxatga olingan" value={formatDate(student.enrollment_date)} />
            <InfoRow label="Ota-ona" value={student.parent_name || "—"} />
            <InfoRow label="Ota-ona telefoni" value={student.parent_phone || "—"} />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades">Baholar</TabsTrigger>
              <TabsTrigger value="attendance">Davomat</TabsTrigger>
              {isSuperAdmin && <TabsTrigger value="payments">To'lovlar</TabsTrigger>}
            </TabsList>

            <TabsContent value="grades">
              <Card>
                <CardContent className="p-0">
                  {grades?.items.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fan</TableHead>
                          <TableHead>Turi</TableHead>
                          <TableHead>Ball</TableHead>
                          <TableHead>Sana</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.items.map((g) => (
                          <TableRow key={g.id}>
                            <TableCell>{g.subjectName}</TableCell>
                            <TableCell>{g.grade_type}</TableCell>
                            <TableCell>
                              {g.score}/{g.max_score}
                            </TableCell>
                            <TableCell>{formatDate(g.date)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState title="Baholar mavjud emas" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardContent className="p-0">
                  {attendance?.items.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sana</TableHead>
                          <TableHead>Holati</TableHead>
                          <TableHead>Izoh</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.items.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{formatDate(a.date)}</TableCell>
                            <TableCell>
                              <StatusBadge status={a.status} />
                            </TableCell>
                            <TableCell>{a.note || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState title="Davomat ma'lumotlari mavjud emas" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="payments">
                <Card>
                  <CardContent className="p-0">
                    {payments?.items.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoys</TableHead>
                            <TableHead>Summasi</TableHead>
                            <TableHead>Holati</TableHead>
                            <TableHead>Sana</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.items.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.invoice_number}</TableCell>
                              <TableCell>{formatMoney(p.amount)}</TableCell>
                              <TableCell>
                                <StatusBadge status={p.status} />
                              </TableCell>
                              <TableCell>{formatDate(p.payment_date)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState title="To'lovlar mavjud emas" />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {isSuperAdmin && <StudentFormDialog open={editOpen} onOpenChange={setEditOpen} student={student} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
