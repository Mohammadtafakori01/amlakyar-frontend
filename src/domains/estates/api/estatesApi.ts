import apiClient from '../../../shared/api/client';
import { Estate, RegisterEstateRequest, EstateFilters, RejectEstateRequest, User } from '../../../shared/types';

export const estatesApi = {
  registerEstate: async (data: RegisterEstateRequest): Promise<Estate> => {
    const response = await apiClient.post<Estate>('/estates', data);
    return response.data;
  },

  getEstates: async (filters?: EstateFilters): Promise<Estate[]> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const query = params.toString();
    const url = query ? `/estates?${query}` : '/estates';
    const response = await apiClient.get<Estate[]>(url);
    return response.data;
  },

  getPendingEstates: async (): Promise<Estate[]> => {
    const response = await apiClient.get<Estate[]>('/estates/pending');
    return response.data;
  },

  getApprovedEstates: async (): Promise<Estate[]> => {
    const response = await apiClient.get<Estate[]>('/estates/approved');
    return response.data;
  },

  getEstateById: async (estateId: string): Promise<Estate> => {
    const response = await apiClient.get<Estate>(`/estates/${estateId}`);
    return response.data;
  },

  approveEstate: async (estateId: string): Promise<Estate> => {
    const response = await apiClient.patch<Estate>(`/estates/${estateId}/approve`);
    return response.data;
  },

  rejectEstate: async (estateId: string, payload?: RejectEstateRequest): Promise<Estate> => {
    const response = await apiClient.patch<Estate>(`/estates/${estateId}/reject`, payload);
    return response.data;
  },

  getEstateMembers: async (estateId: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/estates/${estateId}/members`);
    return response.data;
  },
};


