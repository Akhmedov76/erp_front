import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/common/file-upload-field";
import { InlineSpinner } from "@/components/common/page-loader";
import { useCreateAssignment, useUpdateAssignment } from "@/hooks/api/use-assignments";
import { useGroups } from "@/hooks/api/use-groups";
import { useSubjects } from "@/hooks/api/use-subjects";
import { useTeachers } from "@/hooks/api/use-teachers";
import { ASSIGNMENT_TYPE_OPTIONS, DEFAULT_MAX_SCORE_BY_GRADE_TYPE, ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Assignment, AssignmentType } from "@/types/records";

const schema = z.object({
  teacher: z.string().min(1, "O'qituvchi tanlanishi shart"),
  group: z.string().min(1, "Guruh tanlanishi shart"),
  subject: z.string().min(1, "Fan tanlanishi shart"),
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  description: z.string().optional(),
  assignment_type: z.enum(["HOMEWORK", "QUIZ", "EXAM", "PROJECT"], {
    required_error: "Topshiriq turi tanlanishi shart",
  }),
  deadline: z.string().min(1, "Muddat kiritilishi shart"),
  max_score: z
    .string()
    .min(1, "Maksimal ball kiritilishi shart")
    .refine((v) => Number(v) > 0, "Maksimal ball musbat bo'lishi kerak"),
});

type FormValues = z.infer<typeof schema>;

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment;
}

export function AssignmentFormDialog({ open, onOpenChange, assignment }: AssignmentFormDialogProps) {
  const isEdit = Boolean(assignment);
  const role = useAuthStore((state) => state.user?.role);
  const isTeacher = role === ROLES.TEACHER;

  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  // Groups are already scoped to "my groups" by the backend for a TEACHER,
  // so this list — and therefore the subject/deadline picking below — never
  // shows another teacher's data in the first place.
  const { data: groups } = useGroups({ limit: 100 });
  const { data: subjects } = useSubjects({ limit: 100 });
  const { data: teachers } = useTeachers({ limit: 100 });
  const [attachment, setAttachment] = useState<File | undefined>();
  const [maxScoreTouched, setMaxScoreTouched] = useState(false);

  // A teacher only ever has their own groups in this list, so its `teacher`
  // field is always their own id — no separate "who am I" endpoint needed.
  const ownTeacherId = isTeacher ? groups?.items[0]?.teacher : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacher: "",
      group: "",
      subject: "",
      title: "",
      description: "",
      assignment_type: "HOMEWORK",
      deadline: "",
      max_score: DEFAULT_MAX_SCORE_BY_GRADE_TYPE.HOMEWORK,
    },
  });

  useEffect(() => {
    if (!open) return;
    setAttachment(undefined);
    setMaxScoreTouched(Boolean(assignment));
    if (assignment) {
      form.reset({
        teacher: assignment.teacher,
        group: assignment.group,
        subject: assignment.subject,
        title: assignment.title,
        description: assignment.description,
        assignment_type: assignment.assignment_type,
        deadline: assignment.deadline.slice(0, 16),
        max_score: assignment.max_score,
      });
    } else {
      form.reset({
        teacher: isTeacher ? (ownTeacherId ?? "") : "",
        group: "",
        subject: "",
        title: "",
        description: "",
        assignment_type: "HOMEWORK",
        deadline: "",
        max_score: DEFAULT_MAX_SCORE_BY_GRADE_TYPE.HOMEWORK,
      });
    }
  }, [open, assignment, isTeacher, ownTeacherId, form]);

  const handleAssignmentTypeChange = (value: AssignmentType) => {
    form.setValue("assignment_type", value);
    if (!maxScoreTouched) form.setValue("max_score", DEFAULT_MAX_SCORE_BY_GRADE_TYPE[value] ?? "100");
  };

  const isPending = createAssignment.isPending || updateAssignment.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, deadline: new Date(values.deadline).toISOString(), attachment };
    const mutation = isEdit
      ? updateAssignment.mutateAsync({ id: assignment!.id, body: payload })
      : createAssignment.mutateAsync(payload);

    mutation
      .then(() => {
        toast.success(isEdit ? "Topshiriq yangilandi" : "Topshiriq yaratildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Topshiriqni tahrirlash" : "Yangi topshiriq"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sarlavha</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assignment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turi</FormLabel>
                    <Select value={field.value} onValueChange={handleAssignmentTypeChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Turini tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSIGNMENT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimal ball</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0.01}
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setMaxScoreTouched(true);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guruh</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Guruhni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups?.items.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fan</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fanni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects?.items.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* A TEACHER is always creating their own assignment — asking
                  them to re-pick themselves from a list is pure friction, so
                  the field only shows up for SUPERADMIN (who may be creating
                  on a teacher's behalf). */}
              {!isTeacher && (
                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O'qituvchi</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="O'qituvchini tanlang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers?.items.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muddat</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Topshiriq shartlari, talablari..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Ilova fayl (ixtiyoriy)</FormLabel>
              <FileUploadField
                value={attachment}
                onChange={setAttachment}
                currentFileUrl={isEdit ? assignment?.attachment : undefined}
              />
            </FormItem>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <InlineSpinner /> : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
