import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InlineSpinner } from "@/components/common/page-loader";
import { useCreateCourse, useUpdateCourse } from "@/hooks/api/use-courses";
import { GENERIC_STATUS_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import type { Course } from "@/types/academic";

const schema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  description: z.string().optional(),
  duration: z.coerce.number().int().positive("Davomiylik musbat son bo'lishi kerak"),
  price: z.coerce.number().nonnegative("Narx manfiy bo'lmasligi kerak"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof schema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
}

export function CourseFormDialog({ open, onOpenChange, course }: CourseFormDialogProps) {
  const isEdit = Boolean(course);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", duration: 4, price: 0, status: "ACTIVE" },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        course
          ? {
              name: course.name,
              description: course.description,
              duration: course.duration,
              price: parseFloat(course.price),
              status: course.status,
            }
          : { name: "", description: "", duration: 4, price: 0, status: "ACTIVE" },
      );
    }
  }, [open, course, form]);

  const isPending = createCourse.isPending || updateCourse.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, description: values.description ?? "", price: values.price.toFixed(2) };
    const mutation = isEdit ? updateCourse.mutateAsync({ id: course!.id, body: payload }) : createCourse.mutateAsync(payload);

    mutation
      .then(() => {
        toast.success(isEdit ? "Kurs yangilandi" : "Kurs yaratildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Kursni tahrirlash" : "Yangi kurs"}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Davomiyligi (hafta)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Narxi</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holati</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENERIC_STATUS_OPTIONS.map((opt) => (
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
