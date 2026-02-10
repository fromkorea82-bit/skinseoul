# Technical Stack Documentation

## SkinSEOUL - AI-Powered K-Beauty Skin Analysis

**Version:** 1.0
**Last Updated:** February 2026
**Architecture:** Serverless, JAMstack
**Deployment:** Vercel Edge Network

---

## Table of Contents

1. [Technology Overview](#1-technology-overview)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [External Services](#4-external-services)
5. [Affiliate Integration](#5-affiliate-integration)
6. [Internationalization](#6-internationalization)
7. [Development Tools](#7-development-tools)
8. [System Architecture](#8-system-architecture)
9. [Project File Structure](#9-project-file-structure)
10. [Environment Variables](#10-environment-variables)
11. [Performance Optimization](#11-performance-optimization)
12. [Security Measures](#12-security-measures)
13. [Deployment Pipeline](#13-deployment-pipeline)
14. [API Rate Limits & Costs](#14-api-rate-limits--costs)
15. [Scalability Considerations](#15-scalability-considerations)
16. [Technology Decision Rationale](#16-technology-decision-rationale)

---

## 1. Technology Overview

### Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2+ |
| **Language** | TypeScript | 5.0+ |
| **Styling** | Tailwind CSS | 3.4+ |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Database** | Supabase PostgreSQL | 15+ |
| **AI/ML** | OpenAI Vision API | GPT-4o |
| **Hosting** | Vercel | Pro Plan |
| **CDN** | Vercel Edge Network | Automatic |

### Architecture Principles

1. **Serverless-First:** No server management, auto-scaling
2. **Edge-Optimized:** Global CDN for fast asset delivery
3. **Type-Safe:** Full TypeScript coverage
4. **Privacy-First:** No persistent image storage
5. **Cost-Efficient:** Free tiers maximized, pay-per-use APIs

---

## 2. Frontend Stack

### 2.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | React framework with App Router |
| **React** | 18.2+ | UI library |
| **TypeScript** | 5.0+ | Type safety |

```bash
# Installation
npx create-next-app@latest skinseoul-ai --typescript --tailwind --app --src-dir=false
```

### 2.2 Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **Radix UI** | Latest | Headless UI primitives |
| **Lucide React** | Latest | Icon library |

```bash
# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog progress
```

**Key shadcn/ui Components Used:**
- `Button` - CTAs, actions
- `Card` - Skin concern cards, product cards
- `Dialog` - Privacy notice modal
- `Progress` - Analysis loading, severity bars
- `Select` - Language selector, filters
- `Tabs` - Result sections
- `Badge` - Priority indicators

### 2.3 Camera & Image Handling

| Technology | Version | Purpose |
|------------|---------|---------|
| **react-webcam** | 7.2+ | Camera capture |
| **sharp** | 0.33+ | Server-side image optimization |
| **next/image** | Built-in | Client-side image optimization |

```typescript
// react-webcam usage
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user"
};

<Webcam
  audio={false}
  screenshotFormat="image/jpeg"
  videoConstraints={videoConstraints}
  ref={webcamRef}
/>
```

### 2.4 Animations (Optional)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Framer Motion** | 11.0+ | Smooth animations |

```typescript
// Example: Result reveal animation
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <AnalysisResults />
</motion.div>
```

### 2.5 Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.50+ | Form state management |
| **Zod** | 3.22+ | Schema validation |

```typescript
// Example: Image upload validation
import { z } from 'zod';

const imageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Max 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'Only JPEG/PNG allowed'
    ),
});
```

### 2.6 State Management

| Approach | Use Case |
|----------|----------|
| **React useState** | Local component state |
| **React Context** | Global state (language, theme) |
| **URL State** | Shareable state (filters, locale) |

**No Redux/Zustand for MVP** - Context + useState sufficient for current complexity.

```typescript
// Example: Analysis Context
const AnalysisContext = createContext<{
  results: AnalysisResult | null;
  setResults: (results: AnalysisResult) => void;
}>({
  results: null,
  setResults: () => {},
});
```

---

## 3. Backend Stack

### 3.1 Runtime Environment

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | JavaScript runtime |
| **Vercel Serverless** | Latest | Function execution |

### 3.2 API Routes

Next.js App Router API routes in `/app/api/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze-skin` | POST | AI skin analysis |
| `/api/products` | GET | Query product database |
| `/api/track-event` | POST | Analytics events |

```typescript
// app/api/analyze-skin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const { imageBase64 } = await request.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_PROMPT },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ],
    max_tokens: 1000,
  });

  return NextResponse.json({ analysis: response.choices[0].message.content });
}
```

### 3.3 AI Integration

| Service | Model | Purpose |
|---------|-------|---------|
| **OpenAI** | GPT-4o Vision | Skin analysis |

```bash
npm install openai
```

```typescript
// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ANALYSIS_PROMPT = `
Analyze this facial photo for skin concerns. Return JSON:
{
  "skinType": "oily" | "dry" | "combination" | "normal",
  "concerns": [
    {
      "name": string,
      "severity": 0.0-1.0,
      "location": string[],
      "confidence": 0.0-1.0
    }
  ],
  "overallScore": 0-100
}

Concerns to detect: dehydration, fine_lines, hyperpigmentation,
enlarged_pores, acne, redness, dullness, oily_skin
`;
```

### 3.4 Database

| Service | Type | Purpose |
|---------|------|---------|
| **Supabase** | PostgreSQL 15 | Product data, analytics |

```bash
npm install @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side with service role
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 3.5 Authentication

| Phase | Approach |
|-------|----------|
| **MVP (Phase 1)** | None - anonymous usage |
| **Phase 2** | Supabase Auth (email, OAuth) |

```typescript
// Phase 2: Supabase Auth setup
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

---

## 4. External Services

### 4.1 Service Overview

| Service | Purpose | Tier | Monthly Cost |
|---------|---------|------|--------------|
| **OpenAI** | Vision API | Pay-per-use | ~$13 |
| **Supabase** | Database | Free | $0 |
| **Vercel** | Hosting | Pro | $20 |
| **Google Analytics** | Analytics | Free | $0 |
| **Sentry** | Error tracking | Free | $0 |

### 4.2 OpenAI Vision API

**Configuration:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30s timeout
  maxRetries: 2,
});
```

**Usage Pattern:**
1. Client captures image → Base64 encoding
2. Send to `/api/analyze-skin`
3. Server calls OpenAI Vision
4. Parse JSON response
5. Return structured analysis

### 4.3 Supabase

**Features Used:**
- PostgreSQL database (products table)
- Real-time subscriptions (future)
- Row-level security (future)
- Auth (Phase 2)

**Dashboard:** https://supabase.com/dashboard

### 4.4 Vercel

**Features Used:**
- Serverless Functions (API routes)
- Edge Network (CDN)
- Analytics (built-in)
- Preview deployments
- Environment variables

**Dashboard:** https://vercel.com/dashboard

### 4.5 Analytics

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Core Web Vitals, page views |
| **Google Analytics 4** | User behavior, conversions |

```typescript
// lib/analytics.ts
export const trackEvent = (name: string, params?: object) => {
  // GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }

  // Server tracking
  fetch('/api/track-event', {
    method: 'POST',
    body: JSON.stringify({ name, params }),
  });
};
```

### 4.6 Error Tracking (Optional)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 5. Affiliate Integration

### 5.1 Affiliate Programs

| Platform | Market | Commission | Integration |
|----------|--------|------------|-------------|
| **Amazon Associates** | US, UK, JP | 3-5% | Manual links (MVP) |
| **Coupang Partners** | Korea | 3-7% | Manual links |
| **YesStyle Affiliate** | Global | 8-12% | Manual links |

### 5.2 Link Structure

```typescript
// lib/affiliate.ts
export const generateAffiliateLink = (
  product: Product,
  platform: 'amazon' | 'coupang' | 'yesstyle'
): string => {
  const tags = {
    amazon: 'skinseoul-20',
    coupang: 'af12345',
    yesstyle: 'SKINSEOUL',
  };

  switch (platform) {
    case 'amazon':
      return `https://amazon.com/dp/${product.asin}?tag=${tags.amazon}`;
    case 'coupang':
      return `https://link.coupang.com/${product.coupangId}?${tags.coupang}`;
    case 'yesstyle':
      return `https://yesstyle.com/p/${product.yesStyleId}?rco=${tags.yesstyle}`;
  }
};
```

### 5.3 Tracking

```typescript
// Track affiliate clicks
const handleBuyClick = (product: Product, platform: string) => {
  trackEvent('affiliate_click', {
    product_id: product.id,
    product_name: product.name,
    platform,
    price: product.price,
  });

  window.open(generateAffiliateLink(product, platform), '_blank');
};
```

---

## 6. Internationalization

### 6.1 Library

| Technology | Version | Purpose |
|------------|---------|---------|
| **next-intl** | 3.0+ | i18n for App Router |

```bash
npm install next-intl
```

### 6.2 Supported Locales

| Code | Language | Coverage | Priority |
|------|----------|----------|----------|
| `en` | English | 100% | Default |
| `ja` | Japanese | 100% | High |
| `zh-CN` | Chinese (Simplified) | 100% | Medium |

### 6.3 Configuration

```typescript
// i18n.config.ts
export const locales = ['en', 'ja', 'zh-CN'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
```

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### 6.4 Translation Files

```
public/
└── locales/
    ├── en.json
    ├── ja.json
    └── zh-CN.json
```

```json
// public/locales/en.json
{
  "landing": {
    "title": "Seoul's Secret to Your Best Skin",
    "subtitle": "AI-powered K-Beauty skin analysis",
    "cta": "Analyze My Skin"
  },
  "analysis": {
    "uploading": "Uploading photo...",
    "analyzing": "Analyzing your skin...",
    "complete": "Analysis complete!"
  },
  "concerns": {
    "dehydration": "Dehydration",
    "fine_lines": "Fine Lines",
    "hyperpigmentation": "Dark Spots",
    "enlarged_pores": "Enlarged Pores",
    "acne": "Acne & Blemishes",
    "redness": "Redness",
    "dullness": "Dullness",
    "oily_skin": "Oily Skin"
  },
  "ingredients": {
    "title": "Recommended Ingredients",
    "why": "Why you need this"
  },
  "products": {
    "title": "Recommended Products",
    "buyNow": "Buy Now",
    "sortBy": "Sort by"
  }
}
```

### 6.5 Usage in Components

```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('landing');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <Button>{t('cta')}</Button>
    </main>
  );
}
```

---

## 7. Development Tools

### 7.1 Package Manager

| Tool | Version |
|------|---------|
| **npm** | 10+ |

```bash
# Recommended for consistency
npm ci  # Use in CI/CD
npm install  # Local development
```

### 7.2 Code Quality

| Tool | Purpose | Config File |
|------|---------|-------------|
| **ESLint** | Linting | `.eslintrc.json` |
| **Prettier** | Formatting | `.prettierrc` |
| **TypeScript** | Type checking | `tsconfig.json` |

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### 7.3 Git Hooks (Optional)

```bash
npm install husky lint-staged --save-dev
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 7.4 Testing (Phase 2)

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **MSW** | API mocking |

```bash
# Phase 2 installation
npm install -D vitest @testing-library/react playwright
```

### 7.5 IDE Configuration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Browser    │    │   Mobile     │    │   Tablet     │       │
│  │  (Chrome,    │    │  (Safari,    │    │  (iPad,      │       │
│  │   Firefox,   │    │   Chrome)    │    │   Android)   │       │
│  │   Safari)    │    │              │    │              │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                    │
│                             ▼ HTTPS                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                         EDGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Vercel Edge Network                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │  CDN Node  │  │  CDN Node  │  │  CDN Node  │  ...     │   │
│  │  │  (US-West) │  │  (Tokyo)   │  │ (Singapore)│          │   │
│  │  └────────────┘  └────────────┘  └────────────┘          │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              Edge Middleware                        │  │   │
│  │  │  - Rate limiting (10 req/min per IP)               │  │   │
│  │  │  - Locale detection                                │  │   │
│  │  │  - Security headers                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Next.js App Router                       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │                    Pages (SSR/SSG)                   │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │ │   │
│  │  │  │ Landing │ │ Analyze │ │ Results │ │Products │   │ │   │
│  │  │  │  page   │ │  page   │ │  page   │ │  page   │   │ │   │
│  │  │  │  (SSG)  │ │ (Client)│ │ (Client)│ │  (SSR)  │   │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │               API Routes (Serverless)                │ │   │
│  │  │  ┌───────────────┐ ┌───────────────┐ ┌───────────┐  │ │   │
│  │  │  │ /api/analyze  │ │ /api/products │ │/api/track │  │ │   │
│  │  │  │    -skin      │ │               │ │  -event   │  │ │   │
│  │  │  │   (POST)      │ │    (GET)      │ │  (POST)   │  │ │   │
│  │  │  └───────┬───────┘ └───────┬───────┘ └─────┬─────┘  │ │   │
│  │  │          │                 │               │         │ │   │
│  │  └──────────┼─────────────────┼───────────────┼─────────┘ │   │
│  └─────────────┼─────────────────┼───────────────┼───────────┘   │
│                │                 │               │                │
│                ▼                 ▼               ▼                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   OpenAI     │    │   Supabase   │    │   Google     │       │
│  │  Vision API  │    │  PostgreSQL  │    │  Analytics   │       │
│  │              │    │              │    │              │       │
│  │  - GPT-4o    │    │  - Products  │    │  - Events    │       │
│  │  - Analysis  │    │  - Analytics │    │  - Sessions  │       │
│  │              │    │  - (Auth P2) │    │  - Goals     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SKIN ANALYSIS FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] User captures photo                                         │
│      │                                                           │
│      ▼                                                           │
│  [2] Client validates (size, format)                             │
│      │                                                           │
│      ▼                                                           │
│  [3] Convert to Base64                                           │
│      │                                                           │
│      ▼                                                           │
│  [4] POST /api/analyze-skin ──────────────────┐                  │
│      │                                         │                  │
│      ▼                                         ▼                  │
│  [5] Server validates request             [Rate Limit Check]     │
│      │                                         │                  │
│      ▼                                         │                  │
│  [6] Call OpenAI Vision API ◄──────────────────┘                 │
│      │                                                           │
│      ▼                                                           │
│  [7] Parse JSON response                                         │
│      │                                                           │
│      ▼                                                           │
│  [8] Map concerns → ingredients                                  │
│      │                                                           │
│      ▼                                                           │
│  [9] Return structured response                                  │
│      │                                                           │
│      ▼                                                           │
│  [10] Client displays results                                    │
│      │                                                           │
│      ▼                                                           │
│  [11] Image discarded (no storage)                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPONENT HIERARCHY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RootLayout                                                      │
│  ├── Header                                                      │
│  │   ├── Logo                                                    │
│  │   ├── Navigation                                              │
│  │   └── LanguageSelector                                        │
│  │                                                               │
│  ├── Main (per route)                                            │
│  │   │                                                           │
│  │   ├── LandingPage (/)                                         │
│  │   │   ├── HeroSection                                         │
│  │   │   ├── HowItWorks                                          │
│  │   │   └── CTAButton                                           │
│  │   │                                                           │
│  │   ├── AnalyzePage (/analyze)                                  │
│  │   │   ├── CameraCapture                                       │
│  │   │   │   ├── WebcamPreview                                   │
│  │   │   │   └── CaptureButton                                   │
│  │   │   ├── FileUpload                                          │
│  │   │   │   ├── DropZone                                        │
│  │   │   │   └── FileInput                                       │
│  │   │   ├── ImagePreview                                        │
│  │   │   └── PrivacyNotice                                       │
│  │   │                                                           │
│  │   ├── ResultsPage (/results)                                  │
│  │   │   ├── AnalysisResults                                     │
│  │   │   │   ├── SkinTypeCard                                    │
│  │   │   │   ├── ConcernCard (multiple)                          │
│  │   │   │   └── OverallScore                                    │
│  │   │   ├── IngredientSection                                   │
│  │   │   │   └── IngredientCard (multiple)                       │
│  │   │   └── ProductSection                                      │
│  │   │       └── ProductCard (multiple)                          │
│  │   │                                                           │
│  │   └── ProductsPage (/products)                                │
│  │       ├── FilterSidebar                                       │
│  │       ├── SortDropdown                                        │
│  │       └── ProductGrid                                         │
│  │           └── ProductCard (multiple)                          │
│  │                                                               │
│  └── Footer                                                      │
│      ├── Links                                                   │
│      └── Disclaimer                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Project File Structure

```
skinseoul-ai/
│
├── app/                              # Next.js App Router
│   ├── [locale]/                     # i18n dynamic routing
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Locale layout
│   │   │
│   │   ├── analyze/
│   │   │   └── page.tsx              # Camera/upload page
│   │   │
│   │   ├── results/
│   │   │   └── page.tsx              # Analysis results page
│   │   │
│   │   └── products/
│   │       └── page.tsx              # Product grid page
│   │
│   ├── api/                          # API routes
│   │   ├── analyze-skin/
│   │   │   └── route.ts              # POST: AI skin analysis
│   │   │
│   │   ├── products/
│   │   │   └── route.ts              # GET: product queries
│   │   │
│   │   └── track-event/
│   │       └── route.ts              # POST: analytics tracking
│   │
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── not-found.tsx                 # 404 page
│
├── components/                        # React components
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── select.tsx
│   │
│   ├── layout/                       # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSelector.tsx
│   │
│   ├── analyze/                      # Analysis components
│   │   ├── CameraCapture.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ImagePreview.tsx
│   │   └── PrivacyNotice.tsx
│   │
│   ├── results/                      # Results components
│   │   ├── AnalysisResults.tsx
│   │   ├── ConcernCard.tsx
│   │   ├── SkinTypeCard.tsx
│   │   └── OverallScore.tsx
│   │
│   ├── ingredients/                  # Ingredient components
│   │   ├── IngredientSection.tsx
│   │   └── IngredientCard.tsx
│   │
│   └── products/                     # Product components
│       ├── ProductGrid.tsx
│       ├── ProductCard.tsx
│       ├── FilterSidebar.tsx
│       └── SortDropdown.tsx
│
├── lib/                              # Utility libraries
│   ├── supabase.ts                   # Supabase client
│   ├── openai.ts                     # OpenAI client + prompts
│   ├── recommendation.ts             # Concern → ingredient logic
│   ├── affiliate.ts                  # Affiliate link generation
│   ├── analytics.ts                  # Event tracking
│   └── utils.ts                      # General utilities
│
├── hooks/                            # Custom React hooks
│   ├── useCamera.ts
│   ├── useAnalysis.ts
│   └── useProducts.ts
│
├── types/                            # TypeScript types
│   ├── analysis.ts
│   ├── product.ts
│   └── ingredient.ts
│
├── contexts/                         # React contexts
│   ├── AnalysisContext.tsx
│   └── LocaleContext.tsx
│
├── public/                           # Static assets
│   ├── locales/                      # Translation files
│   │   ├── en.json
│   │   ├── ja.json
│   │   └── zh-CN.json
│   │
│   ├── images/                       # Static images
│   │   ├── logo.svg
│   │   └── og-image.png
│   │
│   ├── favicon.ico
│   └── robots.txt
│
├── docs/                             # Documentation
│   ├── PRD.md
│   ├── TECH_STACK.md                 # This file
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   └── UI_WIREFRAMES.md
│
├── .env.local                        # Environment variables (git ignored)
├── .env.example                      # Example env file
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore                        # Git ignore rules
├── middleware.ts                     # Edge middleware
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Project readme
```

---

## 10. Environment Variables

### 10.1 Required Variables

```bash
# .env.local

# ============================================
# OpenAI Configuration
# ============================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Supabase Configuration
# ============================================
# Public (exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# Analytics
# ============================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# ============================================
# Environment
# ============================================
NEXT_PUBLIC_APP_URL=https://skinseoul.vercel.app
NODE_ENV=production
```

### 10.2 Optional Variables (Phase 2+)

```bash
# ============================================
# Affiliate Programs (Phase 2)
# ============================================
AMAZON_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
AMAZON_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AMAZON_PARTNER_TAG=skinseoul-20

COUPANG_PARTNER_ID=AF12345678
COUPANG_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

YESSTYLE_AFFILIATE_CODE=SKINSEOUL

# ============================================
# Error Tracking (Optional)
# ============================================
SENTRY_DSN=https://xxxx@sentry.io/xxxxx

# ============================================
# Email (Phase 2)
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 10.3 Environment Variable Types

```typescript
// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // OpenAI
    OPENAI_API_KEY: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Analytics
    NEXT_PUBLIC_GA_ID: string;

    // App
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
```

### 10.4 Vercel Environment Setup

```bash
# Set via Vercel CLI
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

---

## 11. Performance Optimization

### 11.1 Image Optimization

| Strategy | Implementation |
|----------|----------------|
| **Next.js Image** | Automatic AVIF/WebP conversion |
| **Lazy Loading** | `loading="lazy"` on below-fold images |
| **Responsive Sizes** | `sizes` prop for viewport-based loading |
| **Blur Placeholder** | `placeholder="blur"` for product images |

```typescript
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
  placeholder="blur"
  blurDataURL={product.blurHash}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 11.2 Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const CameraCapture = dynamic(
  () => import('@/components/analyze/CameraCapture'),
  {
    loading: () => <CameraSkeleton />,
    ssr: false  // Camera requires client-side
  }
);

const AnalysisResults = dynamic(
  () => import('@/components/results/AnalysisResults'),
  { loading: () => <ResultsSkeleton /> }
);
```

### 11.3 API Caching

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await fetchProducts();

  return NextResponse.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 11.4 Database Optimization

```sql
-- Indexes for product queries
CREATE INDEX idx_products_ingredients ON products USING GIN (ingredients);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_rating ON products (rating DESC);

-- Composite index for filtered queries
CREATE INDEX idx_products_category_rating ON products (category, rating DESC);
```

### 11.5 Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

**Target Bundle Sizes:**
| Chunk | Target | Current |
|-------|--------|---------|
| First Load JS | < 100KB | TBD |
| Page JS (avg) | < 50KB | TBD |
| Total CSS | < 30KB | TBD |

---

## 12. Security Measures

### 12.1 Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; timestamp: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/analyze')) {
    const ip = request.ip ?? 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;

    const current = rateLimit.get(ip);

    if (current && now - current.timestamp < windowMs) {
      if (current.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
      current.count++;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
  }

  return NextResponse.next();
}
```

### 12.2 Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const analyzeImageSchema = z.object({
  imageBase64: z
    .string()
    .min(1, 'Image required')
    .refine(
      (val) => val.startsWith('data:image/'),
      'Invalid image format'
    )
    .refine(
      (val) => val.length < 10 * 1024 * 1024 * 1.37, // ~10MB in Base64
      'Image too large (max 10MB)'
    ),
});

export const productQuerySchema = z.object({
  ingredient: z.string().optional(),
  category: z.enum(['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask']).optional(),
  sortBy: z.enum(['popularity', 'rating', 'price_asc', 'price_desc']).optional(),
  limit: z.number().min(1).max(50).optional().default(20),
});
```

### 12.3 Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 12.4 CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 12.5 No Image Storage Policy

```typescript
// API route ensures no persistence
export async function POST(request: NextRequest) {
  const { imageBase64 } = await request.json();

  try {
    // Process with OpenAI
    const result = await analyzeWithOpenAI(imageBase64);

    // Image is NOT saved anywhere
    // Only the analysis result is returned

    return NextResponse.json({ analysis: result });
  } finally {
    // Explicit cleanup (for documentation)
    // imageBase64 is garbage collected after function scope
  }
}
```

---

## 13. Deployment Pipeline

### 13.1 Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ Local Development│                                           │
│  │   npm run dev    │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼ git push                                             │
│  ┌──────────────────┐                                           │
│  │ GitHub Repository│                                           │
│  │   main branch    │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ▼ Webhook trigger                                      │
│  ┌──────────────────┐                                           │
│  │   Vercel Build   │                                           │
│  │  - npm install   │                                           │
│  │  - npm run build │                                           │
│  │  - Type check    │                                           │
│  │  - Lint check    │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           ├─────────────────────┐                                │
│           ▼                     ▼                                │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Preview Deploy   │  │ Production Deploy│                     │
│  │ (PR branches)    │  │ (main branch)    │                     │
│  │                  │  │                  │                     │
│  │ skinseoul-xxx.   │  │ skinseoul.       │                     │
│  │ vercel.app       │  │ vercel.app       │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Branch Strategy

| Branch | Purpose | Deploy Target |
|--------|---------|---------------|
| `main` | Production code | Production |
| `develop` | Integration | Preview |
| `feature/*` | New features | Preview |
| `fix/*` | Bug fixes | Preview |

### 13.3 Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1", "hnd1", "sin1"]
}
```

### 13.4 Domain Configuration

| Domain | Environment | Status |
|--------|-------------|--------|
| `skinseoul.vercel.app` | Production | Default |
| `skinseoul.ai` | Production | Phase 2 (custom domain) |
| `*.vercel.app` | Preview | Automatic |

---

## 14. API Rate Limits & Costs

### 14.1 OpenAI Vision API

| Tier | Rate Limit | Monthly Limit |
|------|------------|---------------|
| Tier 1 (Free) | 3 RPM | $100 |
| Tier 2 (Pay) | 500 RPM | $500 |
| Tier 3 | 5,000 RPM | $1,000 |

**Cost Calculation:**

| Component | Cost |
|-----------|------|
| Input tokens | $2.50 / 1M tokens |
| Output tokens | $10.00 / 1M tokens |
| Image (low detail) | ~85 tokens |
| Image (high detail) | ~765 tokens |

**Per Analysis Estimate:**
- Image input: ~1,000 tokens
- Text prompt: ~200 tokens
- Output: ~500 tokens
- **Total cost:** ~$0.01275 per analysis

**Monthly Budget (1,000 analyses):** $12.75

### 14.2 Supabase Free Tier

| Resource | Limit | Upgrade Trigger |
|----------|-------|-----------------|
| Database size | 500 MB | >400MB used |
| API requests | 500K/month | >400K used |
| Bandwidth | 2 GB | >1.5GB used |
| File storage | 1 GB | Not used (MVP) |
| Edge Functions | 500K/month | Not used (MVP) |

**Estimated Usage:**
- 50 products × 1KB = 50KB
- 1,000 analytics rows × 0.5KB = 500KB
- **Total:** ~1MB (0.2% of limit)

### 14.3 Vercel Pro

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Serverless Executions | 1,000/day |
| Build Minutes | 6,000/month |
| Team Members | 1 |

**Monthly Cost:** $20

### 14.4 Cost Summary

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| OpenAI API | ~$13 | 1,000 analyses |
| Supabase | $0 | Free tier |
| Vercel Pro | $20 | Required for analytics |
| Domain (.ai) | ~$7 | Annual ÷ 12 |
| **Total** | **~$40** | |

---

## 15. Scalability Considerations

### 15.1 Current Limits

| Component | Current Capacity | Bottleneck At |
|-----------|------------------|---------------|
| API Routes | 1,000/day | 10,000/day |
| Database | 500MB | 400MB |
| Bandwidth | 100GB | 80GB |
| OpenAI | 500 RPM | Cost ($500+/mo) |

### 15.2 Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Monthly users | 10,000 | Upgrade Supabase to Pro |
| Monthly analyses | 5,000 | Increase OpenAI budget |
| Bandwidth | 80GB | Consider Vercel Enterprise |
| Database size | 400MB | Archive old analytics |

### 15.3 Upgrade Path

```
Phase 1 (MVP)              Phase 2 (Growth)           Phase 3 (Scale)
─────────────────          ─────────────────          ─────────────────
Vercel Pro ($20)     →     Vercel Pro ($20)     →    Vercel Enterprise
Supabase Free        →     Supabase Pro ($25)   →    Supabase Team ($599)
OpenAI Tier 2        →     OpenAI Tier 3        →    HautAI API (backup)

Monthly: $40               Monthly: $100              Monthly: $1,000+
Users: 1,000               Users: 50,000              Users: 500,000+
```

### 15.4 Performance Scaling

| Strategy | Implementation | Trigger |
|----------|----------------|---------|
| **Caching** | Vercel Edge Cache | Immediate |
| **CDN** | Vercel Edge (auto) | Immediate |
| **DB Pooling** | Supabase built-in | >100 concurrent |
| **Read Replicas** | Supabase Pro | >10,000 users |
| **Sharding** | Not needed | >1M users |

---

## 16. Technology Decision Rationale

### 16.1 Why Next.js 14 App Router?

| Factor | Decision |
|--------|----------|
| **Server Components** | Reduce client bundle size |
| **Streaming** | Progressive loading for analysis |
| **Built-in Optimization** | Image, font, script handling |
| **Vercel Integration** | Seamless deployment |
| **i18n Support** | Native route-based localization |

**Alternatives Considered:**
- Remix: Less mature ecosystem
- Astro: Less suited for interactive apps
- SvelteKit: Smaller talent pool

### 16.2 Why Supabase over Prisma?

| Factor | Supabase | Prisma |
|--------|----------|--------|
| **Setup Time** | 5 minutes | 30+ minutes |
| **Hosting** | Included | Separate needed |
| **Auth** | Built-in | Separate needed |
| **Real-time** | Built-in | Extra setup |
| **Cost** | Free tier | DB hosting costs |

**For MVP:** Supabase's simplicity wins.

### 16.3 Why shadcn/ui?

| Factor | shadcn/ui | Material UI | Chakra |
|--------|-----------|-------------|--------|
| **Bundle Size** | Copy what you need | Large | Medium |
| **Customization** | Full control | Theme-based | Limited |
| **Tailwind** | Native | Conflict | Separate |
| **Accessibility** | Radix-based | Good | Good |

**Result:** shadcn/ui provides best balance of customization and accessibility.

### 16.4 Why OpenAI over HautAI?

| Factor | OpenAI Vision | HautAI |
|--------|---------------|--------|
| **Cost** | $0.01/image | $0.05+/image |
| **Accuracy** | Good enough | Professional |
| **Setup** | Simple API | Enterprise sales |
| **Flexibility** | Custom prompts | Fixed metrics |

**MVP Strategy:** Start with OpenAI, validate concept, upgrade to HautAI if accuracy issues arise.

---

## Appendix

### A. Dependency Versions

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.4.0",
    "@supabase/supabase-js": "^2.42.0",
    "openai": "^4.28.0",
    "next-intl": "^3.9.0",
    "react-webcam": "^7.2.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.0",
    "prettier": "^3.2.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### B. Related Documentation

| Document | Path |
|----------|------|
| Product Requirements | `/docs/PRD.md` |
| Database Schema | `/docs/DATABASE_SCHEMA.md` |
| API Specification | `/docs/API_SPECIFICATION.md` |
| UI Wireframes | `/docs/UI_WIREFRAMES.md` |

---

**Document Status:** ✅ Approved for Development
**Next Review:** Post-MVP Launch
