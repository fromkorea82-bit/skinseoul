export interface Product {
  id: string;
  name: string;
  name_ko: string | null;
  name_ja: string | null;
  name_zh: string | null;
  brand: string;
  category: ProductCategory;
  ingredients: ProductIngredients;
  price_usd: number | null;
  price_krw: number | null;
  rating: number | null;
  review_count: number;
  image_url: string | null;
  thumbnail_url: string | null;
  affiliate_links: AffiliateLinks;
  description: MultiLangText;
  popularity_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'essence'
  | 'ampoule'
  | 'moisturizer'
  | 'cream'
  | 'sunscreen'
  | 'mask'
  | 'exfoliator';

export interface ProductIngredients {
  primary: string[];
  full_list: string[];
}

export interface AffiliateLinks {
  amazon?: string;
  amazon_jp?: string;
  coupang?: string;
  yesstyle?: string;
}

export interface MultiLangText {
  en?: string;
  ko?: string;
  ja?: string;
  zh?: string;
}
