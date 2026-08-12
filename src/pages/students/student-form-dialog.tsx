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
import { useCreateStudent, useUpdateStudent } from "@/hooks/api/use-students";
import { GENDER_OPTIONS, STUDENT_STATUS_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import type { Student } from "@/types/people";

const baseSchema = {
  first_name: z.string().min(1, "Ism kiritilishi shart"),
  last_name: z.string().min(1, "Familiya kiritilishi shart"),
  middle_name: z.string().optional(),
  phone: z.string().min(9, "Telefon raqami noto'g'ri"),
  email: z.string().email("Email formati noto'g'ri"),
  birth_date: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  address: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  enrollment_date: z.string().min(1, "Sana kiritilishi shart"),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "EXPELLED"]),
};

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak"),
  group_id: z.string().optional(),
});

const updateSchema = z.object(baseSchema);

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
}

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEdit = Boolean(student);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const { data: groups } = useGroups({ limit: 100, status: "ACTIVE" });

  const schema = isEdit ? updateSchema : createSchema;
  type FormValues = z.infer<typeof createSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      phone: "",
      email: "",
      birth_date: "",
      address: "",
      parent_name: "",
      parent_phone: "",
      enrollment_date: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
      password: "",
      group_id: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (student) {
      form.reset({
        first_name: student.first_name,
        last_name: student.last_name,
        middle_name: student.middle_name,
        phone: student.phone,
        email: student.email,
        birth_date: student.birth_date ?? "",
        gender: student.gender ?? undefined,
        address: student.address,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        enrollment_date: student.enrollment_date,
        status: student.status,
        password: "",
        group_id: "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        middle_name: "",
        phone: "",
        email: "",
        birth_date: "",
        address: "",
        parent_name: "",
        parent_phone: "",
        enrollment_date: new Date().toISOString().slice(0, 10),
        status: "ACTIVE",
        password: "",
        group_id: "",
      });
    }
  }, [open, student, form]);

  const isPending = createStudent.isPending || updateStudent.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      const { password: _password, group_id: _groupId, ...rest } = values;
      updateStudent
        .mutateAsync({ id: student!.id, body: rest })
        .then(() => {
          toast.success("O'quvchi yangilandi");
          onOpenChange(false);
        })
        .catch((error) => toast.error(getErrorMessage(error)));
    } else {
      const payload = { ...values, group_id: values.group_id || undefined };
      createStudent
        .mutateAsync(payload)
        .then(() => {
          toast.success("O'quvchi yaratildi");
          onOpenChange(false);
        })
        .catch((error) => toast.error(getErrorMessage(error)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}</DialogTitle>
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
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sharifi</FormLabel>
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jinsi</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((opt) => (
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
                name="enrollment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ro'yxatga olingan sana</FormLabel>
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
                        {STUDENT_STATUS_OPTIONS.map((opt) => (
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
                name="parent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ota-ona ismi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ota-ona telefoni</FormLabel>
                    <FormControl>
                      <Input placeholder="+998901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Manzil</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Guruh (ixtiyoriy)</FormLabel>
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
              )}
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
