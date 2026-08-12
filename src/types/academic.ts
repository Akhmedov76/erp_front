export type GenericStatus = "ACTIVE" | "INACTIVE";

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: string;
  status: GenericStatus;
  created_at: string;
  updated_at: string;
}

export type CourseInput = Omit<Course, "id" | "created_at" | "updated_at">;

export interface Subject {
  id: string;
  course: string;
  courseName: string;
  teacher: string | null;
  teacherName: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type SubjectInput = Omit<Subject, "id" | "courseName" | "teacherName" | "created_at" | "updated_at">;

export interface Group {
  id: string;
  name: string;
  description: string;
  course: string;
  courseName: string;
  teacher: string | null;
  teacherName: string | null;
  room: string;
  capacity: number;
  studentCount: number;
  start_date: string;
  end_date: string | null;
  status: GenericStatus;
  created_at: string;
  updated_at: string;
}

export type GroupInput = Omit<
  Group,
  "id" | "courseName" | "teacherName" | "studentCount" | "created_at" | "updated_at"
>;

export type GroupMembershipStatus = "ACTIVE" | "REMOVED";

export interface GroupStudent {
  id: string;
  student: {
    id: string;
    fullName: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    status: string;
    enrollment_date: string;
  };
  joined_at: string;
  status: GroupMembershipStatus;
}

export interface Schedule {
  id: string;
  group: string;
  groupName: string;
  teacher: string;
  teacherName: string;
  subject: string;
  subjectName: string;
  room: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export type ScheduleInput = Omit<
  Schedule,
  "id" | "groupName" | "teacherName" | "subjectName" | "created_at" | "updated_at"
>;
