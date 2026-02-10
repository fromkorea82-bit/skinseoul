# Development Plan

## SkinSEOUL - 2-Week MVP Sprint Plan

**Version:** 1.0
**Last Updated:** February 2026
**Sprint Duration:** 14 days
**Goal:** Launch functional MVP with AI skin analysis and product recommendations

---

## Table of Contents

1. [Timeline Overview](#1-timeline-overview)
2. [Daily Breakdown](#2-daily-breakdown)
3. [Milestones](#3-milestones)
4. [Claude Code Task List](#4-claude-code-task-list)
5. [Risk Management](#5-risk-management)
6. [Success Criteria & Launch Checklist](#6-success-criteria--launch-checklist)

---

## 1. Timeline Overview

### 1.1 Sprint Map

```
WEEK 1: FOUNDATION + CORE                    WEEK 2: FEATURES + LAUNCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day  1    2    3    4    5    6    7    8    9   10   11   12   13   14
     │    │    │    │    │    │    │    │    │    │    │    │    │    │
     ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
   ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
   │INIT│CAM │ DB │ AI │CORE│PROD│i18n│SEO │TEST│BETA│ FIX│SEED│ QA │SHIP│
   └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
     ▲                   ▲              ▲         ▲                   ▲
     │                   │              │         │                   │
   M1: Scaffold       M2: Core       M3: Full  M4: Beta          M5: LAUNCH
                       Flow           Feature   Ready

LEGEND:
  INIT = Project setup         AI   = OpenAI integration    SEO  = SEO & meta
  CAM  = Camera/upload         CORE = Core flow end-to-end  TEST = Testing
  DB   = Database setup        PROD = Product recs          BETA = Beta testing
  i18n = Multi-language        FIX  = Bug fixes             SEED = Content seeding
                               QA   = Quality assurance     SHIP = Deploy & launch
```

### 1.2 Phase Summary

| Phase | Days | Focus | Deliverable |
|-------|------|-------|-------------|
| **Foundation** | 1-3 | Setup, UI, Database | Scaffold + DB ready |
| **Core Engine** | 4-5 | AI analysis, results | End-to-end flow works |
| **Features** | 6-8 | Products, i18n, SEO | Feature-complete app |
| **Polish** | 9-11 | Testing, beta, fixes | Beta-ready build |
| **Launch** | 12-14 | Content, QA, deploy | Public launch |

---

## 2. Daily Breakdown

---

### DAY 1 — Project Setup & Landing Page

**Goal:** Fully scaffolded Next.js project with landing page live on Vercel preview.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Next.js + TypeScript     │    │ Landing page UI          │
│ Tailwind CSS setup       │    │ Header + Footer          │
│ shadcn/ui init           │    │ Hero, How It Works,      │
│ Project structure        │    │ Features sections        │
│ ESLint + Prettier        │    │ Vercel initial deploy    │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Initialize Next.js 14 project with TypeScript and App Router
- [ ] Install and configure Tailwind CSS 3.4+
- [ ] Initialize shadcn/ui with rose theme
- [ ] Create project folder structure (`components/`, `lib/`, `types/`, `hooks/`, `contexts/`)
- [ ] Set up ESLint and Prettier with project rules
- [ ] Create root layout with Inter font and metadata
- [ ] Build `Header` component with logo and language selector placeholder
- [ ] Build `Footer` component with links and disclaimer
- [ ] Build landing page with Hero, How It Works (3 steps), and Features (4 cards)
- [ ] Create primary CTA button ("Analyze My Skin") linking to `/analyze`
- [ ] Deploy to Vercel and verify preview URL works
- [ ] Create `.env.example` with all required variables

**Acceptance:** Landing page is live on Vercel preview, responsive on mobile and desktop.

---

### DAY 2 — Camera Capture & Image Upload

**Goal:** Users can take a photo or upload an image with full validation.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ react-webcam setup       │    │ Image preview component  │
│ Camera capture component │    │ File validation (Zod)    │
│ Camera permissions       │    │ Privacy notice UI        │
│ Mobile camera handling   │    │ Retake/re-upload flow    │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Install react-webcam and configure camera access
- [ ] Build `CameraCapture` component with live preview
- [ ] Build `FileUpload` component with drag-and-drop zone
- [ ] Implement file validation with Zod (JPEG/PNG, max 10MB)
- [ ] Build `ImagePreview` component with captured/uploaded photo display
- [ ] Add retake and re-upload actions
- [ ] Build `PrivacyNotice` component with consent text
- [ ] Create `/analyze` page assembling all capture components
- [ ] Handle camera permission denied state
- [ ] Test on mobile Safari and Android Chrome

**Acceptance:** Photo capture and upload works on both desktop and mobile with validation.

---

### DAY 3 — Database Setup & Seed Data

**Goal:** Supabase database fully configured with 50 products seeded.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Supabase project setup   │    │ Seed 50 products         │
│ Run migration 001        │    │ Seed 20 ingredients      │
│ Create Supabase client   │    │ Verify RLS policies      │
│ TypeScript types         │    │ Test queries from app    │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Create Supabase project and get credentials
- [ ] Add Supabase env vars to `.env.local` and Vercel
- [ ] Run migration `001_initial_schema.sql` (products, ingredient_library, analyses)
- [ ] Install `@supabase/supabase-js` and create client in `lib/supabase.ts`
- [ ] Create TypeScript types in `types/database.ts`
- [ ] Seed 50 K-Beauty products with affiliate links and multi-language descriptions
- [ ] Seed 20+ ingredients with concern mappings and descriptions
- [ ] Enable and verify RLS policies
- [ ] Create database triggers (updated_at, popularity increment)
- [ ] Test product queries and ingredient lookups from the app

**Acceptance:** All tables exist, 50 products and 20 ingredients seeded, queries work from Next.js.

---

### DAY 4 — AI Skin Analysis Integration

**Goal:** OpenAI Vision API analyzes photos and returns structured skin concern data.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ OpenAI SDK setup         │    │ API route implementation │
│ Prompt engineering       │    │ Response parsing         │
│ JSON schema validation   │    │ Error handling           │
│ Test with sample photos  │    │ Loading state UI         │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Install OpenAI SDK and create client in `lib/openai.ts`
- [ ] Implement system prompt and analysis prompt from PROMPTS.md
- [ ] Create `POST /api/analyze-skin` route with input validation
- [ ] Implement Base64 image handling (no server storage)
- [ ] Parse and validate JSON response from OpenAI
- [ ] Build error handling for API failures, timeouts, rate limits
- [ ] Build loading/analyzing page with progress steps animation
- [ ] Test with 5+ sample photos and verify concern detection
- [ ] Implement rate limiting middleware (10 req/min per IP)
- [ ] Add `processing_time_ms` tracking

**Acceptance:** Upload a photo → receive JSON analysis with concerns, scores, and skin type in <10s.

---

### DAY 5 — Results Page & Core Flow

**Goal:** Complete user journey from photo upload to analysis results displayed.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Results page layout      │    │ Ingredient section       │
│ Score card component     │    │ Concern→ingredient map   │
│ Concern cards            │    │ Ingredient cards         │
│ Severity bars            │    │ Full flow testing        │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Build `/results` page layout
- [ ] Build `ScoreCard` component (overall score circle, skin type badge)
- [ ] Build `ConcernCard` component (severity bar, location, description)
- [ ] Build concerns section displaying all detected concerns
- [ ] Implement concern-to-ingredient mapping logic in `lib/recommendation.ts`
- [ ] Build `IngredientCard` component (priority badge, match score, explanation)
- [ ] Build ingredients section with top 3-5 recommendations
- [ ] Wire up full flow: Landing → Camera → Analysis → Results
- [ ] Store analysis results in `analyses` table
- [ ] Add "See Products" CTA button per ingredient and "New Analysis" button

**Acceptance:** End-to-end flow works: take photo → see concerns → see ingredient recommendations.

---

### DAY 6 — Product Recommendations

**Goal:** Product grid displays K-Beauty products filtered by recommended ingredients.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Products API route       │    │ Product grid page        │
│ Query by ingredient      │    │ Product card component   │
│ Filtering & sorting      │    │ Affiliate link tracking  │
│ Pagination               │    │ Results→Products flow    │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Create `GET /api/products` route with query params (ingredient, category, sort, pagination)
- [ ] Implement Supabase queries with filtering, sorting, and pagination
- [ ] Build `/products` page with grid layout
- [ ] Build `ProductCard` component (image, brand, name, rating, price, buy button)
- [ ] Build `FilterBar` component (ingredient filter, category filter, sort dropdown)
- [ ] Implement affiliate link generation in `lib/affiliate.ts`
- [ ] Add affiliate click tracking via `POST /api/track-event`
- [ ] Wire "See Products" buttons from ingredients to filtered product view
- [ ] Handle empty states (no matching products)
- [ ] Test pagination and all sort options

**Acceptance:** Users can view products filtered by ingredient with working affiliate links and tracking.

---

### DAY 7 — Multi-Language Support

**Goal:** Full UI translated to English, Japanese, and Chinese (Simplified).

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ next-intl setup          │    │ Translate all strings    │
│ Locale routing           │    │ Ingredient descriptions  │
│ Language selector        │    │ AI response localization │
│ Middleware               │    │ Test all 3 languages     │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Install and configure next-intl with App Router
- [ ] Create locale middleware for `en`, `ja`, `zh-CN`
- [ ] Build complete English translation file (`en.json`)
- [ ] Build complete Japanese translation file (`ja.json`)
- [ ] Build complete Chinese translation file (`zh-CN.json`)
- [ ] Build `LanguageSelector` component with flag icons
- [ ] Update all pages and components to use `useTranslations()`
- [ ] Add `?lang=` URL parameter persistence
- [ ] Implement browser language auto-detection on first visit
- [ ] Verify all 3 languages render correctly on every page

**Acceptance:** App fully usable in English, Japanese, and Chinese. Language persists across pages.

---

### DAY 8 — SEO, Meta Tags & Analytics

**Goal:** App is SEO-optimized with analytics tracking all key events.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Meta tags (OG, Twitter)  │    │ Analytics integration    │
│ Structured data (JSON-LD)│    │ Event tracking           │
│ Sitemap + robots.txt     │    │ Track: analysis, clicks  │
│ Semantic HTML audit      │    │ Vercel Analytics setup   │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Add Open Graph meta tags to all pages (title, description, image)
- [ ] Add Twitter Card meta tags
- [ ] Implement JSON-LD structured data (Organization, WebApplication)
- [ ] Generate `sitemap.xml` via Next.js config
- [ ] Create `robots.txt`
- [ ] Audit and fix semantic HTML (heading hierarchy, landmarks)
- [ ] Set up Google Analytics 4 with `NEXT_PUBLIC_GA_ID`
- [ ] Enable Vercel Analytics
- [ ] Build `lib/analytics.ts` with `trackEvent()` function
- [ ] Implement event tracking for: page views, analysis start/complete, ingredient views, product clicks, affiliate clicks
- [ ] Create `POST /api/track-event` route
- [ ] Test tracking fires correctly for all events

**Acceptance:** All pages have proper meta tags. Analytics captures full user funnel.

---

### DAY 9 — Testing & Quality Assurance

**Goal:** All features tested and bugs documented for fixing.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Manual testing: full flow│    │ AI accuracy testing      │
│ Mobile testing           │    │ Edge case testing        │
│ Cross-browser testing    │    │ Bug list compilation     │
│ Accessibility audit      │    │ Performance audit        │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Full flow manual test: landing → camera → analysis → results → products → affiliate
- [ ] Test on iPhone Safari (iOS 14+)
- [ ] Test on Android Chrome
- [ ] Test on Desktop Chrome, Firefox, Safari, Edge
- [ ] Run AI analysis on 10 test photos, verify accuracy
- [ ] Test edge cases: no face, poor lighting, side angle, with glasses
- [ ] Accessibility audit: keyboard navigation, screen reader, color contrast
- [ ] Run Lighthouse audit, note scores
- [ ] Test all 3 languages end-to-end
- [ ] Test rate limiting (11+ requests in 1 minute)
- [ ] Test error states: API failure, timeout, invalid image
- [ ] Compile bug list with priority: Critical / High / Medium / Low

**Acceptance:** Bug list created. No critical bugs. Lighthouse Performance 90+.

---

### DAY 10 — Beta Testing & Bug Fixes

**Goal:** External beta testers use the app. Critical and high-priority bugs fixed.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Fix critical bugs        │    │ Beta user testing (5-10) │
│ Fix high-priority bugs   │    │ Collect feedback         │
│ Performance optimization │    │ Fix beta-reported issues │
│ Loading state polish     │    │ Prompt iteration if needed│
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Fix all critical bugs from Day 9 testing
- [ ] Fix all high-priority bugs
- [ ] Optimize Largest Contentful Paint (target <2.5s)
- [ ] Add skeleton loading states for product grid
- [ ] Share beta URL with 5-10 external testers
- [ ] Collect beta feedback via form or direct messages
- [ ] Fix any beta-reported critical issues
- [ ] Iterate AI prompt if accuracy feedback is poor
- [ ] Optimize images with `next/image` and proper sizing
- [ ] Fix any mobile-specific layout issues

**Acceptance:** Beta testers can complete full flow. No critical bugs remaining.

---

### DAY 11 — Content Seeding & Affiliate Setup

**Goal:** All 50 products have verified affiliate links. Content finalized.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Verify all affiliate URLs│    │ Product descriptions     │
│ Update broken links      │    │ Ingredient descriptions  │
│ Add product images       │    │ Landing page copy final  │
│ Price verification       │    │ Disclaimer text final    │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Verify all 50 product affiliate links are valid (click-test each)
- [ ] Replace any placeholder image URLs with real product images
- [ ] Verify product prices are current
- [ ] Complete all product descriptions in English, Korean
- [ ] Complete all ingredient descriptions in English, Korean
- [ ] Finalize Japanese and Chinese translations
- [ ] Finalize landing page marketing copy
- [ ] Finalize privacy policy text
- [ ] Finalize disclaimer / terms of service text
- [ ] Fix any remaining medium-priority bugs

**Acceptance:** All content finalized. All affiliate links verified working.

---

### DAY 12 — Final Polish & Performance

**Goal:** App feels polished and performant. Production-ready.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ UI polish pass           │    │ Security audit           │
│ Animation refinement     │    │ Final performance check  │
│ Error message polish     │    │ Environment variables    │
│ Empty state handling     │    │ Production config verify │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] UI polish pass: spacing, alignment, consistency
- [ ] Refine loading/transition animations
- [ ] Polish error messages for user-friendliness
- [ ] Verify all empty states have proper messaging
- [ ] Security audit: no exposed API keys, CORS configured, rate limiting active
- [ ] Verify all env vars set in Vercel production environment
- [ ] Verify `next.config.js` security headers
- [ ] Final Lighthouse audit (target: Performance 90+, Accessibility 90+, SEO 90+)
- [ ] Test production build locally (`npm run build && npm start`)
- [ ] Fix any remaining low-priority bugs

**Acceptance:** Lighthouse scores 90+ across all categories. Production build runs without errors.

---

### DAY 13 — Pre-Launch QA & Staging

**Goal:** Final QA on production-like environment. Go/No-Go decision.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ Full regression test     │    │ Go/No-Go checklist       │
│ Production deploy (staging)│  │ Prepare launch materials │
│ Test on production URL   │    │ Reddit/Instagram drafts  │
│ Monitor error logs       │    │ Final sign-off           │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Full regression test of all features on preview deployment
- [ ] Promote to production deployment
- [ ] Test full flow on production URL
- [ ] Verify analytics events fire on production
- [ ] Verify affiliate links track correctly
- [ ] Monitor Vercel logs and Sentry for errors
- [ ] Run Go/No-Go checklist (see Section 6)
- [ ] Draft Reddit post for r/AsianBeauty
- [ ] Draft Reddit post for r/SkincareAddiction
- [ ] Prepare Instagram launch content
- [ ] Create OpenGraph image for social sharing
- [ ] Final team sign-off: GO or NO-GO

**Acceptance:** Go/No-Go checklist passes. Production URL works flawlessly.

---

### DAY 14 — LAUNCH

**Goal:** SkinSEOUL is live and users are analyzing their skin.

```
Morning                          Afternoon
┌──────────────────────────┐    ┌──────────────────────────┐
│ 🚀 Production launch     │    │ Community engagement     │
│ Post to Reddit           │    │ Monitor analytics        │
│ Post to Instagram        │    │ Respond to feedback      │
│ Share with networks      │    │ Hotfix if needed         │
└──────────────────────────┘    └──────────────────────────┘
```

#### Tasks
- [ ] Final production check — site is live and working
- [ ] Post to Reddit r/AsianBeauty
- [ ] Post to Reddit r/SkincareAddiction
- [ ] Post to Instagram with K-Beauty hashtags
- [ ] Share launch on personal networks
- [ ] Monitor real-time analytics (users, analyses, clicks)
- [ ] Monitor error tracking for any production issues
- [ ] Respond to Reddit comments and questions
- [ ] Deploy hotfix for any critical issues found post-launch
- [ ] Document lessons learned and plan Week 3 priorities

**Acceptance:** App is live, users are completing analyses, affiliate links generating clicks.

---

## 3. Milestones

### 3.1 Milestone Schedule

```
Day  1         3           5              7          10         14
 │          │           │              │          │          │
 ▼          ▼           ▼              ▼          ▼          ▼
┌────┐   ┌────┐     ┌──────┐      ┌──────┐  ┌──────┐  ┌──────┐
│ M1 │   │ M2 │     │  M3  │      │  M4  │  │  M5  │  │  M6  │
│    │   │    │     │      │      │      │  │      │  │      │
│SCAF│   │ DB │     │ CORE │      │ FEAT │  │ BETA │  │LAUNCH│
│FOLD│   │DONE│     │ FLOW │      │ DONE │  │READY │  │  🚀  │
└────┘   └────┘     └──────┘      └──────┘  └──────┘  └──────┘
```

### 3.2 Milestone Details

| # | Milestone | Day | Criteria | Blocker If Missed |
|---|-----------|-----|----------|-------------------|
| M1 | **Scaffold Complete** | 1 | Landing page live on Vercel | Everything blocked |
| M2 | **Database Ready** | 3 | 50 products, 20 ingredients seeded | AI integration delayed |
| M3 | **Core Flow Working** | 5 | Photo → Analysis → Results → Ingredients | Product recs delayed |
| M4 | **Feature Complete** | 7 | Products, i18n, full flow | Polish time reduced |
| M5 | **Beta Ready** | 10 | External testers can use app | Launch delayed |
| M6 | **Public Launch** | 14 | App live, users converting | Sprint failed |

### 3.3 Critical Path

```
M1 → M3 → M6 (minimum viable path)

M1: Project Setup (Day 1)
 └──▶ Camera/Upload (Day 2)
       └──▶ AI Integration (Day 4)
             └──▶ Results Page (Day 5) = M3
                   └──▶ Bug Fixes (Day 10-12)
                         └──▶ Launch (Day 14) = M6

Parallel track (can be done independently):
M1 → Database Setup (Day 3) = M2
M3 → Products (Day 6)
M3 → i18n (Day 7)
M3 → SEO (Day 8)
```

---

## 4. Claude Code Task List

### 4.1 Execution Order

Tasks are numbered for sequential execution with Claude Code. Each task includes acceptance criteria and dependencies.

---

#### Phase 0: Documentation (COMPLETED)

| Task | Description | Status |
|------|-------------|--------|
| 0-1 | Create PRD.md | ✅ Done |
| 0-2 | Create TECH_STACK.md | ✅ Done |
| 0-3 | Create DATABASE_SCHEMA.md | ✅ Done |
| 0-4 | Create API_SPECIFICATION.md | ✅ Done |
| 0-5 | Create UI_WIREFRAMES.md | ✅ Done |
| 0-6 | Create PROMPTS.md | ✅ Done |
| 0-7 | Create DEVELOPMENT_PLAN.md | ✅ Done |

---

#### Phase 1: Project Setup (Day 1)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 1-1 | **Initialize Next.js project** | — | Next.js 14 app with TypeScript, Tailwind, App Router runs locally |
| 1-2 | **Configure shadcn/ui** | 1-1 | shadcn/ui initialized with rose theme, Button/Card/Select components added |
| 1-3 | **Create project structure** | 1-1 | All folders created (`components/`, `lib/`, `types/`, `hooks/`, `contexts/`) |
| 1-4 | **Build Header & Footer** | 1-2 | Header with logo + language placeholder, Footer with disclaimer renders |
| 1-5 | **Build Landing Page** | 1-4 | Hero, How It Works, Features sections render, responsive on mobile |
| 1-6 | **Deploy to Vercel** | 1-5 | Preview URL is accessible and renders correctly |

---

#### Phase 2: Camera & Upload (Day 2)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 2-1 | **Build CameraCapture component** | 1-3 | react-webcam shows live preview, capture works on mobile |
| 2-2 | **Build FileUpload component** | 1-3 | Drag-and-drop and click-to-upload work, JPEG/PNG validation |
| 2-3 | **Build ImagePreview component** | 2-1, 2-2 | Shows captured/uploaded image with retake option |
| 2-4 | **Build Analyze page** | 2-1, 2-2, 2-3 | `/analyze` page with camera, upload, preview, privacy notice |
| 2-5 | **Image validation** | 2-4 | Zod schema rejects >10MB, non-JPEG/PNG, shows error message |

---

#### Phase 3: Database (Day 3)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 3-1 | **Supabase setup** | 1-1 | Project created, env vars configured, client connects |
| 3-2 | **Run initial migration** | 3-1 | products, ingredient_library, analyses tables exist |
| 3-3 | **Create TypeScript types** | 3-2 | All DB types defined in `types/database.ts` |
| 3-4 | **Seed products** | 3-2 | 50 products with affiliate links and descriptions seeded |
| 3-5 | **Seed ingredients** | 3-2 | 20+ ingredients with concern mappings seeded |
| 3-6 | **Enable RLS** | 3-4, 3-5 | RLS policies active, products publicly readable |

---

#### Phase 4: AI Integration (Day 4)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 4-1 | **OpenAI client setup** | 1-1 | OpenAI SDK configured in `lib/openai.ts` |
| 4-2 | **Implement analysis prompts** | 4-1 | System + analysis prompts from PROMPTS.md |
| 4-3 | **Create analyze-skin API route** | 4-2, 2-5 | `POST /api/analyze-skin` accepts Base64, returns JSON analysis |
| 4-4 | **Response parsing & validation** | 4-3 | JSON response validated, malformed responses handled |
| 4-5 | **Rate limiting middleware** | 4-3 | 10 req/min per IP enforced, 429 returned on excess |
| 4-6 | **Build loading page** | 1-2 | Progress animation with steps: uploading → detecting → analyzing |

---

#### Phase 5: Results & Recommendations (Day 5)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 5-1 | **Build ScoreCard component** | 1-2 | Displays overall score and skin type |
| 5-2 | **Build ConcernCard component** | 1-2 | Shows concern type, severity bar, location, description |
| 5-3 | **Build concerns section** | 5-1, 5-2, 4-3 | All detected concerns displayed as cards |
| 5-4 | **Implement recommendation engine** | 3-5 | `lib/recommendation.ts` maps concerns → ingredients |
| 5-5 | **Build IngredientCard component** | 1-2, 5-4 | Priority badge, match score, explanation, "See Products" CTA |
| 5-6 | **Build Results page** | 5-3, 5-5 | `/results` page with score + concerns + ingredients |
| 5-7 | **Wire full flow** | 5-6, 4-6 | Landing → Analyze → Loading → Results works end-to-end |
| 5-8 | **Save analysis to DB** | 5-7, 3-1 | Analysis stored in analyses table |

---

#### Phase 6: Products (Day 6)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 6-1 | **Create products API route** | 3-4 | `GET /api/products` with filtering, sorting, pagination |
| 6-2 | **Build ProductCard component** | 1-2 | Image, brand, name, rating, price, buy button |
| 6-3 | **Build ProductGrid** | 6-2 | 3-col desktop, 2-col tablet, 1-col mobile grid |
| 6-4 | **Build FilterBar** | 1-2 | Ingredient, category, sort dropdowns |
| 6-5 | **Build Products page** | 6-1, 6-3, 6-4 | `/products` page with filtered grid |
| 6-6 | **Affiliate link tracking** | 6-5 | Click tracking via `/api/track-event`, links open in new tab |
| 6-7 | **Wire results to products** | 5-5, 6-5 | "See Products" on ingredient → filtered product page |

---

#### Phase 7: Internationalization (Day 7)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 7-1 | **next-intl setup** | 1-1 | Locale routing works for en, ja, zh-CN |
| 7-2 | **Create translation files** | 7-1 | `en.json`, `ja.json`, `zh-CN.json` with all UI strings |
| 7-3 | **Build LanguageSelector** | 7-1 | Dropdown in header switches language, persists in URL |
| 7-4 | **Translate all components** | 7-2 | All hardcoded strings replaced with `useTranslations()` |
| 7-5 | **Verify all languages** | 7-4 | All 3 languages render correctly on every page |

---

#### Phase 8: SEO & Analytics (Day 8)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 8-1 | **Meta tags** | 1-1 | OG + Twitter Card tags on all pages |
| 8-2 | **Structured data** | 8-1 | JSON-LD for Organization and WebApplication |
| 8-3 | **Sitemap & robots.txt** | 8-1 | `/sitemap.xml` and `/robots.txt` generated |
| 8-4 | **Analytics setup** | 1-1 | GA4 + Vercel Analytics tracking page views |
| 8-5 | **Event tracking** | 8-4 | All funnel events tracked (analysis, clicks, affiliate) |
| 8-6 | **Track-event API** | 8-5 | `POST /api/track-event` stores events |

---

#### Phase 9: Testing & Polish (Days 9-12)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 9-1 | **Manual testing** | All above | Full flow tested on 4+ browsers/devices |
| 9-2 | **AI accuracy testing** | 4-3 | 10 test photos analyzed, 80%+ accuracy |
| 9-3 | **Accessibility audit** | All above | Keyboard nav works, ARIA labels present, contrast passes |
| 9-4 | **Performance optimization** | All above | Lighthouse Performance 90+ |
| 9-5 | **Bug fixes (critical)** | 9-1 | All critical bugs resolved |
| 9-6 | **Bug fixes (high)** | 9-5 | All high-priority bugs resolved |
| 9-7 | **Content finalization** | 3-4, 3-5 | All product/ingredient content verified and complete |
| 9-8 | **Security audit** | All above | No exposed keys, CORS configured, headers set |

---

#### Phase 10: Launch (Days 13-14)

| Task | Description | Depends On | Acceptance Criteria |
|------|-------------|------------|---------------------|
| 10-1 | **Final regression test** | 9-1 through 9-8 | Full flow works on production |
| 10-2 | **Production deployment** | 10-1 | Main branch deployed to production |
| 10-3 | **Go/No-Go decision** | 10-2 | All launch criteria met |
| 10-4 | **Social media launch** | 10-3 | Reddit + Instagram posts published |
| 10-5 | **Monitor & hotfix** | 10-4 | Real-time monitoring, hotfix if needed |

---

### 4.2 Task Dependency Graph

```
Phase 0 (Docs) ─────────────────────────────────────────────────────────
    ✅ Complete

Phase 1 (Setup) ────────────────────────────────────────────────────────
    1-1 ──▶ 1-2 ──▶ 1-4 ──▶ 1-5 ──▶ 1-6
    1-1 ──▶ 1-3

Phase 2 (Camera) ───────────────────────────────────────────────────────
    1-3 ──▶ 2-1 ──┐
    1-3 ──▶ 2-2 ──┼──▶ 2-3 ──▶ 2-4 ──▶ 2-5
                  │
Phase 3 (DB) ───────────────────────────────────────────────────────────
    1-1 ──▶ 3-1 ──▶ 3-2 ──▶ 3-3
                    3-2 ──▶ 3-4 ──┐
                    3-2 ──▶ 3-5 ──┼──▶ 3-6
                                  │
Phase 4 (AI) ───────────────────────────────────────────────────────────
    1-1 ──▶ 4-1 ──▶ 4-2 ──▶ 4-3 ──▶ 4-4
    2-5 ──▶ 4-3         4-3 ──▶ 4-5
                        1-2 ──▶ 4-6

Phase 5 (Results) ──────────────────────────────────────────────────────
    1-2 ──▶ 5-1 ──┐
    1-2 ──▶ 5-2 ──┼──▶ 5-3 ──┐
    4-3 ──────────┘           │
    3-5 ──▶ 5-4 ──▶ 5-5 ─────┼──▶ 5-6 ──▶ 5-7 ──▶ 5-8
                              │
Phase 6 (Products) ─────────────────────────────────────────────────────
    3-4 ──▶ 6-1 ──────▶ 6-5 ──▶ 6-6
    1-2 ──▶ 6-2 ──▶ 6-3 ──▶ 6-5
    1-2 ──▶ 6-4 ──────────▶ 6-5
    5-5 + 6-5 ──▶ 6-7

Phase 7-8 (i18n, SEO) ─────────────────────────────────────────────────
    Can run in parallel after Phase 5

Phase 9-10 (Testing, Launch) ──────────────────────────────────────────
    All above ──▶ 9-1 ──▶ ... ──▶ 10-4 ──▶ 10-5
```

---

## 5. Risk Management

### 5.1 Risk Matrix

| # | Risk | Probability | Impact | Score | Mitigation |
|---|------|-------------|--------|-------|------------|
| R1 | OpenAI API key issues or quota limits | Medium | Critical | **High** | Set up key early (Day 1), monitor usage |
| R2 | Camera API not working on mobile Safari | Medium | High | **High** | Test Day 2, fallback to upload-only |
| R3 | AI analysis accuracy below 60% | Medium | High | **High** | Iterate prompts daily, lower confidence threshold |
| R4 | Supabase free tier limits hit | Low | Medium | **Low** | Start with 50 products, monitor usage |
| R5 | Affiliate link approval delayed | Medium | Medium | **Medium** | Use direct product links as fallback |
| R6 | Translation quality issues | Medium | Low | **Low** | Start English-only, add i18n Day 7 |
| R7 | Vercel deployment issues | Low | High | **Medium** | Test deployment Day 1, have Netlify backup |
| R8 | Scope creep (adding Phase 2 features) | High | Medium | **High** | Strict scope: MVP only, track in backlog |
| R9 | Base64 image too large for API | Medium | Medium | **Medium** | Client-side resize before upload |
| R10 | Legal concerns about skin analysis | Low | High | **Medium** | Add disclaimers Day 1, avoid medical terms |

### 5.2 Contingency Plans

#### If Camera Doesn't Work on Mobile (R2)

```
Plan A: react-webcam with getUserMedia  ← Primary
Plan B: native <input type="file" capture="user">  ← Fallback
Plan C: Upload-only mode on mobile  ← Last resort
```

#### If AI Accuracy is Poor (R3)

```
Day 4: Test with initial prompt
Day 5: Iterate prompt based on results
Day 6: Add scoring anchors and constraints
Day 7: Consider simplified concern list (5 instead of 8)
Day 9: Lower confidence display threshold to 0.7
```

#### If Behind Schedule

```
Day 7 checkpoint — if behind:
  - Cut: i18n (add post-launch)
  - Cut: Analytics (add post-launch)
  - Focus: Core flow + products only

Day 10 checkpoint — if behind:
  - Cut: SEO optimization (add post-launch)
  - Cut: Some product seed data (launch with 20)
  - Focus: Working flow + critical bugs
```

### 5.3 Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| Day 1 | - | - | - |

*Updated as decisions are made during the sprint.*

---

## 6. Success Criteria & Launch Checklist

### 6.1 Launch Go/No-Go Checklist

#### Must Pass (All required for launch)

```
FUNCTIONALITY
─────────────
[ ] Landing page loads correctly on desktop and mobile
[ ] Photo capture works on at least 2 mobile browsers
[ ] Photo upload works with drag-and-drop and click
[ ] AI analysis completes in <15 seconds
[ ] Analysis results display concerns with scores
[ ] Ingredient recommendations display with explanations
[ ] Product recommendations display with images and prices
[ ] Affiliate links open correct product pages
[ ] At least 30 products are seeded with valid affiliate links
[ ] At least 15 ingredients are seeded with descriptions
[ ] Privacy notice is displayed before photo capture

TECHNICAL
─────────
[ ] No JavaScript console errors on any page
[ ] HTTPS enforced on production
[ ] API keys not exposed in client-side code
[ ] Rate limiting active on /api/analyze-skin
[ ] Lighthouse Performance score ≥ 85
[ ] Lighthouse Accessibility score ≥ 85
[ ] Production environment variables all set
[ ] Error handling works (API timeout, invalid image)

CONTENT & LEGAL
───────────────
[ ] "For educational purposes only" disclaimer visible
[ ] "Consult a dermatologist" notice on results page
[ ] Privacy policy text present
[ ] No broken images on any page
[ ] All visible text is proofread (English at minimum)

AI QUALITY
──────────
[ ] 10 test photos analyzed with 70%+ accuracy
[ ] No medical diagnosis language in AI responses
[ ] Confidence scores correctly suppress low-confidence concerns
[ ] JSON responses parse correctly 100% of the time
```

#### Should Pass (Important but not blocking)

```
[ ] All 50 products seeded with complete data
[ ] All 3 languages fully translated
[ ] Lighthouse Performance score ≥ 90
[ ] Analytics tracking all key events
[ ] Animations smooth on mobile
[ ] SEO meta tags on all pages
[ ] Sitemap.xml generated
[ ] Mobile camera switching (front/back) works
```

### 6.2 Post-Launch Success Metrics (Week 3+)

| Metric | Day 1 Target | Week 1 Target | Month 1 Target |
|--------|-------------|---------------|----------------|
| Unique visitors | 50+ | 300+ | 1,000+ |
| Analyses completed | 20+ | 150+ | 600+ |
| Product page views | 10+ | 100+ | 500+ |
| Affiliate clicks | 5+ | 50+ | 200+ |
| Avg session time | 2+ min | 3+ min | 3+ min |
| Error rate | <5% | <3% | <1% |

### 6.3 Post-Launch Priorities (Week 3)

| Priority | Task | Reason |
|----------|------|--------|
| 1 | Fix any production bugs | User retention |
| 2 | Iterate AI prompts based on real usage | Accuracy |
| 3 | Add more products (target 100) | Revenue |
| 4 | SEO blog: "Best K-Beauty for [concern]" | Traffic |
| 5 | Reddit community engagement | Growth |
| 6 | Product Hunt submission prep | Awareness |

---

## Appendix

### A. Tool & Account Setup

Complete before Day 1:

| Service | Action | URL |
|---------|--------|-----|
| **GitHub** | Create repo `skinseoul-ai` | github.com/new |
| **Vercel** | Connect GitHub repo | vercel.com/new |
| **Supabase** | Create new project | supabase.com/dashboard |
| **OpenAI** | Get API key (Tier 2) | platform.openai.com/api-keys |
| **Amazon** | Apply for Associates | affiliate-program.amazon.com |
| **Google** | Create GA4 property | analytics.google.com |

### B. Related Documentation

| Document | Path |
|----------|------|
| Product Requirements | `/docs/PRD.md` |
| Tech Stack | `/docs/TECH_STACK.md` |
| Database Schema | `/docs/DATABASE_SCHEMA.md` |
| API Specification | `/docs/API_SPECIFICATION.md` |
| UI Wireframes | `/docs/UI_WIREFRAMES.md` |
| AI Prompts | `/docs/PROMPTS.md` |

---

**Document Status:** ✅ Approved for Development
**Sprint Start:** TBD
**Last Updated:** February 2026
