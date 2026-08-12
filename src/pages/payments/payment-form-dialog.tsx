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
import { InlineSpinner } from "@/components/common/page-loader";
import { useCreatePayment } from "@/hooks/api/use-payments";
import { useStudents } from "@/hooks/api/use-students";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  student: z.string().min(1, "O'quvchi tanlanishi shart"),
  amount: z.coerce.number().positive("Summasi musbat bo'lishi kerak"),
  payment_date: z.string().min(1, "Sana kiritilishi shart"),
  payment_method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "ONLINE"]),
  status: z.enum(["PAID", "PENDING", "PARTIAL", "CANCELLED"]),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentFormDialog({ open, onOpenChange }: PaymentFormDialogProps) {
  const createPayment = useCreatePayment();
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedSearch = useDebouncedValue(studentSearch);
  const { data: students } = useStudents({ search: debouncedSearch, limit: 20 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student: "",
      amount: 0,
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: "CASH",
      status: "PAID",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        student: "",
        amount: 0,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: "CASH",
        status: "PAID",
        description: "",
      });
      setStudentSearch("");
    }
  }, [open, form]);

  const onSubmit = (values: FormValues) => {
    createPayment
      .mutateAsync({ ...values, amount: values.amount.toFixed(2) })
      .then(() => {
        toast.success("To'lov qayd etildi");
        onOpenChange(false);
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi to'lov</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O'quvchi</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="O'quvchini tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-1">
                        <Input
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Qidirish..."
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {students?.items.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summasi</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_date"
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
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To'lov usuli</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((opt) => (
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
                        {PAYMENT_STATUS_OPTIONS.map((opt) => (
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? <InlineSpinner /> : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
