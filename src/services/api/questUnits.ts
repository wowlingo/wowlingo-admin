import apiClient from './client';
import {
  QuestUnit,
  CreateQuestUnitPayload,
  UpdateQuestUnitPayload,
  ApiResponse,
  Quest,
} from '../../types';

export const questUnitAPI = {
  getAll: async (): Promise<QuestUnit[]> => {
    const { data } = await apiClient.get<ApiResponse<QuestUnit[]>>('/api/admin/quest/units');
    return data.data;
  },

  getById: async (id: number): Promise<QuestUnit> => {
    const { data } = await apiClient.get<ApiResponse<QuestUnit>>(`/api/admin/quest/units/${id}`);
    return data.data;
  },

  create: async (payload: CreateQuestUnitPayload): Promise<QuestUnit> => {
    const { data } = await apiClient.post<ApiResponse<QuestUnit>>('/api/admin/quest/units', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateQuestUnitPayload): Promise<QuestUnit> => {
    const { data } = await apiClient.put<ApiResponse<QuestUnit>>(`/api/admin/quest/units/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/quest/units/${id}`);
  },

  getUsedQuests: async (id: number): Promise<Quest[]> => {
    const { data } = await apiClient.get<ApiResponse<Quest[]>>(`/api/admin/quest/units/${id}/quests`);
    return data.data;
  },
};