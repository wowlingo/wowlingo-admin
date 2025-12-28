import apiClient from './client';
import { Hashtag, ApiResponse } from '../../types';

export interface CreateHashtagPayload {
  code: string;
  name: string;
}

export const hashtagAPI = {
  getAll: async (): Promise<Hashtag[]> => {
    const { data } = await apiClient.get<ApiResponse<Hashtag[]>>('/api/hashtags');
    return data.data;
  },

  create: async (payload: CreateHashtagPayload): Promise<Hashtag> => {
    const { data } = await apiClient.post<ApiResponse<Hashtag>>('/api/admin/hashtag', payload);
    return data.data;
  },

  // 다음 code 번호 생성 (code1, code2, ...)
  generateNextCode: (hashtags: Hashtag[]): string => {
    const codeNumbers = hashtags
      .map(h => {
        const match = h.code.match(/^code(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const maxCodeNumber = codeNumbers.length > 0 ? Math.max(...codeNumbers) : 0;
    return `code${maxCodeNumber + 1}`;
  },
};