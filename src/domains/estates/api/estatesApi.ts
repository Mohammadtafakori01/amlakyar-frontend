import apiClient from '../../../shared/api/client';
import { Estate, RegisterEstateRequest, CreateEstateByMasterRequest, EstateFilters, RejectEstateRequest, UpdateEstateRequest, SetEstateStatusRequest, User, PaginatedResponse } from '../../../shared/types';

export const estatesApi = {
  registerEstate: async (data: RegisterEstateRequest): Promise<Estate> => {
    const response = await apiClient.post<Estate>('/estates', data);
    return response.data;
  },

  createEstateByMaster: async (data: CreateEstateByMasterRequest): Promise<Estate> => {
    const response = await apiClient.post<Estate>('/estates/master', data);
    return response.data;
  },

  getEstates: async (filters?: EstateFilters): Promise<PaginatedResponse<Estate>> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const query = params.toString();
    const url = query ? `/estates?${query}` : '/estates';
    const response = await apiClient.get<PaginatedResponse<Estate>>(url);
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

  setEstateStatus: async (id: string, data: SetEstateStatusRequest): Promise<Estate> => {
    const response = await apiClient.patch<Estate>(`/estates/${id}/status`, data);
    return response.data;
  },

  getEstateMembers: async (estateId: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/estates/${estateId}/members`);
    return response.data;
  },

  updateEstate: async (id: string, data: UpdateEstateRequest): Promise<Estate> => {
    const response = await apiClient.patch<Estate>(`/estates/${id}`, data);
    return response.data;
  },

  deleteEstate: async (id: string): Promise<void> => {
    await apiClient.delete(`/estates/${id}`);
  },
};


