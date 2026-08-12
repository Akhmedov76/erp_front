export type Gender = "MALE" | "FEMALE";
export type StudentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "EXPELLED";
export type TeacherStatus = "ACTIVE" | "INACTIVE";

export interface Student {
  id: string;
  userId: string;
  loginEmail: string;
  fullName: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  email: string;
  birth_date: string | null;
  gender: Gender | null;
  address: string;
  avatar: string | null;
  parent_name: string;
  parent_phone: string;
  enrollment_date: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentListItem {
  id: string;
  fullName: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: StudentStatus;
  enrollment_date: string;
}

export interface StudentCreateInput {
  password: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  email: string;
  birth_date?: string;
  gender?: Gender;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  enrollment_date: string;
  status?: StudentStatus;
  group_id?: string;
}

export type StudentUpdateInput = Partial<Omit<StudentCreateInput, "password" | "group_id">>;

export interface Teacher {
  id: string;
  userId: string;
  loginEmail: string;
  fullName: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birth_date: string | null;
  specialization: string;
  experience: number;
  salary?: string | null;
  avatar: string | null;
  status: TeacherStatus;
  created_at: string;
  updated_at: string;
}

export interface TeacherListItem {
  id: string;
  fullName: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  specialization: string;
  status: TeacherStatus;
}

export interface TeacherCreateInput {
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birth_date?: string;
  specialization?: string;
  experience?: number;
  salary?: string;
  status?: TeacherStatus;
}

export type TeacherUpdateInput = Partial<Omit<TeacherCreateInput, "password">>;
