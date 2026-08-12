import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/common/page-header";
import { PageLoader, InlineSpinner } from "@/components/common/page-loader";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangePassword, useMe } from "@/hooks/api/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, getErrorMessage, initials } from "@/lib/utils";

const schema = z
  .object({
    old_password: z.string().min(1, "Joriy parol kiritilishi shart"),
    new_password: z.string().min(8, "Yangi parol kamida 8 belgidan iborat bo'lishi kerak"),
    confirm_password: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Parollar mos kelmadi",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const changePassword = useChangePassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  if (isLoading || !me) return <PageLoader />;

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      { old_password: values.old_password, new_password: values.new_password },
      {
        onSuccess: () => {
          toast.success("Parol muvaffaqiyatli o'zgartirildi");
          form.reset();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Hisobingiz ma'lumotlari" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials(me.email)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{me.email}</CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={me.status} />
              <span className="text-sm text-muted-foreground">{ROLE_LABELS[me.role]}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b py-1.5">
              <span className="text-muted-foreground">Oxirgi kirish</span>
              <span className="font-medium">{formatDateTime(me.lastLoginAt)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Ro'yxatdan o'tgan</span>
              <span className="font-medium">{formatDateTime(me.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parolni o'zgartirish</CardTitle>
            <CardDescription>Xavfsizlik uchun kuchli parol tanlang</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="old_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joriy parol</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yangi parol</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yangi parolni tasdiqlang</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? <InlineSpinner /> : "Parolni yangilash"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
