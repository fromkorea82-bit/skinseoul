import { NextRequest, NextResponse } from 'next/server';
import { openai, SKIN_ANALYSIS_MODEL } from '@/lib/openai';
import { SKIN_ANALYSIS_PROMPT } from '@/lib/prompts/skin-analysis';
import { recommendIngredients } from '@/lib/recommendation/recommend-ingredients';

// Rate limiting (simple in-memory for MVP)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Remove old timestamps
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again in a minute.',
          },
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { image, language = 'en' } = body;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Image is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate image format (base64)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'Invalid image format. Must be base64 encoded.',
          },
        },
        { status: 400 }
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: SKIN_ANALYSIS_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: SKIN_ANALYSIS_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No response from AI');
    }

    // Parse JSON response — strip markdown fences if present
    let analysis;
    try {
      const cleaned = analysisText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    // Check for quality errors
    if (analysis.error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POOR_PHOTO_QUALITY',
            message: analysis.message || 'Photo quality is insufficient for analysis',
          },
        },
        { status: 400 }
      );
    }

    // Generate ingredient recommendations
    const ingredients = recommendIngredients(analysis.concerns, {
      language: language as 'en' | 'ko' | 'ja' | 'zh',
      maxIngredients: 5,
    });

    const processingTime = Date.now() - startTime;

    // Return successful analysis with recommendations
    return NextResponse.json({
      success: true,
      data: {
        analysis_id: crypto.randomUUID(),
        ...analysis,
        recommended_ingredients: ingredients,
        processing_time_ms: processingTime,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        engine: 'openai-vision',
      },
    });
  } catch (error: unknown) {
    console.error('Skin analysis error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Analysis failed. Please try again.',
          details: process.env.NODE_ENV === 'development' ? message : undefined,
        },
      },
      { status: 500 }
    );
  }
}
