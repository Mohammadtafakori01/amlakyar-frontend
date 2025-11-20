import { User, CreateUserRequest, UpdateUserRequest, UserFilters, CreateStaffRequest, PaginationMeta } from '../../../shared/types';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  CreateStaffRequest,
};

