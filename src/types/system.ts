export type NotificationType = "ATTENDANCE" | "GRADE" | "ASSIGNMENT" | "PAYMENT" | "SCHEDULE" | "SYSTEM";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PASSWORD_CHANGE";

export interface AuditLog {
  id: string;
  user: string | null;
  userEmail: string | null;
  action: AuditAction;
  entity: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}
