import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contractsApi } from '../api/contractsApi';
import {
  ContractsState,
  Contract,
  CreateContractStep1Request,
  AddPartyRequest,
  CreateContractStep2Request,
  UpdatePropertyRequest,
  UpdateTermsRequest,
  SaveDraftRequest,
  CreateContractFullRequest,
  UpdateContractRequest,
  UpdateContractStatusRequest,
  ContractFilters,
  PaginatedResponse,
} from '../types';
import { PaginatedResponse as SharedPaginatedResponse } from '../../../shared/types';

const initialState: ContractsState = {
  contracts: [],
  selectedContract: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  searchQuery: null,
};

// Async thunks
export const createContractStep1 = createAsyncThunk(
  'contracts/createStep1',
  async (data: CreateContractStep1Request, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.createContractStep1(data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const addParty = createAsyncThunk(
  'contracts/addParty',
  async ({ contractId, data }: { contractId: string; data: AddPartyRequest }, { rejectWithValue }) => {
    try {
      const party = await contractsApi.addParty(contractId, data);
      return { contractId, party };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در افزودن طرف قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createContractStep2 = createAsyncThunk(
  'contracts/createStep2',
  async ({ contractId, data }: { contractId: string; data: CreateContractStep2Request }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.createContractStep2(contractId, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ثبت طرفین قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateProperty = createAsyncThunk(
  'contracts/updateProperty',
  async ({ contractId, data }: { contractId: string; data: UpdatePropertyRequest }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.updateProperty(contractId, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ثبت جزئیات ملک');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateTerms = createAsyncThunk(
  'contracts/updateTerms',
  async ({ contractId, data }: { contractId: string; data: UpdateTermsRequest }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.updateTerms(contractId, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ثبت شرایط قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const saveDraft = createAsyncThunk(
  'contracts/saveDraft',
  async ({ contractId, data }: { contractId: string; data: SaveDraftRequest }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.saveDraft(contractId, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ذخیره پیش‌نویس');
      return rejectWithValue(errorMsg);
    }
  }
);

export const finalizeContract = createAsyncThunk(
  'contracts/finalize',
  async (contractId: string, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.finalizeContract(contractId);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در نهایی‌سازی قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const createContractFull = createAsyncThunk(
  'contracts/createFull',
  async (data: CreateContractFullRequest, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.createContractFull(data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchContracts = createAsyncThunk(
  'contracts/fetchContracts',
  async (filters?: ContractFilters, { rejectWithValue }) => {
    try {
      const response = await contractsApi.getContracts(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت لیست قراردادها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchArchive = createAsyncThunk(
  'contracts/fetchArchive',
  async (year: number, { rejectWithValue }) => {
    try {
      const contracts = await contractsApi.getArchive(year);
      return { contracts, year };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت بایگانی');
      return rejectWithValue(errorMsg);
    }
  }
);

export const searchContracts = createAsyncThunk(
  'contracts/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const contracts = await contractsApi.searchContracts(query);
      return { contracts, query };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در جستجوی قراردادها');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchContractById = createAsyncThunk(
  'contracts/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.getContractById(id);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت اطلاعات قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateContract = createAsyncThunk(
  'contracts/update',
  async ({ id, data }: { id: string; data: UpdateContractRequest }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.updateContract(id, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در به‌روزرسانی قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateContractStatus = createAsyncThunk(
  'contracts/updateStatus',
  async ({ id, data }: { id: string; data: UpdateContractStatusRequest }, { rejectWithValue }) => {
    try {
      const contract = await contractsApi.updateContractStatus(id, data);
      return contract;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در تغییر وضعیت قرارداد');
      return rejectWithValue(errorMsg);
    }
  }
);

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    setSelectedContract: (state, action: PayloadAction<Contract | null>) => {
      state.selectedContract = action.payload;
    },
    setFilters: (state, action: PayloadAction<ContractFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = null;
      state.isSearching = false;
    },
  },
  extraReducers: (builder) => {
    // Create Step 1
    builder
      .addCase(createContractStep1.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContractStep1.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload;
        state.error = null;
      })
      .addCase(createContractStep1.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Party
    builder
      .addCase(addParty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addParty.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedContract?.id === action.payload.contractId) {
          if (!state.selectedContract.parties) {
            state.selectedContract.parties = [];
          }
          state.selectedContract.parties.push(action.payload.party);
        }
        state.error = null;
      })
      .addCase(addParty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Step 2
    builder
      .addCase(createContractStep2.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContractStep2.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload;
        state.error = null;
      })
      .addCase(createContractStep2.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Property
    builder
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        // The response is a property object, not a contract object
        // It has structure: { id: propertyId, contractId: contractId, contract: { ... } }
        const propertyResponse = action.payload as any;
        
        // Extract the contract from the property response if it exists
        if (propertyResponse.contract) {
          // If the response has a nested contract object, use that
          state.selectedContract = propertyResponse.contract;
          // Update the contract in the list if it exists
          const index = state.contracts.findIndex(c => c.id === propertyResponse.contract.id);
          if (index !== -1) {
            state.contracts[index] = propertyResponse.contract;
          }
        } else if (propertyResponse.contractId) {
          // If we only have contractId, try to find the contract in the list
          const contract = state.contracts.find(c => c.id === propertyResponse.contractId);
          if (contract) {
            state.selectedContract = contract;
          }
        }
        // Don't set selectedContract to the property object itself
        // as it has a different id (property id, not contract id)
        state.error = null;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Terms
    builder
      .addCase(updateTerms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTerms.fulfilled, (state, action) => {
        state.isLoading = false;
        // The response is a terms object, not a contract object
        // It has structure: { id: termsId, contractId: contractId, contract: { ... } }
        const termsResponse = action.payload as any;
        
        // Extract the contract from the terms response if it exists
        if (termsResponse.contract) {
          // If the response has a nested contract object, use that
          state.selectedContract = termsResponse.contract;
          // Update the contract in the list if it exists
          const index = state.contracts.findIndex(c => c.id === termsResponse.contract.id);
          if (index !== -1) {
            state.contracts[index] = termsResponse.contract;
          }
        } else if (termsResponse.contractId) {
          // If we only have contractId, try to find the contract in the list
          const contract = state.contracts.find(c => c.id === termsResponse.contractId);
          if (contract) {
            state.selectedContract = contract;
          }
        }
        // Don't set selectedContract to the terms object itself
        // as it has a different id (terms id, not contract id)
        state.error = null;
      })
      .addCase(updateTerms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save Draft
    builder
      .addCase(saveDraft.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload;
        const index = state.contracts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
        state.error = null;
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Finalize Contract
    builder
      .addCase(finalizeContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finalizeContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload;
        const index = state.contracts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
        state.error = null;
      })
      .addCase(finalizeContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Full Contract
    builder
      .addCase(createContractFull.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContractFull.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts.push(action.payload);
        state.selectedContract = action.payload;
        state.error = null;
      })
      .addCase(createContractFull.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Contracts
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.data;
        state.pagination = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Archive
    builder
      .addCase(fetchArchive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArchive.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.contracts;
        state.error = null;
      })
      .addCase(fetchArchive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Contracts
    builder
      .addCase(searchContracts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchContracts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.contracts;
        state.searchQuery = action.payload.query;
        state.error = null;
      })
      .addCase(searchContracts.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Fetch Contract By ID
    builder
      .addCase(fetchContractById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload;
        state.error = null;
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Contract
    builder
      .addCase(updateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.selectedContract?.id === action.payload.id) {
          state.selectedContract = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Contract Status
    builder
      .addCase(updateContractStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContractStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.contracts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.selectedContract?.id === action.payload.id) {
          state.selectedContract = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContractStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedContract, setFilters, clearError, clearSearch } = contractsSlice.actions;
export default contractsSlice.reducer;

