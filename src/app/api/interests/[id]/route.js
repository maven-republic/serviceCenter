// src/app/api/interests/[id]/route.js
// Individual interest management - UPDATED with price range support

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/interests/[id] - Get specific interest details (unchanged)
export async function GET(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🎯 Interest GET API called for ID:', id)
  
  try {
    const supabase = await createClient()

    const { data: interest, error } = await supabase
      .from('interest')
      .select(`
        *,
        appointment:appointment_id (
          appointment_id,
          title,
          description,
          status,
          session,
          preferred_end,
          urgency,
          customer_message,
          service:service_id (
            service_id,
            name,
            description,
            base_price
          ),
          customer:customer_id (
            customer_id,
            account:account_id (
              account_id,
              first_name,
              last_name,
              email,
              profile_picture_url
            )
          ),
          address:address_id (
            address_id,
            street_address,
            city,
            parish,
            formatted_address,
            latitude,
            longitude
          )
        ),
        professional:professional_id (
          professional_id,
          business_name,
          verification_status,
          rating_average,
          rating_count,
          account:account_id (
            account_id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('interest_id', id)
      .single()

    if (error || !interest) {
      console.error('❌ Interest not found:', error)
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    console.log('✅ Interest found:', interest.interest_id)

    return NextResponse.json({
      success: true,
      interest
    })

  } catch (error) {
    console.error('💥 Interest GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/interests/[id] - Update interest (UPDATED with price range support)
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🎯 Interest PATCH API called for ID:', id)
  
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔥 Update request:', body)

    // Get current interest to validate
    const { data: currentInterest, error: fetchError } = await supabase
      .from('interest')
      .select('interest_id, professional_id, appointment_id, status, assessment, amount, selected_by_customer')
      .eq('interest_id', id)
      .single()

    if (fetchError || !currentInterest) {
      console.error('❌ Interest fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {}
    
    // Handle status changes - FIXED: Added 'confirmed' transition
    if (body.status) {
      const validTransitions = {
        'invited': ['quoted', 'declined'],
        'interested': ['quoted', 'withdrawn'], 
        'quoted': ['selected', 'rejected', 'updated'],
        'selected': ['confirmed', 'declined'],    // ✅ This allows selected → confirmed
        'confirmed': [],                          // Final success state
        'declined': [],                           // Final decline state  
        'rejected': [],                           // Customer rejected quote
        'withdrawn': [],
        'updated': ['quoted']
      }

      console.log('🔍 Status transition check:', {
        current: currentInterest.status,
        requested: body.status,
        allowed: validTransitions[currentInterest.status]
      })

      if (!validTransitions[currentInterest.status]?.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentInterest.status} to ${body.status}` },
          { status: 400 }
        )
      }

      // Additional validation for 'confirmed' status
      if (body.status === 'confirmed') {
        if (currentInterest.status !== 'selected') {
          return NextResponse.json(
            { error: 'Can only confirm selected interests' },
            { status: 400 }
          )
        }

        if (!currentInterest.selected_by_customer) {
          return NextResponse.json(
            { error: 'Interest must be selected by customer before confirmation' },
            { status: 400 }
          )
        }
      }

      updateData.status = body.status
    }

    // Handle other field updates including new price range fields
    const allowedFields = [
      'message', 
      'amount', 
      'proposed_start', 
      'proposed_end', 
      'notes', 
      'intent', 
      'assessment',
      'modality',
      'fee',
      'estimated_duration_hours',
      'earliest_start',
      'latest_start',
      // Price range fields
      'price_range_min',
      'price_range_max',
      'assessment_justification'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Enhanced validation for assessment-only with price ranges
    if (body.assessment !== undefined || body.amount !== undefined || body.price_range_min !== undefined || body.price_range_max !== undefined) {
      const newAssessment = body.assessment !== undefined ? body.assessment : currentInterest.assessment
      const newAmount = body.amount !== undefined ? body.amount : currentInterest.amount
      const newPriceRangeMin = body.price_range_min !== undefined ? body.price_range_min : null
      const newPriceRangeMax = body.price_range_max !== undefined ? body.price_range_max : null
      const newJustification = body.assessment_justification !== undefined ? body.assessment_justification : null

      // Validate assessment-only requirements
      if (newAssessment && !newAmount) {
        if (!newPriceRangeMin && !newPriceRangeMax) {
          return NextResponse.json(
            { error: 'Price range is required when assessment is needed without immediate quote' },
            { status: 400 }
          )
        }
        
        if (!newJustification || !newJustification.trim()) {
          return NextResponse.json(
            { error: 'Assessment justification is required when assessment is needed without immediate quote' },
            { status: 400 }
          )
        }
      }

      // Validate price range order
      if (newPriceRangeMin && newPriceRangeMax) {
        if (parseFloat(newPriceRangeMin) >= parseFloat(newPriceRangeMax)) {
          return NextResponse.json(
            { error: 'Maximum price must be greater than minimum price' },
            { status: 400 }
          )
        }
      }
    }

    updateData.updated_at = new Date().toISOString()

    console.log('🔥 Updating interest with:', updateData)

    // FIXED: Simple update without complex embedding to avoid PostgREST errors
    const { data: updatedInterest, error } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', id)
      .select('*')  // Simple select without relationships
      .single()

    if (error) {
      console.error('❌ Error updating interest:', error)
      return NextResponse.json(
        { error: 'Failed to update interest', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Interest updated successfully:', updatedInterest.interest_id)

    // Handle special status changes
    if (body.status === 'withdrawn') {
      // Update appointment interest count
      const { data: appointment } = await supabase
        .from('appointment')
        .select('interest_count')
        .eq('appointment_id', currentInterest.appointment_id)
        .single()

      if (appointment) {
        await supabase
          .from('appointment')
          .update({
            interest_count: Math.max(0, appointment.interest_count - 1)
          })
          .eq('appointment_id', currentInterest.appointment_id)
      }
    }

    // TODO: Send notifications based on status changes
    if (body.status === 'quoted') {
      console.log('📧 TODO: Send quote notification to customer')
    } else if (body.status === 'withdrawn') {
      console.log('📧 TODO: Send withdrawal notification to customer')
    } else if (body.status === 'confirmed') {
      console.log('✅ Professional confirmed interest - appointment status will be updated by DB trigger')
    }

    return NextResponse.json({
      success: true,
      message: 'Interest updated successfully',
      interest: updatedInterest
    })

  } catch (error) {
    console.error('💥 Interest PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/interests/[id] - Delete/withdraw interest (unchanged)
export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🎯 Interest DELETE API called for ID:', id)
  
  try {
    const supabase = await createClient()

    // Check if interest exists and can be deleted
    const { data: interest, error: fetchError } = await supabase
      .from('interest')
      .select('interest_id, status, appointment_id, professional_id')
      .eq('interest_id', id)
      .single()

    if (fetchError || !interest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // Only allow deletion for certain statuses
    const deletableStatuses = ['pending', 'invited', 'quoted']
    if (!deletableStatuses.includes(interest.status)) {
      return NextResponse.json(
        { error: 'Cannot delete interest with status: ' + interest.status },
        { status: 400 }
      )
    }

    // Mark as withdrawn instead of hard delete to preserve history
    const { error } = await supabase
      .from('interest')
      .update({ 
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('interest_id', id)

    if (error) {
      console.error('❌ Error withdrawing interest:', error)
      return NextResponse.json(
        { error: 'Failed to withdraw interest', details: error.message },
        { status: 500 }
      )
    }

    // Update appointment interest count
    const { data: appointment } = await supabase
      .from('appointment')
      .select('interest_count')
      .eq('appointment_id', interest.appointment_id)
      .single()

    if (appointment) {
      await supabase
        .from('appointment')
        .update({
          interest_count: Math.max(0, appointment.interest_count - 1)
        })
        .eq('appointment_id', interest.appointment_id)
    }

    console.log('✅ Interest withdrawn:', id)

    // TODO: Send withdrawal notification
    console.log('📧 TODO: Send withdrawal notification to customer')

    return NextResponse.json({
      success: true,
      message: 'Interest withdrawn successfully'
    })

  } catch (error) {
    console.error('💥 Interest DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}