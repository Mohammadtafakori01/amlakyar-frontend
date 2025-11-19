import { User, AuthResponse, LoginRequest, RegisterCustomerRequest, SendOTPRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest, RegisterConsultantRequest, RegisterMemberRequest, RegisterAdminRequest } from '../../../shared/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterCustomerRequest,
  SendOTPRequest,
  VerifyOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RegisterConsultantRequest,
  RegisterMemberRequest,
  RegisterAdminRequest,
};

