import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient() // ✅ await the async factory
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    if (!professionalId) {
      return NextResponse.json({ error: 'Professional ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('professional_service')
      .select(`
        professional_service_id,
        service_id,
        custom_price,
        custom_duration_minutes,
        additional_notes,
        is_active,
        created_at,
        updated_at,
        service:service_id (
          service_id,
          name,
          description,
          base_price,
          duration_minutes,
          pricing_model,
          price_type,
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
          quant (
            volatility,
            urgency_drift,
            area_unit_rate,
            option_premium,
            base_price_mean,
            model_type
          )
        )
      `)
      .eq('professional_id', professionalId)

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active')
    }

    if (search) {
      query = query.or(`
        service.name.ilike.%${search}%,
        service.description.ilike.%${search}%,
        service.portfolio.name.ilike.%${search}%,
        service.portfolio.vertical.name.ilike.%${search}%,
        additional_notes.ilike.%${search}%
      `)
    }

    console.log('🛰️ Executing Supabase query...')
    const { data: professionalServices, error } = await query.order('created_at', { ascending: false })

    if (error || !professionalServices) {
      console.error('❌ Supabase Query Error:', error)

      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        code: error?.code || null,
        hint: error?.hint || null,
        details: error?.details || null,
        message: error?.message || 'No error message available',
        full: JSON.stringify(error || {}, null, 2)
      }, { status: 500 })
    }

    const stats = {
      total: professionalServices.length,
      active: professionalServices.filter(ps => ps.is_active).length,
      inactive: professionalServices.filter(ps => !ps.is_active).length,
      averagePrice: professionalServices.length > 0
        ? professionalServices.reduce((sum, ps) =>
            sum + (ps.custom_price || ps.service?.base_price || 0), 0
          ) / professionalServices.length
        : 0,
      totalPotentialValue: professionalServices
        .filter(ps => ps.is_active)
        .reduce((sum, ps) =>
          sum + (ps.custom_price || ps.service?.base_price || 0), 0
        ) || 0
    }

    return NextResponse.json({
      success: true,
      data: professionalServices,
      stats,
      count: professionalServices.length
    })

  } catch (error) {
    console.error('❌ Catch Block Error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n')
    })

    return NextResponse.json({
      success: false,
      error: 'Unexpected server failure',
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n') || []
    }, { status: 500 })
  }
}
