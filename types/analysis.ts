import type { SkinConcernType, SkinType } from './ingredient';

export interface Analysis {
  id: string;
  session_id: string | null;
  user_id: string | null;
  result_data: AnalysisResult;
  recommended_ingredients: RecommendedIngredient[];
  recommended_product_ids: string[] | null;
  analysis_engine: 'openai-vision' | 'hautai' | 'hybrid';
  processing_time_ms: number | null;
  model_version: string | null;
  prompt_version: string | null;
  client_info: ClientInfo | null;
  user_rating: number | null;
  user_feedback: string | null;
  feedback_tags: string[] | null;
  created_at: string;
}

export interface AnalysisResult {
  photo_quality: 'good' | 'fair' | 'poor';
  lighting: 'natural' | 'artificial' | 'dim' | 'harsh';
  skin_type: SkinType;
  overall_score: number;
  estimated_age_range: string;
  concerns: DetectedConcern[];
  skin_summary_en: string;
  skin_summary_ko: string;
  analysis_notes: string;
}

export interface DetectedConcern {
  type: SkinConcernType;
  score: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  location: string[];
  confidence: number;
  description_en: string;
  description_ko: string;
}

export interface RecommendedIngredient {
  name: string;
  priority: number;
  score: number;
  addresses: SkinConcernType[];
  reason_en: string;
  reason_ko?: string;
}

export interface ClientInfo {
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  screen_size?: string;
  locale?: string;
  referrer?: string;
}

// API response types
export interface AnalysisApiResponse {
  success: boolean;
  data?: AnalysisApiData;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  meta?: {
    timestamp: string;
    version: string;
    engine: string;
  };
}

export interface AnalysisApiData {
  analysis_id: string;
  concerns: AnalysisApiConcern[];
  skin_type: string;
  estimated_age_range: string;
  confidence_score: number;
  photo_quality: string;
  analysis_notes?: string;
  processing_time_ms: number;
}

export interface AnalysisApiConcern {
  type: string;
  score: number;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
}
