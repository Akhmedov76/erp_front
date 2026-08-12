import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers,
  ListChecks,
  Newspaper,
  ScrollText,
  Users,
  Wallet,
} from "lucide-react";

import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Bosh sahifa", to: "/dashboard", icon: LayoutDashboard, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "O'quvchilar", to: "/students", icon: GraduationCap, roles: ["SUPERADMIN", "TEACHER"] },
  { label: "O'qituvchilar", to: "/teachers", icon: Users, roles: ["SUPERADMIN"] },
  { label: "Kurslar", to: "/courses", icon: BookOpen, roles: ["SUPERADMIN"] },
  { label: "Fanlar", to: "/subjects", icon: Layers, roles: ["SUPERADMIN"] },
  { label: "Guruhlar", to: "/groups", icon: Users, roles: ["SUPERADMIN", "TEACHER"] },
  { label: "Dars jadvali", to: "/schedules", icon: Calendar, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "Davomat", to: "/attendance", icon: CalendarCheck, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "Baholar", to: "/grades", icon: ListChecks, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "Topshiriqlar", to: "/assignments", icon: ClipboardList, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "To'lovlar", to: "/payments", icon: Wallet, roles: ["SUPERADMIN", "STUDENT"] },
  { label: "Bildirishnomalar", to: "/notifications", icon: Newspaper, roles: ["SUPERADMIN", "TEACHER", "STUDENT"] },
  { label: "Analitika", to: "/analytics", icon: BarChart3, roles: ["SUPERADMIN", "TEACHER"] },
  { label: "Hisobotlar", to: "/reports", icon: FileText, roles: ["SUPERADMIN", "TEACHER"] },
  { label: "Audit jurnali", to: "/audit-logs", icon: ScrollText, roles: ["SUPERADMIN"] },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
