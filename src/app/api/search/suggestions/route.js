// src/app/api/search/suggestions/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 6;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = await createClient();
    
    const { data: suggestions, error } = await supabase.rpc('get_search_suggestions', {
      search_query: query.trim(),
      limit_count: limit
    });

    if (error) {
      console.error('Suggestions error:', error);
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json({
      suggestions: suggestions || []
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}