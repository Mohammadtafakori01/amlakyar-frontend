import apiClient from '../../../shared/api/client';
import {
  ClientLog,
  CreateClientLogRequest,
  PublicClientLogsFilters,
} from '../types';
import { PaginatedResponse } from '../../../shared/types';

export const clientLogsApi = {
  createClientLog: async (data: CreateClientLogRequest): Promise<ClientLog> => {
    const response = await apiClient.post<ClientLog>('/client-logs', data);
    return response.data;
  },

  getClientLogs: async (): Promise<ClientLog[]> => {
    const response = await apiClient.get<ClientLog[]>('/client-logs');
    return response.data;
  },

  getPublicClientLogs: async (filters?: PublicClientLogsFilters): Promise<PaginatedResponse<ClientLog>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.visitType) params.append('visitType', filters.visitType);
    
    const queryString = params.toString();
    const url = queryString ? `/client-logs/public?${queryString}` : '/client-logs/public';
    const response = await apiClient.get<PaginatedResponse<ClientLog>>(url);
    return response.data;
  },

  getClientLogById: async (id: string): Promise<ClientLog> => {
    const response = await apiClient.get<ClientLog>(`/client-logs/${id}`);
    return response.data;
  },

  shareClientLog: async (id: string): Promise<ClientLog> => {
    const response = await apiClient.patch<ClientLog>(`/client-logs/${id}/share`, { isPublic: true });
    return response.data;
  },
};

