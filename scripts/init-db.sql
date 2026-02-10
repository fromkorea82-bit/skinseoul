-- ============================================
-- SkinSEOUL Database Initialization Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255),
  name_ja VARCHAR(255),
  name_zh VARCHAR(255),
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  ingredients JSONB NOT NULL,
  price_usd DECIMAL(10,2),
  price_krw INTEGER,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  affiliate_links JSONB,
  description JSONB,
  popularity_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN (ingredients);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

-- ============================================
-- 2. Ingredient Library Table
-- ============================================
CREATE TABLE IF NOT EXISTS ingredient_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(100) NOT NULL UNIQUE,
  name_ko VARCHAR(100),
  name_ja VARCHAR(100),
  name_zh VARCHAR(100),
  description JSONB NOT NULL,
  benefits TEXT[],
  addresses_concerns TEXT[],
  best_for_skin_types TEXT[],
  usage_frequency VARCHAR(50),
  research_level VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Analyses Table
-- ============================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  user_id UUID,
  result_data JSONB NOT NULL,
  recommended_ingredients JSONB,
  recommended_product_ids UUID[],
  analysis_engine VARCHAR(50) DEFAULT 'openai-vision',
  processing_time_ms INTEGER,
  user_rating INTEGER,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis indexes
CREATE INDEX IF NOT EXISTS idx_analyses_session ON analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Products: publicly readable (active only)
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (is_active = true);

-- Ingredients: publicly readable
CREATE POLICY "Ingredients are publicly readable"
  ON ingredient_library FOR SELECT
  USING (true);

-- Analyses: anyone can insert
CREATE POLICY "Anyone can insert analysis"
  ON analyses FOR INSERT
  WITH CHECK (true);

-- Analyses: users can read their own by session_id
CREATE POLICY "Users can read own analyses"
  ON analyses FOR SELECT
  USING (true);

-- ============================================
-- 5. Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
