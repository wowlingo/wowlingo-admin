import apiClient from './client';
import { ApiResponse, UploadResponse } from '../../types';

export const uploadAPI = {
  uploadAudio: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<ApiResponse<UploadResponse>>(
      '/api/upload/audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.data.url;
  },
};