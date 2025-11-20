import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { estatesApi } from '../api/estatesApi';
import { EstatesState, Estate, EstateFilters, RejectEstateRequest } from '../types';

const initialState: EstatesState = {
  estates: [],
  pendingEstates: [],
  approvedEstates: [],
  selectedEstate: null,
  currentEstate: null,
  filters: {},
  isLoading: false,
  isPendingLoading: false,
  isApprovedLoading: false,
  isCurrentEstateLoading: false,
  error: null,
  pendingEstatesError: null,
  approvedEstatesError: null,
  currentEstateError: null,
};

const normalizeError = (error: any, fallback: string) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return message || fallback;
};

export const fetchEstates = createAsyncThunk(
  'estates/fetchEstates',
  async (filters?: EstateFilters, { rejectWithValue }) => {
    try {
      const estates = await estatesApi.getEstates(filters);
      return estates;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در دریافت لیست املاک'));
    }
  }
);

export const fetchPendingEstates = createAsyncThunk(
  'estates/fetchPendingEstates',
  async (_, { rejectWithValue }) => {
    try {
      const estates = await estatesApi.getPendingEstates();
      return estates;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در دریافت لیست املاک در انتظار تایید'));
    }
  }
);

export const fetchApprovedEstates = createAsyncThunk(
  'estates/fetchApprovedEstates',
  async (_, { rejectWithValue }) => {
    try {
      const estates = await estatesApi.getApprovedEstates();
      return estates;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در دریافت لیست املاک تایید شده'));
    }
  }
);
export const fetchEstateById = createAsyncThunk(
  'estates/fetchEstateById',
  async (estateId: string, { rejectWithValue }) => {
    try {
      const estate = await estatesApi.getEstateById(estateId);
      return estate;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در دریافت اطلاعات ملک'));
    }
  }
);

export const fetchCurrentEstate = createAsyncThunk(
  'estates/fetchCurrentEstate',
  async (estateId: string, { rejectWithValue }) => {
    try {
      const estate = await estatesApi.getEstateById(estateId);
      return estate;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در دریافت اطلاعات املاک شما'));
    }
  }
);

export const approveEstate = createAsyncThunk(
  'estates/approveEstate',
  async (estateId: string, { rejectWithValue }) => {
    try {
      const estate = await estatesApi.approveEstate(estateId);
      return estate;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در تایید ملک'));
    }
  }
);

export const rejectEstate = createAsyncThunk(
  'estates/rejectEstate',
  async ({ estateId, payload }: { estateId: string; payload?: RejectEstateRequest }, { rejectWithValue }) => {
    try {
      const estate = await estatesApi.rejectEstate(estateId, payload);
      return estate;
    } catch (error: any) {
      return rejectWithValue(normalizeError(error, 'خطا در رد ملک'));
    }
  }
);

const estatesSlice = createSlice({
  name: 'estates',
  initialState,
  reducers: {
    setEstateFilters: (state, action: PayloadAction<EstateFilters>) => {
      state.filters = action.payload;
    },
    clearEstatesError: (state) => {
      state.error = null;
    },
    clearCurrentEstate: (state) => {
      state.currentEstate = null;
      state.currentEstateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstates.fulfilled, (state, action: PayloadAction<Estate[]>) => {
        state.isLoading = false;
        state.estates = action.payload;
        state.error = null;
      })
      .addCase(fetchEstates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPendingEstates.pending, (state) => {
        state.isPendingLoading = true;
        state.pendingEstatesError = null;
      })
      .addCase(fetchPendingEstates.fulfilled, (state, action: PayloadAction<Estate[]>) => {
        state.isPendingLoading = false;
        state.pendingEstates = action.payload;
        state.pendingEstatesError = null;
      })
      .addCase(fetchPendingEstates.rejected, (state, action) => {
        state.isPendingLoading = false;
        state.pendingEstatesError = action.payload as string;
      });

    builder
      .addCase(fetchApprovedEstates.pending, (state) => {
        state.isApprovedLoading = true;
        state.approvedEstatesError = null;
      })
      .addCase(fetchApprovedEstates.fulfilled, (state, action: PayloadAction<Estate[]>) => {
        state.isApprovedLoading = false;
        state.approvedEstates = action.payload;
        state.approvedEstatesError = null;
      })
      .addCase(fetchApprovedEstates.rejected, (state, action) => {
        state.isApprovedLoading = false;
        state.approvedEstatesError = action.payload as string;
      });

    builder
      .addCase(fetchEstateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstateById.fulfilled, (state, action: PayloadAction<Estate>) => {
        state.isLoading = false;
        state.selectedEstate = action.payload;
        state.error = null;
      })
      .addCase(fetchEstateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCurrentEstate.pending, (state) => {
        state.isCurrentEstateLoading = true;
        state.currentEstateError = null;
      })
      .addCase(fetchCurrentEstate.fulfilled, (state, action: PayloadAction<Estate>) => {
        state.isCurrentEstateLoading = false;
        state.currentEstate = action.payload;
        state.currentEstateError = null;
      })
      .addCase(fetchCurrentEstate.rejected, (state, action) => {
        state.isCurrentEstateLoading = false;
        state.currentEstateError = action.payload as string;
      });

    builder
      .addCase(approveEstate.pending, (state) => {
        state.error = null;
      })
      .addCase(approveEstate.fulfilled, (state, action: PayloadAction<Estate>) => {
        const updatedEstate = action.payload;
        state.estates = state.estates.map((estate) =>
          estate.id === updatedEstate.id ? updatedEstate : estate
        );
        state.pendingEstates = state.pendingEstates.filter((estate) => estate.id !== updatedEstate.id);
        const approvedIndex = state.approvedEstates.findIndex((estate) => estate.id === updatedEstate.id);
        if (approvedIndex === -1) {
          state.approvedEstates = [updatedEstate, ...state.approvedEstates];
        } else {
          state.approvedEstates[approvedIndex] = updatedEstate;
        }
        if (state.selectedEstate?.id === updatedEstate.id) {
          state.selectedEstate = updatedEstate;
        }
        if (state.currentEstate?.id === updatedEstate.id) {
          state.currentEstate = updatedEstate;
        }
      })
      .addCase(approveEstate.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(rejectEstate.pending, (state) => {
        state.error = null;
      })
      .addCase(rejectEstate.fulfilled, (state, action: PayloadAction<Estate>) => {
        const updatedEstate = action.payload;
        state.estates = state.estates.map((estate) =>
          estate.id === updatedEstate.id ? updatedEstate : estate
        );
        state.pendingEstates = state.pendingEstates.filter((estate) => estate.id !== updatedEstate.id);
        state.approvedEstates = state.approvedEstates.filter((estate) => estate.id !== updatedEstate.id);
        if (state.selectedEstate?.id === updatedEstate.id) {
          state.selectedEstate = updatedEstate;
        }
        if (state.currentEstate?.id === updatedEstate.id) {
          state.currentEstate = updatedEstate;
        }
      })
      .addCase(rejectEstate.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setEstateFilters, clearEstatesError, clearCurrentEstate } = estatesSlice.actions;
export default estatesSlice.reducer;


