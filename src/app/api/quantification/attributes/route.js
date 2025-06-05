// src/app/api/quantification/attributes/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()

    // Fetch all active services with their portfolios and verticals
    const { data: services, error } = await supabase
      .from('service')
      .select(`
        service_id,
        name,
        description,
        base_price,
        duration_minutes,
        pricing_model,
        price_type,
        is_active,
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
        attribute (
          attribute_id,
          attribute_name,
          value_type,
          input_hint,
          is_required,
          is_visible,
          enum_options,
          unit_type,
          unit_options,
          default_unit
        ),
        quant (
          volatility,
          urgency_drift,
          area_unit_rate,
          option_premium,
          base_price_mean,
          model_type
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching services with attributes:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch services',
        details: error.message
      }, { status: 500 })
    }

    // Group services by category for easier selection
    const categorizedServices = {}
    
    services?.forEach(service => {
      const category = service.portfolio?.vertical?.name || 'General'
      
      if (!categorizedServices[category]) {
        categorizedServices[category] = []
      }
      
      categorizedServices[category].push(service)
    })

    return NextResponse.json({
      success: true,
      services: services || [],
      categorized: categorizedServices,
      count: services?.length || 0
    })

  } catch (error) {
    console.error('Quantification attributes API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch service attributes',
      details: error.message
    }, { status: 500 })
  }
}