import { User, AuthResponse, LoginRequest, RegisterCustomerRequest, SendOTPRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest, RegisterConsultantRequest, RegisterMemberRequest, RegisterAdminRequest, RegisterEstateRequest, Estate } from '../../../shared/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  estateStatusMessage: string | null;
  estateRegistrationSuccess: boolean;
  estateRegistrationError: string | null;
  lastRegisteredEstate: Estate | null;
  resetPasswordMessage: string | null;
  // Master impersonation fields
  masterAccessToken: string | null;
  masterRefreshToken: string | null;
  masterUser: User | null;
  isImpersonating: boolean;
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
  RegisterEstateRequest,
  Estate,
};

