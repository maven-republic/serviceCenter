import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || null;
  const subcategory = searchParams.get('subcategory') || null;
  const parish = searchParams.get('parish') || null;
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
  const experienceLevel = searchParams.get('experience') || null;
  const verified = searchParams.get('verified') === 'true';
  const sortBy = searchParams.get('sortBy') || 'relevance';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  if (!query) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const supabase = createClient();
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  let results = [];
  let total = 0;
  
  try {
    // Get categories for filters
    const { data: categories } = await supabase
      .from('service_category')
      .select('category_id, name, path')
      .eq('is_active', true)
      .order('display_order');
      
    // Get parishes for filters
    const { data: parishes } = await supabase
      .rpc('get_distinct_parishes');

    if (type === 'all' || type === 'service') {
      // Build service query based on authentication status
      let serviceQuery = supabase.from('service');
      
      if (isAuthenticated) {
        // Full data for authenticated users
        serviceQuery = serviceQuery.select(`
          service_id, 
          name, 
          description, 
          base_price,
          service_image(*),
          pricing_tier(*),
          requirement(*),
          service_subcategory(
            name, 
            service_category(name)
          )
        `, { count: 'exact' });
      } else {
        // Limited data for non-authenticated users
        serviceQuery = serviceQuery.select(`
          service_id, 
          name, 
          description, 
          base_price,
          service_image(image_url, is_primary).filter(is_primary.eq.true),
          service_subcategory(
            name, 
            service_category(name)
          )
        `, { count: 'exact' });
      }
      
      // Apply filters
      if (category) {
        serviceQuery = serviceQuery.filter('service_subcategory.service_category.category_id', 'eq', category);
      }
      
      if (subcategory) {
        serviceQuery = serviceQuery.filter('service_subcategory.subcategory_id', 'eq', subcategory);
      }
      
      if (minPrice !== null) {
        serviceQuery = serviceQuery.gte('base_price', minPrice);
      }
      
      if (maxPrice !== null) {
        serviceQuery = serviceQuery.lte('base_price', maxPrice);
      }
      
      // Search term filter
      serviceQuery = serviceQuery.or(`
        name.ilike.%${query}%,
        description.ilike.%${query}%
      `);
      
      // Apply sorting
      switch (sortBy) {
        case 'price':
          serviceQuery = serviceQuery.order('base_price', { ascending: sortOrder === 'asc' });
          break;
        case 'featured':
          serviceQuery = serviceQuery.order('is_featured', { ascending: false });
          break;
        default: // relevance
          serviceQuery = serviceQuery.order('is_featured', { ascending: false });
      }
      
      // Apply pagination
      serviceQuery = serviceQuery.range(from, to);
      
      // Get services with direct match
      const { data: services, count: serviceCount, error: serviceError } = await serviceQuery;
      
      if (serviceError) {
        console.error("Service search error:", serviceError);
        return NextResponse.json(
          { error: "Error searching services" }, 
          { status: 500 }
        );
      }
      
      // Search through service_search_term table for matching terms
      let termQuery = supabase.from('service_search_term');
      
      if (isAuthenticated) {
        termQuery = termQuery.select(`
          service:service_id(
            service_id,
            name, 
            description, 
            base_price,
            service_image(*),
            pricing_tier(*),
            requirement(*),
            service_subcategory(
              name, 
              service_category(name)
            )
          )
        `);
      } else {
        termQuery = termQuery.select(`
          service:service_id(
            service_id,
            name, 
            description, 
            base_price,
            service_image(image_url, is_primary).filter(is_primary.eq.true),
            service_subcategory(
              name, 
              service_category(name)
            )
          )
        `);
      }
      
      termQuery = termQuery.textSearch('search_term', query);
      
      // Apply same filters to term search
      if (category) {
        termQuery = termQuery.filter('service.service_subcategory.service_category.category_id', 'eq', category);
      }
      
      if (subcategory) {
        termQuery = termQuery.filter('service.service_subcategory.subcategory_id', 'eq', subcategory);
      }
      
      termQuery = termQuery.range(from, to);
      
      const { data: termMatches, error: termError } = await termQuery;
      
      if (termError) {
        console.error("Term search error:", termError);
      }
      
      // Combine and deduplicate results
      const serviceMap = new Map();
      
      // Add direct matches
      (services || []).forEach(service => {
        serviceMap.set(service.service_id, {
          type: 'service',
          ...service,
          match_type: 'direct'
        });
      });
      
      // Add term matches, avoiding duplicates
      (termMatches || []).forEach(item => {
        if (item.service && !serviceMap.has(item.service.service_id)) {
          serviceMap.set(item.service.service_id, {
            type: 'service',
            ...item.service,
            match_type: 'term'
          });
        }
      });
      
      results = [...serviceMap.values()];
      total = serviceCount || results.length;
    }
    
    // PROVIDER SEARCH
    if (type === 'all' || type === 'provider') {
      // Build provider query based on authentication status
      let providerQuery = supabase.from('individual_professional');
      
      if (isAuthenticated) {
        // Full data for authenticated users
        providerQuery = providerQuery.select(`
          professional_id,
          bio,
          experience,
          hourly_rate,
          daily_rate,
          verification_status,
          identity_verified,
          skills_verified,
          account:account_id(
            account_id,
            first_name,
            last_name,
            email,
            profile_picture_url
          ),
          professional_expertise!inner(
            category_id,
            experience_years,
            service_category:category_id(
              name,
              path
            )
          )
        `, { count: 'exact' });
      } else {
        // Limited data for non-authenticated users
        providerQuery = providerQuery.select(`
          professional_id,
          bio,
          experience,
          hourly_rate,
          verification_status,
          account:account_id(
            first_name,
            last_name,
            profile_picture_url
          ),
          professional_expertise!inner(
            service_category:category_id(
              name
            )
          )
        `, { count: 'exact' });
      }
      
      // Apply filters
      if (experienceLevel) {
        providerQuery = providerQuery.eq('experience', experienceLevel);
      }
      
      if (verified) {
        providerQuery = providerQuery.eq('verification_status', 'verified');
      }
      
      if (category) {
        providerQuery = providerQuery.filter('professional_expertise.category_id', 'eq', category);
      }
      
      if (parish) {
        // This assumes there's a way to join with address table
        // You might need to adjust this based on your actual schema relationship
        providerQuery = providerQuery.filter('address.parish', 'eq', parish);
      }
      
      // Search term filter
      providerQuery = providerQuery.or(
        `bio.ilike.%${query}%,account.first_name.ilike.%${query}%,account.last_name.ilike.%${query}%`
      );
      
      // Apply sorting
      switch (sortBy) {
        case 'price':
          providerQuery = providerQuery.order('hourly_rate', { ascending: sortOrder === 'asc' });
          break;
        case 'experience':
          providerQuery = providerQuery.order('experience', { ascending: false });
          break;
        default: // relevance
          // No specific ordering
      }
      
      // Apply pagination
      providerQuery = providerQuery.range(from, to);
      
      // Execute query
      const { data: providers, count: providerCount, error: providerError } = await providerQuery;
      
      if (providerError) {
        console.error("Provider search error:", providerError);
      } else {
        // Format providers
        const formattedProviders = (providers || []).map(provider => {
          // For non-authenticated users, mask the full name
          const displayName = isAuthenticated 
            ? `${provider.account.first_name} ${provider.account.last_name}`
            : `${provider.account.first_name} ${provider.account.last_name.charAt(0)}.`;
            
          return {
            type: 'provider',
            ...provider,
            displayName
          };
        });
        
        results = [...results, ...formattedProviders];
        total += providerCount || 0;
      }
    }
    
    // Return results with metadata
    return NextResponse.json({
      results,
      total,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: to < total - 1
      },
      filters: {
        categories: categories || [],
        parishes: parishes || []
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" }, 
      { status: 500 }
    );
  }
}
