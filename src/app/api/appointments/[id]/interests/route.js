// src/app/api/appointments/[id]/interests/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(request, { params }) {
  console.log('🔵 PUT /api/appointments/[id]/interests - Starting request')
  
  try {
    const resolvedParams = await params
    const appointmentId = resolvedParams.id
    
    console.log('📝 Resolved appointment ID:', appointmentId)
    
    if (!appointmentId) {
      console.error('❌ Missing appointment ID')
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
      console.log('📝 Request body parsed:', {
        action: body.action,
        professional_id: body.professional_id,
        decline_reason: body.decline_reason,
        hasMessage: !!body.decline_message,
        hasReferrals: !!body.referral_suggestions
      })
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { professional_id, action } = body

    console.log('🔄 Processing professional response:', {
      appointmentId,
      professionalId: professional_id,
      action,
      bodyKeys: Object.keys(body)
    })

    if (!professional_id) {
      console.error('❌ Missing professional_id')
      return NextResponse.json(
        { success: false, error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    if (!action) {
      console.error('❌ Missing action')
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with error handling
    let supabase
    try {
      supabase = createClient()
      console.log('✅ Supabase client created')
    } catch (supabaseError) {
      console.error('❌ Failed to create Supabase client:', supabaseError)
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Find the interest record with enhanced error handling
    console.log('🔍 Finding interest record...')
    const { data: interest, error: findError } = await supabase
      .from('interest')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('professional_id', professional_id)
      .single()

    if (findError) {
      console.error('❌ Database error finding interest:', findError)
      console.error('❌ Error details:', {
        code: findError.code,
        message: findError.message,
        details: findError.details,
        hint: findError.hint
      })
      
      if (findError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Interest record not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database error finding interest record',
          details: findError.message 
        },
        { status: 500 }
      )
    }

    if (!interest) {
      console.error('❌ Interest not found')
      return NextResponse.json(
        { success: false, error: 'Interest record not found' },
        { status: 404 }
      )
    }

    console.log('✅ Interest found:', interest.interest_id)

    // Handle different actions
    switch (action) {
      case 'decline_selection':
        return await handleDeclineSelection(supabase, interest, body)
      
      case 'accept_selection':
        return await handleAcceptSelection(supabase, interest, body)
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ API Error in PUT /api/appointments/[id]/interests:', error)
    console.error('❌ Error stack:', error.stack)
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

async function handleDeclineSelection(supabase, interest, body) {
  const { 
    decline_reason, 
    decline_message, 
    referral_suggestions = [] 
  } = body

  console.log('📝 Processing decline selection:', {
    interestId: interest.interest_id,
    reason: decline_reason,
    messageLength: decline_message?.length || 0,
    referralCount: referral_suggestions?.length || 0
  })

  try {
    // Prepare update data - using ONLY existing database fields
    const updateData = {
      status: 'rejected',                           // ✅ Existing enum value
      response: 'declined',                         // ✅ Existing enum value  
      rejection_reason: decline_reason,             // ✅ Existing field
      customer_rejected_at: new Date().toISOString(), // ✅ Existing field
      updated_at: new Date().toISOString()         // ✅ Existing field
    }

    // Add decline message to existing notes field
    if (decline_message) {
      updateData.notes = decline_message // ✅ Using existing 'notes' field
    }

    // Store referral suggestions in customer_notes as JSON if provided
    if (referral_suggestions && referral_suggestions.length > 0) {
      const referralData = {
        decline_reason,
        decline_message,
        referral_suggestions,
        declined_at: new Date().toISOString()
      }
      updateData.customer_notes = JSON.stringify(referralData) // ✅ Existing field
    }

    console.log('📝 Update data prepared:', updateData)

    // Update the interest record with decline information
    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interest.interest_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Database error updating interest:', updateError)
      console.error('❌ Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update interest record',
          details: updateError.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Interest updated successfully')

    // Update appointment status if needed
    const { error: appointmentError } = await supabase
      .from('appointment')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', interest.appointment_id)

    if (appointmentError) {
      console.warn('⚠️ Failed to update appointment timestamp:', appointmentError)
      // Don't fail the request for this
    }

    console.log('✅ Professional decline processed successfully')

    return NextResponse.json({
      success: true,
      message: 'Selection declined successfully',
      interest: updatedInterest,
      action: 'decline_selection'
    })

  } catch (error) {
    console.error('❌ Error in handleDeclineSelection:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process decline',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleAcceptSelection(supabase, interest, body) {
  const { 
    response_message,
    updated_quote,
    schedule_assessment,
    assessment_details 
  } = body

  console.log('✅ Processing accept selection:', {
    interestId: interest.interest_id,
    hasMessage: !!response_message,
    hasUpdatedQuote: !!updated_quote,
    needsAssessment: !!schedule_assessment
  })

  try {
    // Update the interest record with acceptance
    const updateData = {
      response: 'confirmed',                        // ✅ Existing enum value
      customer_selected_at: new Date().toISOString(), // ✅ Existing field
      replied: new Date().toISOString(),           // ✅ Existing field
      updated_at: new Date().toISOString()         // ✅ Existing field
    }

    if (response_message) {
      updateData.customer_notes = response_message // ✅ Existing field
    }

    // Add updated quote if provided
    if (updated_quote) {
      if (updated_quote.amount) updateData.amount = updated_quote.amount
      if (updated_quote.duration_hours) updateData.estimated_duration_hours = updated_quote.duration_hours
      if (updated_quote.price_min) updateData.price_range_min = updated_quote.price_min
      if (updated_quote.price_max) updateData.price_range_max = updated_quote.price_max
    }

    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interest.interest_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update interest:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update interest record',
          details: updateError.message 
        },
        { status: 500 }
      )
    }

    // Update appointment to assign professional
    const { error: appointmentError } = await supabase
      .from('appointment')
      .update({
        professional_id: interest.professional_id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', interest.appointment_id)

    if (appointmentError) {
      console.error('❌ Failed to update appointment:', appointmentError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to assign appointment',
          details: appointmentError.message 
        },
        { status: 500 }
      )
    }

    // Create assessment if requested
    if (schedule_assessment && assessment_details) {
      console.log('📅 Creating assessment record')
      
      const { error: assessmentError } = await supabase
        .from('assessment')
        .insert({
          interest_id: interest.interest_id,
          appointment_id: interest.appointment_id,
          professional_id: interest.professional_id,
          service_delivery_address_id: assessment_details.address_id,
          proposed_date: assessment_details.proposed_date,
          proposed_duration_minutes: assessment_details.duration_minutes || 60,
          proposed_fee: assessment_details.fee || 0,
          assessment_type: assessment_details.type || 'local',
          proposal_message: assessment_details.message
        })

      if (assessmentError) {
        console.error('❌ Failed to create assessment:', assessmentError)
        // Don't fail the whole operation for assessment creation failure
      } else {
        console.log('✅ Assessment created successfully')
      }
    }

    console.log('✅ Professional acceptance processed successfully')

    return NextResponse.json({
      success: true,
      message: 'Selection accepted successfully',
      interest: updatedInterest,
      action: 'accept_selection'
    })

  } catch (error) {
    console.error('❌ Error in handleAcceptSelection:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process acceptance',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET method to fetch interests for an appointment
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const appointmentId = resolvedParams.id

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: interests, error } = await supabase
      .from('interest')
      .select(`
        *,
        professional:individual_professional!interest_professional_id_fkey(
          professional_id,
          account:account!individual_professional_account_id_fkey(
            first_name,
            last_name,
            email,
            profile_picture_url
          )
        )
      `)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch interests:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch interests',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      interests: interests || []
    })

  } catch (error) {
    console.error('❌ API Error in GET /api/appointments/[id]/interests:', error)
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