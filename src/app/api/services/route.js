import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

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
        portfolio:portfolio_id (
          portfolio_id,
          name,
          description,
          is_featured,
          vertical:vertical_id (
            vertical_id,
            name,
            description,
            industry:industry_id (
              industry_id,
              name,
              description,
              icon
            )
          )
        ),
        gallery:service_id (
          image_id,
          image_url,
          alt_text,
          is_primary,
          display_order
        ),
        attribute:service_id (
          attribute_id,
          attribute_name,
          value_type,
          input_hint,
          is_required,
          is_visible,
          pricing_weight,
          enum_options,
          validation_rules
        ),
        skeyword:service_id (
          search_term_id,
          search_term
        ),
        operation:service_id (
          operation_id,
          name,
          description,
          sequence_order,
          duration_minutes,
          skill_level_required,
          equipment_required,
          is_optional
        )
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    const { data: services, error } = await query

    if (error) throw error

    // Manual filtering (deep .eq not supported)
    const filtered = category
      ? (services || []).filter(s => s.portfolio?.vertical?.industry?.name === category)
      : services

    const transformed = filtered.map(service => ({
      service_id: service.service_id,
      id: service.service_id,
      name: service.name,
      title: service.name,
      description: service.description,
      base_price: service.base_price,
      price: service.base_price,
      duration_minutes: service.duration_minutes,
      pricing_model: service.pricing_model,
      price_type: service.price_type,
      is_featured: service.is_featured,
      portfolio: service.portfolio,
      category: service.portfolio?.vertical?.industry?.name || 'General',
      subcategory: service.portfolio?.vertical?.name || 'Other',
      portfolio_name: service.portfolio?.name || 'General Services',
      images: service.gallery || [],
      primary_image: service.gallery?.find(img => img.is_primary)?.image_url || service.gallery?.[0]?.image_url || '/images/listings/default.jpg',
      img: service.gallery?.find(img => img.is_primary)?.image_url || service.gallery?.[0]?.image_url || '/images/listings/default.jpg',
      attributes: service.attribute || [],
      keywords: service.skeyword?.map(k => k.search_term) || [],
      operations: service.operation || [],
      deliveryTime: service.duration_minutes ? `${Math.ceil(service.duration_minutes / 60 / 24)}d` : '1d',
      level: service.is_featured ? 'top-rated' : 'level-1',
      rating: 4.7 + (Math.random() * 0.6),
      review: Math.floor(Math.random() * 200) + 50,
      tag: service.portfolio?.name || 'Service',
      author: {
        name: 'Professional Service Provider',
        img: '/images/team/default-provider.png'
      },
      location: 'jamaica',
      sort: service.is_featured ? 'best-seller' : 'recommended',
      tool: 'professional-tools',
      language: 'english'
    }))

    return NextResponse.json({
      success: true,
      data: transformed,
      count: transformed.length,
      metadata: {
        total_services: transformed.length,
        featured_services: transformed.filter(s => s.is_featured).length,
        categories: [...new Set(transformed.map(s => s.category))],
        portfolios: [...new Set(transformed.map(s => s.portfolio_name))]
      }
    })

  } catch (error) {
    console.error('❌ Services API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch services',
        details: error.message
      },
      { status: 500 }
    )
  }
}
