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
import { useCreateTeacher, useUpdateTeacher } from "@/hooks/api/use-teachers";
import { TEACHER_STATUS_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import type { Teacher } from "@/types/people";

const baseSchema = {
  first_name: z.string().min(1, "Ism kiritilishi shart"),
  last_name: z.string().min(1, "Familiya kiritilishi shart"),
  phone: z.string().min(9, "Telefon raqami noto'g'ri"),
  email: z.string().email("Email formati noto'g'ri"),
  birth_date: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.coerce.number().int().nonnegative().optional(),
  salary: z.coerce.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
};

const createSchema = z.object({ ...baseSchema, password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak") });
const updateSchema = z.object(baseSchema);

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher;
}

export function TeacherFormDialog({ open, onOpenChange, teacher }: TeacherFormDialogProps) {
  const isEdit = Boolean(teacher);
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  type FormValues = z.infer<typeof createSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver((isEdit ? updateSchema : createSchema) as never),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      birth_date: "",
      specialization: "",
      experience: 0,
      salary: undefined,
      status: "ACTIVE",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      teacher
        ? {
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            phone: teacher.phone,
            email: teacher.email,
            birth_date: teacher.birth_date ?? "",
            specialization: teacher.specialization,
            experience: teacher.experience,
            salary: teacher.salary ? parseFloat(teacher.salary) : undefined,
            status: teacher.status,
            password: "",
          }
        : {
            first_name: "",
            last_name: "",
            phone: "",
            email: "",
            birth_date: "",
            specialization: "",
            experience: 0,
            salary: undefined,
            status: "ACTIVE",
            password: "",
          },
    );
  }, [open, teacher, form]);

  const isPending = createTeacher.isPending || updateTeacher.isPending;

  const onSubmit = (values: FormValues) => {
    const salary = values.salary !== undefined ? values.salary.toFixed(2) : undefined;
    if (isEdit) {
      const { password: _password, ...rest } = values;
      updateTeacher
        .mutateAsync({ id: teacher!.id, body: { ...rest, salary } })
        .then(() => {
          toast.success("O'qituvchi yangilandi");
          onOpenChange(false);
        })
        .catch((error) => toast.error(getErrorMessage(error)));
    } else {
      createTeacher
        .mutateAsync({ ...values, salary })
        .then(() => {
          toast.success("O'qituvchi yaratildi");
          onOpenChange(false);
        })
        .catch((error) => toast.error(getErrorMessage(error)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ism</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Familiya</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+998901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parol</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mutaxassisligi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tajribasi (yil)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maosh</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tug'ilgan sana</FormLabel>
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
                        {TEACHER_STATUS_OPTIONS.map((opt) => (
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
