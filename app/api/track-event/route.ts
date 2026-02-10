import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, product_id, affiliate_source, url } = body;

    if (!event || !product_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields: event, product_id' } },
        { status: 400 }
      );
    }

    // MVP: Log affiliate click events to console
    // TODO: Store in Supabase analytics table for production
    console.log('[Track Event]', {
      event,
      product_id,
      affiliate_source,
      url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to track event' } },
      { status: 500 }
    );
  }
}
