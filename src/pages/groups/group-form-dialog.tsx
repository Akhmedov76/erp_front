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
import { useCreateGroup, useUpdateGroup } from "@/hooks/api/use-groups";
import { useTeachers } from "@/hooks/api/use-teachers";
import { GENERIC_STATUS_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import type { Group } from "@/types/academic";

const schema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  description: z.string().optional(),
  course: z.string().min(1, "Kurs tanlanishi shart"),
  teacher: z.string().optional(),
  room: z.string().optional(),
  capacity: z.coerce.number().int().positive("Sig'im musbat son bo'lishi kerak"),
  start_date: z.string().min(1, "Boshlanish sanasi kiritilishi shart"),
  end_date: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof schema>;

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group;
}

export function GroupFormDialog({ open, onOpenChange, group }: GroupFormDialogProps) {
  const isEdit = Boolean(group);
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const { data: courses } = useCourses({ limit: 100 });
  const { data: teachers } = useTeachers({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      course: "",
      teacher: "",
      room: "",
      capacity: 20,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      group
        ? {
            name: group.name,
            description: group.description,
            course: group.course,
            teacher: group.teacher ?? "",
            room: group.room,
            capacity: group.capacity,
            start_date: group.start_date,
            end_date: group.end_date ?? "",
            status: group.status,
          }
        : {
            name: "",
            description: "",
            course: "",
            teacher: "",
            room: "",
            capacity: 20,
            start_date: new Date().toISOString().slice(0, 10),
            end_date: "",
            status: "ACTIVE",
          },
    );
  }, [open, group, form]);

  const isPending = createGroup.isPending || updateGroup.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      description: values.description ?? "",
      room: values.room ?? "",
      teacher: values.teacher || null,
      end_date: values.end_date || null,
    };
    const mutation = isEdit
      ? updateGroup.mutateAsync({ id: group!.id, body: payload })
      : createGroup.mutateAsync(payload as never);

    mutation
      .then(() => {
        toast.success(isEdit ? "Guruh yangilandi" : "Guruh yaratildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Guruhni tahrirlash" : "Yangi guruh"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
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
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xona</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sig'imi</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boshlanish sanasi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tugash sanasi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Tavsif</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
