// FIXED: src/app/api/appointments/[appointment-id]/interests/[interest-id]/route.js
// Handle individual interest updates and professional quote updates

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 🔧 FIXED GET - Get specific interest for an appointment (simplified query)
export async function GET(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  const interestId = resolvedParams['interest-id']
  
  console.log('🎯 Interest GET API:', { appointmentId, interestId })
  
  try {
    const supabase = await createClient()

    // 🔧 SIMPLIFIED: Get interest first, then enrich with related data
    const { data: interest, error } = await supabase
      .from('interest')
      .select('*')
      .eq('interest_id', interestId)
      .eq('appointment_id', appointmentId)
      .single()

    if (error || !interest) {
      console.error('❌ Interest not found:', error)
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // 🔧 SEPARATE QUERIES: Get related data separately to avoid relationship conflicts
    let enrichedInterest = { ...interest }

    // Get appointment data
    if (interest.appointment_id) {
      const { data: appointment } = await supabase
        .from('appointment')
        .select('appointment_id, title, description, status, customer_id')
        .eq('appointment_id', interest.appointment_id)
        .single()
      
      enrichedInterest.appointment = appointment
    }

    // Get professional data
    if (interest.professional_id) {
      const { data: professional } = await supabase
        .from('individual_professional')
        .select('professional_id, business_name, verification_status, rating_average, rating_count, account_id')
        .eq('professional_id', interest.professional_id)
        .single()
      
      if (professional) {
        // Get professional account data
        const { data: account } = await supabase
          .from('account')
          .select('account_id, first_name, last_name, email, profile_picture_url')
          .eq('account_id', professional.account_id)
          .single()
        
        enrichedInterest.professional = {
          ...professional,
          account: account
        }
      }
    }

    console.log('✅ Interest found and enriched:', interest.interest_id)

    return NextResponse.json({
      success: true,
      interest: enrichedInterest
    })

  } catch (error) {
    console.error('💥 Interest GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Professional updates quote (KEY: Sets status to 'updated') - UNCHANGED
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  const interestId = resolvedParams['interest-id']
  
  console.log('🔄 Professional Quote Update API:', { appointmentId, interestId })
  
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('📝 Quote update request:', body)

    // Get current interest
    const { data: currentInterest, error: fetchError } = await supabase
      .from('interest')
      .select('*')
      .eq('interest_id', interestId)
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError || !currentInterest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // Verify interest is in correct state for quote updates
    if (!['selected', 'confirmed'].includes(currentInterest.status)) {
      return NextResponse.json(
        { error: `Cannot update quote when status is "${currentInterest.status}"` },
        { status: 400 }
      )
    }

    // Store original values for history
    const originalAmount = currentInterest.amount
    const originalMessage = currentInterest.message
    const originalDuration = currentInterest.estimated_duration_hours

    // 🔧 FIXED: Use single-word fields that match your database schema
    const updateData = {
      status: 'updated',
      updated_at: new Date().toISOString()
    }

    // Handle quote update fields
    if (body.updated_quote) {
      const { amount, duration_hours, scope_changes, timeline_changes } = body.updated_quote
      
      if (amount !== undefined) {
        updateData.amount = parseFloat(amount)
        updateData.base = originalAmount // Store original for comparison using single-word field
      }
      
      if (duration_hours !== undefined) {
        updateData.estimated_duration_hours = parseFloat(duration_hours)
        updateData.hours = originalDuration // Store original duration
      }
    }

    // Handle update justification using single-word field
    if (body.quote_update_reason) {
      updateData.reason = body.quote_update_reason // Single-word field
    }

    // Handle updated message
    if (body.response_message) {
      updateData.message = body.response_message
    }

    console.log('🔥 Updating interest with quote update:', updateData)

    // Update the interest record
    const { data: updatedInterest, error: updateError } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', interestId)
      .eq('appointment_id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update interest:', updateError)
      return NextResponse.json(
        { error: 'Failed to update quote', details: updateError.message },
        { status: 500 }
      )
    }

    // 🔥 KEY CHANGE: Update appointment status to 'reviewing'
    const { error: appointmentUpdateError } = await supabase
      .from('appointment')
      .update({
        status: 'reviewing', // Blocks assessment scheduling
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)

    if (appointmentUpdateError) {
      console.error('❌ Failed to update appointment status:', appointmentUpdateError)
      // Don't fail the whole operation for this
    }

    // Create quote update history record (if table exists)
    const historyData = {
      interest_id: interestId,
      appointment_id: appointmentId,
      professional_id: currentInterest.professional_id,
      
      // Original values
      original_amount: originalAmount,
      original_message: originalMessage,
      original_duration_hours: originalDuration,
      
      // Updated values
      updated_amount: updateData.amount || originalAmount,
      updated_message: updateData.message || originalMessage,
      updated_duration_hours: updateData.estimated_duration_hours || originalDuration,
      
      // Justification and changes
      update_reason: body.quote_update_reason,
      scope_changes: body.updated_quote?.scope_changes,
      timeline_changes: body.updated_quote?.timeline_changes,
      
      created_at: new Date().toISOString()
    }

    const { error: historyError } = await supabase
      .from('quote_update_history')
      .insert(historyData)

    if (historyError) {
      console.warn('⚠️ Failed to create quote history:', historyError)
      // Don't fail for history creation
    }

    console.log('✅ Quote update successful - status now "updated", appointment now "reviewing"')

    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully. Customer approval required.',
      interest: updatedInterest,
      requires_customer_approval: true
    })

  } catch (error) {
    console.error('💥 Quote update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}