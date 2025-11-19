import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../../shared/types';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
}

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
};

