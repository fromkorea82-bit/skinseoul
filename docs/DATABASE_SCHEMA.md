# Database Schema Documentation

## SkinSEOUL - Supabase PostgreSQL Database Design

**Version:** 1.0
**Last Updated:** February 2026
**Database:** Supabase PostgreSQL 15
**ORM:** Supabase Client (no Prisma for MVP)

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Table: products](#2-table-products)
3. [Table: ingredient_library](#3-table-ingredient_library)
4. [Table: analyses](#4-table-analyses)
5. [Table: users (Phase 2)](#5-table-users-phase-2)
6. [Sample Seed Data](#6-sample-seed-data)
7. [Row Level Security (RLS) Policies](#7-row-level-security-rls-policies)
8. [Database Functions & Triggers](#8-database-functions--triggers)
9. [Views](#9-views)
10. [Migration Scripts](#10-migration-scripts)
11. [Backup & Maintenance](#11-backup--maintenance)
12. [Performance Estimates](#12-performance-estimates)
13. [TypeScript Types](#13-typescript-types)
14. [Query Examples](#14-query-examples)

---

## 1. Schema Overview

### 1.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐                      │
│  │     products     │         │ ingredient_library│                      │
│  ├──────────────────┤         ├──────────────────┤                      │
│  │ id (PK)          │         │ id (PK)          │                      │
│  │ name             │         │ name_en (UNIQUE) │                      │
│  │ name_ko          │◄────────│ name_ko          │                      │
│  │ name_ja          │ JSON    │ name_ja          │                      │
│  │ name_zh          │ lookup  │ name_zh          │                      │
│  │ brand            │         │ description      │                      │
│  │ category         │         │ benefits[]       │                      │
│  │ ingredients      │─────────│ addresses_concerns│                     │
│  │ price_usd        │         │ best_for_skin_types│                    │
│  │ price_krw        │         │ usage_frequency  │                      │
│  │ rating           │         │ precautions      │                      │
│  │ review_count     │         │ research_level   │                      │
│  │ image_url        │         │ created_at       │                      │
│  │ thumbnail_url    │         └──────────────────┘                      │
│  │ affiliate_links  │                                                    │
│  │ description      │                                                    │
│  │ popularity_score │◄─────────────────────┐                            │
│  │ is_active        │                      │                            │
│  │ created_at       │                      │ referenced by              │
│  │ updated_at       │                      │ recommended_product_ids    │
│  └──────────────────┘                      │                            │
│                                            │                            │
│  ┌──────────────────┐         ┌────────────┴─────────┐                  │
│  │      users       │         │      analyses        │                  │
│  │   (Phase 2)      │         ├──────────────────────┤                  │
│  ├──────────────────┤         │ id (PK)              │                  │
│  │ id (PK/FK)       │◄────────│ session_id           │                  │
│  │ email            │ user_id │ user_id (FK) [P2]    │                  │
│  │ display_name     │         │ result_data          │                  │
│  │ preferred_language│        │ recommended_ingredients│                │
│  │ subscription_tier│         │ recommended_product_ids│                │
│  │ subscription_expires│      │ analysis_engine      │                  │
│  │ total_analyses   │         │ processing_time_ms   │                  │
│  │ last_analysis_at │         │ user_rating [P2]     │                  │
│  │ created_at       │         │ user_feedback [P2]   │                  │
│  │ updated_at       │         │ created_at           │                  │
│  └──────────────────┘         └──────────────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  [P2] = Phase 2 feature
  ──► = Reference relationship
  ◄── = Referenced by
```

### 1.2 Tables Summary

| Table | Purpose | Phase | Est. Rows (Year 1) |
|-------|---------|-------|-------------------|
| `products` | K-Beauty product catalog | MVP | 500 |
| `ingredient_library` | Ingredient reference data | MVP | 80 |
| `analyses` | Skin analysis results & tracking | MVP | 50,000 |
| `users` | User accounts & preferences | Phase 2 | 10,000 |

### 1.3 Supabase Project Setup

```bash
# Create new Supabase project
# Dashboard: https://supabase.com/dashboard

# Get connection details
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database URL (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

---

## 2. Table: products

### 2.1 Schema Definition

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table for K-Beauty product catalog
CREATE TABLE products (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ============================================
  -- Basic Information
  -- ============================================
  name VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255),                    -- Korean name (한국어)
  name_ja VARCHAR(255),                    -- Japanese name (日本語)
  name_zh VARCHAR(255),                    -- Chinese Simplified (简体中文)
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,           -- Product category

  -- ============================================
  -- Ingredients (JSONB for flexible querying)
  -- ============================================
  ingredients JSONB NOT NULL DEFAULT '{}',
  /*
  Structure:
  {
    "primary": ["Hyaluronic Acid", "Niacinamide"],
    "full_list": ["Water", "Glycerin", "Hyaluronic Acid", "Niacinamide", "..."]
  }
  */

  -- ============================================
  -- Pricing
  -- ============================================
  price_usd DECIMAL(10,2),                 -- US Dollar price
  price_krw INTEGER,                       -- Korean Won price

  -- ============================================
  -- Ratings & Reviews
  -- ============================================
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),  -- 0.00 - 5.00
  review_count INTEGER DEFAULT 0,

  -- ============================================
  -- Images
  -- ============================================
  image_url TEXT,                          -- Full-size product image
  thumbnail_url TEXT,                      -- 300x300 thumbnail

  -- ============================================
  -- Affiliate Links (JSONB)
  -- ============================================
  affiliate_links JSONB DEFAULT '{}',
  /*
  Structure:
  {
    "amazon": "https://amzn.to/xxx",
    "amazon_jp": "https://amzn.to/yyy",
    "coupang": "https://link.coupang.com/xxx",
    "yesstyle": "https://yesstyle.com/xxx?rco=SKINSEOUL"
  }
  */

  -- ============================================
  -- Descriptions (Multi-language JSONB)
  -- ============================================
  description JSONB DEFAULT '{}',
  /*
  Structure:
  {
    "en": "A lightweight essence with 96.3% snail secretion filtrate...",
    "ko": "96.3% 달팽이 점액 여과물이 함유된 가벼운 에센스...",
    "ja": "96.3%のカタツムリムチンを配合した軽いエッセンス...",
    "zh": "含有96.3%蜗牛黏液滤液的轻盈精华..."
  }
  */

  -- ============================================
  -- Metadata
  -- ============================================
  popularity_score INTEGER DEFAULT 0,      -- Incremented on recommendation
  is_active BOOLEAN DEFAULT true,          -- Soft delete / hide products
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ============================================
  -- Constraints
  -- ============================================
  CONSTRAINT valid_category CHECK (
    category IN ('cleanser', 'toner', 'serum', 'essence', 'ampoule',
                 'moisturizer', 'cream', 'sunscreen', 'mask', 'exfoliator')
  )
);

-- Add comments for documentation
COMMENT ON TABLE products IS 'K-Beauty product catalog with multi-language support';
COMMENT ON COLUMN products.ingredients IS 'JSONB with primary and full ingredient lists';
COMMENT ON COLUMN products.affiliate_links IS 'JSONB with platform-specific affiliate URLs';
COMMENT ON COLUMN products.popularity_score IS 'Auto-incremented when product is recommended';
```

### 2.2 Indexes

```sql
-- GIN index for JSONB ingredient search
CREATE INDEX idx_products_ingredients ON products USING GIN (ingredients);

-- Standard indexes for common queries
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX idx_products_rating ON products(rating DESC NULLS LAST);

-- Partial index for active products only
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- Composite index for filtered sorting
CREATE INDEX idx_products_category_rating ON products(category, rating DESC);
CREATE INDEX idx_products_category_popularity ON products(category, popularity_score DESC);

-- Full-text search index (optional, for product search)
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, ''))
);
```

### 2.3 Category Values

| Category | Description | Example Products |
|----------|-------------|------------------|
| `cleanser` | Face wash, oil cleanser | COSRX Low pH Cleanser |
| `toner` | Hydrating toner, essence toner | Klairs Supple Preparation |
| `serum` | Concentrated treatments | Beauty of Joseon Glow Serum |
| `essence` | Lightweight hydrators | COSRX Snail Mucin Essence |
| `ampoule` | High-potency serums | Missha Time Revolution |
| `moisturizer` | Lightweight lotions | COSRX Oil-Free Lotion |
| `cream` | Rich moisturizers | Laneige Water Bank Cream |
| `sunscreen` | SPF protection | Beauty of Joseon SPF 50 |
| `mask` | Sheet masks, wash-off | Laneige Water Sleeping Mask |
| `exfoliator` | AHA/BHA, scrubs | COSRX BHA Blackhead Power |

---

## 3. Table: ingredient_library

### 3.1 Schema Definition

```sql
-- Ingredient reference library
CREATE TABLE ingredient_library (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ============================================
  -- Names (Multi-language)
  -- ============================================
  name_en VARCHAR(100) NOT NULL UNIQUE,    -- English name (primary key for lookups)
  name_ko VARCHAR(100),                    -- Korean (한국어)
  name_ja VARCHAR(100),                    -- Japanese (日本語)
  name_zh VARCHAR(100),                    -- Chinese Simplified (简体中文)

  -- ============================================
  -- Alternative Names / Aliases
  -- ============================================
  aliases TEXT[],                          -- ['Vitamin B3', 'Nicotinamide']

  -- ============================================
  -- Descriptions (Multi-language JSONB)
  -- ============================================
  description JSONB NOT NULL DEFAULT '{}',
  /*
  Structure:
  {
    "en": "A powerful humectant that can hold up to 1000x its weight in water...",
    "ko": "자체 무게의 1000배까지 수분을 보유할 수 있는 강력한 보습제...",
    "ja": "水を自重の1000倍まで保持できる強力な保湿剤...",
    "zh": "一种强效保湿剂，能够保持自身重量1000倍的水分..."
  }
  */

  -- ============================================
  -- Benefits & Skin Concern Mapping
  -- ============================================
  benefits TEXT[],                         -- What it does
  /*
  Possible values:
  ['hydration', 'anti-aging', 'brightening', 'acne-fighting',
   'barrier-repair', 'pore-minimizing', 'oil-control', 'soothing',
   'exfoliating', 'antioxidant', 'firming', 'plumping']
  */

  addresses_concerns TEXT[],               -- Which skin concerns it helps
  /*
  Possible values (matches AI analysis output):
  ['dehydration', 'fine_lines', 'wrinkles', 'hyperpigmentation',
   'enlarged_pores', 'acne', 'blemishes', 'redness', 'sensitivity',
   'dullness', 'oily_skin', 'dark_circles', 'uneven_texture']
  */

  best_for_skin_types TEXT[],              -- Recommended skin types
  /*
  Possible values:
  ['dry', 'oily', 'combination', 'normal', 'sensitive', 'all']
  */

  -- ============================================
  -- Usage Information
  -- ============================================
  usage_frequency VARCHAR(50),             -- 'daily', 'twice-daily', 'weekly', 'as_needed'
  usage_time VARCHAR(20),                  -- 'am', 'pm', 'both'
  concentration_range VARCHAR(50),         -- '2-5%', '10-20%', etc.

  -- ============================================
  -- Precautions & Warnings (Multi-language)
  -- ============================================
  precautions JSONB DEFAULT '{}',
  /*
  Structure:
  {
    "en": "May increase sun sensitivity. Always use sunscreen.",
    "ko": "자외선에 대한 민감도가 증가할 수 있습니다. 항상 자외선 차단제를 사용하세요.",
    "ja": "...",
    "zh": "..."
  }
  */

  -- ============================================
  -- Compatibility
  -- ============================================
  pairs_well_with TEXT[],                  -- ['Vitamin C', 'Hyaluronic Acid']
  avoid_mixing_with TEXT[],                -- ['Retinol', 'AHA/BHA']

  -- ============================================
  -- Scientific Backing
  -- ============================================
  research_level VARCHAR(20),              -- Evidence strength
  /*
  Possible values:
  'strong' - Multiple peer-reviewed studies
  'moderate' - Some clinical evidence
  'limited' - Emerging research
  'traditional' - Traditional/anecdotal use
  */

  -- ============================================
  -- Metadata
  -- ============================================
  inci_name VARCHAR(200),                  -- Official INCI nomenclature
  ewg_rating INTEGER,                      -- EWG safety rating 1-10
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ============================================
  -- Constraints
  -- ============================================
  CONSTRAINT valid_research_level CHECK (
    research_level IN ('strong', 'moderate', 'limited', 'traditional')
  ),
  CONSTRAINT valid_usage_frequency CHECK (
    usage_frequency IN ('daily', 'twice-daily', 'weekly', 'as_needed')
  ),
  CONSTRAINT valid_usage_time CHECK (
    usage_time IN ('am', 'pm', 'both')
  )
);

-- Comments
COMMENT ON TABLE ingredient_library IS 'Reference library of skincare ingredients with multi-language support';
COMMENT ON COLUMN ingredient_library.addresses_concerns IS 'Maps to AI analysis concern types';
COMMENT ON COLUMN ingredient_library.research_level IS 'Scientific evidence strength rating';
```

### 3.2 Indexes

```sql
-- Primary name lookup
CREATE INDEX idx_ingredient_name ON ingredient_library(name_en);

-- Array indexes for concern/benefit queries
CREATE INDEX idx_ingredient_concerns ON ingredient_library USING GIN (addresses_concerns);
CREATE INDEX idx_ingredient_benefits ON ingredient_library USING GIN (benefits);
CREATE INDEX idx_ingredient_skin_types ON ingredient_library USING GIN (best_for_skin_types);

-- Alias search
CREATE INDEX idx_ingredient_aliases ON ingredient_library USING GIN (aliases);
```

### 3.3 Concern to Ingredient Mapping

| Skin Concern | Primary Ingredients | Secondary Ingredients |
|--------------|---------------------|----------------------|
| `dehydration` | Hyaluronic Acid, Ceramides | Glycerin, Squalane, Beta-Glucan |
| `fine_lines` | Retinol, Peptides | Adenosine, Collagen, Bakuchiol |
| `wrinkles` | Retinol, Peptides | Vitamin C, Adenosine |
| `hyperpigmentation` | Niacinamide, Vitamin C | Arbutin, Tranexamic Acid, Licorice Root |
| `enlarged_pores` | BHA, Niacinamide | AHA, Clay, Witch Hazel |
| `acne` | BHA, Tea Tree | Centella Asiatica, Propolis, Mugwort |
| `blemishes` | Centella Asiatica, Snail Mucin | Madecassoside, Propolis |
| `redness` | Centella Asiatica, Aloe Vera | Madecassoside, Panthenol, Green Tea |
| `sensitivity` | Centella Asiatica, Panthenol | Ceramides, Aloe Vera |
| `dullness` | Vitamin C, AHA | Rice Extract, Niacinamide, Licorice Root |
| `oily_skin` | BHA, Niacinamide | Green Tea, Zinc, Witch Hazel |

---

## 4. Table: analyses

### 4.1 Schema Definition

```sql
-- Skin analysis results and tracking
CREATE TABLE analyses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ============================================
  -- User Identification
  -- ============================================
  session_id VARCHAR(100),                 -- Anonymous browser session ID
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Phase 2: linked user

  -- ============================================
  -- Analysis Results (JSONB)
  -- ============================================
  result_data JSONB NOT NULL DEFAULT '{}',
  /*
  Structure:
  {
    "skin_type": "combination",
    "concerns": [
      {
        "type": "dehydration",
        "score": 0.75,
        "severity": "moderate",
        "location": ["cheeks", "forehead"],
        "confidence": 0.88
      },
      {
        "type": "enlarged_pores",
        "score": 0.45,
        "severity": "mild",
        "location": ["nose", "chin"],
        "confidence": 0.92
      }
    ],
    "overall_score": 72,
    "estimated_age_range": "25-30",
    "photo_quality": "good",
    "lighting_conditions": "natural"
  }
  */

  -- ============================================
  -- Recommendations
  -- ============================================
  recommended_ingredients JSONB DEFAULT '[]',
  /*
  Structure:
  [
    {
      "name": "Hyaluronic Acid",
      "priority": 1,
      "score": 0.92,
      "addresses": ["dehydration"],
      "reason_en": "Deep hydration for your dehydrated cheeks",
      "reason_ko": "건조한 볼을 위한 깊은 수분 공급"
    },
    {
      "name": "Niacinamide",
      "priority": 2,
      "score": 0.85,
      "addresses": ["enlarged_pores", "dullness"],
      "reason_en": "Minimizes pores and brightens skin",
      "reason_ko": "모공 축소 및 피부 톤 개선"
    }
  ]
  */

  recommended_product_ids UUID[],          -- Array of recommended product IDs

  -- ============================================
  -- Technical Metadata
  -- ============================================
  analysis_engine VARCHAR(50) DEFAULT 'openai-vision',
  /*
  Possible values:
  'openai-vision' - GPT-4o Vision (MVP)
  'hautai' - Haut.AI API (Phase 2 upgrade)
  'hybrid' - Combined analysis
  */

  processing_time_ms INTEGER,              -- API response time in milliseconds
  model_version VARCHAR(50),               -- 'gpt-4o-2024-08-06', etc.
  prompt_version VARCHAR(20),              -- 'v1.0', 'v1.1', etc.

  -- ============================================
  -- Client Information
  -- ============================================
  client_info JSONB DEFAULT '{}',
  /*
  Structure:
  {
    "device_type": "mobile",
    "browser": "Safari",
    "os": "iOS 17",
    "screen_size": "390x844",
    "locale": "en-US",
    "referrer": "reddit.com"
  }
  */

  -- ============================================
  -- User Feedback (Phase 2)
  -- ============================================
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  feedback_tags TEXT[],                    -- ['accurate', 'helpful', 'inaccurate']

  -- ============================================
  -- Timestamps
  -- ============================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ============================================
  -- Constraints
  -- ============================================
  CONSTRAINT valid_analysis_engine CHECK (
    analysis_engine IN ('openai-vision', 'hautai', 'hybrid')
  )
);

-- Comments
COMMENT ON TABLE analyses IS 'Stores skin analysis results for tracking and improvement';
COMMENT ON COLUMN analyses.session_id IS 'Anonymous session ID for Phase 1 (no auth)';
COMMENT ON COLUMN analyses.result_data IS 'Complete AI analysis output as JSONB';
COMMENT ON COLUMN analyses.recommended_product_ids IS 'Array of product UUIDs for popularity tracking';
```

### 4.2 Indexes

```sql
-- Session lookup (for anonymous users)
CREATE INDEX idx_analyses_session ON analyses(session_id);

-- User lookup (Phase 2)
CREATE INDEX idx_analyses_user ON analyses(user_id) WHERE user_id IS NOT NULL;

-- Time-based queries
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);

-- JSONB index for result queries
CREATE INDEX idx_analyses_result ON analyses USING GIN (result_data);

-- Composite index for analytics queries
CREATE INDEX idx_analyses_engine_created ON analyses(analysis_engine, created_at DESC);
```

### 4.3 Severity Levels

| Score Range | Severity | Description |
|-------------|----------|-------------|
| 0.00 - 0.25 | `minimal` | Barely noticeable |
| 0.26 - 0.50 | `mild` | Slightly visible |
| 0.51 - 0.75 | `moderate` | Clearly visible |
| 0.76 - 1.00 | `severe` | Prominent concern |

---

## 5. Table: users (Phase 2)

### 5.1 Schema Definition

```sql
-- User accounts (Phase 2 implementation)
-- References Supabase Auth for authentication

CREATE TABLE users (
  -- Primary Key (references Supabase Auth)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ============================================
  -- Profile Information
  -- ============================================
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,

  -- ============================================
  -- Preferences
  -- ============================================
  preferred_language VARCHAR(10) DEFAULT 'en',
  /*
  Possible values: 'en', 'ko', 'ja', 'zh-CN'
  */

  skin_profile JSONB DEFAULT '{}',
  /*
  Structure (Phase 2: user-provided data):
  {
    "skin_type": "combination",
    "concerns": ["acne", "hyperpigmentation"],
    "allergies": ["fragrance"],
    "age_range": "25-30"
  }
  */

  notification_preferences JSONB DEFAULT '{}',
  /*
  Structure:
  {
    "email_marketing": false,
    "product_alerts": true,
    "analysis_reminders": true
  }
  */

  -- ============================================
  -- Subscription (Phase 2+)
  -- ============================================
  subscription_tier VARCHAR(20) DEFAULT 'free',
  /*
  Possible values:
  'free' - Basic features, limited analyses
  'premium' - Unlimited analyses, history, routines
  */

  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),         -- Stripe integration

  -- ============================================
  -- Usage Analytics
  -- ============================================
  total_analyses INTEGER DEFAULT 0,
  last_analysis_at TIMESTAMP WITH TIME ZONE,

  -- ============================================
  -- Timestamps
  -- ============================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ============================================
  -- Constraints
  -- ============================================
  CONSTRAINT valid_subscription_tier CHECK (
    subscription_tier IN ('free', 'premium')
  ),
  CONSTRAINT valid_language CHECK (
    preferred_language IN ('en', 'ko', 'ja', 'zh-CN')
  )
);

-- Comments
COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth (Phase 2)';
COMMENT ON COLUMN users.id IS 'References auth.users(id) from Supabase Auth';
```

### 5.2 Indexes

```sql
-- Email lookup
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Subscription queries
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_subscription_expires ON users(subscription_expires_at)
  WHERE subscription_expires_at IS NOT NULL;
```

---

## 6. Sample Seed Data

### 6.1 Products Seed Data

```sql
-- Seed popular K-Beauty products
INSERT INTO products (
  name, name_ko, name_ja, name_zh,
  brand, category, ingredients,
  price_usd, price_krw, rating, review_count,
  image_url, thumbnail_url, affiliate_links,
  description, popularity_score
) VALUES

-- Product 1: COSRX Snail Mucin
(
  'Advanced Snail 96 Mucin Power Essence',
  '어드밴스드 스네일 96 뮤신 파워 에센스',
  'アドバンスド スネイル 96 ムチン パワー エッセンス',
  '高级蜗牛96粘蛋白精华',
  'COSRX',
  'essence',
  '{
    "primary": ["Snail Secretion Filtrate", "Hyaluronic Acid"],
    "full_list": ["Snail Secretion Filtrate (96.3%)", "Betaine", "Butylene Glycol", "1,2-Hexanediol", "Sodium Hyaluronate", "Panthenol", "Arginine", "Allantoin", "Ethyl Hexanediol", "Sodium Polyacrylate", "Carbomer", "Phenoxyethanol"]
  }',
  15.99, 19000, 4.8, 45230,
  'https://images.cosrx.com/snail-96-full.jpg',
  'https://images.cosrx.com/snail-96-thumb.jpg',
  '{
    "amazon": "https://www.amazon.com/dp/B00PBX3L7K?tag=skinseoul-20",
    "amazon_jp": "https://www.amazon.co.jp/dp/B00PBX3L7K?tag=skinseoul-22",
    "yesstyle": "https://www.yesstyle.com/cosrx-snail-96?rco=SKINSEOUL",
    "coupang": "https://link.coupang.com/re/COSRX-snail"
  }',
  '{
    "en": "This lightweight essence contains 96.3% snail secretion filtrate to deeply hydrate and repair damaged skin. Perfect for all skin types, it helps reduce the appearance of fine lines, acne scars, and hyperpigmentation while improving overall skin texture.",
    "ko": "96.3% 달팽이 점액 여과물이 함유된 가벼운 에센스로 피부 깊숙이 수분을 공급하고 손상된 피부를 복구합니다. 모든 피부 타입에 적합하며, 잔주름, 여드름 자국, 색소침착을 개선하고 전체적인 피부결을 향상시킵니다.",
    "ja": "96.3%のカタツムリムチンを配合した軽いエッセンスで、肌に深く潤いを与え、ダメージを受けた肌を修復します。",
    "zh": "这款轻盈精华含有96.3%的蜗牛黏液滤液，能深层滋润并修复受损肌肤。"
  }',
  1000
),

-- Product 2: Laneige Water Sleeping Mask
(
  'Water Sleeping Mask',
  '워터 슬리핑 마스크',
  'ウォーター スリーピング マスク',
  '水润睡眠面膜',
  'Laneige',
  'mask',
  '{
    "primary": ["Hyaluronic Acid", "Beta-Glucan", "Trehalose"],
    "full_list": ["Water", "Butylene Glycol", "Cyclopentasiloxane", "Glycerin", "Cyclohexasiloxane", "Trehalose", "Sodium Hyaluronate", "Beta-Glucan", "Hydrolyzed Collagen"]
  }',
  32.00, 38000, 4.6, 28450,
  'https://images.laneige.com/water-sleeping-full.jpg',
  'https://images.laneige.com/water-sleeping-thumb.jpg',
  '{
    "amazon": "https://www.amazon.com/dp/B00QFXOYB4?tag=skinseoul-20",
    "yesstyle": "https://www.yesstyle.com/laneige-water-mask?rco=SKINSEOUL"
  }',
  '{
    "en": "An overnight hydrating mask featuring SLEEP-TOX™ and Moisture Wrap™ technology. Purifies and delivers intense hydration while you sleep for a refreshed, dewy complexion in the morning.",
    "ko": "SLEEP-TOX™와 모이스처 랩™ 기술을 탑재한 오버나이트 수분 마스크. 자는 동안 피부를 정화하고 집중 수분을 공급하여 아침에 촉촉하고 생기있는 피부로 가꿔줍니다."
  }',
  850
),

-- Product 3: Beauty of Joseon Glow Serum
(
  'Glow Serum: Propolis + Niacinamide',
  '맑은쌀 프로폴리스 세럼',
  'グロウセラム プロポリス + ナイアシンアミド',
  '发光精华 蜂胶+烟酰胺',
  'Beauty of Joseon',
  'serum',
  '{
    "primary": ["Propolis Extract", "Niacinamide", "Rice Bran Water"],
    "full_list": ["Propolis Extract (60%)", "Oryza Sativa (Rice) Bran Water", "Niacinamide", "Butylene Glycol", "Glycerin", "1,2-Hexanediol", "Honey Extract", "Royal Jelly Extract"]
  }',
  17.00, 20000, 4.7, 18920,
  'https://images.boj.com/glow-serum-full.jpg',
  'https://images.boj.com/glow-serum-thumb.jpg',
  '{
    "amazon": "https://www.amazon.com/dp/B08XQ2M6XL?tag=skinseoul-20",
    "yesstyle": "https://www.yesstyle.com/boj-glow-serum?rco=SKINSEOUL"
  }',
  '{
    "en": "A nourishing serum with 60% propolis extract and 2% niacinamide. Targets dullness and uneven skin tone while providing deep hydration and a healthy glow. Suitable for all skin types.",
    "ko": "60% 프로폴리스 추출물과 2% 나이아신아마이드가 함유된 영양 세럼. 칙칙함과 불균일한 피부톤을 개선하며 깊은 수분 공급과 건강한 광채를 선사합니다."
  }',
  720
),

-- Product 4: COSRX BHA Blackhead Power Liquid
(
  'BHA Blackhead Power Liquid',
  'BHA 블랙헤드 파워 리퀴드',
  'BHA ブラックヘッド パワー リキッド',
  'BHA黑头能量精华',
  'COSRX',
  'exfoliator',
  '{
    "primary": ["Betaine Salicylate", "Willow Bark Water"],
    "full_list": ["Salix Alba (Willow) Bark Water", "Butylene Glycol", "Betaine Salicylate (4%)", "Niacinamide", "1,2-Hexanediol", "Arginine", "Panthenol", "Sodium Hyaluronate"]
  }',
  25.00, 30000, 4.5, 22100,
  'https://images.cosrx.com/bha-blackhead-full.jpg',
  'https://images.cosrx.com/bha-blackhead-thumb.jpg',
  '{
    "amazon": "https://www.amazon.com/dp/B00OZEJ8R8?tag=skinseoul-20"
  }',
  '{
    "en": "A gentle BHA exfoliant with 4% betaine salicylate derived from willow bark. Unclogs pores, reduces blackheads, and controls excess sebum without drying or irritating the skin.",
    "ko": "버드나무 껍질에서 추출한 4% 베타인 살리실레이트가 함유된 순한 BHA 각질제거제. 모공을 청소하고 블랙헤드를 줄이며 피부를 건조하거나 자극하지 않고 과잉 피지를 조절합니다."
  }',
  650
),

-- Product 5: Klairs Supple Preparation Toner
(
  'Supple Preparation Unscented Toner',
  '서플 프레퍼레이션 무향 토너',
  'サプル プレパレーション 無香料 トナー',
  '柔润无香化妆水',
  'Klairs',
  'toner',
  '{
    "primary": ["Hyaluronic Acid", "Centella Asiatica", "Beta-Glucan"],
    "full_list": ["Water", "Butylene Glycol", "Dimethyl Sulfone", "Betaine", "Caprylic/Capric Triglyceride", "Natto Gum", "Sodium Hyaluronate", "Centella Asiatica Extract", "Beta-Glucan"]
  }',
  23.00, 27000, 4.6, 15780,
  'https://images.klairs.com/supple-toner-full.jpg',
  'https://images.klairs.com/supple-toner-thumb.jpg',
  '{
    "amazon": "https://www.amazon.com/dp/B07B5Y8N6H?tag=skinseoul-20",
    "yesstyle": "https://www.yesstyle.com/klairs-toner?rco=SKINSEOUL"
  }',
  '{
    "en": "A fragrance-free, pH-balanced hydrating toner that preps skin for better absorption of subsequent products. Contains soothing centella asiatica and hydrating hyaluronic acid.",
    "ko": "향료가 없고 pH 균형이 맞춰진 수분 토너로 다음 단계 제품의 흡수를 높여줍니다. 진정 효과의 센텔라 아시아티카와 보습 효과의 히알루론산이 함유되어 있습니다."
  }',
  580
);
```

### 6.2 Ingredients Seed Data

```sql
-- Seed ingredient library
INSERT INTO ingredient_library (
  name_en, name_ko, name_ja, name_zh,
  aliases, description,
  benefits, addresses_concerns, best_for_skin_types,
  usage_frequency, usage_time, concentration_range,
  precautions, pairs_well_with, avoid_mixing_with,
  research_level, inci_name, ewg_rating
) VALUES

-- Ingredient 1: Hyaluronic Acid
(
  'Hyaluronic Acid',
  '히알루론산',
  'ヒアルロン酸',
  '透明质酸',
  ARRAY['HA', 'Sodium Hyaluronate', 'Hyaluronan'],
  '{
    "en": "A powerful humectant that can hold up to 1000x its weight in water. Naturally found in skin, it provides deep hydration, plumps fine lines, and improves skin elasticity without clogging pores.",
    "ko": "자체 무게의 1000배까지 수분을 보유할 수 있는 강력한 보습제입니다. 피부에 자연적으로 존재하며, 깊은 수분 공급, 잔주름 개선, 피부 탄력 향상 효과가 있으며 모공을 막지 않습니다.",
    "ja": "水を自重の1000倍まで保持できる強力な保湿成分。肌に自然に存在し、深い保湿、小じわの改善、肌の弾力向上に効果があります。",
    "zh": "一种强效保湿剂，能够保持自身重量1000倍的水分。天然存在于皮肤中，可深层补水、淡化细纹、提升肌肤弹性，且不会堵塞毛孔。"
  }',
  ARRAY['hydration', 'plumping', 'anti-aging', 'barrier-repair'],
  ARRAY['dehydration', 'fine_lines', 'dullness'],
  ARRAY['all'],
  'twice-daily', 'both', '0.1-2%',
  '{
    "en": "Generally safe for all skin types. Apply to damp skin for best results.",
    "ko": "모든 피부 타입에 안전합니다. 최상의 결과를 위해 촉촉한 피부에 바르세요."
  }',
  ARRAY['Vitamin C', 'Niacinamide', 'Peptides', 'Ceramides'],
  ARRAY[],
  'strong',
  'Sodium Hyaluronate',
  1
),

-- Ingredient 2: Niacinamide
(
  'Niacinamide',
  '나이아신아마이드',
  'ナイアシンアミド',
  '烟酰胺',
  ARRAY['Vitamin B3', 'Nicotinamide', 'Niacin'],
  '{
    "en": "A form of Vitamin B3 that brightens skin, strengthens the skin barrier, minimizes pores, and regulates sebum production. Well-tolerated by most skin types and can be used with most other actives.",
    "ko": "피부를 밝게 하고, 피부 장벽을 강화하며, 모공을 최소화하고, 피지 생성을 조절하는 비타민 B3 유도체입니다. 대부분의 피부 타입에서 잘 견디며 대부분의 다른 활성 성분과 함께 사용할 수 있습니다.",
    "ja": "肌を明るくし、バリア機能を強化し、毛穴を目立たなくし、皮脂の分泌を調整するビタミンB3誘導体です。",
    "zh": "一种维生素B3，能够提亮肤色、强化皮肤屏障、缩小毛孔、调节皮脂分泌。适合大多数肤质，可与大多数活性成分搭配使用。"
  }',
  ARRAY['brightening', 'barrier-repair', 'pore-minimizing', 'oil-control'],
  ARRAY['hyperpigmentation', 'enlarged_pores', 'oily_skin', 'dullness', 'acne'],
  ARRAY['all'],
  'twice-daily', 'both', '2-10%',
  '{
    "en": "Start with lower concentrations (2-5%) if you have sensitive skin. High concentrations may cause temporary flushing.",
    "ko": "민감한 피부의 경우 낮은 농도(2-5%)부터 시작하세요. 고농도는 일시적인 홍조를 유발할 수 있습니다."
  }',
  ARRAY['Hyaluronic Acid', 'Salicylic Acid', 'Retinol', 'Vitamin C'],
  ARRAY[],
  'strong',
  'Niacinamide',
  1
),

-- Ingredient 3: Centella Asiatica
(
  'Centella Asiatica',
  '센텔라 아시아티카',
  'ツボクサエキス',
  '积雪草',
  ARRAY['Cica', 'Tiger Grass', 'Gotu Kola', 'Madecassoside'],
  '{
    "en": "Also known as Cica or Tiger Grass, this traditional Asian herb soothes irritated skin, reduces redness, and promotes wound healing. Rich in madecassoside, asiaticoside, and other calming compounds.",
    "ko": "시카 또는 병풀이라고도 알려진 아시아 전통 허브로, 자극받은 피부를 진정시키고, 붉은기를 줄이며, 상처 치유를 촉진합니다. 마데카소사이드, 아시아티코사이드 및 기타 진정 성분이 풍부합니다.",
    "ja": "シカやタイガーグラスとも呼ばれるアジアの伝統的なハーブで、刺激を受けた肌を落ち着かせ、赤みを軽減し、傷の治癒を促進します。",
    "zh": "又称积雪草或老虎草，这种亚洲传统草药能舒缓受刺激的皮肤、减少红肿、促进伤口愈合。富含积雪草苷、羟基积雪草苷等镇静成分。"
  }',
  ARRAY['soothing', 'barrier-repair', 'anti-aging', 'acne-fighting'],
  ARRAY['redness', 'sensitivity', 'acne', 'blemishes'],
  ARRAY['all', 'sensitive'],
  'twice-daily', 'both', '0.1-5%',
  '{
    "en": "Very gentle and suitable for sensitive skin. Rare allergic reactions may occur.",
    "ko": "매우 순하며 민감한 피부에 적합합니다. 드물게 알레르기 반응이 있을 수 있습니다."
  }',
  ARRAY['Hyaluronic Acid', 'Niacinamide', 'Green Tea', 'Snail Mucin'],
  ARRAY[],
  'strong',
  'Centella Asiatica Extract',
  1
),

-- Ingredient 4: Retinol
(
  'Retinol',
  '레티놀',
  'レチノール',
  '视黄醇',
  ARRAY['Vitamin A', 'Retinoid', 'Retinyl Palmitate'],
  '{
    "en": "A gold-standard anti-aging ingredient derived from Vitamin A. Accelerates cell turnover, stimulates collagen production, reduces fine lines, and improves skin texture. Requires gradual introduction to avoid irritation.",
    "ko": "비타민 A에서 유래한 황금 표준 안티에이징 성분. 세포 재생을 촉진하고, 콜라겐 생성을 자극하며, 잔주름을 줄이고, 피부 결을 개선합니다. 자극을 피하기 위해 점진적인 도입이 필요합니다.",
    "ja": "ビタミンA由来のゴールドスタンダードのアンチエイジング成分。細胞のターンオーバーを促進し、コラーゲン生成を刺激し、小じわを減らし、肌のテクスチャを改善します。",
    "zh": "一种源自维生素A的黄金标准抗衰老成分。加速细胞更新、刺激胶原蛋白生成、减少细纹、改善肤质。需要逐步引入以避免刺激。"
  }',
  ARRAY['anti-aging', 'firming', 'brightening', 'exfoliating'],
  ARRAY['fine_lines', 'wrinkles', 'hyperpigmentation', 'uneven_texture', 'acne'],
  ARRAY['normal', 'oily', 'combination'],
  'daily', 'pm', '0.01-1%',
  '{
    "en": "Start slowly (2-3x/week). Always use sunscreen the next day. Avoid if pregnant or breastfeeding. May cause initial purging, dryness, or peeling.",
    "ko": "천천히 시작하세요(주 2-3회). 다음 날 항상 자외선 차단제를 사용하세요. 임신 중이거나 수유 중인 경우 피하세요. 초기 퍼징, 건조함, 또는 각질이 발생할 수 있습니다."
  }',
  ARRAY['Hyaluronic Acid', 'Peptides', 'Ceramides'],
  ARRAY['Vitamin C', 'AHA', 'BHA', 'Benzoyl Peroxide'],
  'strong',
  'Retinol',
  4
),

-- Ingredient 5: Vitamin C
(
  'Vitamin C',
  '비타민 C',
  'ビタミンC',
  '维生素C',
  ARRAY['L-Ascorbic Acid', 'Ascorbyl Glucoside', 'Ethyl Ascorbic Acid', 'Sodium Ascorbyl Phosphate'],
  '{
    "en": "A potent antioxidant that brightens skin, fades dark spots, boosts collagen production, and protects against environmental damage. L-Ascorbic Acid is the most effective but least stable form.",
    "ko": "피부를 밝게 하고, 다크 스팟을 개선하며, 콜라겐 생성을 촉진하고, 환경 손상으로부터 보호하는 강력한 항산화제입니다. L-아스코르브산이 가장 효과적이지만 안정성이 가장 낮습니다.",
    "ja": "肌を明るくし、シミを薄くし、コラーゲンの生成を促進し、環境ダメージから保護する強力な抗酸化成分です。",
    "zh": "一种强效抗氧化剂，能提亮肤色、淡化色斑、促进胶原蛋白生成、保护皮肤免受环境损害。L-抗坏血酸是最有效但最不稳定的形式。"
  }',
  ARRAY['brightening', 'antioxidant', 'anti-aging', 'firming'],
  ARRAY['hyperpigmentation', 'dullness', 'fine_lines', 'uneven_texture'],
  ARRAY['all'],
  'daily', 'am', '10-20%',
  '{
    "en": "Apply in the morning before sunscreen for best protection. Store in dark, cool place. May tingle on sensitive skin.",
    "ko": "최상의 보호를 위해 아침에 자외선 차단제 전에 바르세요. 어둡고 서늘한 곳에 보관하세요. 민감한 피부에서 따끔거림이 있을 수 있습니다."
  }',
  ARRAY['Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid', 'Niacinamide'],
  ARRAY['Retinol', 'Benzoyl Peroxide'],
  'strong',
  'Ascorbic Acid',
  1
),

-- Ingredient 6: Salicylic Acid (BHA)
(
  'Salicylic Acid',
  '살리실산',
  'サリチル酸',
  '水杨酸',
  ARRAY['BHA', 'Beta Hydroxy Acid', 'Betaine Salicylate'],
  '{
    "en": "An oil-soluble exfoliant that penetrates deep into pores to dissolve sebum, unclog pores, and reduce blackheads. Also has anti-inflammatory properties that help calm acne-prone skin.",
    "ko": "모공 깊숙이 침투하여 피지를 용해하고, 모공을 정화하며, 블랙헤드를 줄이는 지용성 각질 제거제입니다. 여드름 피부를 진정시키는 항염 특성도 있습니다.",
    "ja": "毛穴の奥深くまで浸透して皮脂を溶かし、毛穴の詰まりを解消し、黒ずみを減らす油溶性の角質除去成分です。",
    "zh": "一种油溶性去角质成分，能深入毛孔溶解皮脂、疏通毛孔、减少黑头。还具有抗炎特性，有助于镇静痘痘肌。"
  }',
  ARRAY['exfoliating', 'pore-minimizing', 'acne-fighting', 'oil-control'],
  ARRAY['acne', 'enlarged_pores', 'oily_skin', 'blemishes'],
  ARRAY['oily', 'combination', 'acne-prone'],
  'daily', 'pm', '0.5-2%',
  '{
    "en": "Start with 0.5% and gradually increase. May cause dryness or peeling. Use sunscreen daily. Avoid if allergic to aspirin.",
    "ko": "0.5%부터 시작하여 점진적으로 농도를 높이세요. 건조함이나 각질이 발생할 수 있습니다. 매일 자외선 차단제를 사용하세요. 아스피린 알레르기가 있으면 피하세요."
  }',
  ARRAY['Niacinamide', 'Hyaluronic Acid', 'Green Tea'],
  ARRAY['Retinol', 'Vitamin C', 'AHA'],
  'strong',
  'Salicylic Acid',
  3
);
```

---

## 7. Row Level Security (RLS) Policies

### 7.1 Enable RLS

```sql
-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;  -- Phase 2
```

### 7.2 Products Policies

```sql
-- Products are publicly readable (only active products)
CREATE POLICY "products_select_active"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Only service role can insert/update/delete products
CREATE POLICY "products_admin_insert"
  ON products
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "products_admin_update"
  ON products
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_admin_delete"
  ON products
  FOR DELETE
  TO service_role
  USING (true);
```

### 7.3 Ingredient Library Policies

```sql
-- Ingredients are publicly readable
CREATE POLICY "ingredients_select_all"
  ON ingredient_library
  FOR SELECT
  USING (true);

-- Only service role can modify ingredients
CREATE POLICY "ingredients_admin_all"
  ON ingredient_library
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 7.4 Analyses Policies

```sql
-- Anyone can insert an analysis (no auth required in Phase 1)
CREATE POLICY "analyses_insert_anon"
  ON analyses
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own analyses (by session_id or user_id)
CREATE POLICY "analyses_select_own"
  ON analyses
  FOR SELECT
  USING (
    session_id IS NOT NULL
    OR auth.uid() = user_id
  );

-- Service role can view all analyses (for analytics)
CREATE POLICY "analyses_admin_select"
  ON analyses
  FOR SELECT
  TO service_role
  USING (true);

-- Phase 2: Users can update their own analyses (add feedback)
CREATE POLICY "analyses_update_own"
  ON analyses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 7.5 Users Policies (Phase 2)

```sql
-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users are created via trigger (see functions)
CREATE POLICY "users_insert_trigger"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## 8. Database Functions & Triggers

### 8.1 Auto-Update Timestamp

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to products table
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to users table (Phase 2)
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 8.2 Increment Popularity Score

```sql
-- Function to increment product popularity when recommended
CREATE OR REPLACE FUNCTION increment_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment popularity_score for all recommended products
  IF NEW.recommended_product_ids IS NOT NULL THEN
    UPDATE products
    SET popularity_score = popularity_score + 1
    WHERE id = ANY(NEW.recommended_product_ids);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger after analysis insert
CREATE TRIGGER trigger_increment_popularity
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_popularity();
```

### 8.3 Create User Profile on Auth Signup (Phase 2)

```sql
-- Function to create user profile when auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 8.4 Update User Analysis Count (Phase 2)

```sql
-- Function to update user's analysis count
CREATE OR REPLACE FUNCTION update_user_analysis_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE users
    SET
      total_analyses = total_analyses + 1,
      last_analysis_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger after analysis insert
CREATE TRIGGER trigger_update_user_analysis
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analysis_count();
```

### 8.5 Search Function for Products

```sql
-- Function to search products by ingredient
CREATE OR REPLACE FUNCTION search_products_by_ingredient(
  ingredient_name TEXT,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products p
  WHERE
    p.is_active = true
    AND (
      p.ingredients->'primary' ? ingredient_name
      OR p.ingredients->'full_list' ? ingredient_name
    )
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY p.popularity_score DESC, p.rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM search_products_by_ingredient('Hyaluronic Acid', 'serum', 10);
```

### 8.6 Get Ingredient Recommendations

```sql
-- Function to get recommended ingredients for concerns
CREATE OR REPLACE FUNCTION get_ingredients_for_concerns(
  concern_list TEXT[]
)
RETURNS TABLE (
  ingredient_name VARCHAR,
  priority INTEGER,
  matched_concerns TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    il.name_en,
    ROW_NUMBER() OVER (ORDER BY
      array_length(
        ARRAY(SELECT unnest(il.addresses_concerns) INTERSECT SELECT unnest(concern_list)),
        1
      ) DESC
    )::INTEGER AS priority,
    ARRAY(SELECT unnest(il.addresses_concerns) INTERSECT SELECT unnest(concern_list))
  FROM ingredient_library il
  WHERE il.addresses_concerns && concern_list
  ORDER BY priority
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM get_ingredients_for_concerns(ARRAY['dehydration', 'hyperpigmentation']);
```

---

## 9. Views

### 9.1 Popular Products View

```sql
-- View: Top products by recommendation count
CREATE OR REPLACE VIEW popular_products AS
SELECT
  p.id,
  p.name,
  p.brand,
  p.category,
  p.rating,
  p.price_usd,
  p.image_url,
  p.popularity_score,
  COALESCE(rec.recommendation_count, 0) AS recommendation_count
FROM products p
LEFT JOIN (
  SELECT
    unnest(recommended_product_ids) AS product_id,
    COUNT(*) AS recommendation_count
  FROM analyses
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY product_id
) rec ON p.id = rec.product_id
WHERE p.is_active = true
ORDER BY recommendation_count DESC, p.popularity_score DESC, p.rating DESC
LIMIT 100;

-- Usage: SELECT * FROM popular_products WHERE category = 'serum';
```

### 9.2 Trending Ingredients View

```sql
-- View: Top recommended ingredients (last 30 days)
CREATE OR REPLACE VIEW trending_ingredients AS
SELECT
  ingredient_data->>'name' AS ingredient_name,
  COUNT(*) AS recommendation_count,
  ROUND(AVG((ingredient_data->>'score')::NUMERIC), 2) AS avg_score,
  ROUND(AVG((ingredient_data->>'priority')::NUMERIC), 1) AS avg_priority
FROM analyses,
LATERAL jsonb_array_elements(recommended_ingredients) AS ingredient_data
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY ingredient_data->>'name'
ORDER BY recommendation_count DESC
LIMIT 20;

-- Usage: SELECT * FROM trending_ingredients;
```

### 9.3 Daily Analytics View

```sql
-- View: Daily analysis statistics
CREATE OR REPLACE VIEW daily_analytics AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_analyses,
  COUNT(DISTINCT session_id) AS unique_sessions,
  ROUND(AVG(processing_time_ms)) AS avg_processing_ms,
  ROUND(AVG((result_data->>'overall_score')::NUMERIC), 1) AS avg_skin_score,
  COUNT(CASE WHEN user_rating IS NOT NULL THEN 1 END) AS feedback_count,
  ROUND(AVG(user_rating), 2) AS avg_user_rating
FROM analyses
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Usage: SELECT * FROM daily_analytics LIMIT 30;
```

### 9.4 Concern Distribution View

```sql
-- View: Distribution of detected skin concerns
CREATE OR REPLACE VIEW concern_distribution AS
SELECT
  concern->>'type' AS concern_type,
  COUNT(*) AS occurrence_count,
  ROUND(AVG((concern->>'score')::NUMERIC), 2) AS avg_severity,
  ROUND(
    COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM analyses WHERE created_at > NOW() - INTERVAL '30 days') * 100,
    1
  ) AS percentage
FROM analyses,
LATERAL jsonb_array_elements(result_data->'concerns') AS concern
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY concern->>'type'
ORDER BY occurrence_count DESC;

-- Usage: SELECT * FROM concern_distribution;
```

---

## 10. Migration Scripts

### 10.1 Migration: 001_initial_schema.sql

```sql
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for SkinSEOUL
-- Date: 2026-02-06

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255),
  name_ja VARCHAR(255),
  name_zh VARCHAR(255),
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '{}',
  price_usd DECIMAL(10,2),
  price_krw INTEGER,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  affiliate_links JSONB DEFAULT '{}',
  description JSONB DEFAULT '{}',
  popularity_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (
    category IN ('cleanser', 'toner', 'serum', 'essence', 'ampoule',
                 'moisturizer', 'cream', 'sunscreen', 'mask', 'exfoliator')
  )
);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN (ingredients);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

-- ============================================
-- Table: ingredient_library
-- ============================================
CREATE TABLE IF NOT EXISTS ingredient_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(100) NOT NULL UNIQUE,
  name_ko VARCHAR(100),
  name_ja VARCHAR(100),
  name_zh VARCHAR(100),
  aliases TEXT[],
  description JSONB NOT NULL DEFAULT '{}',
  benefits TEXT[],
  addresses_concerns TEXT[],
  best_for_skin_types TEXT[],
  usage_frequency VARCHAR(50),
  usage_time VARCHAR(20),
  concentration_range VARCHAR(50),
  precautions JSONB DEFAULT '{}',
  pairs_well_with TEXT[],
  avoid_mixing_with TEXT[],
  research_level VARCHAR(20),
  inci_name VARCHAR(200),
  ewg_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredient indexes
CREATE INDEX IF NOT EXISTS idx_ingredient_name ON ingredient_library(name_en);
CREATE INDEX IF NOT EXISTS idx_ingredient_concerns ON ingredient_library USING GIN (addresses_concerns);
CREATE INDEX IF NOT EXISTS idx_ingredient_benefits ON ingredient_library USING GIN (benefits);

-- ============================================
-- Table: analyses
-- ============================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  user_id UUID,
  result_data JSONB NOT NULL DEFAULT '{}',
  recommended_ingredients JSONB DEFAULT '[]',
  recommended_product_ids UUID[],
  analysis_engine VARCHAR(50) DEFAULT 'openai-vision',
  processing_time_ms INTEGER,
  model_version VARCHAR(50),
  prompt_version VARCHAR(20),
  client_info JSONB DEFAULT '{}',
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  feedback_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses indexes
CREATE INDEX IF NOT EXISTS idx_analyses_session ON analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_result ON analyses USING GIN (result_data);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================
-- Products policies
CREATE POLICY "products_select_active" ON products FOR SELECT USING (is_active = true);

-- Ingredients policies
CREATE POLICY "ingredients_select_all" ON ingredient_library FOR SELECT USING (true);

-- Analyses policies
CREATE POLICY "analyses_insert_anon" ON analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "analyses_select_own" ON analyses FOR SELECT
  USING (session_id IS NOT NULL OR auth.uid() = user_id);

-- ============================================
-- Functions & Triggers
-- ============================================
-- Updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Popularity increment function
CREATE OR REPLACE FUNCTION increment_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recommended_product_ids IS NOT NULL THEN
    UPDATE products
    SET popularity_score = popularity_score + 1
    WHERE id = ANY(NEW.recommended_product_ids);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_popularity
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_popularity();
```

### 10.2 Migration: 002_seed_products.sql

See Section 6.1 for complete product seed data.

### 10.3 Migration: 003_seed_ingredients.sql

See Section 6.2 for complete ingredient seed data.

### 10.4 Migration: 004_users_phase2.sql

```sql
-- Migration: 004_users_phase2.sql
-- Description: Add users table for Phase 2
-- Date: TBD (Phase 2)

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  skin_profile JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),
  total_analyses INTEGER DEFAULT 0,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_trigger" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Add foreign key to analyses
ALTER TABLE analyses
  ADD CONSTRAINT fk_analyses_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update user analysis count trigger
CREATE OR REPLACE FUNCTION update_user_analysis_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE users
    SET total_analyses = total_analyses + 1, last_analysis_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_analysis
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analysis_count();
```

---

## 11. Backup & Maintenance

### 11.1 Supabase Automatic Backups

| Plan | Backup Frequency | Retention | Point-in-Time Recovery |
|------|------------------|-----------|------------------------|
| Free | Daily | 7 days | No |
| Pro | Daily | 7 days | Yes (7 days) |
| Team | Daily | 14 days | Yes (14 days) |

### 11.2 Manual Backup Commands

```bash
# Export entire database
pg_dump -h db.[project-ref].supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Export specific tables
pg_dump -h db.[project-ref].supabase.co -U postgres -d postgres \
  -t products -t ingredient_library > products_backup.sql

# Using Supabase CLI
supabase db dump -f backup.sql
supabase db dump --data-only -f data_backup.sql
```

### 11.3 Scheduled Maintenance Tasks

#### Weekly: Update Popularity Scores

```sql
-- Reset and recalculate popularity based on recent recommendations
UPDATE products
SET popularity_score = COALESCE(
  (SELECT COUNT(*)
   FROM analyses
   WHERE products.id = ANY(recommended_product_ids)
   AND created_at > NOW() - INTERVAL '30 days'),
  0
);
```

#### Monthly: Archive Old Anonymous Analyses

```sql
-- Create archive table (one-time)
CREATE TABLE IF NOT EXISTS analyses_archive (
  LIKE analyses INCLUDING ALL
);

-- Archive analyses older than 90 days without user_id
INSERT INTO analyses_archive
SELECT * FROM analyses
WHERE created_at < NOW() - INTERVAL '90 days'
  AND user_id IS NULL;

-- Delete archived records from main table
DELETE FROM analyses
WHERE created_at < NOW() - INTERVAL '90 days'
  AND user_id IS NULL;
```

#### Monthly: Vacuum and Analyze

```sql
-- Optimize table storage and update statistics
VACUUM ANALYZE products;
VACUUM ANALYZE ingredient_library;
VACUUM ANALYZE analyses;
```

### 11.4 Monitoring Queries

```sql
-- Table sizes
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Row counts
SELECT
  'products' AS table_name, COUNT(*) AS row_count FROM products
UNION ALL SELECT 'ingredient_library', COUNT(*) FROM ingredient_library
UNION ALL SELECT 'analyses', COUNT(*) FROM analyses;

-- Index usage
SELECT
  indexrelname AS index_name,
  relname AS table_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 12. Performance Estimates

### 12.1 Growth Projections

| Table | Month 1 | Month 3 | Month 6 | Year 1 |
|-------|---------|---------|---------|--------|
| `products` | 50 | 100 | 200 | 500 |
| `ingredient_library` | 30 | 40 | 60 | 80 |
| `analyses` | 1,000 | 5,000 | 20,000 | 50,000 |
| `users` (Phase 2) | - | 500 | 2,000 | 10,000 |

### 12.2 Storage Estimates

| Table | Avg Row Size | Month 1 | Year 1 |
|-------|--------------|---------|--------|
| `products` | 2 KB | 100 KB | 1 MB |
| `ingredient_library` | 1.5 KB | 45 KB | 120 KB |
| `analyses` | 1 KB | 1 MB | 50 MB |
| `users` | 0.5 KB | - | 5 MB |
| **Total** | - | **~2 MB** | **~60 MB** |

### 12.3 Query Performance Targets

| Query | Expected Time | Index Used |
|-------|---------------|------------|
| Get product by ID | < 5ms | Primary key |
| Search products by ingredient | < 50ms | GIN (ingredients) |
| List products by category | < 20ms | idx_products_category |
| Get trending ingredients | < 100ms | idx_analyses_created |
| Insert analysis | < 30ms | N/A |

### 12.4 Supabase Free Tier Limits

| Resource | Limit | Est. Usage (Month 1) | % Used |
|----------|-------|---------------------|--------|
| Database size | 500 MB | 2 MB | 0.4% |
| API requests | 500K/month | 10K | 2% |
| Bandwidth | 2 GB | 100 MB | 5% |
| Edge Functions | 500K/month | 0 | 0% |

**Conclusion:** Free tier sufficient for MVP and early growth.

---

## 13. TypeScript Types

### 13.1 Database Types

```typescript
// types/database.ts

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
  usage_frequency: UsageFrequency | null;
  usage_time: UsageTime | null;
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
export type UsageFrequency = 'daily' | 'twice-daily' | 'weekly' | 'as_needed';
export type UsageTime = 'am' | 'pm' | 'both';
export type ResearchLevel = 'strong' | 'moderate' | 'limited' | 'traditional';

export interface Analysis {
  id: string;
  session_id: string | null;
  user_id: string | null;
  result_data: AnalysisResult;
  recommended_ingredients: RecommendedIngredient[];
  recommended_product_ids: string[] | null;
  analysis_engine: AnalysisEngine;
  processing_time_ms: number | null;
  model_version: string | null;
  prompt_version: string | null;
  client_info: ClientInfo | null;
  user_rating: number | null;
  user_feedback: string | null;
  feedback_tags: string[] | null;
  created_at: string;
}

export type AnalysisEngine = 'openai-vision' | 'hautai' | 'hybrid';

export interface AnalysisResult {
  skin_type: SkinType;
  concerns: DetectedConcern[];
  overall_score: number;
  estimated_age_range?: string;
  photo_quality?: 'good' | 'fair' | 'poor';
  lighting_conditions?: string;
}

export interface DetectedConcern {
  type: SkinConcernType;
  score: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  location: string[];
  confidence: number;
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

// Phase 2
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'ko' | 'ja' | 'zh-CN';
  skin_profile: UserSkinProfile | null;
  notification_preferences: NotificationPreferences | null;
  subscription_tier: 'free' | 'premium';
  subscription_expires_at: string | null;
  total_analyses: number;
  last_analysis_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSkinProfile {
  skin_type?: SkinType;
  concerns?: SkinConcernType[];
  allergies?: string[];
  age_range?: string;
}

export interface NotificationPreferences {
  email_marketing?: boolean;
  product_alerts?: boolean;
  analysis_reminders?: boolean;
}
```

### 13.2 Supabase Generated Types

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id [project-ref] > types/supabase.ts
```

---

## 14. Query Examples

### 14.1 Product Queries

```typescript
// lib/queries/products.ts
import { supabase } from '@/lib/supabase';

// Get products by ingredient
export async function getProductsByIngredient(
  ingredient: string,
  category?: string,
  limit = 20
) {
  let query = supabase
    .from('products')
    .select('*')
    .contains('ingredients->primary', [ingredient])
    .eq('is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
}

// Get top products by category
export async function getTopProductsByCategory(
  category: string,
  limit = 10
) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);

  return { data, error };
}

// Search products
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(20);

  return { data, error };
}
```

### 14.2 Ingredient Queries

```typescript
// lib/queries/ingredients.ts
import { supabase } from '@/lib/supabase';

// Get ingredients for skin concerns
export async function getIngredientsForConcerns(
  concerns: string[]
) {
  const { data, error } = await supabase
    .from('ingredient_library')
    .select('*')
    .overlaps('addresses_concerns', concerns)
    .order('research_level');

  return { data, error };
}

// Get ingredient by name
export async function getIngredientByName(name: string) {
  const { data, error } = await supabase
    .from('ingredient_library')
    .select('*')
    .eq('name_en', name)
    .single();

  return { data, error };
}
```

### 14.3 Analysis Queries

```typescript
// lib/queries/analyses.ts
import { supabase } from '@/lib/supabase';

// Save analysis result
export async function saveAnalysis(
  sessionId: string,
  resultData: object,
  recommendedIngredients: object[],
  recommendedProductIds: string[],
  processingTimeMs: number
) {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      session_id: sessionId,
      result_data: resultData,
      recommended_ingredients: recommendedIngredients,
      recommended_product_ids: recommendedProductIds,
      processing_time_ms: processingTimeMs,
      analysis_engine: 'openai-vision',
    })
    .select()
    .single();

  return { data, error };
}

// Get analysis by ID
export async function getAnalysisById(id: string) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// Get user analyses (Phase 2)
export async function getUserAnalyses(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}
```

---

## Appendix

### A. SQL Quick Reference

```sql
-- Check if ingredient exists in product
SELECT * FROM products
WHERE ingredients->'primary' ? 'Niacinamide';

-- Query JSONB array
SELECT * FROM products
WHERE ingredients @> '{"primary": ["Hyaluronic Acid"]}';

-- Get distinct categories
SELECT DISTINCT category FROM products WHERE is_active = true;

-- Count analyses per day
SELECT DATE(created_at), COUNT(*)
FROM analyses
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

### B. Related Documentation

| Document | Path |
|----------|------|
| Product Requirements | `/docs/PRD.md` |
| Tech Stack | `/docs/TECH_STACK.md` |
| API Specification | `/docs/API_SPECIFICATION.md` |
| UI Wireframes | `/docs/UI_WIREFRAMES.md` |

---

**Document Status:** ✅ Approved for Development
**Next Review:** Post-MVP Launch
