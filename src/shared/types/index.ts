// User roles enum
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CONSULTANT = 'CONSULTANT',
  SECRETARY = 'SECRETARY',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}

// Base API response type
export interface ApiResponse<T = any> {
  data?: T;
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

// User type
export interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  role: UserRole;
  estateId?: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth response type
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Login request
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

// Register customer request
export interface RegisterCustomerRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  password: string;
}

// OTP request
export interface SendOTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

// Password reset
export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  code: string;
  newPassword: string;
}

// Refresh token
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Create user request
export interface CreateUserRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  password: string;
  role: UserRole;
  estateId?: string;
}

// Update user request
export interface UpdateUserRequest {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  password?: string;
  role?: UserRole;
  estateId?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

// Register consultant request (Supervisor)
export interface RegisterConsultantRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
}

// Register member request (Admin)
export interface RegisterMemberRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  role: UserRole.SUPERVISOR | UserRole.SECRETARY | UserRole.CONSULTANT;
}

// Register admin request (Master)
export interface RegisterAdminRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
}

// User filters
export interface UserFilters {
  role?: UserRole;
  estateId?: string;
}

