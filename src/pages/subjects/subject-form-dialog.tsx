import { useEffect } from "react";
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
import { InlineSpinner } from "@/components/common/page-loader";
import { useCourses } from "@/hooks/api/use-courses";
import { useCreateSubject, useUpdateSubject } from "@/hooks/api/use-subjects";
import { useTeachers } from "@/hooks/api/use-teachers";
import { getErrorMessage } from "@/lib/utils";
import type { Subject } from "@/types/academic";

const schema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  description: z.string().optional(),
  course: z.string().min(1, "Kurs tanlanishi shart"),
  teacher: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
}

export function SubjectFormDialog({ open, onOpenChange, subject }: SubjectFormDialogProps) {
  const isEdit = Boolean(subject);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const { data: courses } = useCourses({ limit: 100 });
  const { data: teachers } = useTeachers({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", course: "", teacher: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        subject
          ? { name: subject.name, description: subject.description, course: subject.course, teacher: subject.teacher ?? "" }
          : { name: "", description: "", course: "", teacher: "" },
      );
    }
  }, [open, subject, form]);

  const isPending = createSubject.isPending || updateSubject.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, description: values.description ?? "", teacher: values.teacher || null };
    const mutation = isEdit
      ? updateSubject.mutateAsync({ id: subject!.id, body: payload })
      : createSubject.mutateAsync(payload as never);

    mutation
      .then(() => {
        toast.success(isEdit ? "Fan yangilandi" : "Fan yaratildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Fanni tahrirlash" : "Yangi fan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomi</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kurs</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kursni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses?.items.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O'qituvchi (ixtiyoriy)</FormLabel>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tavsif</FormLabel>
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
