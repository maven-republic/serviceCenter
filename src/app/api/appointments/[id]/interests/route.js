// src/app/api/appointments/[id]/interests/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Customer selects/rejects professionals
export async function POST(request, { params }) {
  console.log('🔵 POST /api/appointments/[id]/interests - Customer selecting professional')
  
  try {
    const resolvedParams = await params
    const appointmentId = resolvedParams.id
    
    console.log('📝 Appointment ID:', appointmentId)
    
    if (!appointmentId) {
      console.error('❌ Missing appointment ID')
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('📝 Request body:', {
        action: body.action,
        interest_ids: body.interest_ids,
        hasCustomerNotes: !!body.data?.customer_notes
      })
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { action, interest_ids, data } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    if (!interest_ids || !Array.isArray(interest_ids) || interest_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one interest ID is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = await createClient()
    console.log('✅ Supabase client created')

    if (action === 'select_professional') {
      console.log('🎯 Selecting professional(s):', interest_ids)

      // Update the selected interest(s)
      const { data: updatedInterests, error: updateError } = await supabase
        .from('interest')
        .update({
          selected_by_customer: true,
          customer_selected_at: new Date().toISOString(),
          customer_notes: data?.customer_notes || null,
          status: 'selected',
          updated_at: new Date().toISOString()
        })
        .in('interest_id', interest_ids)
        .eq('appointment_id', appointmentId)
        .select()

      if (updateError) {
        console.error('❌ Database error updating interests:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to select professional', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('✅ Professional(s) selected successfully:', updatedInterests?.length || 0)

      // Update appointment status if needed
      const { error: appointmentError } = await supabase
        .from('appointment')
        .update({
          status: 'quoted',
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId)

      if (appointmentError) {
        console.warn('⚠️ Failed to update appointment status:', appointmentError)
        // Don't fail the request for this
      }

      return NextResponse.json({
        success: true,
        message: 'Professional selected successfully',
        selected_interests: updatedInterests,
        action: 'select_professional'
      })
    }

    if (action === 'reject_interests') {
      console.log('❌ Rejecting interests:', interest_ids)

      const { data: rejectedInterests, error: rejectError } = await supabase
        .from('interest')
        .update({
          status: 'rejected',
          customer_rejected_at: new Date().toISOString(),
          rejection_reason: data?.rejection_reason || 'Not selected',
          updated_at: new Date().toISOString()
        })
        .in('interest_id', interest_ids)
        .eq('appointment_id', appointmentId)
        .select()

      if (rejectError) {
        console.error('❌ Database error rejecting interests:', rejectError)
        return NextResponse.json(
          { success: false, error: 'Failed to reject interests', details: rejectError.message },
          { status: 500 }
        )
      }

      console.log('✅ Interests rejected successfully:', rejectedInterests?.length || 0)

      return NextResponse.json({
        success: true,
        message: 'Interests rejected successfully',
        rejected_interests: rejectedInterests,
        action: 'reject_interests'
      })
    }

    // Unknown action
    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ API Error in POST /api/appointments/[id]/interests:', error)
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

// PUT - Professional responds to customer selection
export async function PUT(request, { params }) {
  console.log('🔵 PUT /api/appointments/[id]/interests - Professional response')
  
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
    const supabase = await createClient()
    console.log('✅ Supabase client created')

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

// GET - Fetch interests for an appointment
export async function GET(request, { params }) {
  try {
    console.log('🎯 GET /api/appointments/[id]/interests called')
    
    const resolvedParams = await params
    const appointmentId = resolvedParams.id

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    console.log('✅ Supabase client created successfully')

    // Fetch interests for the appointment
    const { data: interests, error } = await supabase
      .from('interest')
      .select('*')
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

    console.log(`✅ Found ${interests?.length || 0} interests for appointment ${appointmentId}`)

    // Fetch professional data separately to avoid relationship conflicts
    let enrichedInterests = interests || []

    if (interests && interests.length > 0) {
      // Get unique professional IDs
      const professionalIds = [...new Set(interests.map(i => i.professional_id))]
      
      if (professionalIds.length > 0) {
        // Get professionals separately
        const { data: professionals } = await supabase
          .from('individual_professional')
          .select('professional_id, account_id, bio, verification_status, hourly_rate')
          .in('professional_id', professionalIds)

        // Get professional account data separately
        const accountIds = professionals?.map(p => p.account_id) || []
        let accounts = []
        if (accountIds.length > 0) {
          const { data: accountsData } = await supabase
            .from('account')
            .select('account_id, first_name, last_name, email, profile_picture_url')
            .in('account_id', accountIds)
          accounts = accountsData || []
        }

        // Enrich interests with professional data
        enrichedInterests = interests.map(interest => {
          const professional = professionals?.find(p => p.professional_id === interest.professional_id)
          const account = accounts?.find(a => a.account_id === professional?.account_id)

          return {
            ...interest,
            professional: professional ? {
              ...professional,
              account: account || null
            } : null
          }
        })
      }
    }

    console.log(`✅ Successfully enriched ${enrichedInterests.length} interests with professional data`)

    return NextResponse.json({
      success: true,
      interests: enrichedInterests
    })

  } catch (error) {
    console.error('❌ API Error in GET /api/appointments/[id]/interests:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
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

// Helper Functions

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
      status: 'declined_by_professional',           // Status for professional decline
      response: 'declined',                         // Response status
      rejection_reason: decline_reason,             // Decline reason
      updated_at: new Date().toISOString()         // Updated timestamp
    }

    // Add decline message to existing notes field
    if (decline_message) {
      updateData.notes = decline_message
    }

    // Store referral suggestions in customer_notes as JSON if provided
    if (referral_suggestions && referral_suggestions.length > 0) {
      const referralData = {
        decline_reason,
        decline_message,
        referral_suggestions,
        declined_at: new Date().toISOString()
      }
      updateData.customer_notes = JSON.stringify(referralData)
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
      response: 'confirmed',                        // Professional confirmed
      status: 'confirmed',                          // Status updated to confirmed
      replied: new Date().toISOString(),           // Reply timestamp
      updated_at: new Date().toISOString()         // Updated timestamp
    }

    if (response_message) {
      updateData.customer_notes = response_message
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