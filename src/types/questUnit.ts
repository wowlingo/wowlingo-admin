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

export type QuestItemType = 'choice' | 'statement-question' | 'same-different';

export interface QuestItem {
  questItemId: number;
  questId: number;
  type: QuestItemType;
  question1: number;
  question2: number | null;
  answer1: number | null;
  answer2: number | null;
  answerOx: string | null;
  answerSq: string | null;
  remark: string | null;
  hasAnswer: boolean;
  quest?: Quest;
  questUnit1?: QuestUnit;
  questUnit2?: QuestUnit;
  answerUnit1?: QuestUnit;
  answerUnit2?: QuestUnit;
}

export interface CreateQuestItemPayload {
  questId: number;
  type: QuestItemType;
  question1: number;
  question2?: number;
  answer1?: number;
  answer2?: number;
  answerOx?: string;
  answerSq?: string;
  remark?: string;
}

export interface UpdateQuestItemPayload {
  questId?: number;
  type?: QuestItemType;
  question1?: number;
  question2?: number;
  answer1?: number;
  answer2?: number;
  answerOx?: string;
  answerSq?: string;
  remark?: string;
}
