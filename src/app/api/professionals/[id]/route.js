// src/app/api/professionals/[id]/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const professionalId = resolvedParams.id
    
    if (!professionalId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching professional data for:', professionalId)

    const supabase = await createClient()

    // Fetch professional with account information
    const { data: professional, error } = await supabase
      .from('individual_professional')
      .select(`
        *,
        account:account!individual_professional_account_id_fkey(
          account_id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          account_status,
          created_at,
          updated_at
        )
      `)
      .eq('professional_id', professionalId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Professional not found:', professionalId)
        return NextResponse.json(
          { success: false, error: 'Professional not found' },
          { status: 404 }
        )
      }
      
      console.error('❌ Database error fetching professional:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch professional data',
          details: error.message 
        },
        { status: 500 }
      )
    }

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      )
    }

    console.log('✅ Professional data fetched successfully')

    return NextResponse.json({
      success: true,
      professional: {
        ...professional,
        // Ensure both ID formats for compatibility
        id: professional.professional_id,
        professional_id: professional.professional_id
      }
    })

  } catch (error) {
    console.error('❌ API Error in GET /api/professionals/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const professionalId = resolvedParams.id
    
    if (!professionalId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    const updates = await request.json()
    console.log('🔄 Updating professional:', professionalId, 'with:', Object.keys(updates))

    const supabase = await createClient()

    // Remove fields that shouldn't be updated directly
    const allowedFields = [
      'bio', 
      'experience', 
      'hourly_rate', 
      'daily_rate', 
      'rate_currency',
      'rate_negotiable', 
      'website_url', 
      'portfolio_url', 
      'service_radius',
      'travel_fee',
      'min_notice_hours',
      'buffer_minutes',
      'default_event_duration',
      'max_bookings_per_day'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    // Add updated timestamp
    filteredUpdates.updated_at = new Date().toISOString()

    const { data: updatedProfessional, error } = await supabase
      .from('individual_professional')
      .update(filteredUpdates)
      .eq('professional_id', professionalId)
      .select(`
        *,
        account:account!individual_professional_account_id_fkey(
          account_id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          account_status,
          created_at,
          updated_at
        )
      `)
      .single()

    if (error) {
      console.error('❌ Failed to update professional:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update professional',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Professional updated successfully')

    return NextResponse.json({
      success: true,
      professional: {
        ...updatedProfessional,
        // Ensure both ID formats for compatibility
        id: updatedProfessional.professional_id,
        professional_id: updatedProfessional.professional_id
      }
    })

  } catch (error) {
    console.error('❌ API Error in PATCH /api/professionals/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const professionalId = resolvedParams.id
    
    if (!professionalId) {
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body

    console.log('🔄 Professional action:', { professionalId, action })

    const supabase = await createClient()

    // Handle different professional actions
    switch (action) {
      case 'verify_identity':
        return await handleVerifyIdentity(supabase, professionalId, body)
      
      case 'update_verification_status':
        return await handleUpdateVerificationStatus(supabase, professionalId, body)
      
      case 'update_rates':
        return await handleUpdateRates(supabase, professionalId, body)
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ API Error in PUT /api/professionals/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to handle identity verification
async function handleVerifyIdentity(supabase, professionalId, body) {
  const { verification_documents, verification_type } = body

  try {
    const { data: updatedProfessional, error } = await supabase
      .from('individual_professional')
      .update({
        identity_verified: true,
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('professional_id', professionalId)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to verify identity:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to verify identity',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Identity verified successfully')

    return NextResponse.json({
      success: true,
      message: 'Identity verified successfully',
      professional: updatedProfessional
    })

  } catch (error) {
    console.error('❌ Error in handleVerifyIdentity:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process identity verification',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to handle verification status updates
async function handleUpdateVerificationStatus(supabase, professionalId, body) {
  const { verification_status, verification_notes } = body

  try {
    const updateData = {
      verification_status,
      updated_at: new Date().toISOString()
    }

    // Update verification flags based on status
    if (verification_status === 'verified') {
      updateData.identity_verified = true
      updateData.skills_verified = true
    } else if (verification_status === 'rejected') {
      updateData.identity_verified = false
      updateData.skills_verified = false
    }

    const { data: updatedProfessional, error } = await supabase
      .from('individual_professional')
      .update(updateData)
      .eq('professional_id', professionalId)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to update verification status:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update verification status',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Verification status updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Verification status updated successfully',
      professional: updatedProfessional
    })

  } catch (error) {
    console.error('❌ Error in handleUpdateVerificationStatus:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update verification status',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Helper function to handle rate updates
async function handleUpdateRates(supabase, professionalId, body) {
  const { hourly_rate, daily_rate, rate_currency, rate_negotiable, travel_fee } = body

  try {
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate
    if (daily_rate !== undefined) updateData.daily_rate = daily_rate
    if (rate_currency !== undefined) updateData.rate_currency = rate_currency
    if (rate_negotiable !== undefined) updateData.rate_negotiable = rate_negotiable
    if (travel_fee !== undefined) updateData.travel_fee = travel_fee

    const { data: updatedProfessional, error } = await supabase
      .from('individual_professional')
      .update(updateData)
      .eq('professional_id', professionalId)
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to update rates:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update rates',
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Rates updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Rates updated successfully',
      professional: updatedProfessional
    })

  } catch (error) {
    console.error('❌ Error in handleUpdateRates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update rates',
        details: error.message 
      },
      { status: 500 }
    )
  }
}