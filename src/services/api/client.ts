import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../../config';
import { ApiResponse } from '../../types';

const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiServer,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      console.error('API Error:', message);
      return Promise.reject(new Error(message));
    } else if (error.request) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;