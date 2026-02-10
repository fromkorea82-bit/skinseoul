# API Specification Document

## SkinSEOUL - REST API Documentation

**Version:** 1.0
**Last Updated:** February 2026
**Base URL:** `https://skinseoul.vercel.app/api`
**Environment:** Production

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Standard Response Format](#3-standard-response-format)
4. [Error Handling](#4-error-handling)
5. [Rate Limiting](#5-rate-limiting)
6. [Endpoints](#6-endpoints)
   - [POST /api/analyze-skin](#61-post-apianalyze-skin)
   - [GET /api/products](#62-get-apiproducts)
   - [GET /api/products/:id](#63-get-apiproductsid)
   - [GET /api/ingredients](#64-get-apiingredients)
   - [GET /api/ingredients/:name](#65-get-apiingredientsname)
   - [POST /api/track-event](#66-post-apitrack-event)
7. [Validation Schemas](#7-validation-schemas)
8. [TypeScript SDK](#8-typescript-sdk)
9. [cURL Examples](#9-curl-examples)
10. [Webhooks (Phase 2)](#10-webhooks-phase-2)
11. [Changelog](#11-changelog)

---

## 1. API Overview

### 1.1 Base Information

| Property | Value |
|----------|-------|
| **Base URL** | `https://skinseoul.vercel.app/api` |
| **Protocol** | HTTPS only |
| **Response Format** | JSON (`application/json`) |
| **Character Encoding** | UTF-8 |
| **API Version** | 1.0 |
| **Rate Limit** | 10 requests/minute per IP |

### 1.2 Environment URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://skinseoul.vercel.app/api` |
| Preview | `https://skinseoul-*.vercel.app/api` |
| Local | `http://localhost:3000/api` |

### 1.3 Supported Languages

| Code | Language | Description |
|------|----------|-------------|
| `en` | English | Default language |
| `ja` | Japanese | 日本語 |
| `zh-CN` | Chinese (Simplified) | 简体中文 |

### 1.4 Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST) | `application/json` |
| `Accept` | No | `application/json` (default) |
| `Accept-Language` | No | Preferred language (`en`, `ja`, `zh-CN`) |
| `X-Session-ID` | No | Anonymous session tracking |
| `Authorization` | Phase 2 | `Bearer <token>` |

---

## 2. Authentication

### 2.1 Phase 1 (MVP)

**No authentication required.** All endpoints are publicly accessible.

Anonymous session tracking is done via `X-Session-ID` header or `session_id` in request body.

```typescript
// Generate session ID on client
const sessionId = crypto.randomUUID();

fetch('/api/analyze-skin', {
  headers: {
    'X-Session-ID': sessionId
  }
});
```

### 2.2 Phase 2 (User Accounts)

JWT-based authentication via Supabase Auth.

```typescript
// Get token from Supabase Auth
const { data: { session } } = await supabase.auth.getSession();

fetch('/api/user/analyses', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiry:** 1 hour (auto-refresh via Supabase client)

---

## 3. Standard Response Format

### 3.1 Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;      // ISO 8601 format
    version: string;        // API version
    request_id?: string;    // For debugging
    processing_time_ms?: number;
  };
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "products": [...]
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0",
    "request_id": "req_abc123xyz",
    "processing_time_ms": 45
  }
}
```

### 3.2 Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: object;       // Additional error context
    field?: string;         // For validation errors
  };
  meta: {
    timestamp: string;
    version: string;
    request_id?: string;
  };
}
```

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Image file exceeds maximum size limit",
    "details": {
      "max_size_bytes": 10485760,
      "received_size_bytes": 15234567
    }
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0",
    "request_id": "req_xyz789abc"
  }
}
```

### 3.3 Pagination Format

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      total: number;        // Total items matching query
      limit: number;        // Items per page
      offset: number;       // Current offset
      has_more: boolean;    // More items available
      next_offset?: number; // Next page offset (if has_more)
    };
  };
  meta: {...};
}
```

---

## 4. Error Handling

### 4.1 Error Codes Reference

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|------------|
| `INVALID_REQUEST` | 400 | Malformed request body | Check JSON syntax |
| `INVALID_IMAGE` | 400 | Image validation failed | Use JPEG/PNG, max 10MB |
| `INVALID_IMAGE_FORMAT` | 400 | Unsupported image format | Convert to JPEG or PNG |
| `IMAGE_TOO_LARGE` | 400 | Image exceeds size limit | Compress to under 10MB |
| `POOR_IMAGE_QUALITY` | 400 | Image quality insufficient | Use clearer photo |
| `NO_FACE_DETECTED` | 400 | No face found in image | Ensure face is visible |
| `MISSING_PARAMETER` | 400 | Required parameter missing | Include required fields |
| `INVALID_PARAMETER` | 400 | Parameter validation failed | Check parameter format |
| `UNAUTHORIZED` | 401 | Authentication required | Provide valid token (P2) |
| `FORBIDDEN` | 403 | Access denied | Check permissions |
| `NOT_FOUND` | 404 | Resource not found | Verify ID/path |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying |
| `INTERNAL_ERROR` | 500 | Server error | Contact support |
| `AI_SERVICE_ERROR` | 503 | OpenAI API unavailable | Retry after delay |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down | Retry later |

### 4.2 Validation Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "image",
          "message": "Image is required",
          "code": "required"
        },
        {
          "field": "language",
          "message": "Invalid language code",
          "code": "invalid_enum",
          "allowed": ["en", "ja", "zh-CN"]
        }
      ]
    }
  }
}
```

### 4.3 Retry Strategy

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry server errors (5xx) and rate limits
      if (response.status >= 500 || response.status === 429) {
        if (attempt === maxRetries) return response;

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## 5. Rate Limiting

### 5.1 Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/analyze-skin` | 10 requests | 1 minute |
| `/api/products` | 60 requests | 1 minute |
| `/api/ingredients` | 60 requests | 1 minute |
| `/api/track-event` | 100 requests | 1 minute |
| **Global** | 100 requests | 1 minute |

### 5.2 Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1707220800
Retry-After: 45
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Remaining requests in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `Retry-After` | Seconds to wait (on 429 response) |

### 5.3 Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 10,
      "window_seconds": 60,
      "retry_after_seconds": 45
    }
  }
}
```

---

## 6. Endpoints

### 6.1 POST /api/analyze-skin

Analyze a facial photo for skin concerns and get ingredient recommendations.

#### Request

```http
POST /api/analyze-skin HTTP/1.1
Host: skinseoul.vercel.app
Content-Type: application/json
X-Session-ID: session_abc123
```

```typescript
interface AnalyzeSkinRequest {
  image: string;          // Base64 encoded image (required)
  language?: string;      // Response language: 'en' | 'ja' | 'zh-CN'
  include_products?: boolean;  // Include product recommendations (default: false)
}
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "language": "en",
  "include_products": true
}
```

**Image Requirements:**
| Property | Requirement |
|----------|-------------|
| Format | JPEG or PNG |
| Max Size | 10 MB (10,485,760 bytes) |
| Min Resolution | 480 × 480 pixels |
| Max Resolution | 4096 × 4096 pixels |
| Content | Clear frontal face photo |
| Lighting | Even lighting recommended |

#### Response

```typescript
interface AnalyzeSkinResponse {
  analysis_id: string;
  skin_type: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  overall_score: number;      // 0-100 skin health score
  confidence_score: number;   // 0-1 AI confidence
  concerns: SkinConcern[];
  recommendations: {
    ingredients: IngredientRecommendation[];
    products?: ProductRecommendation[];  // If include_products=true
  };
  processing_time_ms: number;
}

interface SkinConcern {
  type: string;               // Concern identifier
  score: number;              // 0-1 severity score
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  location: string[];         // Face areas affected
  confidence: number;         // 0-1 detection confidence
  title: string;              // Localized title
  description: string;        // Localized description
}

interface IngredientRecommendation {
  name: string;
  name_localized?: string;
  priority: number;           // 1 = highest priority
  score: number;              // Relevance score 0-1
  why_you_need_it: string;    // Localized explanation
  concerns_addressed: string[];
  usage_tip?: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: string;
  match_score: number;        // How well it matches concerns
  key_ingredients: string[];
  price_usd: number;
  affiliate_url: string;
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysis_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "skin_type": "combination",
    "overall_score": 72,
    "confidence_score": 0.87,
    "concerns": [
      {
        "type": "dehydration",
        "score": 0.75,
        "severity": "moderate",
        "location": ["cheeks", "forehead"],
        "confidence": 0.89,
        "title": "Dehydration",
        "description": "Your skin shows signs of dehydration, particularly in the cheek and forehead areas. This can lead to tightness, flakiness, and premature fine lines."
      },
      {
        "type": "enlarged_pores",
        "score": 0.45,
        "severity": "mild",
        "location": ["nose", "chin"],
        "confidence": 0.92,
        "title": "Enlarged Pores",
        "description": "Mild pore visibility detected in the T-zone. This is common for combination skin types and can be improved with proper care."
      },
      {
        "type": "hyperpigmentation",
        "score": 0.35,
        "severity": "mild",
        "location": ["cheeks"],
        "confidence": 0.78,
        "title": "Uneven Skin Tone",
        "description": "Some areas show slight uneven pigmentation. Sun protection and brightening ingredients can help."
      }
    ],
    "recommendations": {
      "ingredients": [
        {
          "name": "Hyaluronic Acid",
          "name_localized": "Hyaluronic Acid",
          "priority": 1,
          "score": 0.95,
          "why_you_need_it": "Deeply hydrates your dehydrated skin by attracting and retaining moisture. Can hold up to 1000x its weight in water.",
          "concerns_addressed": ["dehydration"],
          "usage_tip": "Apply to damp skin for maximum absorption"
        },
        {
          "name": "Niacinamide",
          "name_localized": "Niacinamide",
          "priority": 2,
          "score": 0.88,
          "why_you_need_it": "Helps minimize pore appearance and brighten uneven skin tone while strengthening your skin barrier.",
          "concerns_addressed": ["enlarged_pores", "hyperpigmentation"],
          "usage_tip": "Start with 5% concentration and can use twice daily"
        },
        {
          "name": "Centella Asiatica",
          "name_localized": "Centella Asiatica",
          "priority": 3,
          "score": 0.72,
          "why_you_need_it": "Soothes and repairs the skin barrier while providing antioxidant protection.",
          "concerns_addressed": ["dehydration"],
          "usage_tip": "Great for sensitive skin, can be used daily"
        }
      ],
      "products": [
        {
          "id": "prod_cosrx_snail",
          "name": "Advanced Snail 96 Mucin Power Essence",
          "brand": "COSRX",
          "category": "essence",
          "match_score": 0.94,
          "key_ingredients": ["Snail Secretion Filtrate", "Hyaluronic Acid"],
          "price_usd": 15.99,
          "affiliate_url": "https://www.amazon.com/dp/B00PBX3L7K?tag=skinseoul-20"
        }
      ]
    },
    "processing_time_ms": 3245
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0",
    "request_id": "req_abc123"
  }
}
```

**Error Responses:**

*Invalid Image (400):*
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Image validation failed",
    "details": {
      "reason": "size_exceeded",
      "max_size_bytes": 10485760,
      "received_size_bytes": 15234567
    }
  }
}
```

*Poor Quality (400):*
```json
{
  "success": false,
  "error": {
    "code": "POOR_IMAGE_QUALITY",
    "message": "Image quality is insufficient for accurate analysis",
    "details": {
      "issues": ["too_dark", "blurry", "face_partially_visible"],
      "suggestions": [
        "Ensure good lighting on your face",
        "Hold camera steady to avoid blur",
        "Position face fully in frame"
      ]
    }
  }
}
```

*AI Service Error (503):*
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Analysis service temporarily unavailable",
    "details": {
      "retry_after_seconds": 30
    }
  }
}
```

---

### 6.2 GET /api/products

Query and filter K-Beauty products from the catalog.

#### Request

```http
GET /api/products?ingredient=Hyaluronic+Acid&category=serum&limit=20 HTTP/1.1
Host: skinseoul.vercel.app
Accept-Language: en
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ingredient` | string | - | Filter by primary ingredient |
| `ingredients` | string[] | - | Filter by multiple ingredients (comma-separated) |
| `category` | string | - | Filter by product category |
| `brand` | string | - | Filter by brand name |
| `min_rating` | number | - | Minimum rating (0-5) |
| `max_price` | number | - | Maximum price in USD |
| `min_price` | number | - | Minimum price in USD |
| `sort` | string | `popularity` | Sort order |
| `order` | string | `desc` | Sort direction: `asc` or `desc` |
| `limit` | number | 20 | Results per page (max 50) |
| `offset` | number | 0 | Pagination offset |
| `language` | string | `en` | Response language |
| `search` | string | - | Full-text search query |

**Sort Options:**

| Value | Description |
|-------|-------------|
| `popularity` | By popularity score (default) |
| `rating` | By user rating |
| `price` | By price |
| `newest` | By creation date |
| `name` | Alphabetical |

**Category Values:**

| Value | Description |
|-------|-------------|
| `cleanser` | Face cleansers |
| `toner` | Toners and essence toners |
| `serum` | Serums and ampoules |
| `essence` | Essences |
| `moisturizer` | Moisturizers and lotions |
| `cream` | Rich creams |
| `sunscreen` | SPF products |
| `mask` | Sheet masks and wash-off masks |
| `exfoliator` | AHA/BHA/scrubs |

#### Response

```typescript
interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  filters_applied: {
    ingredient?: string;
    category?: string;
    min_rating?: number;
    max_price?: number;
  };
}

interface Product {
  id: string;
  name: string;
  name_localized?: string;
  brand: string;
  category: string;
  ingredients: {
    primary: string[];
    full_list?: string[];
  };
  price: {
    usd: number | null;
    krw: number | null;
  };
  rating: number | null;
  review_count: number;
  image_url: string | null;
  thumbnail_url: string | null;
  description: string;
  affiliate_links: {
    amazon?: string;
    amazon_jp?: string;
    coupang?: string;
    yesstyle?: string;
  };
  popularity_score: number;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Advanced Snail 96 Mucin Power Essence",
        "name_localized": "Advanced Snail 96 Mucin Power Essence",
        "brand": "COSRX",
        "category": "essence",
        "ingredients": {
          "primary": ["Snail Secretion Filtrate", "Hyaluronic Acid"]
        },
        "price": {
          "usd": 15.99,
          "krw": 19000
        },
        "rating": 4.8,
        "review_count": 45230,
        "image_url": "https://images.cosrx.com/snail-96-full.jpg",
        "thumbnail_url": "https://images.cosrx.com/snail-96-thumb.jpg",
        "description": "This lightweight essence contains 96.3% snail secretion filtrate to deeply hydrate and repair damaged skin.",
        "affiliate_links": {
          "amazon": "https://www.amazon.com/dp/B00PBX3L7K?tag=skinseoul-20",
          "yesstyle": "https://www.yesstyle.com/cosrx-snail-96?rco=SKINSEOUL"
        },
        "popularity_score": 1000
      },
      {
        "id": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
        "name": "Glow Serum: Propolis + Niacinamide",
        "name_localized": "Glow Serum: Propolis + Niacinamide",
        "brand": "Beauty of Joseon",
        "category": "serum",
        "ingredients": {
          "primary": ["Propolis Extract", "Niacinamide", "Rice Bran Water"]
        },
        "price": {
          "usd": 17.00,
          "krw": 20000
        },
        "rating": 4.7,
        "review_count": 18920,
        "image_url": "https://images.boj.com/glow-serum-full.jpg",
        "thumbnail_url": "https://images.boj.com/glow-serum-thumb.jpg",
        "description": "A nourishing serum with 60% propolis extract and 2% niacinamide.",
        "affiliate_links": {
          "amazon": "https://www.amazon.com/dp/B08XQ2M6XL?tag=skinseoul-20"
        },
        "popularity_score": 720
      }
    ],
    "pagination": {
      "total": 47,
      "limit": 20,
      "offset": 0,
      "has_more": true,
      "next_offset": 20
    },
    "filters_applied": {
      "ingredient": "Hyaluronic Acid",
      "category": "serum"
    }
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0",
    "processing_time_ms": 45
  }
}
```

---

### 6.3 GET /api/products/:id

Get detailed information about a specific product.

#### Request

```http
GET /api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890?language=en HTTP/1.1
Host: skinseoul.vercel.app
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Product ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `language` | string | `en` | Response language |

#### Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Advanced Snail 96 Mucin Power Essence",
      "name_localized": "Advanced Snail 96 Mucin Power Essence",
      "brand": "COSRX",
      "category": "essence",
      "ingredients": {
        "primary": ["Snail Secretion Filtrate", "Hyaluronic Acid"],
        "full_list": [
          "Snail Secretion Filtrate (96.3%)",
          "Betaine",
          "Butylene Glycol",
          "1,2-Hexanediol",
          "Sodium Hyaluronate",
          "Panthenol",
          "Arginine",
          "Allantoin",
          "Ethyl Hexanediol",
          "Sodium Polyacrylate",
          "Carbomer",
          "Phenoxyethanol"
        ]
      },
      "price": {
        "usd": 15.99,
        "krw": 19000
      },
      "rating": 4.8,
      "review_count": 45230,
      "image_url": "https://images.cosrx.com/snail-96-full.jpg",
      "thumbnail_url": "https://images.cosrx.com/snail-96-thumb.jpg",
      "description": "This lightweight essence contains 96.3% snail secretion filtrate to deeply hydrate and repair damaged skin. Perfect for all skin types, it helps reduce the appearance of fine lines, acne scars, and hyperpigmentation while improving overall skin texture.",
      "affiliate_links": {
        "amazon": "https://www.amazon.com/dp/B00PBX3L7K?tag=skinseoul-20",
        "amazon_jp": "https://www.amazon.co.jp/dp/B00PBX3L7K?tag=skinseoul-22",
        "yesstyle": "https://www.yesstyle.com/cosrx-snail-96?rco=SKINSEOUL",
        "coupang": "https://link.coupang.com/re/COSRX-snail"
      },
      "popularity_score": 1000,
      "created_at": "2026-01-15T00:00:00.000Z",
      "updated_at": "2026-02-01T00:00:00.000Z"
    },
    "related_products": [
      {
        "id": "...",
        "name": "Snail Mucin 92% Moisturizer",
        "brand": "COSRX",
        "price": { "usd": 18.99 },
        "thumbnail_url": "..."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {
      "id": "invalid-uuid-here"
    }
  }
}
```

---

### 6.4 GET /api/ingredients

Get the ingredient library with descriptions and benefits.

#### Request

```http
GET /api/ingredients?language=en&concern=dehydration HTTP/1.1
Host: skinseoul.vercel.app
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `language` | string | `en` | Response language |
| `concern` | string | - | Filter by skin concern addressed |
| `concerns` | string[] | - | Filter by multiple concerns (comma-separated) |
| `benefit` | string | - | Filter by benefit |
| `skin_type` | string | - | Filter by recommended skin type |
| `search` | string | - | Search by name or alias |
| `limit` | number | 50 | Results per page (max 100) |
| `offset` | number | 0 | Pagination offset |

#### Response

```typescript
interface IngredientsResponse {
  ingredients: Ingredient[];
  pagination: Pagination;
}

interface Ingredient {
  id: string;
  name: string;
  name_localized?: string;
  aliases: string[];
  description: string;
  benefits: string[];
  addresses_concerns: string[];
  best_for_skin_types: string[];
  usage_frequency: string;
  usage_time: string;
  concentration_range?: string;
  precautions?: string;
  pairs_well_with: string[];
  avoid_mixing_with: string[];
  research_level: 'strong' | 'moderate' | 'limited' | 'traditional';
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "id": "ing_hyaluronic",
        "name": "Hyaluronic Acid",
        "name_localized": "Hyaluronic Acid",
        "aliases": ["HA", "Sodium Hyaluronate", "Hyaluronan"],
        "description": "A powerful humectant that can hold up to 1000x its weight in water. Naturally found in skin, it provides deep hydration, plumps fine lines, and improves skin elasticity without clogging pores.",
        "benefits": ["hydration", "plumping", "anti-aging", "barrier-repair"],
        "addresses_concerns": ["dehydration", "fine_lines", "dullness"],
        "best_for_skin_types": ["all"],
        "usage_frequency": "twice-daily",
        "usage_time": "both",
        "concentration_range": "0.1-2%",
        "precautions": "Generally safe for all skin types. Apply to damp skin for best results.",
        "pairs_well_with": ["Vitamin C", "Niacinamide", "Peptides", "Ceramides"],
        "avoid_mixing_with": [],
        "research_level": "strong"
      },
      {
        "id": "ing_niacinamide",
        "name": "Niacinamide",
        "name_localized": "Niacinamide",
        "aliases": ["Vitamin B3", "Nicotinamide"],
        "description": "A form of Vitamin B3 that brightens skin, strengthens the skin barrier, minimizes pores, and regulates sebum production.",
        "benefits": ["brightening", "barrier-repair", "pore-minimizing", "oil-control"],
        "addresses_concerns": ["hyperpigmentation", "enlarged_pores", "oily_skin", "dullness", "acne"],
        "best_for_skin_types": ["all"],
        "usage_frequency": "twice-daily",
        "usage_time": "both",
        "concentration_range": "2-10%",
        "precautions": "Start with lower concentrations (2-5%) if you have sensitive skin.",
        "pairs_well_with": ["Hyaluronic Acid", "Salicylic Acid", "Retinol", "Vitamin C"],
        "avoid_mixing_with": [],
        "research_level": "strong"
      }
    ],
    "pagination": {
      "total": 30,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0"
  }
}
```

---

### 6.5 GET /api/ingredients/:name

Get detailed information about a specific ingredient.

#### Request

```http
GET /api/ingredients/Hyaluronic%20Acid?language=en HTTP/1.1
Host: skinseoul.vercel.app
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Ingredient name (URL encoded) |

#### Response

```json
{
  "success": true,
  "data": {
    "ingredient": {
      "id": "ing_hyaluronic",
      "name": "Hyaluronic Acid",
      "name_localized": "Hyaluronic Acid",
      "aliases": ["HA", "Sodium Hyaluronate", "Hyaluronan"],
      "description": "A powerful humectant that can hold up to 1000x its weight in water...",
      "benefits": ["hydration", "plumping", "anti-aging", "barrier-repair"],
      "addresses_concerns": ["dehydration", "fine_lines", "dullness"],
      "best_for_skin_types": ["all"],
      "usage_frequency": "twice-daily",
      "usage_time": "both",
      "concentration_range": "0.1-2%",
      "precautions": "Generally safe for all skin types. Apply to damp skin for best results.",
      "pairs_well_with": ["Vitamin C", "Niacinamide", "Peptides", "Ceramides"],
      "avoid_mixing_with": [],
      "research_level": "strong",
      "inci_name": "Sodium Hyaluronate",
      "ewg_rating": 1
    },
    "related_products": [
      {
        "id": "prod_cosrx_snail",
        "name": "Advanced Snail 96 Mucin Power Essence",
        "brand": "COSRX",
        "thumbnail_url": "https://..."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0"
  }
}
```

---

### 6.6 POST /api/track-event

Track analytics events for user behavior analysis.

#### Request

```http
POST /api/track-event HTTP/1.1
Host: skinseoul.vercel.app
Content-Type: application/json
X-Session-ID: session_abc123
```

```typescript
interface TrackEventRequest {
  event_name: string;         // Event identifier
  event_data?: object;        // Event-specific data
  session_id?: string;        // Anonymous session ID
  timestamp?: string;         // Client timestamp (ISO 8601)
}
```

**Supported Events:**

| Event Name | Description | Event Data |
|------------|-------------|------------|
| `page_view` | Page visited | `{ page, referrer }` |
| `analysis_started` | User started skin analysis | `{ source }` |
| `analysis_completed` | Analysis finished | `{ analysis_id, concerns_count }` |
| `ingredient_viewed` | Ingredient card expanded | `{ ingredient_name }` |
| `product_viewed` | Product details viewed | `{ product_id, source }` |
| `product_clicked` | Product card clicked | `{ product_id, ingredient }` |
| `affiliate_clicked` | Affiliate link clicked | `{ product_id, platform, url }` |
| `language_changed` | Language switched | `{ from, to }` |
| `share_clicked` | Share button clicked | `{ content_type, method }` |

**Request Body:**
```json
{
  "event_name": "affiliate_clicked",
  "event_data": {
    "product_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "product_name": "COSRX Snail Mucin Essence",
    "platform": "amazon",
    "ingredient": "Hyaluronic Acid",
    "price_usd": 15.99
  },
  "session_id": "session_abc123",
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "event_id": "evt_xyz789",
    "recorded": true
  },
  "meta": {
    "timestamp": "2026-02-06T12:00:00.000Z",
    "version": "1.0"
  }
}
```

**Note:** This endpoint always returns success for valid requests to avoid blocking client-side code. Invalid events are logged server-side but not rejected.

---

## 7. Validation Schemas

### 7.1 Zod Schemas

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

// Image validation
export const imageSchema = z.object({
  image: z
    .string()
    .min(1, 'Image is required')
    .refine(
      (val) => val.startsWith('data:image/'),
      'Invalid image format. Must be base64 encoded.'
    )
    .refine(
      (val) => {
        const base64 = val.split(',')[1];
        const sizeInBytes = (base64.length * 3) / 4;
        return sizeInBytes <= 10 * 1024 * 1024; // 10MB
      },
      'Image exceeds maximum size of 10MB'
    )
    .refine(
      (val) => {
        const mimeType = val.split(';')[0].split(':')[1];
        return ['image/jpeg', 'image/png'].includes(mimeType);
      },
      'Only JPEG and PNG images are supported'
    ),
  language: z.enum(['en', 'ja', 'zh-CN']).optional().default('en'),
  include_products: z.boolean().optional().default(false),
});

// Product query validation
export const productQuerySchema = z.object({
  ingredient: z.string().optional(),
  ingredients: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()))
    .optional(),
  category: z
    .enum([
      'cleanser', 'toner', 'serum', 'essence', 'ampoule',
      'moisturizer', 'cream', 'sunscreen', 'mask', 'exfoliator'
    ])
    .optional(),
  brand: z.string().optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  max_price: z.coerce.number().positive().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(['popularity', 'rating', 'price', 'newest', 'name'])
    .optional()
    .default('popularity'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().nonnegative().optional().default(0),
  language: z.enum(['en', 'ja', 'zh-CN']).optional().default('en'),
  search: z.string().max(100).optional(),
});

// Track event validation
export const trackEventSchema = z.object({
  event_name: z.string().min(1).max(50),
  event_data: z.record(z.unknown()).optional(),
  session_id: z.string().max(100).optional(),
  timestamp: z.string().datetime().optional(),
});

// Export types
export type AnalyzeSkinInput = z.infer<typeof imageSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
```

### 7.2 Usage in API Routes

```typescript
// app/api/analyze-skin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { imageSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = imageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: {
              errors: validated.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code,
              })),
            },
          },
          meta: { timestamp: new Date().toISOString(), version: '1.0' },
        },
        { status: 400 }
      );
    }

    // Process valid request
    const { image, language, include_products } = validated.data;
    // ...
  } catch (error) {
    // Handle errors
  }
}
```

---

## 8. TypeScript SDK

### 8.1 Complete SDK Implementation

```typescript
// lib/sdk/skinseoul-api.ts

export interface SkinSeoulConfig {
  baseURL?: string;
  language?: 'en' | 'ja' | 'zh-CN';
  sessionId?: string;
  timeout?: number;
}

export interface AnalyzeSkinOptions {
  image: string;
  language?: 'en' | 'ja' | 'zh-CN';
  includeProducts?: boolean;
}

export interface GetProductsOptions {
  ingredient?: string;
  ingredients?: string[];
  category?: string;
  brand?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  sort?: 'popularity' | 'rating' | 'price' | 'newest' | 'name';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetIngredientsOptions {
  concern?: string;
  concerns?: string[];
  benefit?: string;
  skinType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TrackEventOptions {
  eventName: string;
  eventData?: Record<string, unknown>;
  timestamp?: Date;
}

export class SkinSeoulAPI {
  private baseURL: string;
  private language: string;
  private sessionId: string;
  private timeout: number;

  constructor(config: SkinSeoulConfig = {}) {
    this.baseURL = config.baseURL || 'https://skinseoul.vercel.app/api';
    this.language = config.language || 'en';
    this.sessionId = config.sessionId || this.generateSessionId();
    this.timeout = config.timeout || 30000;
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': this.language,
          'X-Session-ID': this.sessionId,
          ...options.headers,
        },
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new SkinSeoulError(
          data.error?.message || 'Request failed',
          data.error?.code || 'UNKNOWN_ERROR',
          response.status,
          data.error?.details
        );
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Analyze a facial photo for skin concerns
   */
  async analyzeSkin(options: AnalyzeSkinOptions): Promise<AnalysisResponse> {
    return this.fetch<AnalysisResponse>('/analyze-skin', {
      method: 'POST',
      body: JSON.stringify({
        image: options.image,
        language: options.language || this.language,
        include_products: options.includeProducts || false,
      }),
    });
  }

  /**
   * Get products from the catalog
   */
  async getProducts(options: GetProductsOptions = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (options.ingredient) params.set('ingredient', options.ingredient);
    if (options.ingredients) params.set('ingredients', options.ingredients.join(','));
    if (options.category) params.set('category', options.category);
    if (options.brand) params.set('brand', options.brand);
    if (options.minRating !== undefined) params.set('min_rating', options.minRating.toString());
    if (options.maxPrice !== undefined) params.set('max_price', options.maxPrice.toString());
    if (options.minPrice !== undefined) params.set('min_price', options.minPrice.toString());
    if (options.sort) params.set('sort', options.sort);
    if (options.order) params.set('order', options.order);
    if (options.limit !== undefined) params.set('limit', options.limit.toString());
    if (options.offset !== undefined) params.set('offset', options.offset.toString());
    if (options.search) params.set('search', options.search);

    params.set('language', this.language);

    return this.fetch<ProductsResponse>(`/products?${params.toString()}`);
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<ProductDetailResponse> {
    return this.fetch<ProductDetailResponse>(
      `/products/${encodeURIComponent(id)}?language=${this.language}`
    );
  }

  /**
   * Get ingredients from the library
   */
  async getIngredients(options: GetIngredientsOptions = {}): Promise<IngredientsResponse> {
    const params = new URLSearchParams();

    if (options.concern) params.set('concern', options.concern);
    if (options.concerns) params.set('concerns', options.concerns.join(','));
    if (options.benefit) params.set('benefit', options.benefit);
    if (options.skinType) params.set('skin_type', options.skinType);
    if (options.search) params.set('search', options.search);
    if (options.limit !== undefined) params.set('limit', options.limit.toString());
    if (options.offset !== undefined) params.set('offset', options.offset.toString());

    params.set('language', this.language);

    return this.fetch<IngredientsResponse>(`/ingredients?${params.toString()}`);
  }

  /**
   * Get a single ingredient by name
   */
  async getIngredient(name: string): Promise<IngredientDetailResponse> {
    return this.fetch<IngredientDetailResponse>(
      `/ingredients/${encodeURIComponent(name)}?language=${this.language}`
    );
  }

  /**
   * Track an analytics event
   */
  async trackEvent(options: TrackEventOptions): Promise<void> {
    await this.fetch('/track-event', {
      method: 'POST',
      body: JSON.stringify({
        event_name: options.eventName,
        event_data: options.eventData,
        session_id: this.sessionId,
        timestamp: (options.timestamp || new Date()).toISOString(),
      }),
    });
  }

  /**
   * Set the language for API responses
   */
  setLanguage(language: 'en' | 'ja' | 'zh-CN'): void {
    this.language = language;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

/**
 * Custom error class for API errors
 */
export class SkinSeoulError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SkinSeoulError';
  }
}

// Response types
export interface AnalysisResponse {
  success: true;
  data: {
    analysis_id: string;
    skin_type: string;
    overall_score: number;
    confidence_score: number;
    concerns: Array<{
      type: string;
      score: number;
      severity: string;
      location: string[];
      confidence: number;
      title: string;
      description: string;
    }>;
    recommendations: {
      ingredients: Array<{
        name: string;
        priority: number;
        score: number;
        why_you_need_it: string;
        concerns_addressed: string[];
      }>;
      products?: Array<{
        id: string;
        name: string;
        brand: string;
        match_score: number;
        affiliate_url: string;
      }>;
    };
    processing_time_ms: number;
  };
  meta: ResponseMeta;
}

export interface ProductsResponse {
  success: true;
  data: {
    products: Product[];
    pagination: Pagination;
    filters_applied: Record<string, string | number>;
  };
  meta: ResponseMeta;
}

export interface ProductDetailResponse {
  success: true;
  data: {
    product: Product;
    related_products: Product[];
  };
  meta: ResponseMeta;
}

export interface IngredientsResponse {
  success: true;
  data: {
    ingredients: Ingredient[];
    pagination: Pagination;
  };
  meta: ResponseMeta;
}

export interface IngredientDetailResponse {
  success: true;
  data: {
    ingredient: Ingredient;
    related_products: Product[];
  };
  meta: ResponseMeta;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredients: { primary: string[]; full_list?: string[] };
  price: { usd: number | null; krw: number | null };
  rating: number | null;
  review_count: number;
  image_url: string | null;
  thumbnail_url: string | null;
  description: string;
  affiliate_links: Record<string, string>;
  popularity_score: number;
}

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  benefits: string[];
  addresses_concerns: string[];
  best_for_skin_types: string[];
  usage_frequency: string;
  usage_time: string;
  precautions?: string;
  pairs_well_with: string[];
  avoid_mixing_with: string[];
  research_level: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
}

export interface ResponseMeta {
  timestamp: string;
  version: string;
  request_id?: string;
  processing_time_ms?: number;
}

// Default export
export default SkinSeoulAPI;
```

### 8.2 SDK Usage Examples

```typescript
// Example: Basic usage
import SkinSeoulAPI from '@/lib/sdk/skinseoul-api';

const api = new SkinSeoulAPI({ language: 'en' });

// Analyze skin
const analysisResult = await api.analyzeSkin({
  image: 'data:image/jpeg;base64,...',
  includeProducts: true,
});

console.log('Skin Type:', analysisResult.data.skin_type);
console.log('Concerns:', analysisResult.data.concerns);

// Get products
const products = await api.getProducts({
  ingredient: 'Hyaluronic Acid',
  category: 'serum',
  limit: 10,
});

console.log('Products:', products.data.products);

// Track event
await api.trackEvent({
  eventName: 'product_clicked',
  eventData: { product_id: 'abc123' },
});
```

```typescript
// Example: Error handling
import SkinSeoulAPI, { SkinSeoulError } from '@/lib/sdk/skinseoul-api';

const api = new SkinSeoulAPI();

try {
  const result = await api.analyzeSkin({ image: 'invalid-image' });
} catch (error) {
  if (error instanceof SkinSeoulError) {
    console.error(`API Error [${error.code}]: ${error.message}`);
    console.error('Status:', error.status);
    console.error('Details:', error.details);

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Wait and retry
      const retryAfter = error.details?.retry_after_seconds || 60;
      await new Promise(r => setTimeout(r, retryAfter * 1000));
    }
  }
}
```

```typescript
// Example: React Hook
import { useState, useCallback } from 'react';
import SkinSeoulAPI from '@/lib/sdk/skinseoul-api';

const api = new SkinSeoulAPI();

export function useSkinAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse['data'] | null>(null);

  const analyze = useCallback(async (imageBase64: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.analyzeSkin({
        image: imageBase64,
        includeProducts: true,
      });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, result };
}
```

---

## 9. cURL Examples

### 9.1 Analyze Skin

```bash
# Basic analysis
curl -X POST https://skinseoul.vercel.app/api/analyze-skin \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "language": "en",
    "include_products": true
  }'

# With session ID
curl -X POST https://skinseoul.vercel.app/api/analyze-skin \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: my-session-123" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

### 9.2 Get Products

```bash
# All products (paginated)
curl "https://skinseoul.vercel.app/api/products?limit=20&offset=0"

# Filter by ingredient
curl "https://skinseoul.vercel.app/api/products?ingredient=Hyaluronic%20Acid"

# Multiple filters
curl "https://skinseoul.vercel.app/api/products?\
ingredient=Niacinamide&\
category=serum&\
min_rating=4.5&\
max_price=30&\
sort=rating&\
order=desc&\
limit=10"

# Search products
curl "https://skinseoul.vercel.app/api/products?search=COSRX%20snail"

# Get single product
curl "https://skinseoul.vercel.app/api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### 9.3 Get Ingredients

```bash
# All ingredients
curl "https://skinseoul.vercel.app/api/ingredients"

# Filter by concern
curl "https://skinseoul.vercel.app/api/ingredients?concern=dehydration"

# Multiple concerns
curl "https://skinseoul.vercel.app/api/ingredients?concerns=dehydration,hyperpigmentation"

# Japanese language
curl "https://skinseoul.vercel.app/api/ingredients?language=ja"

# Get single ingredient
curl "https://skinseoul.vercel.app/api/ingredients/Hyaluronic%20Acid"
```

### 9.4 Track Event

```bash
curl -X POST https://skinseoul.vercel.app/api/track-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "affiliate_clicked",
    "event_data": {
      "product_id": "abc123",
      "platform": "amazon",
      "price_usd": 15.99
    },
    "session_id": "session_xyz789"
  }'
```

### 9.5 With jq for Pretty Output

```bash
# Pretty print products
curl -s "https://skinseoul.vercel.app/api/products?limit=5" | jq '.data.products[] | {name, brand, rating}'

# Extract concerns from analysis
curl -s -X POST https://skinseoul.vercel.app/api/analyze-skin \
  -H "Content-Type: application/json" \
  -d '{"image": "..."}' | jq '.data.concerns[] | {type, severity, score}'
```

---

## 10. Webhooks (Phase 2)

### 10.1 Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `analysis.completed` | Skin analysis finished | Analysis result |
| `user.created` | New user registered | User profile |
| `subscription.updated` | Subscription changed | Subscription details |

### 10.2 Webhook Payload Format

```typescript
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: object;
  webhook_id: string;
}
```

### 10.3 Webhook Signature Verification

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}
```

---

## 11. Changelog

### Version 1.0 (February 2026)

**Initial Release**
- `POST /api/analyze-skin` - AI skin analysis endpoint
- `GET /api/products` - Product catalog with filtering
- `GET /api/products/:id` - Single product details
- `GET /api/ingredients` - Ingredient library
- `GET /api/ingredients/:name` - Single ingredient details
- `POST /api/track-event` - Analytics tracking
- Multi-language support (en, ja, zh-CN)
- Rate limiting (10 req/min per IP)
- Standard error responses

### Planned: Version 1.1 (Phase 2)

- JWT authentication via Supabase Auth
- `GET /api/user/analyses` - User analysis history
- `GET /api/user/profile` - User profile management
- `POST /api/user/feedback` - Analysis feedback submission
- Webhook support for real-time events
- Increased rate limits for authenticated users

---

## Appendix

### A. HTTP Status Codes Used

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Auth required (P2) |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

### B. Related Documentation

| Document | Path |
|----------|------|
| Product Requirements | `/docs/PRD.md` |
| Tech Stack | `/docs/TECH_STACK.md` |
| Database Schema | `/docs/DATABASE_SCHEMA.md` |
| UI Wireframes | `/docs/UI_WIREFRAMES.md` |

---

**Document Status:** ✅ Approved for Development
**API Version:** 1.0
**Last Updated:** February 2026
