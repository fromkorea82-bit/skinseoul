export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Product {
  id: string;
  name: string;
  name_ko?: string;
  name_ja?: string;
  name_zh?: string;
  brand: string;
  category: string;
  ingredients: {
    primary: string[];
    full_list: string[];
  };
  price_usd?: number;
  price_krw?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  thumbnail_url?: string;
  affiliate_links?: {
    amazon?: string;
    coupang?: string;
    yesstyle?: string;
  };
  description?: {
    en?: string;
    ko?: string;
    ja?: string;
    zh?: string;
  };
  popularity_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name_en: string;
  name_ko?: string;
  name_ja?: string;
  name_zh?: string;
  description: {
    en?: string;
    ko?: string;
    ja?: string;
    zh?: string;
  };
  benefits?: string[];
  addresses_concerns?: string[];
  best_for_skin_types?: string[];
  usage_frequency?: string;
  research_level?: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  session_id?: string;
  user_id?: string;
  result_data: {
    concerns: SkinConcern[];
    skin_type: string;
    estimated_age?: string;
    confidence_score: number;
    photo_quality?: string;
  };
  recommended_ingredients?: RecommendedIngredient[];
  recommended_product_ids?: string[];
  analysis_engine: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface SkinConcern {
  type: string;
  score: number;
  location?: string;
  severity?: string;
  description?: string;
}

export interface RecommendedIngredient {
  name: string;
  priority: number;
  score: number;
  why_needed?: string;
  concerns_addressed?: string[];
}
