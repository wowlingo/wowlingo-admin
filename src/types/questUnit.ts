export interface Hashtag {
  hashtagId: number;
  code: string;
  name: string;
}

export interface QuestUnit {
  questItemUnitId: number;
  str: string;
  type: string;
  urlNormal: string;
  urlSlow: string;
  hashtags: string[];
  remark?: string;
}

export interface Quest {
  questId: number;
  title: string;
  type: string;
  questItemCount: number;
  order: number;
  hashtags: string[];
}

// API Request Payloads
export interface CreateQuestUnitPayload {
  str: string;
  urlNormal: string;
  urlSlow: string;
  hashtagIds: number[];
  remark?: string;
}

export interface UpdateQuestUnitPayload {
  str?: string;
  urlNormal?: string;
  urlSlow?: string;
  hashtagIds?: number[];
  remark?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

// File Upload Response
export interface UploadResponse {
  url: string;
  originalName: string;
}
