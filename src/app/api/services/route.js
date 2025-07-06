// src/app/api/services/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Optional filters
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const search = searchParams.get('search')
    const includeAll = searchParams.get('include_all')
    const isPublic = searchParams.get('type') === 'public'

    console.log('Services API called with params:', {
      category, location, minPrice, maxPrice, search, includeAll, isPublic
    })

    // Build the query
    let query = supabase
      .from('service')
      .select(`
        service_id,
        name,
        description,
        base_price,
        duration_minutes,
        pricing_model,
        price_type,
        is_featured,
        is_active,
        display_order,
        created_at,
        updated_at,
        portfolio:portfolio_id (
          portfolio_id,
          name,
          description,
          vertical:vertical_id (
            vertical_id,
            name,
            description,
            industry:industry_id (
              industry_id,
              name,
              description
            )
          )
        ),
        valuation_unit:valuation_unit_id (
          unit_id,
          unit_code,
          display_name,
          category
        ),
        gallery (
          image_id,
          image_url,
          alt_text,
          is_primary,
          display_order
        )
      `)
      .eq('is_active', true)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice && maxPrice) {
      query = query.gte('base_price', parseFloat(minPrice))
                   .lte('base_price', parseFloat(maxPrice))
    }

    // Order by featured first, then by display order
    query = query.order('is_featured', { ascending: false })
                 .order('display_order', { ascending: true })

    const { data: services, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch services',
        details: error.message
      }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedServices = services.map(service => ({
      id: service.service_id,
      title: service.name,
      name: service.name,
      description: service.description,
      price: service.base_price || 0,
      duration: service.duration_minutes,
      category: service.portfolio?.vertical?.name || 'General',
      industry: service.portfolio?.vertical?.industry?.name || 'Services',
      pricing_model: service.pricing_model,
      price_type: service.price_type,
      is_featured: service.is_featured,
      valuation_unit: service.valuation_unit,
      
      // Enhanced gallery handling
      gallery: service.gallery && service.gallery.length > 0 
        ? service.gallery
            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)) // Primary images first
            .map(g => g.image_url)
        : null,
      
      img: service.gallery?.find(g => g.is_primary)?.image_url || 
           service.gallery?.[0]?.image_url || 
           '/images/services/default-service.jpg',
           
      // Add mock data for review system (since this might not be in your DB yet)
      rating: (4.2 + Math.random() * 0.6).toFixed(1), // Random rating between 4.2-4.8
      review: Math.floor(Math.random() * 500) + 50, // Random review count
      
      // Mock author data (you might want to join with professional data later)
      author: {
        name: 'Professional', // Could be derived from professional who offers this service
        img: '/images/team/fl-1.png' // Default professional image
      },
      
      portfolio: service.portfolio,
      
      // Add some default fields that the frontend might expect
      deliveryTime: service.duration_minutes ? `${Math.ceil(service.duration_minutes / 60)} hours` : 'Variable',
      level: 'Professional', // Could be derived from service level if needed
      location: 'Remote/On-site', // Default value
      sort: service.is_featured ? 'featured' : 'standard',
      tool: 'Various', // Default value
      language: 'English' // Default value
    }))

    console.log(`✅ Fetched ${transformedServices.length} services`)

    return NextResponse.json(transformedServices)

  } catch (error) {
    console.error('Services API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      portfolio_id,
      name,
      description,
      base_price,
      duration_minutes,
      pricing_model = 'quote',
      price_type = 'estimate',
      valuation_unit_id,
      is_featured = false,
      display_order = 0
    } = body

    if (!portfolio_id || !name) {
      return NextResponse.json({
        success: false,
        error: 'Portfolio ID and name are required'
      }, { status: 400 })
    }

    const { data: service, error } = await supabase
      .from('service')
      .insert({
        portfolio_id,
        name,
        description,
        base_price: base_price ? parseFloat(base_price) : null,
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
        pricing_model,
        price_type,
        valuation_unit_id,
        is_featured,
        is_active: true,
        display_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create service',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service created successfully'
    })

  } catch (error) {
    console.error('Services POST API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create service',
      details: error.message
    }, { status: 500 })
  }
}