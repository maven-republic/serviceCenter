// src/app/api/search/route.js 
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    console.log('🔍 Search API called with query:', query, 'type:', type);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Search query is required'
      }, { status: 400 });
    }

    const supabase = await createClient();
    let results = [];

    // Search Services (SIMPLIFIED - no nested joins for now)
    if (type === 'all' || type === 'services') {
      console.log('🔍 Searching services...');
      const { data: services, error: serviceError } = await supabase
        .from('service')
        .select(`
          service_id,
          name,
          description,
          base_price,
          pricing_model,
          price_type,
          duration_minutes,
          is_featured,
          created_at
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .range(offset, offset + limit - 1);

      if (serviceError) {
        console.error('❌ Service search error:', serviceError);
      } else {
        console.log('✅ Services found:', services?.length || 0);
        
        if (services) {
          results.push(...services.map(service => ({
            ...service,
            type: 'service',
            title: service.name,
            subtitle: service.description?.substring(0, 100),
            category: 'Service',
            price: service.base_price,
            pricing_model: service.pricing_model,
            match_type: 'direct'
          })));
        }
      }

      // Search Keywords separately
      console.log('🔍 Searching keywords...');
      const { data: keywordResults, error: keywordError } = await supabase
        .from('skeyword')
        .select('service_id, search_term')
        .ilike('search_term', `%${query}%`);

      if (keywordError) {
        console.error('❌ Keyword search error:', keywordError);
      } else if (keywordResults && keywordResults.length > 0) {
        console.log('✅ Keywords found:', keywordResults.length);
        
        // Get services for matching keywords
        const serviceIds = keywordResults.map(kr => kr.service_id);
        const { data: keywordServices } = await supabase
          .from('service')
          .select(`
            service_id,
            name,
            description,
            base_price,
            pricing_model
          `)
          .in('service_id', serviceIds)
          .eq('is_active', true);

        if (keywordServices) {
          const existingIds = new Set(results.filter(r => r.type === 'service').map(s => s.service_id));
          const newKeywordServices = keywordServices
            .filter(ks => !existingIds.has(ks.service_id))
            .map(service => ({
              ...service,
              type: 'service',
              title: service.name,
              subtitle: service.description?.substring(0, 100),
              category: 'Service',
              price: service.base_price,
              pricing_model: service.pricing_model,
              match_type: 'keyword',
              matched_keyword: keywordResults.find(kr => kr.service_id === service.service_id)?.search_term
            }));
          
          results.push(...newKeywordServices);
        }
      }
    }

    // Search Professionals (SIMPLIFIED)
    if (type === 'all' || type === 'professionals') {
      console.log('🔍 Searching professionals...');
      
      // Search by first name
      const { data: profsByFirstName } = await supabase
        .from('individual_professional')
        .select(`
          professional_id,
          bio,
          experience,
          hourly_rate,
          daily_rate,
          verification_status,
          account!inner(first_name, last_name, profile_picture_url)
        `)
        .ilike('account.first_name', `%${query}%`)
        .limit(5);

      // Search by last name  
      const { data: profsByLastName } = await supabase
        .from('individual_professional')
        .select(`
          professional_id,
          bio,
          experience,
          hourly_rate,
          daily_rate,
          verification_status,
          account!inner(first_name, last_name, profile_picture_url)
        `)
        .ilike('account.last_name', `%${query}%`)
        .limit(5);

      // Combine and deduplicate professionals
      const allProfessionals = [
        ...(profsByFirstName || []),
        ...(profsByLastName || [])
      ];

      const uniqueProfessionals = allProfessionals.filter((prof, index, self) =>
        index === self.findIndex(p => p.professional_id === prof.professional_id)
      );

      console.log('✅ Professionals found:', uniqueProfessionals.length);

      if (uniqueProfessionals.length > 0) {
        results.push(...uniqueProfessionals.map(prof => ({
          ...prof,
          type: 'professional',
          title: `${prof.account?.first_name} ${prof.account?.last_name}`,
          subtitle: prof.bio?.substring(0, 100) + (prof.bio?.length > 100 ? '...' : ''),
          category: 'Professional',
          price: prof.hourly_rate,
          pricing_model: 'hourly',
          image: prof.account?.profile_picture_url
        })));
      }
    }

    // Search Categories (SIMPLIFIED)
    if (type === 'all' || type === 'categories') {
      console.log('🔍 Searching industries...');
      const { data: industries } = await supabase
        .from('industry')
        .select('industry_id, name, description, icon')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(5);

      console.log('🔍 Searching verticals...');
      const { data: verticals } = await supabase
        .from('vertical')
        .select('vertical_id, name, description')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(5);

      if (industries) {
        results.push(...industries.map(industry => ({
          ...industry,
          type: 'industry',
          title: industry.name,
          subtitle: industry.description,
          category: 'Industry',
          icon: industry.icon
        })));
      }

      if (verticals) {
        results.push(...verticals.map(vertical => ({
          ...vertical,
          type: 'vertical',
          title: vertical.name,
          subtitle: vertical.description,
          category: 'Category'
        })));
      }
    }

    // Sort results by relevance
    results.sort((a, b) => {
      const aExact = a.title?.toLowerCase() === query.toLowerCase() ? 1 : 0;
      const bExact = b.title?.toLowerCase() === query.toLowerCase() ? 1 : 0;
      
      if (aExact !== bExact) return bExact - aExact;
      
      const typePriority = { service: 3, professional: 2, industry: 1, vertical: 1 };
      return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
    });

    const total = results.length;
    console.log('📊 Total results:', total);

    return NextResponse.json({
      results: results.slice(0, limit),
      total,
      query,
      type
    });

  } catch (error) {
    console.error('💥 Search API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}