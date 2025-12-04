import apiClient from './client';
import type {
  QuestItem,
  CreateQuestItemPayload,
  UpdateQuestItemPayload,
  ApiResponse
} from '../../types';

export const questItemAPI = {
  async getAll(questId?: number): Promise<QuestItem[]> {
    const url = questId
      ? `/api/admin/quest/items?questId=${questId}`
      : '/api/admin/quest/items';
    const { data } = await apiClient.get<ApiResponse<QuestItem[]>>(url);
    return data.data;
  },

  async getById(id: number): Promise<QuestItem> {
    const { data } = await apiClient.get<ApiResponse<QuestItem>>(
      `/api/admin/quest/items/${id}`
    );
    return data.data;
  },

  async create(payload: CreateQuestItemPayload): Promise<QuestItem> {
    const { data } = await apiClient.post<ApiResponse<QuestItem>>(
      '/api/admin/quest/items',
      payload
    );
    return data.data;
  },

  async update(id: number, payload: UpdateQuestItemPayload): Promise<QuestItem> {
    const { data } = await apiClient.put<ApiResponse<QuestItem>>(
      `/api/admin/quest/items/${id}`,
      payload
    );
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/quest/items/${id}`);
  },
};