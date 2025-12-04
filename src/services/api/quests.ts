import apiClient from './client';
import type { Quest, ApiResponse } from '../../types';

export const questAPI = {
  async getAll(): Promise<Quest[]> {
    const { data } = await apiClient.get<ApiResponse<Quest[]>>('/api/admin/quest');
    return data.data;
  },

  async getById(id: number): Promise<Quest> {
    const { data } = await apiClient.get<ApiResponse<Quest>>(`/api/admin/quest/${id}`);
    return data.data;
  },
};