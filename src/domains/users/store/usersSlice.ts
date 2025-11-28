import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '../api/usersApi';
import { UsersState, User, CreateUserRequest, UpdateUserRequest, UserFilters, CreateStaffRequest, SearchUsersQuery } from '../types';
import { PaginatedResponse } from '../../../shared/types';

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  searchQuery: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters: UserFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await usersApi.getAllUsers(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در دریافت لیست کاربران');
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await usersApi.getUserById(id);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اطلاعات کاربر');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const user = await usersApi.createUser(data);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد کاربر');
    }
  }
);

export const createStaff = createAsyncThunk(
  'users/createStaff',
  async (data: CreateStaffRequest, { rejectWithValue }) => {
    try {
      const user = await usersApi.createStaff(data);
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در ایجاد کاربر');
      return rejectWithValue(errorMsg);
    }
  }
);
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const user = await usersApi.updateUser(id, data);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در به‌روزرسانی کاربر');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف کاربر');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query: SearchUsersQuery, { rejectWithValue }) => {
    try {
      const users = await usersApi.searchUsers(query);
      return { users, query };
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : (message || 'خطا در جستجوی کاربران');
      return rejectWithValue(errorMsg);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
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
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Staff
    builder
      .addCase(createStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.users;
        state.searchQuery = action.payload.query;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedUser, setFilters, clearError, clearSearch } = usersSlice.actions;
export default usersSlice.reducer;

