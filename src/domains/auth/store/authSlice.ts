import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { estatesApi } from '../../estates/api/estatesApi';
import { AuthState, User, LoginRequest, RegisterCustomerRequest, SendOTPRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest, RegisterConsultantRequest, RegisterMemberRequest, RegisterAdminRequest, RegisterEstateRequest, Estate } from '../types';
import { UserRole } from '../../../shared/types';

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

const ESTATE_PENDING_ERROR = 'Your estate is waiting for Master approval.';
const ESTATE_REJECTED_ERROR = 'Your estate request was rejected.';

const isEstateStatusMessage = (message?: string): boolean =>
  !!message && (message === ESTATE_PENDING_ERROR || message === ESTATE_REJECTED_ERROR);

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
  estateStatusMessage: null,
  estateRegistrationSuccess: false,
  estateRegistrationError: null,
  lastRegisteredEstate: null,
  resetPasswordMessage: null,
  // Master impersonation fields
  masterAccessToken: null,
  masterRefreshToken: null,
  masterUser: null,
  isImpersonating: false,
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

export const registerEstate = createAsyncThunk(
  'auth/registerEstate',
  async (data: RegisterEstateRequest, { rejectWithValue }) => {
    try {
      const estate = await estatesApi.registerEstate(data);
      return estate;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ثبت املاک');
      return rejectWithValue(errorMsg);
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
      const response = await authApi.resetPassword(data);
      return response.message;
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

export const loginAsUser = createAsyncThunk(
  'auth/loginAsUser',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      const currentAccessToken = state.auth.accessToken;
      const currentRefreshToken = state.auth.refreshToken;

      // Only allow MASTER role to login as user
      if (currentUser?.role !== UserRole.MASTER) {
        return rejectWithValue('فقط کاربر مستر می‌تواند به عنوان کاربر دیگر وارد شود');
      }

      // Store master tokens before switching
      const masterAccessToken = currentAccessToken;
      const masterRefreshToken = currentRefreshToken;
      const masterUser = currentUser;

      // Call the API to login as user
      const response = await authApi.loginAsUser(userId);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Store master tokens in localStorage for restoration
        localStorage.setItem('masterAccessToken', masterAccessToken || '');
        localStorage.setItem('masterRefreshToken', masterRefreshToken || '');
        localStorage.setItem('masterUser', JSON.stringify(masterUser));
      }

      return {
        ...response,
        masterAccessToken,
        masterRefreshToken,
        masterUser,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ورود به عنوان کاربر');
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
      state.estateStatusMessage = null;
      state.estateRegistrationSuccess = false;
      state.estateRegistrationError = null;
      state.lastRegisteredEstate = null;
      // Clear master tokens on logout
      state.masterAccessToken = null;
      state.masterRefreshToken = null;
      state.masterUser = null;
      state.isImpersonating = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('masterAccessToken');
        localStorage.removeItem('masterRefreshToken');
        localStorage.removeItem('masterUser');
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.estateStatusMessage = null;
      // Save user to localStorage when setUser is called
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
      state.estateStatusMessage = null;
    },
    clearEstateStatusMessage: (state) => {
      state.estateStatusMessage = null;
    },
    clearResetPasswordMessage: (state) => {
      state.resetPasswordMessage = null;
    },
    resetEstateRegistration: (state) => {
      state.estateRegistrationSuccess = false;
      state.estateRegistrationError = null;
      state.lastRegisteredEstate = null;
    },
    restoreAuth: (state) => {
      // Restore tokens and user from localStorage on app initialization/refresh
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = getUserFromStorage();
        const masterAccessToken = localStorage.getItem('masterAccessToken');
        const masterRefreshToken = localStorage.getItem('masterRefreshToken');
        const masterUserStr = localStorage.getItem('masterUser');
        
        if (accessToken) {
          state.accessToken = accessToken;
        }
        if (refreshToken) {
          state.refreshToken = refreshToken;
        }
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          state.estateStatusMessage = null;
        }
        // Restore master tokens if they exist
        if (masterAccessToken && masterRefreshToken && masterUserStr) {
          try {
            state.masterAccessToken = masterAccessToken;
            state.masterRefreshToken = masterRefreshToken;
            state.masterUser = JSON.parse(masterUserStr);
            state.isImpersonating = true;
          } catch {
            // Invalid master user data, clear it
            localStorage.removeItem('masterAccessToken');
            localStorage.removeItem('masterRefreshToken');
            localStorage.removeItem('masterUser');
          }
        }
      }
    },
    exitImpersonation: (state) => {
      // Restore master tokens and user
      if (state.masterAccessToken && state.masterRefreshToken && state.masterUser) {
        state.accessToken = state.masterAccessToken;
        state.refreshToken = state.masterRefreshToken;
        state.user = state.masterUser;
        state.isAuthenticated = true;
        
        // Clear master tokens
        state.masterAccessToken = null;
        state.masterRefreshToken = null;
        state.masterUser = null;
        state.isImpersonating = false;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', state.accessToken);
          localStorage.setItem('refreshToken', state.refreshToken);
          localStorage.setItem('user', JSON.stringify(state.user));
          localStorage.removeItem('masterAccessToken');
          localStorage.removeItem('masterRefreshToken');
          localStorage.removeItem('masterUser');
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
        state.estateStatusMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        state.estateStatusMessage = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        const message = action.payload as string;
        if (isEstateStatusMessage(message)) {
          state.estateStatusMessage = message;
          state.error = null;
        } else {
          state.error = message;
        }
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

    // Register Estate
    builder
      .addCase(registerEstate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.estateRegistrationError = null;
        state.estateRegistrationSuccess = false;
      })
      .addCase(registerEstate.fulfilled, (state, action: PayloadAction<Estate>) => {
        state.isLoading = false;
        state.estateRegistrationSuccess = true;
        state.lastRegisteredEstate = action.payload;
        state.estateRegistrationError = null;
      })
      .addCase(registerEstate.rejected, (state, action) => {
        state.isLoading = false;
        state.estateRegistrationSuccess = false;
        state.estateRegistrationError = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.estateStatusMessage = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        state.estateStatusMessage = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        const message = action.payload as string;
        if (isEstateStatusMessage(message)) {
          state.estateStatusMessage = message;
          state.error = null;
        } else {
          state.error = message;
        }
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetPasswordMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordMessage = action.payload;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.resetPasswordMessage = null;
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

    // Login As User
    builder
      .addCase(loginAsUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.masterAccessToken = action.payload.masterAccessToken;
        state.masterRefreshToken = action.payload.masterRefreshToken;
        state.masterUser = action.payload.masterUser;
        state.isImpersonating = true;
        state.error = null;
      })
      .addCase(loginAsUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearError, restoreAuth, clearEstateStatusMessage, clearResetPasswordMessage, resetEstateRegistration, exitImpersonation } = authSlice.actions;
export default authSlice.reducer;

