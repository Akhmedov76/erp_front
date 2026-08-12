import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/auth";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/403" replace />;

  return <Outlet />;
}
