// src/app/api/search/suggestions/route.js - COMPLETELY REWRITTEN
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 8;

    console.log('🔍 Suggestions API called with query:', query);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        suggestions: [],
        message: 'Query must be at least 2 characters'
      });
    }

    const supabase = await createClient();
    const suggestions = [];
    const searchTerm = query.trim().toLowerCase();

    try {
      // 1. Search Services (Primary Priority)
      console.log('🔍 Searching services...');
      const { data: services, error: serviceError } = await supabase
        .from('service')
        .select('service_id, name')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(4);

      if (serviceError) {
        console.error('❌ Service error:', serviceError.message);
      } else if (services && services.length > 0) {
        console.log('✅ Found', services.length, 'services');
        suggestions.push(...services.map(service => ({
          id: service.service_id,
          type: 'service',
          text: service.name,
          badge: 'Service',
          priority: service.name.toLowerCase().startsWith(searchTerm) ? 1 : 2
        })));
      }

      // 2. Search Keywords (Secondary Priority)
      console.log('🔍 Searching keywords...');
      const { data: keywords, error: keywordError } = await supabase
        .from('skeyword')
        .select('search_term')
        .ilike('search_term', `%${searchTerm}%`)
        .limit(3);

      if (keywordError) {
        console.error('❌ Keyword error:', keywordError.message);
      } else if (keywords && keywords.length > 0) {
        console.log('✅ Found', keywords.length, 'keywords');
        suggestions.push(...keywords.map(keyword => ({
          id: `keyword-${keyword.search_term}`,
          type: 'keyword',
          text: keyword.search_term,
          badge: 'Related',
          priority: keyword.search_term.toLowerCase().startsWith(searchTerm) ? 1 : 3
        })));
      }

      // 3. Search Industries (Tertiary Priority)
      console.log('🔍 Searching industries...');
      const { data: industries, error: industryError } = await supabase
        .from('industry')
        .select('industry_id, name')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(2);

      if (industryError) {
        console.error('❌ Industry error:', industryError.message);
      } else if (industries && industries.length > 0) {
        console.log('✅ Found', industries.length, 'industries');
        suggestions.push(...industries.map(industry => ({
          id: industry.industry_id,
          type: 'industry',
          text: industry.name,
          badge: 'Category',
          priority: industry.name.toLowerCase().startsWith(searchTerm) ? 1 : 4
        })));
      }

      // 4. Search Verticals (Quaternary Priority)
      console.log('🔍 Searching verticals...');
      const { data: verticals, error: verticalError } = await supabase
        .from('vertical')
        .select('vertical_id, name')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(2);

      if (verticalError) {
        console.error('❌ Vertical error:', verticalError.message);
      } else if (verticals && verticals.length > 0) {
        console.log('✅ Found', verticals.length, 'verticals');
        suggestions.push(...verticals.map(vertical => ({
          id: vertical.vertical_id,
          type: 'vertical',
          text: vertical.name,
          badge: 'Category',
          priority: vertical.name.toLowerCase().startsWith(searchTerm) ? 1 : 5
        })));
      }

    } catch (dbError) {
      console.error('💥 Database error:', dbError);
      // Return empty suggestions instead of failing
      return NextResponse.json({
        suggestions: [],
        query,
        total: 0,
        error: 'Database temporarily unavailable'
      });
    }

    // Process and sort suggestions
    const processedSuggestions = suggestions
      // Remove duplicates by text
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => 
          s.text.toLowerCase() === suggestion.text.toLowerCase()
        )
      )
      // Sort by priority and relevance
      .sort((a, b) => {
        // First by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        
        // Then by type preference
        const typeOrder = { service: 1, keyword: 2, industry: 3, vertical: 4 };
        const aTypeOrder = typeOrder[a.type] || 5;
        const bTypeOrder = typeOrder[b.type] || 5;
        
        if (aTypeOrder !== bTypeOrder) {
          return aTypeOrder - bTypeOrder;
        }
        
        // Finally by alphabetical order
        return a.text.localeCompare(b.text);
      })
      // Limit final results
      .slice(0, limit);

    console.log('📊 Final suggestions:', processedSuggestions.length);
    console.log('📋 Suggestions:', processedSuggestions.map(s => `${s.type}: ${s.text}`));

    return NextResponse.json({
      suggestions: processedSuggestions,
      query,
      total: processedSuggestions.length
    });

  } catch (error) {
    console.error('💥 Suggestions API error:', error);
    return NextResponse.json({
      suggestions: [],
      query: query || '',
      total: 0,
      error: 'Search suggestions temporarily unavailable'
    });
  }
}