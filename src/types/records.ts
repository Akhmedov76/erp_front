export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface Attendance {
  id: string;
  student: string;
  studentName: string;
  group: string;
  schedule: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  created_by: string | null;
  created_at: string;
}

export interface AttendanceInput {
  student: string;
  group: string;
  schedule: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface BulkAttendanceInput {
  groupId: string;
  scheduleId: string;
  date: string;
  students: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
}

export type GradeType = "HOMEWORK" | "QUIZ" | "EXAM" | "MIDTERM" | "FINAL";

export interface Grade {
  id: string;
  student: string;
  studentName: string;
  subject: string;
  subjectName: string;
  teacher: string;
  group: string;
  score: string;
  max_score: string;
  grade_type: GradeType;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface GradeInput {
  student: string;
  subject: string;
  teacher: string;
  group: string;
  score: string;
  max_score: string;
  grade_type: GradeType;
  comment?: string;
  date: string;
}

export interface BulkGradeInput {
  groupId: string;
  subjectId: string;
  teacherId: string;
  gradeType: GradeType;
  maxScore: string;
  date: string;
  grades: Array<{ studentId: string; score: string; comment?: string }>;
}

export type GenericStatus = "ACTIVE" | "INACTIVE";

export interface Assignment {
  id: string;
  teacher: string;
  teacherName: string;
  group: string;
  groupName: string;
  subject: string;
  subjectName: string;
  title: string;
  description: string;
  deadline: string;
  attachment: string | null;
  status: GenericStatus;
  created_at: string;
  updated_at: string;
}

export interface AssignmentInput {
  teacher: string;
  group: string;
  subject: string;
  title: string;
  description?: string;
  deadline: string;
  status?: GenericStatus;
}

export type SubmissionStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";

export interface AssignmentSubmission {
  id: string;
  assignment: string;
  student: string;
  studentName: string;
  file: string | null;
  comment: string;
  score: string | null;
  feedback: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  graded_at: string | null;
}

export interface GradeSubmissionInput {
  score: string;
  feedback?: string;
}

export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE";

export interface Payment {
  id: string;
  student: string;
  studentName: string;
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  invoice_number: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentInput {
  student: string;
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  status?: PaymentStatus;
  description?: string;
}
