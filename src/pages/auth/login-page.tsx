import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InlineSpinner } from "@/components/common/page-loader";
import { useLogin } from "@/hooks/api/use-auth";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().min(1, "Email kiritilishi shart").email("Email formati noto'g'ri"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    form.setFocus("email");
  }, [form]);

  if (accessToken) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = (values: LoginValues) => {
    login.mutate(values, {
      onSuccess: () => {
        toast.success("Xush kelibsiz!");
        navigate("/dashboard", { replace: true });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Education ERP</CardTitle>
          <CardDescription>Hisobingizga kiring</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? <InlineSpinner /> : "Kirish"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
