import apiClient from './client';
import { Hashtag, ApiResponse } from '../../types';

export const hashtagAPI = {
  getAll: async (): Promise<Hashtag[]> => {
    const { data } = await apiClient.get<ApiResponse<Hashtag[]>>('/api/hashtags');
    return data.data;
  },
};