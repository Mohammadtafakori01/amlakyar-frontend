import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { propertyFilesApi } from '../api/propertyFilesApi';
import {
  PropertyFilesState,
  PropertyFile,
  CreatePropertyFileRequest,
  UpdatePropertyFileRequest,
  PropertyFileFilters,
  ShareExternalRequest,
  PropertyFilesResponse,
  BulkOperationRequest,
  PropertyFileAuditLog,
  PropertyFileStatistics,
} from '../types';

const initialState: PropertyFilesState = {
  propertyFiles: [],
  selectedFile: null,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: null,
  isLoading: false,
  error: null,
  auditLogs: [],
  statistics: null,
};

// Async thunks
export const fetchPropertyFiles = createAsyncThunk(
  'propertyFiles/fetchPropertyFiles',
  async (filters: PropertyFileFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await propertyFilesApi.getPropertyFiles(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت فایل‌های ملکی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchPropertyFileById = createAsyncThunk(
  'propertyFiles/fetchPropertyFileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.getPropertyFileById(id);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت فایل ملکی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createPropertyFile = createAsyncThunk(
  'propertyFiles/createPropertyFile',
  async (data: CreatePropertyFileRequest, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.createPropertyFile(data);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد فایل ملکی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updatePropertyFile = createAsyncThunk(
  'propertyFiles/updatePropertyFile',
  async ({ id, data }: { id: string; data: UpdatePropertyFileRequest }, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.updatePropertyFile(id, data);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ویرایش فایل ملکی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const deletePropertyFile = createAsyncThunk(
  'propertyFiles/deletePropertyFile',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyFilesApi.deletePropertyFile(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در حذف فایل ملکی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const shareInternal = createAsyncThunk(
  'propertyFiles/shareInternal',
  async (id: string, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.shareInternal(id);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌اشتراک‌گذاری داخلی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const shareExternal = createAsyncThunk(
  'propertyFiles/shareExternal',
  async ({ id, data }: { id: string; data: ShareExternalRequest }, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.shareExternal(id, data);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌اشتراک‌گذاری خارجی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const shareFromPersonal = createAsyncThunk(
  'propertyFiles/shareFromPersonal',
  async (id: string, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.shareFromPersonal(id);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌اشتراک‌گذاری از فایل شخصی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const shareFromPersonalToExternal = createAsyncThunk(
  'propertyFiles/shareFromPersonalToExternal',
  async ({ id, data }: { id: string; data: ShareExternalRequest }, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.shareFromPersonalToExternal(id, data);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌اشتراک‌گذاری فایل شخصی به تعاون خارجی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const restorePropertyFile = createAsyncThunk(
  'propertyFiles/restorePropertyFile',
  async (id: string, { rejectWithValue }) => {
    try {
      const file = await propertyFilesApi.restorePropertyFile(id);
      return file;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در بازیابی فایل');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchDeletedPropertyFiles = createAsyncThunk(
  'propertyFiles/fetchDeletedPropertyFiles',
  async (filters: PropertyFileFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await propertyFilesApi.getDeletedPropertyFiles(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت فایل‌های حذف شده');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'propertyFiles/fetchAuditLogs',
  async (id: string, { rejectWithValue }) => {
    try {
      const logs = await propertyFilesApi.getAuditLogs(id);
      return logs;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت تاریخچه تغییرات');
      return rejectWithValue(errorMsg);
    }
  }
);

export const bulkOperations = createAsyncThunk(
  'propertyFiles/bulkOperations',
  async (data: BulkOperationRequest, { rejectWithValue }) => {
    try {
      const result = await propertyFilesApi.bulkOperations(data);
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در عملیات دسته‌ای');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'propertyFiles/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await propertyFilesApi.getStatistics();
      return stats;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت آمار');
      return rejectWithValue(errorMsg);
    }
  }
);

const propertyFilesSlice = createSlice({
  name: 'propertyFiles',
  initialState,
  reducers: {
    setSelectedFile: (state, action: PayloadAction<PropertyFile | null>) => {
      state.selectedFile = action.payload;
    },
    setFilters: (state, action: PayloadAction<PropertyFileFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAuditLogs: (state) => {
      state.auditLogs = [];
    },
    resetState: (state) => {
      state.propertyFiles = [];
      state.selectedFile = null;
      state.filters = { page: 1, limit: 10 };
      state.pagination = null;
      state.error = null;
      state.auditLogs = [];
      state.statistics = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch property files
    builder
      .addCase(fetchPropertyFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyFiles = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchPropertyFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch property file by ID
    builder
      .addCase(fetchPropertyFileById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyFileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedFile = action.payload;
      })
      .addCase(fetchPropertyFileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create property file
    builder
      .addCase(createPropertyFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPropertyFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyFiles.unshift(action.payload);
      })
      .addCase(createPropertyFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update property file
    builder
      .addCase(updatePropertyFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyFile.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.propertyFiles.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.propertyFiles[index] = action.payload;
        }
        if (state.selectedFile?.id === action.payload.id) {
          state.selectedFile = action.payload;
        }
      })
      .addCase(updatePropertyFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete property file
    builder
      .addCase(deletePropertyFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePropertyFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyFiles = state.propertyFiles.filter((f) => f.id !== action.payload);
        if (state.selectedFile?.id === action.payload) {
          state.selectedFile = null;
        }
      })
      .addCase(deletePropertyFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share internal
    builder
      .addCase(shareInternal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareInternal.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shareInternal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share external
    builder
      .addCase(shareExternal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareExternal.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shareExternal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Share from personal
    builder
      .addCase(shareFromPersonal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareFromPersonal.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shareFromPersonal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(shareFromPersonalToExternal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareFromPersonalToExternal.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shareFromPersonalToExternal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Restore property file
    builder
      .addCase(restorePropertyFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restorePropertyFile.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.propertyFiles.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.propertyFiles[index] = action.payload;
        }
      })
      .addCase(restorePropertyFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch deleted property files
    builder
      .addCase(fetchDeletedPropertyFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeletedPropertyFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyFiles = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchDeletedPropertyFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch audit logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk operations
    builder
      .addCase(bulkOperations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkOperations.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(bulkOperations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedFile, setFilters, clearError, clearAuditLogs, resetState } = propertyFilesSlice.actions;
export default propertyFilesSlice.reducer;

