import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InlineSpinner } from "@/components/common/page-loader";
import { useCreateAssignment, useUpdateAssignment } from "@/hooks/api/use-assignments";
import { useGroups } from "@/hooks/api/use-groups";
import { useSubjects } from "@/hooks/api/use-subjects";
import { useTeachers } from "@/hooks/api/use-teachers";
import { ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Assignment } from "@/types/records";

const schema = z.object({
  teacher: z.string().min(1, "O'qituvchi tanlanishi shart"),
  group: z.string().min(1, "Guruh tanlanishi shart"),
  subject: z.string().min(1, "Fan tanlanishi shart"),
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Muddat kiritilishi shart"),
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

  // A teacher only ever has their own groups in this list, so its `teacher`
  // field is always their own id — no separate "who am I" endpoint needed.
  const ownTeacherId = isTeacher ? groups?.items[0]?.teacher : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { teacher: "", group: "", subject: "", title: "", description: "", deadline: "" },
  });

  useEffect(() => {
    if (!open) return;
    setAttachment(undefined);
    if (assignment) {
      form.reset({
        teacher: assignment.teacher,
        group: assignment.group,
        subject: assignment.subject,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline.slice(0, 16),
      });
    } else {
      form.reset({ teacher: isTeacher ? (ownTeacherId ?? "") : "", group: "", subject: "", title: "", description: "", deadline: "" });
    }
  }, [open, assignment, isTeacher, ownTeacherId, form]);

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
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0])}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
              </div>
              {isEdit && assignment?.attachment && !attachment && (
                <p className="text-xs text-muted-foreground">
                  Joriy fayl:{" "}
                  <a href={assignment.attachment} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    ko'rish
                  </a>{" "}
                  — yangisini tanlasangiz, u almashtiriladi.
                </p>
              )}
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
