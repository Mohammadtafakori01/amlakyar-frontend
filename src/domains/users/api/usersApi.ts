import apiClient from '../../../shared/api/client';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../../shared/types';

export const usersApi = {
  getAllUsers: async (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.estateId) params.append('estateId', filters.estateId);
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    const response = await apiClient.get<User[]>(url);
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

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

