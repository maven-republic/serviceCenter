// src/app/api/search/keywords/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const minCount = parseInt(searchParams.get('min_count')) || 2;

    console.log('🔍 Keywords API called with:', { limit, minCount });

    const supabase = await createClient();
    const startTime = Date.now();

    // Get all keywords with their service counts efficiently
    const { data: keywordData, error } = await supabase
      .from('skeyword')
      .select(`
        search_term,
        service:service_id (
          service_id,
          is_active,
          name,
          portfolio:portfolio_id (
            portfolio_id,
            name,
            vertical:vertical_id (
              vertical_id,
              name,
              industry:industry_id (
                industry_id,
                name
              )
            )
          )
        )
      `);

    if (error) {
      console.error('❌ Keywords query error:', error);
      throw error;
    }

    console.log(`📊 Processing ${keywordData?.length || 0} keyword-service relationships`);

    // Process keywords to count only active services
    const keywordMap = new Map();
    
    keywordData?.forEach(row => {
      const term = row.search_term?.toLowerCase().trim();
      const service = row.service;
      
      // Skip if no valid term or service is inactive
      if (!term || !service || !service.is_active) {
        return;
      }
      
      if (!keywordMap.has(term)) {
        keywordMap.set(term, {
          keyword: term,
          service_count: 0,
          services: new Set(),
          sample_services: [],
          industries: new Set(),
          verticals: new Set()
        });
      }
      
      const entry = keywordMap.get(term);
      
      // Only count unique services
      if (!entry.services.has(service.service_id)) {
        entry.services.add(service.service_id);
        entry.service_count = entry.services.size;
        
        // Store sample service info (up to 5 samples)
        if (entry.sample_services.length < 5) {
          entry.sample_services.push({
            id: service.service_id,
            name: service.name,
            industry: service.portfolio?.vertical?.industry?.name,
            vertical: service.portfolio?.vertical?.name,
            portfolio: service.portfolio?.name
          });
        }
        
        // Track industries and verticals for this keyword
        if (service.portfolio?.vertical?.industry?.name) {
          entry.industries.add(service.portfolio.vertical.industry.name);
        }
        if (service.portfolio?.vertical?.name) {
          entry.verticals.add(service.portfolio.vertical.name);
        }
      }
    });

    // Convert to array and filter by minimum count
    const popularKeywords = Array.from(keywordMap.values())
      .filter(k => k.service_count >= minCount)
      .sort((a, b) => {
        // Sort by count first (descending), then alphabetically
        if (b.service_count !== a.service_count) {
          return b.service_count - a.service_count;
        }
        return a.keyword.localeCompare(b.keyword);
      })
      .slice(0, limit)
      .map(k => ({
        keyword: k.keyword,
        service_count: k.service_count,
        sample_services: k.sample_services,
        industries: Array.from(k.industries),
        verticals: Array.from(k.verticals),
        // FIX: Convert Sets to Arrays before passing to categorizeKeyword
        category: categorizeKeyword(k.keyword, Array.from(k.verticals), Array.from(k.industries))
      }));

    const searchTime = Date.now() - startTime;

    console.log(`✅ Keywords processed: ${popularKeywords.length} keywords in ${searchTime}ms`);
    console.log('📈 Top keywords:', popularKeywords.slice(0, 5).map(k => `${k.keyword} (${k.service_count})`));

    const stats = {
      totalKeywordEntries: keywordData?.length || 0,
      uniqueKeywords: keywordMap.size,
      popularKeywords: popularKeywords.length,
      averageServicesPerKeyword: popularKeywords.length > 0 
        ? Math.round(popularKeywords.reduce((sum, k) => sum + k.service_count, 0) / popularKeywords.length)
        : 0
    };

    return NextResponse.json({
      keywords: popularKeywords,
      total: popularKeywords.length,
      searchTimeMs: searchTime,
      stats,
      filters: {
        limit,
        minCount
      }
    });

  } catch (error) {
    console.error('💥 Keywords API error:', error);
    
    // Return enhanced fallback data based on your service catalog
    const fallbackKeywords = [
      { keyword: 'emergency plumber', service_count: 11, category: 'plumbing' },
      { keyword: 'welding services', service_count: 25, category: 'welding' },
      { keyword: 'water heater repair', service_count: 6, category: 'plumbing' },
      { keyword: 'drain cleaning', service_count: 5, category: 'plumbing' },
      { keyword: 'pipe repair', service_count: 7, category: 'plumbing' },
      { keyword: 'custom welding', service_count: 6, category: 'welding' },
      { keyword: 'kitchen plumbing', service_count: 6, category: 'plumbing' },
      { keyword: 'bathroom plumbing', service_count: 5, category: 'plumbing' },
      { keyword: 'gas line installation', service_count: 4, category: 'plumbing' },
      { keyword: 'commercial plumbing', service_count: 8, category: 'plumbing' },
      { keyword: 'artistic welding', service_count: 3, category: 'welding' },
      { keyword: 'steel welding', service_count: 5, category: 'welding' },
      { keyword: 'automotive welding', service_count: 3, category: 'welding' },
      { keyword: 'construction welding', service_count: 4, category: 'welding' },
      { keyword: 'outdoor plumbing', service_count: 6, category: 'plumbing' },
      { keyword: 'sewer repair', service_count: 4, category: 'plumbing' },
      { keyword: 'leak detection', service_count: 3, category: 'plumbing' },
      { keyword: 'toilet repair', service_count: 4, category: 'plumbing' },
      { keyword: 'emergency repair', service_count: 6, category: 'emergency' },
      { keyword: 'metal fabrication', service_count: 4, category: 'welding' }
    ];
    
    return NextResponse.json({
      keywords: fallbackKeywords,
      total: fallbackKeywords.length,
      searchTimeMs: 0,
      error: 'Using fallback data',
      message: error.message,
      stats: {
        totalKeywordEntries: 0,
        uniqueKeywords: fallbackKeywords.length,
        popularKeywords: fallbackKeywords.length,
        averageServicesPerKeyword: 5
      }
    });
  }
}

// Helper function to categorize keywords
function categorizeKeyword(keyword, verticals, industries) {
  const term = keyword.toLowerCase();
  
  // FIX: Add safety check to ensure verticals is an array
  const verticalsArray = Array.isArray(verticals) ? verticals : [];
  const industriesArray = Array.isArray(industries) ? industries : [];
  
  // Check verticals first
  if (verticalsArray.some(v => v?.toLowerCase().includes('plumb'))) {
    return 'plumbing';
  }
  if (verticalsArray.some(v => v?.toLowerCase().includes('weld'))) {
    return 'welding';
  }
  if (verticalsArray.some(v => v?.toLowerCase().includes('electric'))) {
    return 'electrical';
  }
  
  // Check industries too
  if (industriesArray.some(i => i?.toLowerCase().includes('plumb'))) {
    return 'plumbing';
  }
  if (industriesArray.some(i => i?.toLowerCase().includes('weld'))) {
    return 'welding';
  }
  if (industriesArray.some(i => i?.toLowerCase().includes('electric'))) {
    return 'electrical';
  }
  
  // Fallback to keyword analysis
  if (term.includes('plumb') || term.includes('drain') || term.includes('pipe') || 
      term.includes('toilet') || term.includes('water') || term.includes('sewer')) {
    return 'plumbing';
  }
  if (term.includes('weld') || term.includes('metal') || term.includes('steel') || 
      term.includes('fabricat')) {
    return 'welding';
  }
  if (term.includes('electric') || term.includes('wire') || term.includes('power')) {
    return 'electrical';
  }
  if (term.includes('emergency') || term.includes('urgent') || term.includes('24/7')) {
    return 'emergency';
  }
  if (term.includes('commercial') || term.includes('business') || term.includes('industrial')) {
    return 'commercial';
  }
  if (term.includes('residential') || term.includes('home') || term.includes('house')) {
    return 'residential';
  }
  
  return 'general';
}