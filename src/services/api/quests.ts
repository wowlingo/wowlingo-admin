import apiClient from './client';
import type { Quest, ApiResponse } from '../../types';

export interface CreateQuestPayload {
  title: string;
  type: 'choice' | 'statement-question' | 'same-different';
  questItemCount: number;
  order: number;
  hashtagIds?: number[];
}

export interface UpdateQuestPayload {
  title?: string;
  type?: 'choice' | 'statement-question' | 'same-different';
  questItemCount?: number;
  order?: number;
  hashtagIds?: number[];
}

export const questAPI = {
  async getAll(): Promise<Quest[]> {
    const { data } = await apiClient.get<ApiResponse<Quest[]>>('/api/admin/quest');
    return data.data;
  },

  async getById(id: number): Promise<Quest> {
    const { data } = await apiClient.get<ApiResponse<Quest>>(`/api/admin/quest/${id}`);
    return data.data;
  },

  async create(payload: CreateQuestPayload): Promise<Quest> {
    const { data } = await apiClient.post<ApiResponse<Quest>>('/api/admin/quest', payload);
    return data.data;
  },

  async update(id: number, payload: UpdateQuestPayload): Promise<Quest> {
    const { data } = await apiClient.put<ApiResponse<Quest>>(`/api/admin/quest/${id}`, payload);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/quest/${id}`);
  },
};