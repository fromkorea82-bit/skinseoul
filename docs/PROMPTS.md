# AI Prompts Documentation

## SkinSEOUL - OpenAI Vision Prompt Engineering

**Version:** 1.0
**Last Updated:** February 2026
**Model:** GPT-4o (gpt-4o-2024-08-06)
**Prompt Version:** v1.0

---

## Table of Contents

1. [Prompt Overview](#1-prompt-overview)
2. [Primary Skin Analysis Prompt](#2-primary-skin-analysis-prompt)
3. [JSON Output Schema](#3-json-output-schema)
4. [Scoring Guidelines](#4-scoring-guidelines)
5. [Photo Quality Validation Prompt](#5-photo-quality-validation-prompt)
6. [Ingredient Recommendation Prompt](#6-ingredient-recommendation-prompt)
7. [Prompt Variations](#7-prompt-variations)
8. [Edge Case Handling](#8-edge-case-handling)
9. [Prompt Engineering Best Practices](#9-prompt-engineering-best-practices)
10. [Testing Methodology](#10-testing-methodology)
11. [A/B Testing Framework](#11-ab-testing-framework)
12. [Prompt Changelog](#12-prompt-changelog)

---

## 1. Prompt Overview

### 1.1 Prompt Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      PROMPT PIPELINE                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [User Photo]                                                 │
│       │                                                       │
│       ▼                                                       │
│  ┌────────────────────────────────┐                           │
│  │  Step 1: Quality Validation   │ ◄─ QUALITY_PROMPT          │
│  │  - Is this a valid face photo? │                           │
│  │  - Lighting sufficient?       │                            │
│  │  - Resolution adequate?       │                            │
│  └─────────────┬──────────────────┘                           │
│                │                                              │
│         Pass?  ├──── No ──▶ Return quality error              │
│                │                                              │
│           Yes  ▼                                              │
│  ┌────────────────────────────────┐                           │
│  │  Step 2: Skin Analysis        │ ◄─ ANALYSIS_PROMPT         │
│  │  - Detect skin type           │                            │
│  │  - Score 8 concerns           │                            │
│  │  - Map locations              │                            │
│  └─────────────┬──────────────────┘                           │
│                │                                              │
│                ▼                                              │
│  ┌────────────────────────────────┐                           │
│  │  Step 3: Recommendations      │ ◄─ RECOMMENDATION_PROMPT   │
│  │  - Map concerns → ingredients │     (Server-side logic,    │
│  │  - Generate explanations      │      not AI-based)         │
│  │  - Prioritize ingredients     │                            │
│  └────────────────────────────────┘                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Model Configuration

```typescript
// lib/openai.ts
const OPENAI_CONFIG = {
  model: 'gpt-4o',
  max_tokens: 1500,
  temperature: 0.3,       // Low for consistent, structured output
  top_p: 0.9,
  frequency_penalty: 0,
  presence_penalty: 0,
  response_format: { type: 'json_object' },
};
```

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `model` | gpt-4o | Best vision + JSON output |
| `max_tokens` | 1500 | Sufficient for full analysis JSON |
| `temperature` | 0.3 | Consistent, deterministic scoring |
| `response_format` | json_object | Force valid JSON output |

### 1.3 Cost Per Call

| Component | Tokens | Cost |
|-----------|--------|------|
| System prompt | ~400 | $0.001 |
| Image (high detail) | ~765 | $0.002 |
| User prompt | ~100 | $0.00025 |
| Output (~500 tokens) | ~500 | $0.005 |
| **Total** | ~1,765 | **~$0.01275** |

---

## 2. Primary Skin Analysis Prompt

### 2.1 System Prompt

```
SYSTEM_PROMPT = """
You are SkinSEOUL Analyzer, an AI skin analysis assistant created by SkinSEOUL.
You specialize in analyzing facial photos for common skin concerns relevant to
K-Beauty skincare routines.

Your role:
- Analyze facial skin from photos with accuracy and care
- Detect and score visible skin concerns objectively
- Provide helpful, non-medical observations
- Always return structured JSON responses

Important guidelines:
- You are NOT a medical professional. Never diagnose medical conditions.
- Focus on cosmetic skin concerns visible in the photo.
- Be encouraging and constructive in descriptions, never harsh or judgmental.
- If the photo quality is poor, indicate low confidence rather than guessing.
- Score conservatively — only assign high severity when clearly visible.
- Account for lighting conditions that may affect appearance.
- Be aware that different skin tones display concerns differently
  (e.g., hyperpigmentation presents differently on darker skin).

You must ALWAYS respond with valid JSON matching the specified schema.
Do not include any text outside the JSON object.
"""
```

### 2.2 Analysis Prompt (User Message)

```
ANALYSIS_PROMPT = """
Analyze this facial photo for skin concerns. Evaluate the visible skin condition
and return a structured analysis.

## Analysis Protocol

1. VERIFY photo is a clear facial photo suitable for skin analysis.
   If not suitable, set "photo_quality" to "poor" and lower all confidence scores.

2. DETERMINE the overall skin type based on visible characteristics:
   - "dry": Visible flakiness, tightness indicators, matte finish
   - "oily": Visible shine especially in T-zone, enlarged pores
   - "combination": Oily T-zone with dry/normal cheeks
   - "normal": Balanced, no extreme oiliness or dryness
   - "sensitive": Visible redness, reactive appearance

3. EVALUATE each of the following 8 skin concerns independently.
   For each concern, assess:
   - severity: Float from 0.0 (not present) to 1.0 (severely present)
   - location: Array of face areas where observed
   - confidence: Float from 0.0 (uncertain) to 1.0 (very certain)

   Concerns to evaluate:
   a) dehydration — Signs of moisture loss, tightness, fine texture lines
   b) fine_lines — Visible lines around eyes, forehead, mouth (not deep wrinkles)
   c) hyperpigmentation — Dark spots, uneven skin tone, post-inflammatory marks
   d) enlarged_pores — Visibly dilated pores, especially on nose, cheeks, chin
   e) acne — Active breakouts, pustules, papules, comedones
   f) redness — Diffuse redness, flushing, visible blood vessels, irritation
   g) dullness — Lack of radiance, tired or sallow appearance, uneven texture
   h) oily_skin — Excess sebum, visible shine, greasy appearance

4. ONLY include concerns with severity > 0.1 in the output.

5. CALCULATE an overall skin health score from 0 to 100:
   - 90-100: Excellent condition, minimal concerns
   - 70-89: Good condition, some minor concerns
   - 50-69: Fair condition, moderate concerns
   - 30-49: Needs attention, significant concerns
   - 0-29: Multiple significant concerns present

6. Return ONLY the JSON object below. No other text.

## Required JSON Schema

{
  "photo_quality": "good" | "fair" | "poor",
  "lighting": "natural" | "artificial" | "dim" | "harsh",
  "skin_type": "dry" | "oily" | "combination" | "normal" | "sensitive",
  "overall_score": <integer 0-100>,
  "concerns": [
    {
      "type": "<concern_name>",
      "severity": <float 0.0-1.0>,
      "location": ["<face_area>", ...],
      "confidence": <float 0.0-1.0>,
      "description_en": "<1-2 sentence observation in English>",
      "description_ko": "<same observation in Korean>"
    }
  ],
  "skin_summary_en": "<2-3 sentence overall skin assessment in English>",
  "skin_summary_ko": "<same assessment in Korean>",
  "estimated_age_range": "<e.g., '25-30'>",
  "analysis_notes": "<any caveats about photo quality or confidence>"
}

## Location Values
Use these standard face area identifiers:
- "forehead"
- "temples"
- "between_brows"
- "nose"
- "cheeks"
- "chin"
- "jawline"
- "under_eyes"
- "nasolabial"
- "t_zone" (forehead + nose + chin)
- "overall"
"""
```

### 2.3 Complete API Call

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `...`; // Section 2.1 above
export const ANALYSIS_PROMPT = `...`; // Section 2.2 above

export async function analyzeSkin(imageBase64: string): Promise<SkinAnalysis> {
  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1500,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: ANALYSIS_PROMPT,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
              detail: 'high',  // Use high detail for skin analysis
            },
          },
        ],
      },
    ],
  });

  const processingTime = Date.now() - startTime;
  const rawContent = response.choices[0].message.content;

  if (!rawContent) {
    throw new Error('No response content from OpenAI');
  }

  const analysis = JSON.parse(rawContent) as SkinAnalysis;

  return {
    ...analysis,
    processing_time_ms: processingTime,
    model_version: 'gpt-4o-2024-08-06',
    prompt_version: 'v1.0',
  };
}
```

---

## 3. JSON Output Schema

### 3.1 Complete Response Schema

```typescript
interface SkinAnalysis {
  // Photo metadata
  photo_quality: 'good' | 'fair' | 'poor';
  lighting: 'natural' | 'artificial' | 'dim' | 'harsh';

  // Skin assessment
  skin_type: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  overall_score: number;         // 0-100
  estimated_age_range: string;   // "25-30"

  // Detected concerns (sorted by severity, descending)
  concerns: SkinConcern[];

  // Summaries
  skin_summary_en: string;
  skin_summary_ko: string;
  analysis_notes: string;

  // Added by server
  processing_time_ms?: number;
  model_version?: string;
  prompt_version?: string;
}

interface SkinConcern {
  type: ConcernType;
  severity: number;              // 0.0 - 1.0
  location: FaceArea[];
  confidence: number;            // 0.0 - 1.0
  description_en: string;
  description_ko: string;
}

type ConcernType =
  | 'dehydration'
  | 'fine_lines'
  | 'hyperpigmentation'
  | 'enlarged_pores'
  | 'acne'
  | 'redness'
  | 'dullness'
  | 'oily_skin';

type FaceArea =
  | 'forehead'
  | 'temples'
  | 'between_brows'
  | 'nose'
  | 'cheeks'
  | 'chin'
  | 'jawline'
  | 'under_eyes'
  | 'nasolabial'
  | 't_zone'
  | 'overall';
```

### 3.2 Example Response

```json
{
  "photo_quality": "good",
  "lighting": "natural",
  "skin_type": "combination",
  "overall_score": 72,
  "estimated_age_range": "25-30",
  "concerns": [
    {
      "type": "dehydration",
      "severity": 0.65,
      "location": ["cheeks", "forehead"],
      "confidence": 0.88,
      "description_en": "Your cheeks and forehead show signs of dehydration with slight tightness and fine texture lines. This is common in combination skin where the T-zone produces oil but other areas lack moisture.",
      "description_ko": "볼과 이마에 약간의 당김과 미세한 결 라인이 보이며 수분 부족의 징후가 나타납니다. 이는 T존에서 유분이 생성되지만 다른 부위에 수분이 부족한 복합성 피부에서 흔합니다."
    },
    {
      "type": "enlarged_pores",
      "severity": 0.45,
      "location": ["nose", "cheeks"],
      "confidence": 0.91,
      "description_en": "Mildly visible pores around the nose and inner cheeks. This is typical for combination skin and can be improved with proper pore-care ingredients.",
      "description_ko": "코와 안쪽 볼 주변에 모공이 약간 눈에 띕니다. 이는 복합성 피부에서 일반적이며 적절한 모공 관리 성분으로 개선할 수 있습니다."
    },
    {
      "type": "dullness",
      "severity": 0.35,
      "location": ["overall"],
      "confidence": 0.75,
      "description_en": "Slight lack of radiance noticed across the face. Brightening ingredients and regular exfoliation can help restore a healthy glow.",
      "description_ko": "얼굴 전체에 약간의 윤기 부족이 감지됩니다. 브라이트닝 성분과 정기적인 각질 제거가 건강한 광채를 회복하는 데 도움이 될 수 있습니다."
    }
  ],
  "skin_summary_en": "Your skin is in good overall condition with a combination skin type. The main areas to focus on are hydration for your cheeks and pore care for the T-zone. With a targeted K-Beauty routine, these concerns can be significantly improved.",
  "skin_summary_ko": "전체적으로 양호한 복합성 피부입니다. 볼의 수분 공급과 T존의 모공 관리에 중점을 두면 좋겠습니다. 맞춤형 K-뷰티 루틴으로 이러한 고민을 크게 개선할 수 있습니다.",
  "analysis_notes": "Good photo quality with natural lighting. Analysis confidence is high."
}
```

---

## 4. Scoring Guidelines

### 4.1 Severity Scale (0.0 - 1.0)

| Range | Label | Visual Indicator | Description |
|-------|-------|------------------|-------------|
| 0.00 - 0.10 | Not Present | (excluded) | Concern not detected |
| 0.11 - 0.25 | Minimal | `██░░░░░░░░` | Barely visible, only upon close inspection |
| 0.26 - 0.50 | Mild | `████░░░░░░` | Noticeable but not prominent |
| 0.51 - 0.75 | Moderate | `██████░░░░` | Clearly visible, should be addressed |
| 0.76 - 1.00 | Severe | `█████████░` | Very prominent, primary concern |

### 4.2 Concern-Specific Scoring Anchors

#### Dehydration
| Score | Indicators |
|-------|------------|
| 0.2 | Slight tightness feeling appearance |
| 0.4 | Visible fine texture lines when skin stretches |
| 0.6 | Noticeable flakiness or rough patches |
| 0.8 | Significant peeling, cracking, or pronounced dry patches |

#### Fine Lines
| Score | Indicators |
|-------|------------|
| 0.2 | Faint expression lines visible only when animating |
| 0.4 | Light static lines around eyes or forehead |
| 0.6 | Clearly visible crow's feet or forehead lines |
| 0.8 | Deep, prominent wrinkles in multiple areas |

#### Hyperpigmentation
| Score | Indicators |
|-------|------------|
| 0.2 | Very light, small spots barely visible |
| 0.4 | Several small dark spots or slight uneven tone |
| 0.6 | Multiple noticeable dark patches or significant unevenness |
| 0.8 | Large areas of significant discoloration |

#### Enlarged Pores
| Score | Indicators |
|-------|------------|
| 0.2 | Pores slightly visible on close-up |
| 0.4 | Pores clearly visible on nose |
| 0.6 | Large visible pores across T-zone and cheeks |
| 0.8 | Very prominent pores creating textured appearance |

#### Acne
| Score | Indicators |
|-------|------------|
| 0.2 | 1-2 minor blemishes or comedones |
| 0.4 | Several small breakouts in one area |
| 0.6 | Multiple active breakouts across multiple areas |
| 0.8 | Significant inflammatory acne, cystic spots |

#### Redness
| Score | Indicators |
|-------|------------|
| 0.2 | Very slight pink tinge, could be normal |
| 0.4 | Noticeable blush-like redness on cheeks |
| 0.6 | Prominent redness with visible irritation |
| 0.8 | Intense redness suggesting possible rosacea |

#### Dullness
| Score | Indicators |
|-------|------------|
| 0.2 | Slightly matte, lacks some glow |
| 0.4 | Noticeably lackluster, tired appearance |
| 0.6 | Significant lack of radiance, sallow tone |
| 0.8 | Very dull, grayish or ashy appearance |

#### Oily Skin
| Score | Indicators |
|-------|------------|
| 0.2 | Slight sheen in T-zone |
| 0.4 | Visible oil on forehead and nose |
| 0.6 | Oily appearance across most of face |
| 0.8 | Heavy oiliness with visible sebum |

### 4.3 Confidence Scoring

| Range | Meaning | When to Apply |
|-------|---------|---------------|
| 0.90 - 1.0 | Very High | Clear photo, obvious concern, ideal conditions |
| 0.75 - 0.89 | High | Good photo, concern clearly visible |
| 0.60 - 0.74 | Moderate | Decent photo, concern likely present |
| 0.40 - 0.59 | Low | Photo quality issues or ambiguous indicators |
| 0.00 - 0.39 | Very Low | Poor conditions, guessing |

**Minimum threshold for display:** 0.6 (concerns below this confidence are excluded from user display)

### 4.4 Overall Score Calculation

```
overall_score = 100 - (weighted_concern_penalty)

weighted_concern_penalty = SUM(
  concern.severity × concern.confidence × CONCERN_WEIGHT[concern.type]
) × NORMALIZATION_FACTOR

CONCERN_WEIGHT = {
  acne: 15,
  redness: 12,
  hyperpigmentation: 12,
  dehydration: 10,
  oily_skin: 10,
  enlarged_pores: 10,
  dullness: 8,
  fine_lines: 8
}

NORMALIZATION_FACTOR = 100 / MAX_POSSIBLE_PENALTY
```

---

## 5. Photo Quality Validation Prompt

### 5.1 Validation Prompt (Optional Pre-check)

For high-traffic scenarios, use a lightweight pre-check before the full analysis.

```
QUALITY_VALIDATION_PROMPT = """
Quickly evaluate this photo for skin analysis suitability.
Return JSON only.

Check:
1. Is a human face clearly visible?
2. Is the face taking up at least 30% of the frame?
3. Is lighting sufficient to see skin details?
4. Is the image in focus (not blurry)?
5. Is the face frontal (not extreme angle)?

{
  "is_valid": true | false,
  "quality_score": <float 0.0-1.0>,
  "issues": ["<issue_code>", ...],
  "suggestion": "<helpful tip if quality is low>"
}

Issue codes:
- "no_face" — No face detected
- "face_too_small" — Face is too far from camera
- "too_dark" — Insufficient lighting
- "too_bright" — Overexposed / harsh lighting
- "blurry" — Image is out of focus
- "extreme_angle" — Face not frontal enough
- "obstructed" — Face partially covered (hands, hair, mask)
- "heavy_makeup" — Heavy makeup may affect analysis accuracy
- "filter_detected" — Beauty filter or edit detected
"""
```

### 5.2 Quality Score Thresholds

| Score | Action | User Message |
|-------|--------|--------------|
| 0.8 - 1.0 | Proceed | "Great photo! Analyzing your skin..." |
| 0.5 - 0.79 | Proceed with warning | "Photo quality is fair. Results may vary." |
| 0.3 - 0.49 | Ask to retake | "For better results, try improving lighting." |
| 0.0 - 0.29 | Block | "We couldn't analyze this photo. Please try again." |

### 5.3 Quality Validation Implementation

```typescript
// lib/quality-check.ts
export async function validatePhotoQuality(
  imageBase64: string
): Promise<QualityResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 200,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: QUALITY_VALIDATION_PROMPT },
          {
            type: 'image_url',
            image_url: { url: imageBase64, detail: 'low' },  // Low detail = cheaper
          },
        ],
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}

// Cost: ~$0.003 per validation (low detail image)
```

---

## 6. Ingredient Recommendation Prompt

### 6.1 Recommendation Logic

Ingredient recommendations are primarily handled by **server-side logic**, not AI, for consistency and speed. The mapping is deterministic.

```typescript
// lib/recommendation.ts

interface ConcernIngredientMap {
  [concern: string]: {
    primary: string[];
    secondary: string[];
  };
}

export const CONCERN_INGREDIENT_MAP: ConcernIngredientMap = {
  dehydration: {
    primary: ['Hyaluronic Acid', 'Ceramides'],
    secondary: ['Squalane', 'Glycerin', 'Beta-Glucan'],
  },
  fine_lines: {
    primary: ['Retinol', 'Peptides'],
    secondary: ['Adenosine', 'Collagen', 'Bakuchiol'],
  },
  hyperpigmentation: {
    primary: ['Niacinamide', 'Vitamin C'],
    secondary: ['Arbutin', 'Tranexamic Acid', 'Licorice Root'],
  },
  enlarged_pores: {
    primary: ['Salicylic Acid', 'Niacinamide'],
    secondary: ['AHA', 'Clay', 'Witch Hazel'],
  },
  acne: {
    primary: ['Salicylic Acid', 'Tea Tree'],
    secondary: ['Centella Asiatica', 'Propolis', 'Mugwort'],
  },
  redness: {
    primary: ['Centella Asiatica', 'Aloe Vera'],
    secondary: ['Madecassoside', 'Panthenol', 'Green Tea'],
  },
  dullness: {
    primary: ['Vitamin C', 'AHA'],
    secondary: ['Rice Extract', 'Niacinamide', 'Licorice Root'],
  },
  oily_skin: {
    primary: ['Salicylic Acid', 'Niacinamide'],
    secondary: ['Green Tea', 'Zinc', 'Witch Hazel'],
  },
};
```

### 6.2 AI-Generated Explanations (Optional Enhancement)

If personalized "why you need this" text is needed beyond templates:

```
EXPLANATION_PROMPT = """
Given the following skin analysis results and recommended ingredient,
write a brief, friendly explanation of why this ingredient would help.

Skin concerns: {concerns_summary}
Ingredient: {ingredient_name}
Target language: {language}

Requirements:
- 1-2 sentences maximum
- Friendly, encouraging tone
- Mention the specific concern(s) it addresses
- Use simple language, avoid jargon
- Do not make medical claims

Return JSON:
{
  "explanation_en": "<English explanation>",
  "explanation_ko": "<Korean explanation>",
  "explanation_ja": "<Japanese explanation>",
  "explanation_zh": "<Chinese explanation>",
  "usage_tip": "<one practical tip>"
}
"""
```

### 6.3 Template-Based Explanations (Default)

For MVP, use pre-written templates for speed and cost savings:

```typescript
// lib/explanation-templates.ts

export const INGREDIENT_EXPLANATIONS: Record<string, Record<string, string>> = {
  'Hyaluronic Acid': {
    dehydration: 'Deeply hydrates by attracting and holding moisture in your skin. Perfect for your dehydrated areas.',
    fine_lines: 'Plumps skin with moisture to reduce the appearance of fine lines.',
    dullness: 'Boosts hydration levels to restore a healthy, dewy glow.',
  },
  'Niacinamide': {
    hyperpigmentation: 'Brightens skin and fades dark spots by inhibiting melanin transfer.',
    enlarged_pores: 'Visibly minimizes pore size while regulating sebum production.',
    oily_skin: 'Controls excess oil production without drying out your skin.',
    dullness: 'Evens skin tone and boosts radiance for a brighter complexion.',
  },
  'Centella Asiatica': {
    redness: 'Calms irritated skin and reduces redness with powerful soothing properties.',
    acne: 'Promotes healing of blemishes while preventing further inflammation.',
  },
  'Vitamin C': {
    hyperpigmentation: 'A potent antioxidant that fades dark spots and evens skin tone.',
    dullness: 'Restores radiance and protects against environmental damage.',
    fine_lines: 'Stimulates collagen to firm skin and reduce fine lines.',
  },
  'Retinol': {
    fine_lines: 'The gold standard for anti-aging — accelerates cell renewal to smooth lines.',
    hyperpigmentation: 'Speeds up cell turnover to fade dark spots faster.',
    acne: 'Unclogs pores and prevents future breakouts.',
  },
  'Salicylic Acid': {
    acne: 'Penetrates deep into pores to dissolve buildup and prevent breakouts.',
    enlarged_pores: 'Clears out pore-clogging debris to minimize their appearance.',
    oily_skin: 'Controls excess sebum at the source without over-drying.',
  },
};
```

---

## 7. Prompt Variations

### 7.1 Skin Tone Awareness

The primary prompt includes skin tone awareness. For enhanced accuracy:

```
SKIN_TONE_ADDENDUM = """
Additional guidance for diverse skin tones:

- Darker skin tones (Fitzpatrick IV-VI):
  • Hyperpigmentation may appear as darker patches rather than brown spots
  • Post-inflammatory hyperpigmentation is more common and visible
  • Redness may present as darker discoloration rather than pink/red
  • Acne scars often leave darker marks
  • "Dullness" should be assessed relative to the person's natural tone
  • Ashiness can be a sign of dehydration

- Lighter skin tones (Fitzpatrick I-II):
  • Redness is more readily visible
  • Sun damage spots may appear as freckle-like marks
  • Visible blood vessels (telangiectasia) are more apparent
  • Fine lines may be more visible

- Medium skin tones (Fitzpatrick III-IV):
  • Both redness and hyperpigmentation can be present
  • Uneven tone may show as a mix of warm and cool patches

Do not comment on or classify the user's skin tone in the output.
Focus only on skin concerns and their treatment.
"""
```

### 7.2 Age Group Adjustments

```
AGE_ADJUSTMENT_NOTES = """
Age-specific scoring context (do not mention age in descriptions):

- Younger skin (estimated 18-25):
  • Fine lines score should be conservative (usually < 0.3)
  • Acne/blemishes are more commonly the primary concern
  • Enlarged pores may be hormonal
  • Focus on prevention-oriented language

- Adult skin (estimated 25-35):
  • Fine lines beginning to appear is normal (0.2-0.5)
  • Combination of concerns is common
  • Balanced recommendations

- Mature skin (estimated 35+):
  • Fine lines are expected; score relative to severity, not presence
  • Dehydration is very common
  • Hyperpigmentation (sun damage) more prevalent
  • Use "refining" language, not "fixing"
"""
```

### 7.3 Lighting Condition Adjustments

```
LIGHTING_NOTES = """
Adjust confidence scores based on lighting:

- Natural daylight (best): Full confidence in assessments
- Artificial warm light: May exaggerate redness, reduce redness confidence by 0.15
- Artificial cool/blue light: May mask redness, reduce redness confidence by 0.1
- Dim lighting: Reduce all confidence scores by 0.2
- Harsh direct light: May exaggerate pores and texture, reduce by 0.1
- Ring light / beauty light: May mask concerns, reduce all by 0.15
- Flash photography: Overexposure likely, reduce confidence by 0.2

Always note the lighting condition in the "lighting" field.
"""
```

### 7.4 Localized Prompt Variants

#### Japanese Response Enhancement

```
JAPANESE_PROMPT_ADDENDUM = """
For Japanese-language output:
- Use polite form (です/ます) in descriptions
- Include the Korean ingredient name alongside Japanese for K-Beauty context
- Use gentle, indirect language for concern descriptions
- Reference "美肌" (beautiful skin) as the goal
"""
```

#### Chinese Response Enhancement

```
CHINESE_PROMPT_ADDENDUM = """
For Chinese-language output:
- Use Simplified Chinese (简体中文)
- Reference K-Beauty concepts with their Chinese equivalents (韩式护肤)
- Use encouraging tone appropriate for Chinese skincare culture
"""
```

---

## 8. Edge Case Handling

### 8.1 Edge Case Matrix

| Edge Case | Detection | Response |
|-----------|-----------|----------|
| No face in photo | `is_valid: false` | "No face detected. Please upload a clear selfie." |
| Multiple faces | Analyze closest/largest face | Note in `analysis_notes` |
| Extreme closeup | Missing context | Lower confidence, note limited view |
| Face with glasses | Obstructed eye area | Skip under-eye analysis, note |
| Heavy makeup | Filtered appearance | Lower all confidence, warn user |
| Beauty filter | Unrealistic smoothing | Warn results may be inaccurate |
| Side profile | Missing half of face | Lower confidence, limited analysis |
| Child's face | Age detection | Return gentle refusal message |
| Non-human | Pet/object photo | Return `is_valid: false` |
| Skin condition | Medical concern | Recommend seeing a dermatologist |

### 8.2 Refusal Responses

```typescript
// Edge case response templates

const EDGE_CASE_RESPONSES = {
  no_face: {
    success: false,
    error: {
      code: 'NO_FACE_DETECTED',
      message: 'We couldn\'t detect a face in your photo. Please upload a clear, front-facing selfie.',
      suggestion: 'Make sure your face is well-lit and takes up most of the frame.',
    },
  },

  child_detected: {
    success: false,
    error: {
      code: 'AGE_RESTRICTION',
      message: 'SkinSEOUL is designed for adults (18+). Our analysis is not suitable for children\'s skin.',
      suggestion: 'Please consult a pediatric dermatologist for children\'s skin concerns.',
    },
  },

  medical_concern: {
    success: true,
    data: {
      // Return analysis but with strong disclaimer
      analysis_notes: 'Some visible concerns may benefit from professional evaluation. We recommend consulting a dermatologist for personalized medical advice.',
      disclaimer: 'This analysis is for educational purposes only and is not a medical diagnosis.',
    },
  },

  filter_detected: {
    success: true,
    data: {
      photo_quality: 'fair',
      analysis_notes: 'Beauty filters or editing may have been detected. Results may not accurately reflect your skin\'s current condition. For best results, please upload an unfiltered photo.',
    },
  },
};
```

### 8.3 Fallback Strategy

```typescript
// lib/fallback.ts

export async function analyzeWithFallback(
  imageBase64: string
): Promise<SkinAnalysis> {
  try {
    // Attempt primary analysis
    return await analyzeSkin(imageBase64);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // Rate limit — retry after delay
      if (error.status === 429) {
        await sleep(2000);
        return await analyzeSkin(imageBase64);
      }

      // Model overloaded — try with shorter prompt
      if (error.status === 503) {
        return await analyzeSkinSimplified(imageBase64);
      }
    }

    // JSON parse failure — retry with stricter prompt
    if (error instanceof SyntaxError) {
      return await analyzeSkinStrict(imageBase64);
    }

    throw error;
  }
}

// Simplified prompt for fallback
const SIMPLIFIED_PROMPT = `
Analyze this face photo for skin concerns. Return valid JSON only:
{
  "photo_quality": "good"|"fair"|"poor",
  "skin_type": "dry"|"oily"|"combination"|"normal"|"sensitive",
  "overall_score": 0-100,
  "concerns": [{"type":"<name>","severity":0.0-1.0,"location":["<area>"],"confidence":0.0-1.0}]
}
Concerns: dehydration, fine_lines, hyperpigmentation, enlarged_pores, acne, redness, dullness, oily_skin
`;
```

---

## 9. Prompt Engineering Best Practices

### 9.1 Iteration Guidelines

```
┌──────────────────────────────────────────────────────────────┐
│                   PROMPT ITERATION CYCLE                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐                                              │
│  │ 1. Baseline │ ◄── Establish current performance            │
│  └──────┬──────┘                                              │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                              │
│  │ 2. Identify │ ◄── Find failure cases, inaccuracies         │
│  │    Issues   │                                              │
│  └──────┬──────┘                                              │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                              │
│  │ 3. Modify   │ ◄── Change ONE thing at a time               │
│  │    Prompt   │                                              │
│  └──────┬──────┘                                              │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                              │
│  │ 4. Test     │ ◄── Run against test suite                   │
│  └──────┬──────┘                                              │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                              │
│  │ 5. Compare  │ ◄── Better? Worse? Same?                     │
│  └──────┬──────┘                                              │
│         │                                                     │
│    Better ──▶ Adopt new prompt, increment version             │
│    Worse ──▶ Revert, try different modification               │
│    Same ──▶ Revert (prefer simpler prompt)                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Be specific** | List exact concern names, score ranges, JSON fields |
| **Show examples** | Include example output in prompt |
| **Constrain output** | Use `response_format: { type: 'json_object' }` |
| **One role** | "You are SkinSEOUL Analyzer" — single clear persona |
| **Negative instructions** | "Do NOT diagnose medical conditions" |
| **Temperature control** | 0.3 for consistency, not creativity |
| **Separate concerns** | Quality check vs analysis as separate calls |
| **Version everything** | Track prompt versions in output metadata |

### 9.3 Common Pitfalls

| Pitfall | Example | Fix |
|---------|---------|-----|
| Vague instructions | "Analyze the skin" | List 8 specific concerns with score ranges |
| No output format | "Tell me about the skin" | Provide exact JSON schema |
| Medical language | "Diagnose the condition" | "Detect visible cosmetic skin concerns" |
| Over-scoring | Everything gets 0.8+ severity | Add scoring anchors with visual examples |
| Inconsistency | Different results for same photo | Lower temperature to 0.3 |
| Missing edge cases | Crashes on non-face photos | Add quality validation step |
| Long prompts | 3000+ token prompts | Keep under 500 tokens for efficiency |

---

## 10. Testing Methodology

### 10.1 Test Photo Suite

Maintain a set of reference photos for consistent testing:

| ID | Description | Expected Concerns | Notes |
|----|-------------|-------------------|-------|
| T01 | Clear skin, good lighting | Few concerns, score 85+ | Baseline "healthy" |
| T02 | Visible acne, T-zone | acne 0.6+, oily_skin 0.5+ | Acne detection |
| T03 | Dry skin, flaking | dehydration 0.7+, dullness 0.4+ | Dehydration detection |
| T04 | Visible wrinkles, mature | fine_lines 0.6+ | Age-related concerns |
| T05 | Uneven skin tone | hyperpigmentation 0.5+ | Pigmentation detection |
| T06 | Redness, irritation | redness 0.6+ | Redness detection |
| T07 | Large visible pores | enlarged_pores 0.5+ | Pore detection |
| T08 | Multiple concerns | 3+ concerns detected | Multi-concern handling |
| T09 | Dark skin tone | Appropriate scoring | Skin tone bias check |
| T10 | Poor lighting | Low confidence scores | Quality handling |
| T11 | Side angle | Limited analysis | Edge case |
| T12 | With glasses | Skip eye area | Obstruction handling |

### 10.2 Accuracy Metrics

```typescript
interface TestResult {
  photo_id: string;
  prompt_version: string;
  expected_concerns: string[];
  detected_concerns: string[];
  true_positives: number;   // Correctly detected
  false_positives: number;  // Detected but not present
  false_negatives: number;  // Present but not detected
  severity_accuracy: number; // Avg deviation from expected
}

// Target metrics
const TARGETS = {
  precision: 0.80,          // 80% of detected concerns are real
  recall: 0.75,             // 75% of real concerns are detected
  severity_deviation: 0.15, // Average severity within ±0.15 of expected
  json_validity: 1.0,       // 100% valid JSON responses
  response_time: 10000,     // Under 10 seconds
};
```

### 10.3 Testing Script

```typescript
// scripts/test-prompts.ts
import { analyzeSkin } from '@/lib/openai';
import { readFileSync } from 'fs';

const TEST_PHOTOS = [
  {
    id: 'T01',
    path: './test-photos/clear-skin.jpg',
    expected: {
      skin_type: 'normal',
      min_score: 80,
      concerns: [],  // No significant concerns expected
    },
  },
  {
    id: 'T02',
    path: './test-photos/acne-tzone.jpg',
    expected: {
      skin_type: 'oily',
      concerns: [
        { type: 'acne', min_severity: 0.5 },
        { type: 'oily_skin', min_severity: 0.4 },
      ],
    },
  },
  // ... more test cases
];

async function runTests() {
  const results = [];

  for (const test of TEST_PHOTOS) {
    const imageBase64 = readFileSync(test.path, 'base64');
    const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

    const start = Date.now();
    const result = await analyzeSkin(dataUrl);
    const duration = Date.now() - start;

    const evaluation = evaluateResult(result, test.expected);

    results.push({
      id: test.id,
      duration,
      ...evaluation,
    });

    console.log(`[${test.id}] ${evaluation.passed ? 'PASS' : 'FAIL'} (${duration}ms)`);
  }

  printSummary(results);
}
```

---

## 11. A/B Testing Framework

### 11.1 Prompt Variant Testing

```typescript
// lib/ab-testing.ts

interface PromptVariant {
  id: string;
  name: string;
  weight: number;         // Traffic allocation (0-1)
  systemPrompt: string;
  analysisPrompt: string;
}

const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: 'control',
    name: 'v1.0 Baseline',
    weight: 0.8,  // 80% of traffic
    systemPrompt: SYSTEM_PROMPT_V1,
    analysisPrompt: ANALYSIS_PROMPT_V1,
  },
  {
    id: 'variant_a',
    name: 'v1.1 Enhanced scoring',
    weight: 0.2,  // 20% of traffic
    systemPrompt: SYSTEM_PROMPT_V1,
    analysisPrompt: ANALYSIS_PROMPT_V1_1,
  },
];

export function selectPromptVariant(sessionId: string): PromptVariant {
  // Deterministic selection based on session ID
  const hash = simpleHash(sessionId);
  const rand = (hash % 100) / 100;

  let cumulative = 0;
  for (const variant of PROMPT_VARIANTS) {
    cumulative += variant.weight;
    if (rand < cumulative) return variant;
  }

  return PROMPT_VARIANTS[0]; // Fallback to control
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
```

### 11.2 Metrics to Track

| Metric | Description | Measurement |
|--------|-------------|-------------|
| **Accuracy Score** | Manual review accuracy | Expert evaluation |
| **User Satisfaction** | User rating of analysis | 1-5 star rating (Phase 2) |
| **Completion Rate** | Users who view all results | Analytics funnel |
| **Product Click Rate** | Users who click products | Click tracking |
| **Processing Time** | API response duration | Server timing |
| **JSON Validity** | Percentage of valid JSON | Parse success rate |
| **Concern Distribution** | Spread of detected concerns | Statistical analysis |
| **Severity Distribution** | Score distribution pattern | Histogram analysis |

### 11.3 Analysis Template

```markdown
## A/B Test Report: [Test Name]

**Date:** [Start] - [End]
**Prompt Versions:** Control (v1.0) vs Variant (v1.1)
**Traffic Split:** 80/20
**Sample Size:** Control: [N], Variant: [N]

### Results

| Metric | Control | Variant | Diff | Significant? |
|--------|---------|---------|------|-------------|
| Accuracy | X% | Y% | +Z% | Yes/No |
| Completion Rate | X% | Y% | +Z% | Yes/No |
| Product Clicks | X% | Y% | +Z% | Yes/No |
| Avg Processing Time | Xms | Yms | -Zms | Yes/No |
| JSON Validity | X% | Y% | +Z% | Yes/No |

### Decision
[ ] Adopt variant — significant improvement
[ ] Continue testing — need more data
[ ] Reject variant — no improvement or regression

### Next Steps
- [Action items]
```

---

## 12. Prompt Changelog

### Version History

| Version | Date | Changes | Impact |
|---------|------|---------|--------|
| v1.0 | Feb 2026 | Initial prompt | Baseline |

### Planned Improvements

| Version | Target | Changes |
|---------|--------|---------|
| v1.1 | Week 3 | Add scoring anchors based on beta feedback |
| v1.2 | Month 2 | Improve skin tone handling |
| v1.3 | Month 2 | Add seasonal adjustments (winter dryness, summer oil) |
| v2.0 | Month 3 | Multi-model ensemble (GPT-4o + HautAI validation) |

### Version Tracking in Code

```typescript
// Every analysis response includes prompt version
export const CURRENT_PROMPT_VERSION = 'v1.0';

// Stored in analyses table for retrospective comparison
await supabase.from('analyses').insert({
  prompt_version: CURRENT_PROMPT_VERSION,
  model_version: 'gpt-4o-2024-08-06',
  // ... other fields
});
```

---

## Appendix

### A. Token Budget Breakdown

| Component | Tokens | Cost |
|-----------|--------|------|
| System prompt | ~380 | $0.00095 |
| Analysis prompt | ~650 | $0.001625 |
| Image (high detail) | ~765 | $0.001913 |
| Response output | ~500 | $0.005 |
| **Total per analysis** | **~2,295** | **~$0.01275** |

### B. Related Documentation

| Document | Path |
|----------|------|
| Product Requirements | `/docs/PRD.md` |
| Tech Stack | `/docs/TECH_STACK.md` |
| Database Schema | `/docs/DATABASE_SCHEMA.md` |
| API Specification | `/docs/API_SPECIFICATION.md` |
| UI Wireframes | `/docs/UI_WIREFRAMES.md` |

---

**Document Status:** ✅ Approved for Development
**Current Prompt Version:** v1.0
**Last Updated:** February 2026
