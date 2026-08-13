import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InlineSpinner } from "@/components/common/page-loader";
import { useGradeSubmission } from "@/hooks/api/use-assignments";
import { getErrorMessage } from "@/lib/utils";
import { AssignmentTypeBadge } from "@/pages/assignments/assignment-type-badge";
import type { AssignmentSubmission, AssignmentType } from "@/types/records";

const schema = z.object({
  score: z.coerce.number().nonnegative("Ball manfiy bo'lmasligi kerak"),
  feedback: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission?: AssignmentSubmission;
  assignmentType?: AssignmentType;
}

export function GradeSubmissionDialog({ open, onOpenChange, submission, assignmentType }: GradeSubmissionDialogProps) {
  const gradeSubmission = useGradeSubmission();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { score: 0, feedback: "" },
  });

  useEffect(() => {
    if (open && submission) {
      form.reset({ score: submission.score ? parseFloat(submission.score) : 0, feedback: submission.feedback ?? "" });
    }
  }, [open, submission, form]);

  const onSubmit = (values: FormValues) => {
    if (!submission) return;
    gradeSubmission.mutate(
      { id: submission.id, body: { score: values.score.toString(), feedback: values.feedback } },
      {
        onSuccess: () => {
          toast.success("Topshiriq baholandi");
          onOpenChange(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {submission?.studentName} — topshiriqni baholash
            {assignmentType && <AssignmentTypeBadge type={assignmentType} />}
          </DialogTitle>
        </DialogHeader>
        {submission?.file && (
          <a
            href={submission.file}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            Topshirilgan faylni ko'rish
          </a>
        )}
        {submission?.comment && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">"{submission.comment}"</p>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ball</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fikr-mulohaza</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={gradeSubmission.isPending}>
                {gradeSubmission.isPending ? <InlineSpinner /> : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
