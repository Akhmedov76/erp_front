import { useMemo, useState } from "react";
import { ArrowLeft, FileText, MessageSquare, Paperclip, Pencil, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { FileUploadField } from "@/components/common/file-upload-field";
import { PageHeader } from "@/components/common/page-header";
import { PageLoader, InlineSpinner } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useAllowResubmission,
  useAssignment,
  useAssignmentSubmissions,
  useSubmitAssignment,
} from "@/hooks/api/use-assignments";
import { ROLES } from "@/lib/constants";
import { formatDateTime, getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { AssignmentSubmission } from "@/types/records";
import { AssignmentFormDialog } from "@/pages/assignments/assignment-form-dialog";
import { AssignmentTypeBadge } from "@/pages/assignments/assignment-type-badge";
import { GradeSubmissionDialog } from "@/pages/assignments/grade-submission-dialog";

// Ungraded work belongs at the top of the teacher's queue; within each group,
// the most recently submitted work surfaces first.
const STATUS_PRIORITY: Record<string, number> = { SUBMITTED: 0, LATE: 0, PENDING: 0, GRADED: 1 };

function sortForGrading(items: AssignmentSubmission[]) {
  return [...items].sort((a, b) => {
    const byStatus = (STATUS_PRIORITY[a.status] ?? 0) - (STATUS_PRIORITY[b.status] ?? 0);
    if (byStatus !== 0) return byStatus;
    return (b.submitted_at ?? "").localeCompare(a.submitted_at ?? "");
  });
}

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const isStudent = role === ROLES.STUDENT;
  const canManage = role === ROLES.SUPERADMIN || role === ROLES.TEACHER;

  const { data: assignment, isLoading } = useAssignment(id);
  const { data: submissions } = useAssignmentSubmissions(canManage ? id : undefined, { limit: 100 });
  const allowResubmission = useAllowResubmission();

  const [editOpen, setEditOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | undefined>();

  const sortedSubmissions = useMemo(
    () => (submissions?.items.length ? sortForGrading(submissions.items) : []),
    [submissions],
  );
  const ungradedCount = sortedSubmissions.filter((s) => s.status !== "GRADED").length;

  if (isLoading || !assignment) return <PageLoader />;

  const handleAllowResubmission = (submission: AssignmentSubmission) => {
    allowResubmission.mutate(submission.id, {
      onSuccess: () => toast.success(`${submission.studentName} uchun qayta topshirishga ruxsat berildi`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

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
            <AssignmentTypeBadge type={assignment.assignment_type} />
            <span>Muddat: {formatDateTime(assignment.deadline)}</span>
            <span>Maksimal ball: {assignment.max_score}</span>
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
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Topshirilgan ishlar ({sortedSubmissions.length})</CardTitle>
              <AssignmentTypeBadge type={assignment.assignment_type} />
            </div>
            {sortedSubmissions.length > 0 && (
              <CardDescription>
                {ungradedCount > 0 ? `${ungradedCount} tasi baholanmagan` : "Barchasi baholangan"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {sortedSubmissions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>O'quvchi</TableHead>
                    <TableHead>Holati</TableHead>
                    <TableHead>Topshirilgan</TableHead>
                    <TableHead>Fayl</TableHead>
                    <TableHead>Ball</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {s.studentName}
                          {s.comment && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">{s.comment}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>{s.submitted_at ? formatDateTime(s.submitted_at) : "—"}</TableCell>
                      <TableCell>
                        {s.file ? (
                          <a
                            href={s.file}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Ko'rish
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{s.score ? `${s.score} / ${s.maxScore}` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {!s.resubmission_allowed && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={allowResubmission.isPending}
                                  onClick={() => handleAllowResubmission(s)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Qayta topshirishga ruxsat berish</TooltipContent>
                            </Tooltip>
                          )}
                          <Button variant="outline" size="sm" onClick={() => setGradingSubmission(s)}>
                            Baholash
                          </Button>
                        </div>
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

      {canManage && (
        <AssignmentFormDialog open={editOpen} onOpenChange={setEditOpen} assignment={assignment} />
      )}
      {canManage && (
        <GradeSubmissionDialog
          open={Boolean(gradingSubmission)}
          onOpenChange={(open) => !open && setGradingSubmission(undefined)}
          submission={gradingSubmission}
          assignmentType={assignment.assignment_type}
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
            Siz bu topshiriqni yubordingiz ({formatDateTime(submitted.submitted_at)}). Qayta yuborsangiz,
            avvalgi javobingiz almashtiriladi.
          </div>
        )}
        <Textarea
          placeholder="Izoh (ixtiyoriy)"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <FileUploadField value={file} onChange={setFile} />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitAssignment.isPending}>
            {submitAssignment.isPending ? <InlineSpinner /> : "Topshirish"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
