import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AppNotification } from "@/types/system";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The raw media URL (assignment.attachments[].file) opens inline in the
 * browser for PDFs/images instead of downloading, and cross-origin <a
 * download> is ignored by browsers — so link to this backend endpoint
 * instead, which sets Content-Disposition: attachment on the response
 * itself (works regardless of origin or file type). */
export function getAttachmentDownloadUrl(attachmentId: string): string {
  return `${import.meta.env.VITE_API_BASE_URL}/assignment-attachments/${attachmentId}/download`;
}

/** Where clicking a notification should take you — mirrors the backend's
 * (type, entity_id) contract documented in API_DOCUMENTATION.md "Notification
 * object shape". Falls back to that section's list page when there's no
 * per-record detail route (Grades/Payments/Attendance), or to null when
 * there's nowhere sensible to go. */
export function getNotificationLink(notification: AppNotification): string | null {
  switch (notification.type) {
    case "ASSIGNMENT":
      return notification.entity_id ? `/assignments/${notification.entity_id}` : "/assignments";
    case "GRADE":
      return "/grades";
    case "PAYMENT":
      return "/payments";
    case "ATTENDANCE":
      return "/attendance";
    case "SCHEDULE":
      return "/schedules";
    case "SYSTEM":
      return notification.entity_id ? `/groups/${notification.entity_id}` : null;
    default:
      return null;
  }
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(num);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      }
    ).response;
    if (response?.data?.errors?.length) {
      return response.data.errors.map((e) => e.message).join(" ");
    }
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return "Noma'lum xatolik yuz berdi.";
}
