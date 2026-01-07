import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clientLogsApi } from '../api/clientLogsApi';
import {
  ClientLogsState,
  ClientLog,
  CreateClientLogRequest,
  PublicClientLogsFilters,
} from '../types';

const initialState: ClientLogsState = {
  clientLogs: [],
  selectedLog: null,
  isLoading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const fetchClientLogs = createAsyncThunk(
  'clientLogs/fetchClientLogs',
  async (_, { rejectWithValue }) => {
    try {
      const logs = await clientLogsApi.getClientLogs();
      return logs;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت مراجعات');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchClientLogById = createAsyncThunk(
  'clientLogs/fetchClientLogById',
  async (id: string, { rejectWithValue }) => {
    try {
      const log = await clientLogsApi.getClientLogById(id);
      return log;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت مراجعه');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchPublicClientLogs = createAsyncThunk(
  'clientLogs/fetchPublicClientLogs',
  async (filters?: PublicClientLogsFilters, { rejectWithValue }) => {
    try {
      const response = await clientLogsApi.getPublicClientLogs(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت مراجعات عمومی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const shareClientLog = createAsyncThunk(
  'clientLogs/shareClientLog',
  async (id: string, { rejectWithValue }) => {
    try {
      const log = await clientLogsApi.shareClientLog(id);
      return log;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در اشتراک‌گذاری مراجعه');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createClientLog = createAsyncThunk(
  'clientLogs/createClientLog',
  async (data: CreateClientLogRequest, { rejectWithValue }) => {
    try {
      const log = await clientLogsApi.createClientLog(data);
      return log;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ثبت مراجعه');
      return rejectWithValue(errorMsg);
    }
  }
);

const clientLogsSlice = createSlice({
  name: 'clientLogs',
  initialState,
  reducers: {
    setSelectedLog: (state, action: PayloadAction<ClientLog | null>) => {
      state.selectedLog = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.clientLogs = [];
      state.selectedLog = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch client logs
    builder
      .addCase(fetchClientLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientLogs = action.payload;
      })
      .addCase(fetchClientLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch client log by ID
    builder
      .addCase(fetchClientLogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientLogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLog = action.payload;
      })
      .addCase(fetchClientLogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create client log
    builder
      .addCase(createClientLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClientLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientLogs.unshift(action.payload);
      })
      .addCase(createClientLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch public client logs
    builder
      .addCase(fetchPublicClientLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicClientLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientLogs = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
      })
      .addCase(fetchPublicClientLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share client log
    builder
      .addCase(shareClientLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareClientLog.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.clientLogs.findIndex(log => log.id === action.payload.id);
        if (index !== -1) {
          state.clientLogs[index] = action.payload;
        }
      })
      .addCase(shareClientLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedLog, clearError, resetState } = clientLogsSlice.actions;
export default clientLogsSlice.reducer;

