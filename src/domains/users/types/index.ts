import { User, CreateUserRequest, UpdateUserRequest, UserFilters, CreateStaffRequest, PaginationMeta, SearchUsersQuery } from '../../../shared/types';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  searchResults: User[];
  isSearching: boolean;
  searchQuery: SearchUsersQuery | null;
}

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  CreateStaffRequest,
  SearchUsersQuery,
};

