// User roles enum
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CONSULTANT = 'CONSULTANT',
  SECRETARY = 'SECRETARY',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}

export enum EstateStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
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
  parentId?: string;
  estate?: Estate;
  parent?: User;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Estate {
  id: string;
  guildId: string;
  establishmentName: string;
  fixedPhone: string;
  address: string;
  status: EstateStatus;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  admin?: User;
  staffCount?: number;
  rejectionReason?: string;
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
// Note: isActive, isApproved, and estateId are NOT accepted by the backend API
// These fields should not be included in update requests
export interface UpdateUserRequest {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  password?: string;
  role?: UserRole;
  // The following fields are not supported in PATCH /api/users/:id
  // estateId?: string;
  // isActive?: boolean;
  // isApproved?: boolean;
}

export type StaffRole = UserRole.SUPERVISOR | UserRole.SECRETARY | UserRole.CONSULTANT;

export interface CreateStaffRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  password?: string; // Optional, minimum 6 characters
  role: StaffRole;
  estateId?: string; // Optional, but should be included for Supervisor/Admin to ensure user is linked to their estate
}

// Register consultant request (Supervisor)
export interface RegisterConsultantRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  estateId?: string; // Optional, but should be included to ensure consultant is linked to Supervisor's estate
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

export interface RegisterEstateRequest {
  guildId: string;
  establishmentName: string;
  fixedPhone: string;
  address: string;
  admin: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    password: string;
  };
}

export interface CreateEstateByMasterRequest {
  guildId: string;
  establishmentName: string;
  fixedPhone: string;
  address: string;
  admin: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    password: string;
  };
  autoApprove?: boolean;
}

export interface EstateFilters {
  status?: EstateStatus;
  page?: number;
  limit?: number;
}

export interface UpdateEstateRequest {
  establishmentName?: string;
  address?: string;
  guildId?: string;
  fixedPhone?: string;
}

export interface SetEstateStatusRequest {
  status: EstateStatus;
  reason?: string;
}

export interface RejectEstateRequest {
  reason?: string;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// User filters with pagination
export interface UserFilters {
  role?: UserRole;
  estateId?: string;
  page?: number;
  limit?: number;
}

// User search query parameters
export interface SearchUsersQuery {
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  nationalId?: string;
}

