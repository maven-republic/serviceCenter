// src/app/api/services/route.js - COMPLETE REWRITE
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const featured = searchParams.get('featured');
    const industry = searchParams.get('industry');
    const vertical = searchParams.get('vertical');
    const portfolio = searchParams.get('portfolio');
    const sortBy = searchParams.get('sort') || 'featured'; // featured, name, price, newest

    console.log('📋 Services API called:', { limit, offset, featured, industry, vertical, portfolio, sortBy });

    const startTime = performance.now();
    const supabase = await createClient();

    // Build the query
    let query = supabase
      .from('service')
      .select(`
        service_id,
        name,
        description,
        base_price,
        duration_minutes,
        is_featured,
        is_active,
        created_at,
        pricing_model,
        price_type,
        display_order,
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
      .eq('is_active', true);

    // Apply filters
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    } else if (featured === 'false') {
      query = query.eq('is_featured', false);
    }

    if (industry) {
      query = query.eq('portfolio.vertical.industry.name', industry);
    }

    if (vertical) {
      query = query.eq('portfolio.vertical.name', vertical);
    }

    if (portfolio) {
      query = query.eq('portfolio.name', portfolio);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'price_low':
        query = query.order('base_price', { ascending: true, nullsLast: true });
        break;
      case 'price_high':
        query = query.order('base_price', { ascending: false, nullsLast: true });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'display_order':
        query = query.order('display_order', { ascending: true, nullsLast: true });
        break;
      case 'featured':
      default:
        query = query
          .order('is_featured', { ascending: false })
          .order('display_order', { ascending: true, nullsLast: true })
          .order('name', { ascending: true });
        break;
    }

    // Apply pagination
    const { data: services, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('❌ Services query error:', error);
      throw error;
    }

    // Transform the data
    const transformedServices = services?.map(service => ({
      service_id: service.service_id,
      service_name: service.name,
      name: service.name, // Keep both for compatibility
      description: service.description,
      base_price: service.base_price,
      duration_minutes: service.duration_minutes,
      is_featured: service.is_featured,
      is_active: service.is_active,
      created_at: service.created_at,
      pricing_model: service.pricing_model,
      price_type: service.price_type,
      display_order: service.display_order,
      industry_name: service.portfolio?.vertical?.industry?.name,
      vertical_name: service.portfolio?.vertical?.name,
      portfolio_name: service.portfolio?.name,
      portfolio_id: service.portfolio?.portfolio_id,
      vertical_id: service.portfolio?.vertical?.vertical_id,
      industry_id: service.portfolio?.vertical?.industry?.industry_id,
      // Computed fields
      formatted_price: formatPrice(service.base_price, service.pricing_model),
      formatted_duration: formatDuration(service.duration_minutes),
      category: service.portfolio?.vertical?.name || 'General'
    })) || [];

    // Get total count for pagination (if not already provided)
    let totalCount = count;
    if (totalCount === null) {
      const { count: totalCountQuery } = await supabase
        .from('service')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      totalCount = totalCountQuery || 0;
    }

    const searchTimeMs = Math.round(performance.now() - startTime);

    // Generate statistics
    const stats = generateServiceStats(transformedServices);

    console.log(`✅ Services fetched: ${transformedServices.length} of ${totalCount} in ${searchTimeMs}ms`);

    const response = {
      services: transformedServices,
      total: totalCount || transformedServices.length,
      count: transformedServices.length,
      offset,
      limit,
      searchTimeMs,
      stats,
      filters: {
        featured,
        industry,
        vertical,
        portfolio,
        sortBy
      },
      pagination: {
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNextPage: offset + limit < (totalCount || 0),
        hasPrevPage: offset > 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Services API error:', error);
    
    // Return fallback empty response
    return NextResponse.json({
      services: [],
      total: 0,
      count: 0,
      offset: 0,
      limit: 50,
      searchTimeMs: 0,
      error: 'Failed to fetch services',
      message: error.message,
      stats: {
        featured: 0,
        industries: [],
        verticals: [],
        portfolios: [],
        priceRange: { min: 0, max: 0, average: 0 }
      },
      filters: {},
      pagination: {
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 });
  }
}

// Helper functions
function formatPrice(price, pricingModel) {
  if (!price) return 'Quote required';
  
  const formatted = new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  
  switch (pricingModel) {
    case 'hourly':
      return `${formatted}/hr`;
    case 'daily':
      return `${formatted}/day`;
    case 'weekly':
      return `${formatted}/week`;
    case 'monthly':
      return `${formatted}/month`;
    case 'per_unit':
      return `${formatted}/unit`;
    case 'fixed':
    default:
      return `From ${formatted}`;
  }
}

function formatDuration(minutes) {
  if (!minutes) return 'Duration varies';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  } else { // Days
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${days}d ${remainingHours}h`;
    }
  }
}

function generateServiceStats(services) {
  const stats = {
    featured: 0,
    industries: new Set(),
    verticals: new Set(),
    portfolios: new Set(),
    pricedServices: 0,
    totalValue: 0,
    pricingModels: {},
    priceRange: { min: Infinity, max: 0, average: 0 }
  };

  services.forEach(service => {
    // Count featured
    if (service.is_featured) stats.featured++;
    
    // Collect categories
    if (service.industry_name) stats.industries.add(service.industry_name);
    if (service.vertical_name) stats.verticals.add(service.vertical_name);
    if (service.portfolio_name) stats.portfolios.add(service.portfolio_name);
    
    // Price statistics
    if (service.base_price && service.base_price > 0) {
      stats.pricedServices++;
      stats.totalValue += service.base_price;
      stats.priceRange.min = Math.min(stats.priceRange.min, service.base_price);
      stats.priceRange.max = Math.max(stats.priceRange.max, service.base_price);
      
      // Count pricing models
      const model = service.pricing_model || 'fixed';
      stats.pricingModels[model] = (stats.pricingModels[model] || 0) + 1;
    }
  });

  // Calculate average
  stats.priceRange.average = stats.pricedServices > 0 
    ? Math.round(stats.totalValue / stats.pricedServices)
    : 0;

  // Handle edge case where no prices exist
  if (stats.priceRange.min === Infinity) {
    stats.priceRange.min = 0;
  }

  return {
    total: services.length,
    featured: stats.featured,
    industries: Array.from(stats.industries),
    verticals: Array.from(stats.verticals),
    portfolios: Array.from(stats.portfolios),
    pricedServices: stats.pricedServices,
    pricingModels: stats.pricingModels,
    priceRange: stats.priceRange
  };
}