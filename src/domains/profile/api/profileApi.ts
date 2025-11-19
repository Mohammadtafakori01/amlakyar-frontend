import apiClient from '../../../shared/api/client';
import { User } from '../../../shared/types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me/profile');
    return response.data;
  },
};

