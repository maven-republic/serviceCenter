// src/app/api/professionals/service-pricing/route.js - Phase 2 Fix
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')

    if (!professionalId) {
      return NextResponse.json({ error: 'Professional ID is required' }, { status: 400 })
    }

    // PHASE 2 FIX: Enhanced query to include all valuation unit relationships
    const { data: professionalServices, error } = await supabase
      .from('professional_service')
      .select(`
        professional_service_id,
        service_id,
        custom_price,
        custom_duration_minutes,
        custom_valuation_unit_id,
        additional_notes,
        is_active,
        created_at,
        updated_at,
        custom_valuation_unit:custom_valuation_unit_id (
          unit_id,
          unit_code,
          display_name,
          category,
          description,
          is_active
        ),
        service:service_id (
          service_id,
          name,
          description,
          base_price,
          duration_minutes,
          pricing_model,
          price_type,
          valuation_unit_id,
          valuation_unit:valuation_unit_id (
            unit_id,
            unit_code,
            display_name,
            category,
            description,
            is_active
          ),
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
            model_type,
            valuation_unit_id
          )
        )
      `)
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase Query Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch professional services',
        details: error.message
      }, { status: 500 })
    }

    // PHASE 2 FIX: Process services to ensure complete valuation unit data
    const processedServices = professionalServices.map(service => {
      // Determine the effective valuation unit (custom takes precedence)
      const effectiveValuationUnit = service.custom_valuation_unit || service.service?.valuation_unit
      
      return {
        ...service,
        // Implement pricing hierarchy: quant.base_price_mean -> service.base_price -> fallback
        effective_base_price: service.service?.quant?.base_price_mean || 
                             service.service?.base_price || 
                             50,
        service: {
          ...service.service,
          // Ensure base_price exists for quantification algorithms
          base_price: service.service?.quant?.base_price_mean || 
                     service.service?.base_price || 
                     50
        },
        // PHASE 2 FIX: Add computed effective valuation unit for easier access
        effective_valuation_unit: effectiveValuationUnit
      }
    })

    // Calculate pricing statistics
    const stats = {
      total: processedServices.length,
      withCustomPricing: processedServices.filter(ps => ps.custom_price).length,
      withoutCustomPricing: processedServices.filter(ps => !ps.custom_price).length,
      averageCustomPrice: processedServices.length > 0
        ? processedServices
            .filter(ps => ps.custom_price)
            .reduce((sum, ps) => sum + ps.custom_price, 0) / 
          Math.max(1, processedServices.filter(ps => ps.custom_price).length)
        : 0,
      totalPotentialRevenue: processedServices
        .reduce((sum, ps) => sum + (ps.custom_price || ps.service?.base_price || 0), 0)
    }

    // PHASE 2 FIX: Enhanced debug logging
    console.log('✅ Professional Services Fetched:', {
      count: processedServices.length,
      withCustomUnits: processedServices.filter(s => s.custom_valuation_unit).length,
      withServiceUnits: processedServices.filter(s => s.service?.valuation_unit).length,
      sampleService: processedServices[0] ? {
        name: processedServices[0].service?.name,
        customPrice: processedServices[0].custom_price,
        customUnit: processedServices[0].custom_valuation_unit?.display_name,
        serviceUnit: processedServices[0].service?.valuation_unit?.display_name,
        effectiveUnit: processedServices[0].effective_valuation_unit?.display_name
      } : null
    })

    return NextResponse.json({
      success: true,
      data: processedServices,
      stats,
      count: processedServices.length
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      professional_service_id,
      custom_price,
      custom_duration_minutes,
      custom_valuation_unit_id,
      quantification_data,
      notes
    } = body

    if (!professional_service_id || !custom_price) {
      return NextResponse.json({
        error: 'Professional service ID and custom price are required'
      }, { status: 400 })
    }

    // PHASE 2 FIX: Update the professional service with enhanced response
    const { data, error } = await supabase
      .from('professional_service')
      .update({
        custom_price: parseFloat(custom_price),
        custom_duration_minutes: custom_duration_minutes ? parseInt(custom_duration_minutes) : null,
        custom_valuation_unit_id: custom_valuation_unit_id || null,
        additional_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('professional_service_id', professional_service_id)
      .select(`
        professional_service_id,
        service_id,
        custom_price,
        custom_duration_minutes,
        custom_valuation_unit_id,
        additional_notes,
        is_active,
        created_at,
        updated_at,
        custom_valuation_unit:custom_valuation_unit_id (
          unit_id,
          unit_code,
          display_name,
          category,
          description,
          is_active
        )
      `)

    if (error) {
      console.error('❌ Update Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update service pricing',
        details: error.message
      }, { status: 500 })
    }

    // PHASE 2 FIX: If no data returned, fetch the updated record manually
    let updatedService = data?.[0]
    if (!updatedService) {
      const { data: fetchedData, error: fetchError } = await supabase
        .from('professional_service')
        .select(`
          professional_service_id,
          service_id,
          custom_price,
          custom_duration_minutes,
          custom_valuation_unit_id,
          additional_notes,
          is_active,
          created_at,
          updated_at,
          custom_valuation_unit:custom_valuation_unit_id (
            unit_id,
            unit_code,
            display_name,
            category,
            description,
            is_active
          )
        `)
        .eq('professional_service_id', professional_service_id)
        .single()

      if (fetchError) {
        console.error('❌ Fetch Error:', fetchError)
      } else {
        updatedService = fetchedData
      }
    }

    // If quantification data is provided, save it to professional_pricing_config
    if (quantification_data) {
      try {
        const { error: quantError } = await supabase
          .from('professional_pricing_config')
          .upsert({
            professional_id: quantification_data.professional_id,
            service_id: quantification_data.service_id,
            custom_price: parseFloat(custom_price),
            custom_duration_minutes: custom_duration_minutes ? parseInt(custom_duration_minutes) : null,
            preferred_pricing_model: quantification_data.model || 'quote',
            custom_volatility: quantification_data.volatility || null,
            custom_urgency_drift: quantification_data.urgency_drift || null,
            markup_percent: quantification_data.markup_percent || null,
            valuation_unit_id: quantification_data.valuation_unit_id || null,
            created_at: new Date().toISOString()
          })

        if (quantError) {
          console.warn('⚠️ Failed to save quantification config:', quantError)
        }
      } catch (quantErr) {
        console.warn('⚠️ Quantification logging error:', quantErr)
      }
    }

    // PHASE 2 FIX: Enhanced debug logging for POST response
    console.log('✅ Service Updated:', {
      professional_service_id,
      custom_price,
      custom_valuation_unit_id,
      custom_valuation_unit: updatedService?.custom_valuation_unit,
      success: true
    })

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Service pricing updated successfully'
    })

  } catch (error) {
    console.error('❌ POST Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update service pricing',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      professional_service_id,
      updates
    } = body

    if (!professional_service_id || !updates) {
      return NextResponse.json({
        error: 'Professional service ID and updates are required'
      }, { status: 400 })
    }

    // Validate and sanitize updates
    const allowedFields = [
      'custom_price',
      'custom_duration_minutes',
      'custom_valuation_unit_id', // PHASE 2 FIX: Add this field
      'additional_notes',
      'is_active'
    ]

    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    // Add updated timestamp
    sanitizedUpdates.updated_at = new Date().toISOString()

    // PHASE 2 FIX: Enhanced PUT response with valuation unit
    const { data, error } = await supabase
      .from('professional_service')
      .update(sanitizedUpdates)
      .eq('professional_service_id', professional_service_id)
      .select(`
        professional_service_id,
        service_id,
        custom_price,
        custom_duration_minutes,
        custom_valuation_unit_id,
        additional_notes,
        is_active,
        created_at,
        updated_at,
        custom_valuation_unit:custom_valuation_unit_id (
          unit_id,
          unit_code,
          display_name,
          category,
          description,
          is_active
        )
      `)

    if (error) {
      console.error('❌ PUT Update Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update service',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('❌ PUT Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update service',
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const professionalServiceId = searchParams.get('professionalServiceId')

    if (!professionalServiceId) {
      return NextResponse.json({
        error: 'Professional service ID is required'
      }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('professional_service')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('professional_service_id', professionalServiceId)
      .select()

    if (error) {
      console.error('❌ Delete Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to remove service',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Service removed successfully'
    })

  } catch (error) {
    console.error('❌ DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove service',
      details: error.message
    }, { status: 500 })
  }
}