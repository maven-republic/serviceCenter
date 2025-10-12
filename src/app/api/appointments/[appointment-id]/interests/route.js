// src/app/api/appointments/[appointment-id]/interests/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch interests for an appointment
export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ FIXED: Extract appointment-id using the exact folder name
    const appointmentId = params['appointment-id']
    
    console.log('🔍 GET /api/appointments/[appointment-id]/interests called')
    console.log('📦 Raw params:', params)
    console.log('🎯 Extracted appointmentId:', appointmentId)

    // ✅ Validate appointmentId exists
    if (!appointmentId || appointmentId === 'undefined' || appointmentId === 'null') {
      console.error('❌ Invalid appointmentId:', appointmentId)
      return NextResponse.json(
        { 
          error: 'Invalid appointment ID', 
          details: 'appointment_id is required and must be a valid UUID',
          received: appointmentId
        },
        { status: 400 }
      )
    }

    // ✅ Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(appointmentId)) {
      console.error('❌ Invalid UUID format:', appointmentId)
      return NextResponse.json(
        { 
          error: 'Invalid appointment ID format', 
          details: 'appointment_id must be a valid UUID',
          received: appointmentId,
          expectedFormat: '123e4567-e89b-12d3-a456-426614174000'
        },
        { status: 400 }
      )
    }

    console.log('✅ Valid appointmentId:', appointmentId)

    // Fetch interests with professional details
    const { data: interests, error } = await supabase
      .from('interest')
      .select(`
        *,
        professional:professional_id (
          professional_id,
          bio,
          experience,
          hourly_rate,
          verification_status,
          account!individual_professional_account_id_fkey (
            account_id,
            first_name,
            last_name,
            email,
            profile_picture_url
          )
        ),
        assessment:assessment!assessment_interest_id_fkey (
          assessment_id,
          status,
          proposed_date,
          proposed_duration_minutes,
          proposed_fee,
          customer_response,
          customer_response_at,
          confirmed_date,
          confirmed_duration_minutes,
          final_quote_provided,
          final_quote_amount
        )
      `)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching interests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interests', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${interests?.length || 0} interests for appointment ${appointmentId}`)

    return NextResponse.json({ 
      success: true,
      interests: interests || [],
      count: interests?.length || 0
    })
  } catch (error) {
    console.error('❌ Error in GET appointment interests:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Customer selects professional(s)
export async function POST(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ FIXED: Extract appointment-id using the exact folder name
    const appointmentId = params['appointment-id']
    
    console.log('🔍 POST /api/appointments/[appointment-id]/interests called')
    console.log('📦 Raw params:', params)
    console.log('🎯 Extracted appointmentId:', appointmentId)

    // ✅ Validate appointmentId
    if (!appointmentId || appointmentId === 'undefined' || appointmentId === 'null') {
      console.error('❌ Invalid appointmentId:', appointmentId)
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    // ✅ Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(appointmentId)) {
      console.error('❌ Invalid UUID format:', appointmentId)
      return NextResponse.json(
        { error: 'Invalid appointment ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('📝 POST Selection - Body received:', body)

    const { interest_ids, customer_notes } = body

    if (!interest_ids || !Array.isArray(interest_ids) || interest_ids.length === 0) {
      return NextResponse.json(
        { error: 'interest_ids array is required' },
        { status: 400 }
      )
    }

    // Verify appointment exists
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Appointment not found:', appointmentId)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Fetch all interests to be selected
    const { data: interestsToSelect, error: fetchError } = await supabase
      .from('interest')
      .select('*')
      .in('interest_id', interest_ids)
      .eq('appointment_id', appointmentId)

    if (fetchError) {
      console.error('❌ Error fetching interests:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch interests', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!interestsToSelect || interestsToSelect.length === 0) {
      return NextResponse.json(
        { error: 'No valid interests found' },
        { status: 404 }
      )
    }

    // Update interests to 'selected' status
    const { data: updatedInterests, error: updateError } = await supabase
      .from('interest')
      .update({
        status: 'selected',
        selected_by_customer: true,
        customer_selected_at: new Date().toISOString(),
        customer_notes: customer_notes || null
      })
      .in('interest_id', interest_ids)
      .select()

    if (updateError) {
      console.error('❌ Error updating interests:', updateError)
      return NextResponse.json(
        { error: 'Failed to select professionals', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Professional(s) selected successfully:', updatedInterests?.length || 0)

    // ✅ AUTO-ACCEPT ASSESSMENTS
    console.log('🔍 Checking for assessments to auto-accept...')

    const interestsRequiringAssessment = interestsToSelect.filter(i => i.assessment === true)

    if (interestsRequiringAssessment.length > 0) {
      console.log(`🔄 Auto-accepting assessments for ${interestsRequiringAssessment.length} interest(s)...`)
      
      for (const interest of interestsRequiringAssessment) {
        try {
          // Wait briefly for database trigger to create assessment record
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Fetch the assessment record
          const { data: assessment, error: assessmentFetchError } = await supabase
            .from('assessment')
            .select('*')
            .eq('interest_id', interest.interest_id)
            .maybeSingle()
          
          if (assessmentFetchError) {
            console.error(`❌ Error fetching assessment for interest ${interest.interest_id}:`, assessmentFetchError)
            continue
          }
          
          if (!assessment) {
            console.warn(`⚠️ No assessment found for interest ${interest.interest_id}`)
            continue
          }

          console.log(`📋 Found assessment:`, {
            assessment_id: assessment.assessment_id,
            status: assessment.status,
            proposed_date: assessment.proposed_date,
            proposed_fee: assessment.proposed_fee
          })
          
          // ✅ AUTO-ACCEPT: Customer selecting professional = accepting their assessment proposal
          const updateData = {
            status: 'accepted',
            customer_response: 'accepted',
            customer_response_at: new Date().toISOString()
          }

          // Only set confirmed_date if proposed_date exists
          if (assessment.proposed_date) {
            updateData.confirmed_date = assessment.proposed_date
            updateData.confirmed_duration_minutes = assessment.proposed_duration_minutes || 60
            console.log(`📅 Setting confirmed_date to: ${assessment.proposed_date}`)
          } else {
            console.warn(`⚠️ Assessment ${assessment.assessment_id} has no proposed_date - skipping auto-accept`)
            continue
          }

          const { error: autoAcceptError } = await supabase
            .from('assessment')
            .update(updateData)
            .eq('assessment_id', assessment.assessment_id)
          
          if (autoAcceptError) {
            console.error(`❌ Failed to auto-accept assessment ${assessment.assessment_id}:`, autoAcceptError)
          } else {
            console.log(`✅ Assessment auto-accepted: ${assessment.assessment_id}`)
            console.log(`   Status: proposed → accepted`)
            console.log(`   Customer response: pending → accepted`)
            if (assessment.proposed_date) {
              console.log(`   Confirmed date: ${assessment.proposed_date}`)
            }
          }
        } catch (error) {
          console.error(`❌ Error processing assessment for interest ${interest.interest_id}:`, error)
        }
      }
      
      console.log('✅ Assessment auto-accept process completed')
    } else {
      console.log('ℹ️ No assessments to auto-accept')
    }

    // Update appointment status
    const { error: appointmentUpdateError } = await supabase
      .from('appointment')
      .update({
        status: 'evaluating',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)

    if (appointmentUpdateError) {
      console.warn('⚠️ Warning: Failed to update appointment status:', appointmentUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully selected ${updatedInterests.length} professional(s)`,
      selected_interests: updatedInterests
    })

  } catch (error) {
    console.error('❌ Error in POST selection:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update existing interest
export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ FIXED: Extract appointment-id using the exact folder name
    const appointmentId = params['appointment-id']
    
    console.log('🔍 PUT /api/appointments/[appointment-id]/interests - Update interest')
    console.log('📦 Raw params:', params)
    console.log('🎯 Extracted appointmentId:', appointmentId)

    // ✅ Validate appointmentId
    if (!appointmentId || appointmentId === 'undefined' || appointmentId === 'null') {
      console.error('❌ Invalid appointmentId:', appointmentId)
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    // ✅ Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(appointmentId)) {
      console.error('❌ Invalid UUID format:', appointmentId)
      return NextResponse.json(
        { error: 'Invalid appointment ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      interest_id,
      message,
      amount,
      fee,
      assessment,
      modality,
      price_range_min,
      price_range_max,
      assessment_justification,
      earliest_start,
      latest_start,
      estimated_duration_hours,
      notes
    } = body

    if (!interest_id) {
      return NextResponse.json(
        { error: 'interest_id is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (message !== undefined) updateData.message = message
    if (amount !== undefined) updateData.amount = amount
    if (fee !== undefined) updateData.fee = fee
    if (assessment !== undefined) updateData.assessment = assessment
    if (modality !== undefined) updateData.modality = modality
    if (price_range_min !== undefined) updateData.price_range_min = price_range_min
    if (price_range_max !== undefined) updateData.price_range_max = price_range_max
    if (assessment_justification !== undefined) updateData.assessment_justification = assessment_justification
    if (earliest_start !== undefined) updateData.earliest_start = earliest_start
    if (latest_start !== undefined) updateData.latest_start = latest_start
    if (estimated_duration_hours !== undefined) updateData.estimated_duration_hours = estimated_duration_hours
    if (notes !== undefined) updateData.notes = notes

    // Update the interest
    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interest_id)
      .eq('appointment_id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating interest:', updateError)
      return NextResponse.json(
        { error: 'Failed to update interest', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Interest updated successfully:', interest_id)

    return NextResponse.json({
      success: true,
      interest: updatedInterest
    })

  } catch (error) {
    console.error('❌ Error in PUT interest:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}