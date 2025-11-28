import apiClient from '../../../shared/api/client';
import {
  Contract,
  CreateContractStep1Request,
  AddPartyRequest,
  CreateContractStep2Request,
  UpdatePropertyRequest,
  UpdateTermsRequest,
  SaveDraftRequest,
  CreateContractFullRequest,
  UpdateContractRequest,
  UpdateContractStatusRequest,
  ContractFilters,
} from '../types';
import { PaginatedResponse as SharedPaginatedResponse } from '../../../shared/types';

export const contractsApi = {
  // Step 1: Create contract (select type)
  createContractStep1: async (data: CreateContractStep1Request): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/contracts/step1', data);
    return response.data;
  },

  // Add a single party
  addParty: async (contractId: string, data: AddPartyRequest): Promise<ContractParty> => {
    const response = await apiClient.post<ContractParty>(`/contracts/${contractId}/parties`, data);
    return response.data;
  },

  // Step 2: Register all parties
  createContractStep2: async (contractId: string, data: CreateContractStep2Request): Promise<Contract> => {
    const response = await apiClient.post<Contract>(`/contracts/${contractId}/step2`, data);
    return response.data;
  },

  // Update property details
  updateProperty: async (contractId: string, data: UpdatePropertyRequest): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${contractId}/property`, data);
    return response.data;
  },

  // Update contract terms
  updateTerms: async (contractId: string, data: UpdateTermsRequest): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${contractId}/terms`, data);
    return response.data;
  },

  // Save draft
  saveDraft: async (contractId: string, data: SaveDraftRequest): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${contractId}/draft`, data);
    return response.data;
  },

  // Finalize contract
  finalizeContract: async (contractId: string): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${contractId}/finalize`);
    return response.data;
  },

  // Create full contract (one-step)
  createContractFull: async (data: CreateContractFullRequest): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/contracts', data);
    return response.data;
  },

  // Get contracts list with filters
  getContracts: async (filters?: ContractFilters): Promise<SharedPaginatedResponse<Contract>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/contracts?${queryString}` : '/contracts';
    const response = await apiClient.get<SharedPaginatedResponse<Contract>>(url);
    return response.data;
  },

  // Get archive by year
  getArchive: async (year: number): Promise<Contract[]> => {
    const response = await apiClient.get<Contract[]>(`/contracts/archive?year=${year}`);
    return response.data;
  },

  // Search contracts
  searchContracts: async (query: string): Promise<Contract[]> => {
    const response = await apiClient.get<Contract[]>(`/contracts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get contract by ID
  getContractById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  // Update contract
  updateContract: async (id: string, data: UpdateContractRequest): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  // Update contract status
  updateContractStatus: async (id: string, data: UpdateContractStatusRequest): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${id}/status`, data);
    return response.data;
  },

  // Download contract as PDF
  downloadContractPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/contracts/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    return response.data;
  },

  // Delete contract (only DRAFT contracts)
  deleteContract: async (id: string): Promise<void> => {
    await apiClient.delete(`/contracts/${id}`);
  },
};

// Re-export ContractParty type for API usage
import { ContractParty } from '../types';
export type { ContractParty };

