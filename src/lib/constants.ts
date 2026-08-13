export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  TEACHER: "O'qituvchi",
  STUDENT: "O'quvchi",
};

export const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
  { value: "BLOCKED", label: "Bloklangan" },
];

export const STUDENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
  { value: "GRADUATED", label: "Bitirgan" },
  { value: "EXPELLED", label: "Chetlashtirilgan" },
];

export const TEACHER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
];

export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "HOMEWORK", label: "Uy vazifasi" },
  { value: "QUIZ", label: "Nazorat ishi" },
  { value: "EXAM", label: "Imtihon" },
  { value: "PROJECT", label: "Loyiha" },
];

export const ASSIGNMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ASSIGNMENT_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export const GENERIC_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Faol" },
  { value: "INACTIVE", label: "Nofaol" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Erkak" },
  { value: "FEMALE", label: "Ayol" },
];

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: "PRESENT", label: "Keldi" },
  { value: "ABSENT", label: "Kelmadi" },
  { value: "LATE", label: "Kechikdi" },
  { value: "EXCUSED", label: "Sababli" },
];

export const GRADE_TYPE_OPTIONS = [
  { value: "HOMEWORK", label: "Uy vazifasi" },
  { value: "QUIZ", label: "Test" },
  { value: "EXAM", label: "Imtihon" },
  { value: "MIDTERM", label: "Oraliq nazorat" },
  { value: "FINAL", label: "Yakuniy nazorat" },
];

// Sensible starting point per grade type so a teacher isn't forced to decide
// a scale from scratch every time — still fully editable per entry.
export const DEFAULT_MAX_SCORE_BY_GRADE_TYPE: Record<string, string> = {
  HOMEWORK: "10",
  QUIZ: "20",
  EXAM: "100",
  MIDTERM: "100",
  FINAL: "100",
};

export const SUBMISSION_STATUS_OPTIONS = [
  { value: "PENDING", label: "Kutilmoqda" },
  { value: "SUBMITTED", label: "Topshirildi" },
  { value: "LATE", label: "Kechikib topshirildi" },
  { value: "GRADED", label: "Baholandi" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "PAID", label: "To'langan" },
  { value: "PENDING", label: "Kutilmoqda" },
  { value: "PARTIAL", label: "Qisman to'langan" },
  { value: "CANCELLED", label: "Bekor qilingan" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Naqd" },
  { value: "CARD", label: "Karta" },
  { value: "BANK_TRANSFER", label: "Bank o'tkazmasi" },
  { value: "ONLINE", label: "Onlayn" },
];

export const GROUP_STUDENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Faol" },
  { value: "REMOVED", label: "O'chirilgan" },
];

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  ATTENDANCE: "Davomat",
  GRADE: "Baho",
  ASSIGNMENT: "Topshiriq",
  PAYMENT: "To'lov",
  SCHEDULE: "Dars jadvali",
  SYSTEM: "Tizim",
};

export const PERFORMANCE_LEVEL_LABELS: Record<string, string> = {
  EXCELLENT: "A'lo",
  GOOD: "Yaxshi",
  AVERAGE: "O'rtacha",
  POOR: "Past",
  CRITICAL: "Tanqidiy",
};

export const AUDIT_ACTION_OPTIONS = [
  { value: "CREATE", label: "Yaratildi" },
  { value: "UPDATE", label: "Yangilandi" },
  { value: "DELETE", label: "O'chirildi" },
  { value: "LOGIN", label: "Kirish" },
  { value: "LOGOUT", label: "Chiqish" },
  { value: "PASSWORD_CHANGE", label: "Parol o'zgartirildi" },
];

export const DEFAULT_PAGE_SIZE = 20;
