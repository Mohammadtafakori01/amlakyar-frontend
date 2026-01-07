import apiClient from '../../../shared/api/client';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  SearchContactsDto,
} from '../types';

export const contactsApi = {
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/contacts', data);
    return response.data;
  },

  getContacts: async (searchParams?: SearchContactsDto): Promise<Contact[]> => {
    const params = new URLSearchParams();
    if (searchParams?.firstName) params.append('firstName', searchParams.firstName);
    if (searchParams?.lastName) params.append('lastName', searchParams.lastName);
    if (searchParams?.phoneNumber) params.append('phoneNumber', searchParams.phoneNumber);
    if (searchParams?.address) params.append('address', searchParams.address);
    if (searchParams?.search) params.append('search', searchParams.search);
    
    const queryString = params.toString();
    const url = queryString ? `/contacts?${queryString}` : '/contacts';
    const response = await apiClient.get<Contact[]>(url);
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

