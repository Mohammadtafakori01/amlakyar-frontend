import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { AuthState, User, LoginRequest, RegisterCustomerRequest, SendOTPRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest, RegisterConsultantRequest, RegisterMemberRequest, RegisterAdminRequest } from '../types';

// Helper function to get user from localStorage
const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? getUserFromStorage() : null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  // Set isAuthenticated to true if we have both token AND user
  isAuthenticated: typeof window !== 'undefined' 
    ? !!(localStorage.getItem('accessToken') && getUserFromStorage())
    : false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ورود');
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async (data: RegisterCustomerRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.registerCustomer(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت‌نام');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (data: SendOTPRequest, { rejectWithValue }) => {
    try {
      await authApi.sendOTP(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ارسال کد');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOTP(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'کد نامعتبر است');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      await authApi.forgotPassword(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ارسال کد');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تغییر رمز عبور');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (data: RefreshTokenRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تازه‌سازی توکن');
    }
  }
);

export const registerConsultant = createAsyncThunk(
  'auth/registerConsultant',
  async (data: RegisterConsultantRequest, { rejectWithValue }) => {
    try {
      await authApi.registerConsultant(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت مشاور');
    }
  }
);

export const getConsultants = createAsyncThunk(
  'auth/getConsultants',
  async (_, { rejectWithValue }) => {
    try {
      const consultants = await authApi.getConsultants();
      return consultants;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت لیست مشاوران');
    }
  }
);

export const registerMember = createAsyncThunk(
  'auth/registerMember',
  async (data: RegisterMemberRequest, { rejectWithValue }) => {
    try {
      await authApi.registerMember(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت عضو');
    }
  }
);

export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async (data: RegisterAdminRequest, { rejectWithValue }) => {
    try {
      await authApi.registerAdmin(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت مدیر');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Save user to localStorage when setUser is called
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreAuth: (state) => {
      // Restore tokens and user from localStorage on app initialization/refresh
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = getUserFromStorage();
        
        if (accessToken) {
          state.accessToken = accessToken;
        }
        if (refreshToken) {
          state.refreshToken = refreshToken;
        }
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register Customer
    builder
      .addCase(registerCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      });
  },
});

export const { logout, setUser, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;

