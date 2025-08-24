// src/app/api/search/route.js - WITH PAGINATION SUPPORT
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const useFuzzy = searchParams.get('fuzzy') === 'true';
    const useKeywords = searchParams.get('keywords') === 'true';
    
    // 🚀 PAGINATION SUPPORT
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const filters = {
      minPrice: searchParams.get('min_price'),
      maxPrice: searchParams.get('max_price'),
      industry: searchParams.get('industry'),
      vertical: searchParams.get('vertical'),
      parish: searchParams.get('parish'),
      featured: searchParams.get('featured') === 'true'
    };

    console.log('🔍 Search API called:', { 
      query, 
      page, 
      limit, 
      offset,
      useFuzzy, 
      useKeywords, 
      filters 
    });

    const startTime = performance.now();
    const supabase = await createClient();
    let results = [];
    let totalCount = 0;
    let searchMethod = 'none';

    if (!query || query.trim().length < 2) {
      // Return paginated services if no query
      console.log(`📋 Fetching services page ${page} (${limit} items, offset ${offset})`);
      
      // Get total count first
      const { count: total } = await supabase
        .from('service')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      totalCount = total || 0;
      
      // Get paginated results
      const { data: allServices, error } = await supabase
        .from('service')
        .select(`
          service_id,
          name,
          description,
          base_price,
          duration_minutes,
          is_featured,
          is_active,
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
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1); // Supabase uses inclusive range

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      results = allServices?.map(service => ({
        service_id: service.service_id,
        service_name: service.name,
        description: service.description,
        base_price: service.base_price,
        duration_minutes: service.duration_minutes,
        is_featured: service.is_featured,
        industry_name: service.portfolio?.vertical?.industry?.name,
        vertical_name: service.portfolio?.vertical?.name,
        portfolio_name: service.portfolio?.name,
        match_type: 'all'
      })) || [];

      searchMethod = 'all_services';
      
    } else {
      // Perform paginated search
      if (useKeywords) {
        console.log('🎯 Using keyword-based search for:', query);
        searchMethod = 'keyword';
        
        try {
          // Try the optimized database function with pagination
          const { data, error } = await supabase.rpc('search_services_by_keywords', {
            search_query: query.trim(),
            max_results: limit,
            offset_results: offset
          });

          if (error) {
            console.warn('⚠️ Database function failed, using manual approach:', error);
            throw error;
          }

          if (data && data.length > 0) {
            results = data.map(service => ({
              service_id: service.service_id,
              service_name: service.service_name,
              description: service.description,
              base_price: service.base_price,
              duration_minutes: service.duration_minutes,
              is_featured: service.is_featured,
              industry_name: service.industry_name,
              vertical_name: service.vertical_name,
              portfolio_name: service.portfolio_name,
              matched_keyword: service.matched_keyword,
              match_type: 'keyword',
              relevance_score: service.relevance_score
            }));
            
            // For search results, we estimate total count
            totalCount = data.length === limit ? (page * limit) + 1 : (offset + data.length);
            
            console.log(`✅ Database function found ${results.length} keyword results`);
          }

        } catch (dbError) {
          console.log('🔄 Database function failed, using manual keyword search');
          
          // Manual keyword search with pagination
          const { data: keywordMatches, error: keywordError } = await supabase
            .from('skeyword')
            .select('search_term, service_id')
            .ilike('search_term', `%${query.trim()}%`);

          if (keywordError) {
            console.error('❌ Manual keyword lookup failed:', keywordError);
            throw keywordError;
          }

          if (keywordMatches && keywordMatches.length > 0) {
            const serviceIds = [...new Set(keywordMatches.map(match => match.service_id))];
            totalCount = serviceIds.length;
            
            console.log(`🎯 Manual search found ${serviceIds.length} service IDs`);

            const { data: services, error: serviceError } = await supabase
              .from('service')
              .select(`
                service_id,
                name,
                description,
                base_price,
                duration_minutes,
                is_featured,
                is_active,
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
              `)
              .in('service_id', serviceIds)
              .eq('is_active', true)
              .order('is_featured', { ascending: false })
              .order('name', { ascending: true })
              .range(offset, offset + limit - 1);

            if (serviceError) {
              throw serviceError;
            }

            if (services && services.length > 0) {
              results = services.map(service => {
                const matchedKeywords = keywordMatches
                  .filter(match => match.service_id === service.service_id)
                  .map(match => match.search_term);

                return {
                  service_id: service.service_id,
                  service_name: service.name,
                  description: service.description,
                  base_price: service.base_price,
                  duration_minutes: service.duration_minutes,
                  is_featured: service.is_featured,
                  industry_name: service.portfolio?.vertical?.industry?.name,
                  vertical_name: service.portfolio?.vertical?.name,
                  portfolio_name: service.portfolio?.name,
                  matched_keyword: matchedKeywords[0],
                  all_matched_keywords: matchedKeywords,
                  match_type: 'keyword'
                };
              });
              
              console.log(`✅ Manual keyword search found ${results.length} services`);
            }
          }
        }
      }

      // If no keyword results, try direct search with pagination
      if (results.length === 0) {
        console.log('🔄 No keyword results, trying direct search');
        searchMethod = 'direct';
        
        // Get total count for direct search
        const { count: directTotal } = await supabase
          .from('service')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .or(`name.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`);
          
        totalCount = directTotal || 0;
        
        // Get paginated direct results
        const { data: directResults, error: directError } = await supabase
          .from('service')
          .select(`
            service_id,
            name,
            description,
            base_price,
            duration_minutes,
            is_featured,
            is_active,
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
          `)
          .eq('is_active', true)
          .or(`name.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`)
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true })
          .range(offset, offset + limit - 1);

        if (directError) {
          throw directError;
        }

        results = directResults?.map(service => ({
          service_id: service.service_id,
          service_name: service.name,
          description: service.description,
          base_price: service.base_price,
          duration_minutes: service.duration_minutes,
          is_featured: service.is_featured,
          industry_name: service.portfolio?.vertical?.industry?.name,
          vertical_name: service.portfolio?.vertical?.name,
          portfolio_name: service.portfolio?.name,
          match_type: 'direct'
        })) || [];

        console.log(`✅ Direct search found ${results.length} results`);
      }
    }

    // Apply additional filters (this might need adjustment for large datasets)
    let filteredResults = results;
    let filtersApplied = [];
    
    if (filters.minPrice || filters.maxPrice) {
      const originalCount = filteredResults.length;
      filteredResults = filteredResults.filter(result => {
        const price = result.base_price || 0;
        if (filters.minPrice && filters.maxPrice) {
          return price >= parseFloat(filters.minPrice) && price <= parseFloat(filters.maxPrice);
        } else if (filters.minPrice) {
          return price >= parseFloat(filters.minPrice);
        } else if (filters.maxPrice) {
          return price <= parseFloat(filters.maxPrice);
        }
        return true;
      });
      if (filteredResults.length !== originalCount) {
        if (filters.minPrice && filters.maxPrice) {
          filtersApplied.push(`price: J$${filters.minPrice}-${filters.maxPrice}`);
        } else if (filters.minPrice) {
          filtersApplied.push(`min price: J$${filters.minPrice}`);
        } else if (filters.maxPrice) {
          filtersApplied.push(`max price: J$${filters.maxPrice}`);
        }
      }
    }

    if (filters.industry) {
      const originalCount = filteredResults.length;
      filteredResults = filteredResults.filter(result => 
        result.industry_name?.toLowerCase().includes(filters.industry.toLowerCase())
      );
      if (filteredResults.length !== originalCount) {
        filtersApplied.push(`industry: ${filters.industry}`);
      }
    }

    if (filters.vertical) {
      const originalCount = filteredResults.length;
      filteredResults = filteredResults.filter(result => 
        result.vertical_name?.toLowerCase().includes(filters.vertical.toLowerCase())
      );
      if (filteredResults.length !== originalCount) {
        filtersApplied.push(`vertical: ${filters.vertical}`);
      }
    }

    if (filters.featured) {
      const originalCount = filteredResults.length;
      filteredResults = filteredResults.filter(result => result.is_featured);
      if (filteredResults.length !== originalCount) {
        filtersApplied.push('featured only');
      }
    }

    const searchTimeMs = Math.round(performance.now() - startTime);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    const responseData = {
      results: filteredResults,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasMore: hasMore,
      query: query?.trim() || '',
      searchTimeMs,
      usedFuzzy: useFuzzy,
      usedKeywords: useKeywords && results.some(r => r.match_type === 'keyword'),
      filters,
      filtersApplied,
      searchMethod,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
        hasPrevious: page > 1
      }
    };

    console.log(`✅ Search completed: ${filteredResults.length}/${totalCount} results (page ${page}/${totalPages}) in ${searchTimeMs}ms using ${searchMethod}`);
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Search API error:', error);
    return NextResponse.json({
      error: 'Search failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      results: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    }, { status: 500 });
  }
}