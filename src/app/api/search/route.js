// src/app/api/search/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const useFuzzy = searchParams.get('fuzzy') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    // Filter parameters
    const filters = {
      minPrice: searchParams.get('min_price'),
      maxPrice: searchParams.get('max_price'),
      industry: searchParams.get('industry'),
      vertical: searchParams.get('vertical'),
      parish: searchParams.get('parish'),
      featured: searchParams.get('featured') === 'true'
    };

    console.log('🔍 Search API called:', { query, useFuzzy, filters });

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Query too short'
      });
    }

    const startTime = performance.now();
    const supabase = await createClient();
    
    // Use your existing database functions
    const searchFunction = useFuzzy ? 'search_services_fuzzy' : 'search_services';
    const searchParams_db = useFuzzy ? {
      search_query: query.trim(),
      max_results: limit,
      similarity_threshold: 0.3
    } : {
      search_query: query.trim(),
      max_results: limit,
      include_inactive: false
    };

    const { data: results, error } = await supabase.rpc(searchFunction, searchParams_db);

    if (error) {
      console.error('Database search error:', error);
      throw error;
    }

    // Apply additional filters
    let filteredResults = results || [];
    
    if (filters.minPrice || filters.maxPrice) {
      filteredResults = filteredResults.filter(result => {
        const price = result.base_price || 0;
        return (!filters.minPrice || price >= parseFloat(filters.minPrice)) &&
               (!filters.maxPrice || price <= parseFloat(filters.maxPrice));
      });
    }

    if (filters.industry) {
      filteredResults = filteredResults.filter(result => 
        result.industry_name?.toLowerCase() === filters.industry.toLowerCase()
      );
    }

    if (filters.vertical) {
      filteredResults = filteredResults.filter(result => 
        result.vertical_name?.toLowerCase() === filters.vertical.toLowerCase()
      );
    }

    if (filters.featured) {
      filteredResults = filteredResults.filter(result => result.is_featured);
    }

    const searchTimeMs = Math.round(performance.now() - startTime);
    
    // Log search using your telemetry function
    try {
      await supabase.rpc('log_search', {
        p_query: query.trim(),
        p_results_count: filteredResults.length,
        p_search_time_ms: searchTimeMs,
        p_filters_applied: filters
      });
    } catch (logError) {
      console.warn('Failed to log search:', logError);
    }

    console.log(`✅ Search completed: ${filteredResults.length} results in ${searchTimeMs}ms`);

    return NextResponse.json({
      results: filteredResults,
      total: filteredResults.length,
      query: query.trim(),
      searchTimeMs,
      usedFuzzy,
      filters
    });

  } catch (error) {
    console.error('💥 Search API error:', error);
    return NextResponse.json({
      error: 'Search failed',
      message: error.message
    }, { status: 500 });
  }
}