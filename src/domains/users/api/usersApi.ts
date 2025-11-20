import apiClient from '../../../shared/api/client';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, CreateStaffRequest, PaginatedResponse, SearchUsersQuery } from '../../../shared/types';

export const usersApi = {
  getAllUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.estateId) params.append('estateId', filters.estateId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    const response = await apiClient.get<PaginatedResponse<User>>(url);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  createStaff: async (data: CreateStaffRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users/staff', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getCurrentUserProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me/profile');
    return response.data;
  },

  searchUsers: async (query: SearchUsersQuery): Promise<User[]> => {
    const params = new URLSearchParams();
    if (query.phone) params.append('phone', query.phone);
    if (query.firstName) params.append('firstName', query.firstName);
    if (query.lastName) params.append('lastName', query.lastName);
    if (query.name) params.append('name', query.name);
    if (query.nationalId) params.append('nationalId', query.nationalId);
    
    const queryString = params.toString();
    const url = queryString ? `/users/search?${queryString}` : '/users/search';
    const response = await apiClient.get<User[]>(url);
    return response.data;
  },
};

