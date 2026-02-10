# Product Requirements Document (PRD)

## SkinSEOUL - AI-Powered K-Beauty Skin Analysis & Recommendation Service

**Version:** 1.0
**Last Updated:** February 2026
**Status:** MVP Development
**Timeline:** 2-week MVP development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience](#3-target-audience)
4. [Core Features - MVP (Phase 1)](#4-core-features---mvp-phase-1)
5. [User Journey](#5-user-journey)
6. [Success Metrics](#6-success-metrics)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Out of Scope (Phase 2+)](#8-out-of-scope-phase-2)
9. [Competitive Analysis](#9-competitive-analysis)
10. [Risks & Mitigation](#10-risks--mitigation)
11. [Go-to-Market Strategy](#11-go-to-market-strategy)
12. [Budget (Month 1)](#12-budget-month-1)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

### Product Vision

**SkinSEOUL** is an AI-powered web application that democratizes K-Beauty expertise for international users. By combining advanced computer vision technology with curated K-Beauty product knowledge, we bridge the gap between complex Korean skincare science and global consumers seeking personalized solutions.

**Tagline:** *"Seoul's Secret to Your Best Skin"*

### Mission

To make personalized K-Beauty recommendations accessible to everyone, regardless of language barriers or skincare knowledge level, by leveraging AI to analyze skin concerns and recommend the right ingredients and products.

### Market Opportunity

The global K-Beauty market presents a significant opportunity:

- **Market Size:** K-Beauty market valued at $10.2 billion (2024), projected to reach $18.3 billion by 2030
- **Growth Rate:** 20% year-over-year growth in international markets
- **Digital Adoption:** 73% of skincare consumers research products online before purchase
- **Personalization Demand:** 67% of consumers want personalized skincare recommendations

### Unique Value Proposition

| Factor | Competitors | SkinSEOUL |
|--------|-------------|-----------|
| **Language** | Korean-focused (Hwahae) or English-only | Multi-language (EN, JA, ZH) |
| **Analysis Method** | Complex quizzes or paid subscriptions | Quick AI photo analysis (free) |
| **Product Focus** | Generic global products | Curated K-Beauty specific |
| **Barrier to Entry** | Account creation required | No signup needed |
| **Price** | Subscription models | Free with affiliate monetization |

---

## 2. Problem Statement

### The K-Beauty Paradox

International consumers are increasingly drawn to K-Beauty products but face significant barriers to entry:

#### 2.1 Product Overwhelm
- **10,000+ K-Beauty products** available on international platforms
- New product launches weekly from 500+ Korean brands
- No clear guidance on where to start or what to choose

#### 2.2 Ingredient Information Barrier
- Product labels primarily in Korean
- Technical ingredient names (e.g., "Niacinamide," "Centella Asiatica") are intimidating
- Misinformation about ingredient interactions and effectiveness
- Difficult to match ingredients to specific skin concerns

#### 2.3 Lack of Personalized Guidance
- Existing tools require:
  - Lengthy quizzes (10-20 questions)
  - Account creation and personal data
  - Subscription payments
- Generic recommendations don't account for individual skin conditions
- No visual analysis—users must self-diagnose their concerns

#### 2.4 Market Gap for International Users
- **Hwahae:** Comprehensive but Korean-language only
- **Global apps:** Not K-Beauty focused, recommend Western products
- **Reddit/YouTube:** Helpful but time-consuming, inconsistent advice

### The Solution

SkinSEOUL eliminates these barriers by providing:
- **Instant AI analysis** of skin concerns from a single photo
- **Ingredient education** explaining why specific ingredients help
- **Curated K-Beauty products** with direct purchase links
- **Multi-language support** for international accessibility
- **No account required** for immediate value delivery

---

## 3. Target Audience

### 3.1 Primary Users

#### Demographics
| Attribute | Detail |
|-----------|--------|
| **Age** | 20-40 years old |
| **Gender** | 85% Female, 15% Male |
| **Income** | Middle to upper-middle ($50K-$150K household) |
| **Education** | College-educated |

#### Geographic Distribution
| Region | Percentage | Key Markets |
|--------|------------|-------------|
| **USA** | 40% | California, New York, Texas |
| **Japan** | 30% | Tokyo, Osaka metro areas |
| **Southeast Asia** | 20% | Singapore, Philippines, Thailand, Malaysia |
| **Others** | 10% | UK, Australia, Canada |

#### Psychographics
- **K-Beauty Enthusiasts:** Already familiar with Korean brands, seeking optimization
- **Skincare Ritual Followers:** View skincare as self-care, enjoy the process
- **Ingredient-Conscious:** Read labels, research products before buying
- **Quality Investors:** Willing to spend $50-200/month on skincare

#### Behaviors
- Active on **Reddit** r/AsianBeauty, r/SkincareAddiction
- Watch **YouTube** K-Beauty channels (Edward Avila, Liah Yoo, Beauty Within)
- Follow **Instagram** skincare influencers and K-Beauty brands
- Shop on **YesStyle, Stylevana, Amazon, Olive Young Global**

#### User Persona: "Sarah"
> Sarah, 28, is a marketing manager in Los Angeles. She discovered K-Beauty through YouTube 2 years ago and has a 7-step routine. She struggles with hyperpigmentation and enlarged pores but doesn't know which products to add next. She spends 30 minutes weekly researching new products on Reddit but often feels overwhelmed by conflicting advice.

### 3.2 Secondary Users

#### Male Skincare Beginners
- Age: 25-35
- Just starting skincare journey
- Prefer simple, no-nonsense recommendations
- Looking for 3-step routine maximum

#### K-Beauty Curious (Complete Novices)
- Age: 18-25
- Heard about K-Beauty on TikTok/Instagram
- No existing routine
- Price-sensitive, starting with affordable products

---

## 4. Core Features - MVP (Phase 1)

### F1: Photo Upload & Capture

**Purpose:** Allow users to submit a photo of their face for AI analysis

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | Mobile camera capture using react-webcam | Must Have |
| F1.2 | File upload via drag & drop interface | Must Have |
| F1.3 | Click-to-upload fallback for accessibility | Must Have |
| F1.4 | Image format validation (JPEG, PNG only) | Must Have |
| F1.5 | File size limit enforcement (max 10MB) | Must Have |
| F1.6 | Image preview before submission | Should Have |
| F1.7 | Retake/re-upload option | Should Have |
| F1.8 | Face detection validation (future) | Could Have |

#### Privacy Requirements
- Display clear privacy notice before capture
- No server-side image storage
- Process images in memory (Base64)
- Delete from memory after analysis complete
- GDPR-compliant consent language

#### UI Specifications
```
┌─────────────────────────────────────┐
│        Analyze Your Skin            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    📷 Camera Preview        │   │
│  │       or                    │   │
│  │    Drag & Drop Image        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ 📸 Take Photo ] [ 📁 Upload ]   │
│                                     │
│  🔒 Your photo is never stored     │
│     and is deleted after analysis   │
└─────────────────────────────────────┘
```

---

### F2: AI Skin Analysis

**Purpose:** Analyze uploaded photo to detect and score skin concerns

#### Technical Implementation
- **API:** OpenAI Vision API (GPT-4o)
- **Processing:** Server-side API route (Next.js)
- **Response Format:** Structured JSON

#### Skin Concerns Analyzed

| # | Concern | Description | Detection Method |
|---|---------|-------------|------------------|
| 1 | **Dehydration** | Lack of moisture, tight feeling | Skin texture, fine lines pattern |
| 2 | **Fine Lines/Wrinkles** | Age-related or expression lines | Forehead, eye area, nasolabial |
| 3 | **Hyperpigmentation** | Dark spots, uneven tone | Color distribution analysis |
| 4 | **Enlarged Pores** | Visible, dilated pores | T-zone texture analysis |
| 5 | **Acne/Blemishes** | Active breakouts, pustules | Inflammation detection |
| 6 | **Redness/Sensitivity** | Rosacea, irritation, flushing | Color analysis, cheek area |
| 7 | **Dullness** | Lack of radiance, tired look | Overall skin luminosity |
| 8 | **Oily Skin** | Excess sebum, shine | T-zone reflection analysis |

#### Output Specification

```json
{
  "skinType": "combination",
  "concerns": [
    {
      "name": "hyperpigmentation",
      "severity": 0.7,
      "location": ["cheeks", "forehead"],
      "confidence": 0.85
    },
    {
      "name": "dehydration",
      "severity": 0.5,
      "location": ["overall"],
      "confidence": 0.90
    }
  ],
  "overallScore": 72,
  "analysisTimestamp": "2026-02-06T10:30:00Z"
}
```

#### Performance Requirements
| Metric | Target |
|--------|--------|
| Processing Time | < 10 seconds |
| API Timeout | 30 seconds |
| Retry Attempts | 2 |
| Confidence Threshold | 0.6 minimum |

---

### F3: Ingredient Recommendations

**Purpose:** Map detected skin concerns to beneficial K-Beauty ingredients

#### Concern-to-Ingredient Mapping

| Skin Concern | Primary Ingredients | Secondary Ingredients |
|--------------|---------------------|----------------------|
| Dehydration | Hyaluronic Acid, Ceramides | Squalane, Glycerin |
| Fine Lines | Retinol, Peptides | Adenosine, Collagen |
| Hyperpigmentation | Niacinamide, Vitamin C | Arbutin, Tranexamic Acid |
| Enlarged Pores | BHA (Salicylic Acid), Niacinamide | Clay, Witch Hazel |
| Acne/Blemishes | Tea Tree, Centella Asiatica | Propolis, Mugwort |
| Redness/Sensitivity | Centella Asiatica, Aloe Vera | Madecassoside, Panthenol |
| Dullness | Vitamin C, AHA | Rice Extract, Licorice Root |
| Oily Skin | BHA, Niacinamide | Green Tea, Zinc |

#### Display Requirements
- Show top 3-5 ingredients based on concern severity
- Priority badges (Primary/Secondary)
- User-friendly explanations (not technical jargon)
- Translated content in user's selected language

#### UI Specification
```
┌─────────────────────────────────────┐
│  Recommended Ingredients for You    │
├─────────────────────────────────────┤
│  1. 🥇 Niacinamide                  │
│     ├─ Addresses: Pores, Dark Spots │
│     └─ "Brightens skin and reduces  │
│         pore appearance"            │
│                                     │
│  2. 🥈 Centella Asiatica            │
│     ├─ Addresses: Redness, Acne     │
│     └─ "Calms irritation and helps  │
│         heal blemishes"             │
│                                     │
│  3. 🥉 Hyaluronic Acid              │
│     ├─ Addresses: Dehydration       │
│     └─ "Deep hydration without      │
│         heaviness"                  │
└─────────────────────────────────────┘
```

---

### F4: K-Beauty Product Recommendations

**Purpose:** Recommend curated K-Beauty products based on ingredient match

#### Product Database Requirements

| Attribute | Requirement |
|-----------|-------------|
| Initial Seed | 50 products minimum |
| Categories | Cleanser, Toner, Serum, Moisturizer, Sunscreen, Mask |
| Data Points | Name, Brand, Image URL, Key Ingredients, Rating, Price Range |
| Affiliate Links | Amazon Associates, Coupang Partners, YesStyle |

#### Display Specifications

```
┌─────────────────────────────────────┐
│  Products with Niacinamide          │
├─────────────────────────────────────┤
│ ┌─────┐                             │
│ │ 📷  │ COSRX Advanced Snail 96     │
│ │     │ Mucin Power Essence         │
│ └─────┘ ⭐ 4.8 (12,340 reviews)     │
│         💲 $15-25                   │
│         [🛒 Buy on Amazon]          │
├─────────────────────────────────────┤
│ ┌─────┐                             │
│ │ 📷  │ Some By Mi AHA BHA PHA      │
│ │     │ 30 Days Miracle Toner       │
│ └─────┘ ⭐ 4.6 (8,920 reviews)      │
│         💲 $12-18                   │
│         [🛒 Buy on Amazon]          │
└─────────────────────────────────────┘
```

#### Sorting & Filtering
- Sort by: Popularity (default), Rating, Price Low-High, Price High-Low
- Filter by: Product category, Price range, Specific ingredient

#### Affiliate Integration
| Platform | Markets | Commission Rate |
|----------|---------|-----------------|
| Amazon Associates | US, UK, Japan | 3-5% |
| Coupang Partners | Korea | 3-7% |
| YesStyle Affiliate | Global | 8-12% |

---

### F5: Multi-Language Support

**Purpose:** Make the service accessible to international users

#### Supported Languages

| Language | Code | Priority | Coverage |
|----------|------|----------|----------|
| English | `en` | Default | 100% |
| Japanese | `ja` | High | 100% |
| Chinese (Simplified) | `zh` | Medium | 100% |

#### Implementation Requirements

| Requirement | Details |
|-------------|---------|
| UI Translation | All interface elements, buttons, labels |
| Content Translation | Ingredient descriptions, skin concern explanations |
| Language Selector | Header component, persistent across sessions |
| URL Persistence | Query parameter `?lang=ja` for shareability |
| Fallback | English if translation missing |
| Detection | Browser language auto-detection on first visit |

#### Translation Scope

- Landing page copy
- Analysis result text
- Ingredient names and descriptions
- Product information (brand names kept in English)
- Error messages
- Privacy notices

---

## 5. User Journey

### 5.1 Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │ Landing Page │  ← SEO/Social/Direct traffic                  │
│  │              │                                               │
│  │ "Seoul's     │                                               │
│  │  Secret..."  │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Click "Analyze My Skin"                               │
│  ┌──────────────┐                                               │
│  │ Camera/Upload│  ← Privacy notice displayed                   │
│  │    Screen    │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Take/Upload Photo                                      │
│  ┌──────────────┐                                               │
│  │  Analyzing   │  ← Progress indicator                         │
│  │    5-10s     │  ← Loading animation                          │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Analysis Complete                                      │
│  ┌──────────────┐                                               │
│  │   Analysis   │  ← Skin concerns (visual cards)               │
│  │   Results    │  ← Skin type detected                         │
│  │              │  ← Overall skin score                         │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Scroll Down                                            │
│  ┌──────────────┐                                               │
│  │ Recommended  │  ← Top 3-5 ingredients                        │
│  │ Ingredients  │  ← Priority badges                            │
│  │              │  ← "Why you need this"                        │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Click Ingredient / "See Products"                      │
│  ┌──────────────┐                                               │
│  │   Product    │  ← Product grid                               │
│  │Recommendations│  ← Filtered by ingredient                    │
│  │              │  ← Affiliate CTAs                             │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼ Click "Buy Now"                                        │
│  ┌──────────────┐                                               │
│  │  Retailer    │  ← Tracked affiliate link                     │
│  │   Website    │  ← Amazon/YesStyle/Coupang                    │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Screen Flow Details

#### Screen 1: Landing Page
- Hero section with value proposition
- "Analyze My Skin" CTA button
- Brief explanation of how it works (3 steps)
- Trust indicators (privacy-first, no signup)
- Language selector

#### Screen 2: Photo Capture/Upload
- Camera preview (mobile) or upload zone (desktop)
- Clear instructions for best photo
- Privacy notice with consent
- Loading state after submission

#### Screen 3: Analysis Results
- Animated reveal of skin concerns
- Visual severity indicators (progress bars)
- Skin type badge
- Overall skin health score (0-100)
- CTA to view ingredient recommendations

#### Screen 4: Ingredient Recommendations
- Ranked ingredient list with explanations
- Mapping to detected concerns
- "See Products" button per ingredient
- Educational content (expandable)

#### Screen 5: Product Recommendations
- Product grid layout
- Filter/sort controls
- Affiliate "Buy Now" buttons
- Price comparison across retailers

---

## 6. Success Metrics

### 6.1 Launch Criteria (Go/No-Go)

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Analysis Accuracy | 80%+ on 10 test photos | Manual review by team |
| Mobile Responsive | Works on iOS Safari & Android Chrome | Device testing |
| Analysis Speed | < 10 seconds average | Performance monitoring |
| Product Database | 50 products with valid affiliate links | Database count |
| Language Coverage | EN, JA, ZH at 100% | Translation audit |

### 6.2 Month 1 Targets

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| **Total Users** | 1,000 | Analytics unique visitors |
| **Analysis Completion Rate** | 60%+ | (Completed / Started) |
| **Ingredient View Rate** | 80% | (Viewed Ingredients / Completed Analysis) |
| **Product Click Rate** | 30% | (Product Clicks / Ingredient Views) |
| **Affiliate Link Clicks** | 20% | (Affiliate Clicks / Product Views) |
| **Average Session Duration** | 3+ minutes | Analytics |
| **Bounce Rate** | < 50% | Analytics |

### 6.3 Revenue Goals

| Timeframe | Users | Conversion | Revenue Target |
|-----------|-------|------------|----------------|
| Month 1 | 1,000 | 1% | $100 (break-even) |
| Month 3 | 10,000 | 3% | $500 |
| Month 6 | 50,000 | 5% | $2,000 |
| Year 1 | 200,000 | 5% | $10,000 |

**Revenue Calculation:**
- Average product price: $30
- Average commission: 5%
- Revenue per conversion: $1.50
- Required conversions for $100: ~67 sales

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint (FCP) | < 2 seconds | Lighthouse |
| Time to Interactive (TTI) | < 3 seconds | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5 seconds | Core Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |
| Lighthouse Performance Score | 90+ | Lighthouse |
| API Response Time | < 500ms (excluding AI) | Server monitoring |

### 7.2 Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS Only | Enforce via Vercel/Next.js config |
| No Image Storage | Base64 in-memory processing only |
| API Key Protection | Environment variables (.env.local) |
| Rate Limiting | 10 requests/minute per IP |
| Input Validation | File type, size validation server-side |
| XSS Prevention | React default escaping, CSP headers |
| CORS Policy | Restrict to known origins |

### 7.3 Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Full tab navigation support |
| Screen Reader Support | ARIA labels, semantic HTML |
| Color Contrast | 4.5:1 minimum ratio |
| Focus Indicators | Visible focus states |
| Alt Text | All images have descriptive alt text |
| Form Labels | Associated labels for all inputs |
| Error Handling | Clear, descriptive error messages |

### 7.4 SEO

| Requirement | Implementation |
|-------------|----------------|
| Meta Tags | Title, description, keywords per page |
| Open Graph | og:title, og:description, og:image |
| Twitter Cards | twitter:card, twitter:title, twitter:image |
| Semantic HTML | Proper heading hierarchy, landmarks |
| Sitemap | /sitemap.xml auto-generated |
| Robots.txt | Allow all crawlers |
| Structured Data | JSON-LD for product, organization |
| Canonical URLs | Prevent duplicate content |

### 7.5 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Safari | 14+ |
| Firefox | 88+ |
| Edge | 90+ |
| Mobile Safari (iOS) | 14+ |
| Chrome (Android) | 90+ |

---

## 8. Out of Scope (Phase 2+)

The following features are explicitly excluded from MVP to maintain focus:

### Phase 2 (Month 2-3)
- [ ] User accounts and authentication
- [ ] Analysis history and saved results
- [ ] Before/After photo comparison
- [ ] Email capture and newsletter

### Phase 3 (Month 4-6)
- [ ] Premium subscription tier
- [ ] Personalized routine builder
- [ ] Product wishlist
- [ ] Price drop alerts

### Future Phases
- [ ] Community features (reviews, discussions)
- [ ] AR virtual product try-on
- [ ] Professional dermatologist consultation
- [ ] Mobile app (iOS/Android)
- [ ] B2B API for brands
- [ ] Ingredient conflict checker

---

## 9. Competitive Analysis

### 9.1 Competitor Comparison Matrix

| Feature | Hwahae | SkinGenie | Haut.AI | SkinBliss | **SkinSEOUL** |
|---------|--------|-----------|---------|-----------|---------------|
| **AI Skin Analysis** | ❌ Quiz-based | ✅ AI | ✅ Pro-grade | ✅ Basic | ✅ AI Vision |
| **K-Beauty Focus** | ✅ Core | ❌ Generic | ❌ Generic | ❌ Generic | ✅ Core |
| **Multi-Language** | ❌ Korean | ✅ English | ✅ Multiple | ✅ English | ✅ EN/JA/ZH |
| **Free Tier** | ✅ Free | ✅ Free | ❌ B2B only | ❌ Subscription | ✅ Free |
| **No Signup Required** | ❌ Required | ❌ Required | N/A | ❌ Required | ✅ No signup |
| **Affiliate Links** | ❌ In-app shop | ❌ In-app shop | N/A | ✅ Links | ✅ Multi-retailer |
| **International Shipping** | ⚠️ Limited | ✅ Global | N/A | ✅ Global | ✅ Global |

### 9.2 Detailed Competitor Analysis

#### Hwahae (화해)
- **Strengths:**
  - 10M+ users, established trust
  - Comprehensive Korean product database
  - Ingredient analysis feature
  - Strong community reviews
- **Weaknesses:**
  - Korean language only
  - No AI photo analysis
  - Complex app-only experience
- **Our Advantage:** English/Multi-language web app

#### SkinGenie
- **Strengths:**
  - AI-powered analysis
  - Free tier available
  - Routine recommendations
- **Weaknesses:**
  - Generic product recommendations
  - Not K-Beauty focused
  - Requires account creation
- **Our Advantage:** K-Beauty specific, no signup

#### Haut.AI
- **Strengths:**
  - Professional-grade AI analysis
  - Validated accuracy
  - Comprehensive skin metrics
- **Weaknesses:**
  - B2B only
  - Expensive licensing
  - Not consumer-facing
- **Our Advantage:** B2C accessible, free

#### SkinBliss
- **Strengths:**
  - Face scanner technology
  - Product recommendations
- **Weaknesses:**
  - Subscription required
  - Limited free features
- **Our Advantage:** Free analysis

---

## 10. Risks & Mitigation

### 10.1 Risk Matrix

| Risk | Probability | Impact | Overall | Status |
|------|-------------|--------|---------|--------|
| AI analysis inaccurate | High | High | **Critical** | Monitoring |
| Legal issues (medical device) | Medium | High | **High** | Mitigated |
| Trademark conflict | High | High | **Critical** | Action needed |
| Low affiliate revenue | Medium | Medium | **Medium** | Monitoring |
| Product DB maintenance | Low | Medium | **Low** | Planned |

### 10.2 Detailed Risk Mitigation

#### Risk 1: AI Analysis Inaccurate
**Description:** OpenAI Vision API may not accurately detect skin concerns

**Mitigation Strategies:**
1. Iterate on prompts daily based on test results
2. Add confidence threshold (hide low-confidence results)
3. Include disclaimer about AI limitations
4. Phase 2: Integrate HautAI API for validation
5. Collect user feedback on accuracy

**Contingency:** Pivot to quiz-based assessment if AI proves unreliable

---

#### Risk 2: Legal Issues (Medical Device Classification)
**Description:** Service could be classified as medical device requiring FDA approval

**Mitigation Strategies:**
1. Clear disclaimers on all pages:
   - "For educational and entertainment purposes only"
   - "Not a substitute for professional dermatological advice"
   - "Consult a dermatologist for medical concerns"
2. Avoid medical terminology ("diagnosis," "treatment")
3. Use "analysis" not "diagnosis"
4. Legal review before launch

**Contingency:** Consult healthcare regulatory attorney if issues arise

---

#### Risk 3: Trademark Conflict (SkinSeoul)
**Description:** "SkinSeoul" or similar names may already be trademarked

**Mitigation Strategies:**
1. Conduct USPTO trademark search before launch
2. Search international trademark databases (WIPO, JPO, KIPO)
3. Prepare alternative brand names:
   - SeoulSkin.ai
   - KBeautyAnalyzer
   - GlowSeoul
4. Register domain variations (.ai, .com, .co)

**Contingency:** Rebrand if cease-and-desist received

---

#### Risk 4: Low Affiliate Revenue
**Description:** Users may not click affiliate links or complete purchases

**Mitigation Strategies:**
1. Optimize product recommendations for conversion
2. SEO optimization for organic traffic growth
3. Reddit/Instagram marketing campaigns
4. Build email list for remarketing (Phase 2)
5. A/B test CTA placement and copy

**Contingency:** Introduce premium tier if affiliate model fails

---

#### Risk 5: Product Database Maintenance
**Description:** Product information becomes outdated (prices, availability, links)

**Mitigation Strategies:**
1. Start small (50 products) to ensure quality
2. Monthly manual audit of links
3. Phase 2: Automated scraping for price updates
4. Remove products with broken links

**Contingency:** Prioritize evergreen products with stable availability

---

## 11. Go-to-Market Strategy

### 11.1 Pre-Launch (Week 1-2)

| Activity | Timeline | Owner |
|----------|----------|-------|
| Build MVP features | Days 1-10 | Development |
| Seed 50 products with affiliate links | Days 8-12 | Content |
| Internal testing (10 team photos) | Days 11-12 | QA |
| Beta testing with 10 external users | Days 12-14 | Product |
| Fix critical bugs from beta feedback | Days 13-14 | Development |

### 11.2 Launch Week (Week 3)

| Day | Activity | Channel |
|-----|----------|---------|
| Mon | Soft launch, monitor systems | Production |
| Tue | Post to r/AsianBeauty | Reddit |
| Wed | Post to r/SkincareAddiction | Reddit |
| Thu | Instagram posts with hashtags | Instagram |
| Fri | Respond to comments, gather feedback | All |
| Sat-Sun | Monitor, iterate based on feedback | All |

**Instagram Hashtags:**
- #KBeauty #KoreanSkincare #SkincareRoutine
- #GlassSkin #10StepRoutine #KBeautyAddict
- #SkincareAnalysis #SkincareTips

### 11.3 Month 1-3 Growth

| Strategy | Activity | Goal |
|----------|----------|------|
| **Content Marketing** | Blog posts: "Best K-Beauty Ingredients for [Concern]" | SEO traffic |
| **Influencer Outreach** | Partner with 5-10 micro-influencers (10K-50K followers) | Awareness |
| **Community Engagement** | Active participation in r/AsianBeauty | Trust building |
| **SEO Optimization** | Target keywords: "k-beauty skin analysis," "korean skincare quiz" | Organic traffic |
| **Product Hunt** | Phase 2 launch on Product Hunt | Tech community |

### 11.4 Marketing Budget (Month 1)

| Item | Budget | Purpose |
|------|--------|---------|
| Influencer gifts | $0 (product samples) | Seeding |
| Paid ads | $0 | Organic focus |
| Content creation | $0 (in-house) | SEO |
| **Total** | **$0** | Bootstrap launch |

---

## 12. Budget (Month 1)

### 12.1 Cost Breakdown

| Category | Item | Cost | Notes |
|----------|------|------|-------|
| **Infrastructure** | Vercel Pro hosting | $20/mo | Includes analytics |
| **API** | OpenAI API | $13/mo | 1,000 analyses @ $0.01275 |
| **Domain** | .ai domain | $80/year (~$7/mo) | Premium TLD |
| **Database** | Supabase | $0 | Free tier sufficient |
| **Email** | Resend | $0 | Free tier (100/day) |
| **Analytics** | Vercel Analytics | $0 | Included in Pro |
| | | | |
| **Total Monthly** | | **$40** | |
| **Total Annual** | | **$480** | |

### 12.2 OpenAI API Cost Calculation

| Model | Input Cost | Output Cost | Avg Tokens | Cost/Analysis |
|-------|------------|-------------|------------|---------------|
| GPT-4o | $2.50/1M | $10.00/1M | ~1,000 in, 500 out | $0.01275 |

**Monthly Budget:** 1,000 analyses × $0.01275 = $12.75 ≈ $13

### 12.3 Break-Even Analysis

| Metric | Value |
|--------|-------|
| Monthly costs | $40 |
| Average product price | $50 |
| Average commission rate | 5% |
| Revenue per sale | $2.50 |
| **Sales needed for break-even** | **16 sales** |

**Conversion Funnel:**
- 1,000 users → 600 complete analysis (60%)
- 600 → 480 view ingredients (80%)
- 480 → 144 view products (30%)
- 144 → 29 click affiliate links (20%)
- 29 → 16 purchases (~55% assumed conversion at retailer)

---

## 13. Appendix

### 13.1 Related Documents

| Document | Path | Description |
|----------|------|-------------|
| UI Wireframes | `/docs/UI_WIREFRAMES.md` | Visual mockups for all screens |
| Tech Stack | `/docs/TECH_STACK.md` | Detailed technology decisions |
| Database Schema | `/docs/DATABASE_SCHEMA.md` | Supabase table definitions |
| API Specification | `/docs/API_SPECIFICATION.md` | Endpoint documentation |

### 13.2 Glossary

| Term | Definition |
|------|------------|
| **K-Beauty** | Korean Beauty - skincare and cosmetic products originating from South Korea |
| **Skin Concern** | A specific skin condition or issue (e.g., acne, hyperpigmentation) |
| **Ingredient** | Active component in skincare products (e.g., Niacinamide, Hyaluronic Acid) |
| **Affiliate Link** | Tracking URL that earns commission on purchases |
| **MVP** | Minimum Viable Product - first launchable version |
| **Severity Score** | 0.0-1.0 rating of how prominent a skin concern appears |
| **Confidence Level** | 0.0-1.0 rating of AI's certainty in its detection |

### 13.3 Reference Links

- [K-Beauty Market Report 2024](https://example.com)
- [OpenAI Vision API Documentation](https://platform.openai.com/docs/guides/vision)
- [Amazon Associates Program](https://affiliate-program.amazon.com)
- [YesStyle Affiliate Program](https://www.yesstyle.com/en/affiliate)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 13.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Product Team | Initial PRD creation |

---

**Document Status:** ✅ Approved for Development
**Next Review:** Post-MVP Launch (Week 3)
