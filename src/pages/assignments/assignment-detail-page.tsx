import { useState } from "react";
import { ArrowLeft, Paperclip, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { PageLoader, InlineSpinner } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAssignment, useAssignmentSubmissions, useSubmitAssignment } from "@/hooks/api/use-assignments";
import { ROLES } from "@/lib/constants";
import { formatDateTime, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { AssignmentSubmission } from "@/types/records";
import { AssignmentFormDialog } from "@/pages/assignments/assignment-form-dialog";
import { GradeSubmissionDialog } from "@/pages/assignments/grade-submission-dialog";

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const isStudent = role === ROLES.STUDENT;
  const canManage = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;

  const { data: assignment, isLoading } = useAssignment(id);
  const { data: submissions } = useAssignmentSubmissions(canManage ? id : undefined, { limit: 100 });

  const [editOpen, setEditOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | undefined>();

  if (isLoading || !assignment) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </Button>

      <PageHeader
        title={assignment.title}
        description={`${assignment.groupName} · ${assignment.subjectName}`}
        actions={
          canManage ? (
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Tahrirlash
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="space-y-3 pt-6 text-sm">
          {assignment.description && <p className="whitespace-pre-wrap">{assignment.description}</p>}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>Muddat: {formatDateTime(assignment.deadline)}</span>
            <StatusBadge status={assignment.status} />
            {assignment.attachment && (
              <a
                href={assignment.attachment}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Ilova
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {isStudent && <SubmitAssignmentCard assignmentId={assignment.id} />}

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topshirilgan ishlar ({submissions?.items.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {submissions?.items.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>O'quvchi</TableHead>
                    <TableHead>Holati</TableHead>
                    <TableHead>Topshirilgan</TableHead>
                    <TableHead>Ball</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.studentName}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>{s.submitted_at ? formatDateTime(s.submitted_at) : "—"}</TableCell>
                      <TableCell>{s.score ?? "—"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setGradingSubmission(s)}>
                          Baholash
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Hali hech kim topshirmagan" />
            )}
          </CardContent>
        </Card>
      )}

      {canManage && <AssignmentFormDialog open={editOpen} onOpenChange={setEditOpen} assignment={assignment} />}
      {canManage && (
        <GradeSubmissionDialog
          open={Boolean(gradingSubmission)}
          onOpenChange={(open) => !open && setGradingSubmission(undefined)}
          submission={gradingSubmission}
        />
      )}
    </div>
  );
}

function SubmitAssignmentCard({ assignmentId }: { assignmentId: string }) {
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | undefined>();
  const [submitted, setSubmitted] = useState<AssignmentSubmission | undefined>();
  const submitAssignment = useSubmitAssignment(assignmentId);

  const handleSubmit = () => {
    submitAssignment.mutate(
      { comment, file },
      {
        onSuccess: (data) => {
          toast.success("Topshiriq muvaffaqiyatli topshirildi");
          setSubmitted(data);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Topshiriqni yuborish</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {submitted && (
          <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm">
            Siz bu topshiriqni yubordingiz ({formatDateTime(submitted.submitted_at)}). Qayta yuborsangiz, avvalgi javobingiz
            almashtiriladi.
          </div>
        )}
        <Textarea
          placeholder="Izoh (ixtiyoriy)"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitAssignment.isPending}>
            {submitAssignment.isPending ? <InlineSpinner /> : "Topshirish"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
