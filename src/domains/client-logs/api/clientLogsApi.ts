import apiClient from '../../../shared/api/client';
import {
  ClientLog,
  CreateClientLogRequest,
} from '../types';

export const clientLogsApi = {
  createClientLog: async (data: CreateClientLogRequest): Promise<ClientLog> => {
    const response = await apiClient.post<ClientLog>('/client-logs', data);
    return response.data;
  },

  getClientLogs: async (): Promise<ClientLog[]> => {
    const response = await apiClient.get<ClientLog[]>('/client-logs');
    return response.data;
  },

  getPublicClientLogs: async (): Promise<ClientLog[]> => {
    const response = await apiClient.get<ClientLog[]>('/client-logs/public');
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

