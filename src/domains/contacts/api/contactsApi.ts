import apiClient from '../../../shared/api/client';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from '../types';

export const contactsApi = {
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/contacts', data);
    return response.data;
  },

  getContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>('/contacts');
    return response.data;
  },

  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    const response = await apiClient.patch<Contact>(`/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },
};

