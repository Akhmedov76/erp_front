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
import { InlineSpinner } from "@/components/common/page-loader";
import { useGroups } from "@/hooks/api/use-groups";
import { useCreateSchedule, useUpdateSchedule } from "@/hooks/api/use-schedules";
import { useSubjects } from "@/hooks/api/use-subjects";
import { useTeachers } from "@/hooks/api/use-teachers";
import { getErrorMessage } from "@/lib/utils";
import type { Schedule } from "@/types/academic";

const schema = z
  .object({
    group: z.string().min(1, "Guruh tanlanishi shart"),
    teacher: z.string().min(1, "O'qituvchi tanlanishi shart"),
    subject: z.string().min(1, "Fan tanlanishi shart"),
    room: z.string().optional(),
    date: z.string().min(1, "Sana kiritilishi shart"),
    start_time: z.string().min(1, "Boshlanish vaqti kiritilishi shart"),
    end_time: z.string().min(1, "Tugash vaqti kiritilishi shart"),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak",
    path: ["end_time"],
  });

type FormValues = z.infer<typeof schema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule;
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const isEdit = Boolean(schedule);
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const { data: groups } = useGroups({ limit: 100 });
  const { data: teachers } = useTeachers({ limit: 100 });
  const { data: subjects } = useSubjects({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      group: "",
      teacher: "",
      subject: "",
      room: "",
      date: new Date().toISOString().slice(0, 10),
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      schedule
        ? {
            group: schedule.group,
            teacher: schedule.teacher,
            subject: schedule.subject,
            room: schedule.room,
            date: schedule.date,
            start_time: schedule.start_time.slice(0, 5),
            end_time: schedule.end_time.slice(0, 5),
          }
        : {
            group: "",
            teacher: "",
            subject: "",
            room: "",
            date: new Date().toISOString().slice(0, 10),
            start_time: "09:00",
            end_time: "10:00",
          },
    );
  }, [open, schedule, form]);

  const isPending = createSchedule.isPending || updateSchedule.isPending;

  const onSubmit = (values: FormValues) => {
    const mutation = isEdit
      ? updateSchedule.mutateAsync({ id: schedule!.id, body: values })
      : createSchedule.mutateAsync(values as never);

    mutation
      .then(() => {
        toast.success(isEdit ? "Dars jadvali yangilandi" : "Dars jadvali yaratildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Dars jadvalini tahrirlash" : "Yangi dars"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sana</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boshlanish</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tugash</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
