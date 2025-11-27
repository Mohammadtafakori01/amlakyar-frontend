import apiClient from '../../../shared/api/client';
import {
  PropertyFile,
  CreatePropertyFileRequest,
  UpdatePropertyFileRequest,
  PropertyFileFilters,
  PropertyFilesResponse,
  ShareExternalRequest,
  BulkOperationRequest,
  PropertyFileAuditLog,
  PropertyFileStatistics,
} from '../types';

export const propertyFilesApi = {
  createPropertyFile: async (data: CreatePropertyFileRequest): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>('/property-files', data);
    return response.data;
  },

  getPropertyFiles: async (filters?: PropertyFileFilters): Promise<PropertyFilesResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.transactionType) params.append('transactionType', filters.transactionType);
    if (filters?.buildingType) params.append('buildingType', filters.buildingType);
    if (filters?.estateId) params.append('estateId', filters.estateId);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/property-files?${queryString}` : '/property-files';
    const response = await apiClient.get<PropertyFilesResponse>(url);
    return response.data;
  },

  getPropertyFileById: async (id: string): Promise<PropertyFile> => {
    const response = await apiClient.get<PropertyFile>(`/property-files/${id}`);
    return response.data;
  },

  updatePropertyFile: async (id: string, data: UpdatePropertyFileRequest): Promise<PropertyFile> => {
    const response = await apiClient.patch<PropertyFile>(`/property-files/${id}`, data);
    return response.data;
  },

  deletePropertyFile: async (id: string): Promise<void> => {
    await apiClient.delete(`/property-files/${id}`);
  },

  shareInternal: async (id: string): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>(`/property-files/${id}/share-internal`);
    return response.data;
  },

  shareExternal: async (id: string, data: ShareExternalRequest): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>(`/property-files/${id}/share-external`, data);
    return response.data;
  },

  shareFromPersonal: async (id: string): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>(`/property-files/${id}/share-from-personal`);
    return response.data;
  },

  shareFromPersonalToExternal: async (id: string, data: ShareExternalRequest): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>(`/property-files/${id}/share-from-personal-to-external`, data);
    return response.data;
  },

  restorePropertyFile: async (id: string): Promise<PropertyFile> => {
    const response = await apiClient.post<PropertyFile>(`/property-files/${id}/restore`);
    return response.data;
  },

  getDeletedPropertyFiles: async (filters?: PropertyFileFilters): Promise<PropertyFilesResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/property-files/deleted?${queryString}` : '/property-files/deleted';
    const response = await apiClient.get<PropertyFilesResponse>(url);
    return response.data;
  },

  getAuditLogs: async (id: string): Promise<PropertyFileAuditLog[]> => {
    const response = await apiClient.get<PropertyFileAuditLog[]>(`/property-files/${id}/audit-logs`);
    return response.data;
  },

  bulkOperations: async (data: BulkOperationRequest): Promise<{ success: number; failed: number }> => {
    const response = await apiClient.post<{ success: number; failed: number }>('/property-files/bulk-operations', data);
    return response.data;
  },

  getStatistics: async (): Promise<PropertyFileStatistics> => {
    const response = await apiClient.get<PropertyFileStatistics>('/property-files/statistics');
    return response.data;
  },
};

