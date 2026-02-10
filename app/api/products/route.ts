import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredient = searchParams.get('ingredient');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by ingredient (search in primary ingredients JSONB)
    if (ingredient) {
      query = query.contains('ingredients->>primary', [ingredient]);
    }

    // Sort
    switch (sort) {
      case 'price_low':
        query = query.order('price_usd', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        query = query.order('price_usd', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('review_count', { ascending: false, nullsFirst: false });
        break;
      case 'rating':
      default:
        query = query.order('rating', { ascending: false, nullsFirst: false });
        break;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Products query error:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch products' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
