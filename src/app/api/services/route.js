// src/app/api/professional/services/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      professional_id,
      service_id,
      custom_price,
      custom_duration_minutes,
      additional_notes,
      is_active = true
    } = body

    if (!professional_id || !service_id) {
      return NextResponse.json({
        success: false,
        error: 'Professional ID and Service ID are required'
      }, { status: 400 })
    }

    // Check if this professional service already exists
    const { data: existing, error: checkError } = await supabase
      .from('professional_service')
      .select('professional_service_id')
      .eq('professional_id', professional_id)
      .eq('service_id', service_id)
      .single()

    if (existing && !checkError) {
      return NextResponse.json({
        success: false,
        error: 'This service is already added to your profile'
      }, { status: 409 })
    }

    // Add the professional service
    const { data, error } = await supabase
      .from('professional_service')
      .insert({
        professional_id,
        service_id,
        custom_price: custom_price ? parseFloat(custom_price) : null,
        custom_duration_minutes: custom_duration_minutes ? parseInt(custom_duration_minutes) : null,
        additional_notes,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding professional service:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to add service',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Service added successfully'
    })

  } catch (error) {
    console.error('Professional services API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add service',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')

    if (!professionalId) {
      return NextResponse.json({
        success: false,
        error: 'Professional ID is required'
      }, { status: 400 })
    }

    const { data: services, error } = await supabase
      .from('professional_service')
      .select(`
        professional_service_id,
        service_id,
        custom_price,
        custom_duration_minutes,
        additional_notes,
        is_active,
        created_at,
        service:service_id (
          service_id,
          name,
          description,
          base_price,
          duration_minutes
        )
      `)
      .eq('professional_id', professionalId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching professional services:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch services',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: services || []
    })

  } catch (error) {
    console.error('Professional services GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      details: error.message
    }, { status: 500 })
  }
}