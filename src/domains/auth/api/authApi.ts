import apiClient from '../../../shared/api/client';
import {
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
  User,
} from '../../../shared/types';

export const authApi = {
  // Public endpoints
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  registerCustomer: async (data: RegisterCustomerRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  sendOTP: async (data: SendOTPRequest): Promise<void> => {
    await apiClient.post('/auth/send-otp', data);
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  // Supervisor endpoints
  registerConsultant: async (data: RegisterConsultantRequest): Promise<void> => {
    await apiClient.post('/auth/supervisor/register-consultant', data);
  },

  getConsultants: async () => {
    const response = await apiClient.get('/auth/supervisor/consultants');
    return response.data;
  },

  // Admin endpoints
  registerMember: async (data: RegisterMemberRequest): Promise<void> => {
    await apiClient.post('/auth/admin/register-member', data);
  },

  // Master endpoints
  registerAdmin: async (data: RegisterAdminRequest): Promise<void> => {
    await apiClient.post('/auth/master/register-admin', data);
  },
};

