import type { MultiLangText } from './product';

export interface Ingredient {
  id: string;
  name_en: string;
  name_ko: string | null;
  name_ja: string | null;
  name_zh: string | null;
  aliases: string[] | null;
  description: MultiLangText;
  benefits: string[] | null;
  addresses_concerns: SkinConcernType[] | null;
  best_for_skin_types: SkinType[] | null;
  usage_frequency: 'daily' | 'twice-daily' | 'weekly' | 'as_needed' | null;
  usage_time: 'am' | 'pm' | 'both' | null;
  concentration_range: string | null;
  precautions: MultiLangText | null;
  pairs_well_with: string[] | null;
  avoid_mixing_with: string[] | null;
  research_level: ResearchLevel | null;
  inci_name: string | null;
  ewg_rating: number | null;
  created_at: string;
}

export type SkinConcernType =
  | 'dehydration'
  | 'fine_lines'
  | 'wrinkles'
  | 'hyperpigmentation'
  | 'enlarged_pores'
  | 'acne'
  | 'blemishes'
  | 'redness'
  | 'sensitivity'
  | 'dullness'
  | 'oily_skin';

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | 'all';

export type ResearchLevel = 'strong' | 'moderate' | 'limited' | 'traditional';
