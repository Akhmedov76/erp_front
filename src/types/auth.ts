export type Role = "SUPERADMIN" | "TEACHER" | "STUDENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface MeResponse {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
