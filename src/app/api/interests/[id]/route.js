// src/app/api/interests/[id]/route.js
// Individual interest management

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/interests/[id] - Get specific interest details
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

// PATCH /api/interests/[id] - Update interest
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
      .select('interest_id, professional_id, appointment_id, status')
      .eq('interest_id', id)
      .single()

    if (fetchError || !currentInterest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {}
    
    // Handle status changes
    if (body.status) {
      const validTransitions = {
        'pending': ['quoted', 'withdrawn'],
        'invited': ['quoted', 'declined'],
        'quoted': ['selected', 'rejected'],
        'selected': ['accepted', 'declined'],
        'accepted': [],
        'declined': [],
        'rejected': [],
        'withdrawn': []
      }

      if (!validTransitions[currentInterest.status]?.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentInterest.status} to ${body.status}` },
          { status: 400 }
        )
      }

      updateData.status = body.status
    }

    // Handle other field updates
    const allowedFields = [
      'message', 'amount', 'proposed_start', 'proposed_end', 
      'notes', 'intent', 'assessment'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    updateData.updated_at = new Date().toISOString()

    console.log('🔥 Updating interest with:', updateData)

    // Update interest
    const { data: updatedInterest, error } = await supabase
      .from('interest')
      .update(updateData)
      .eq('interest_id', id)
      .select(`
        *,
        appointment:appointment_id (
          appointment_id,
          title,
          status,
          customer:customer_id (
            customer_id,
            account:account_id (
              first_name,
              last_name
            )
          )
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error updating interest:', error)
      return NextResponse.json(
        { error: 'Failed to update interest', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Interest updated:', updatedInterest.interest_id)

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

// DELETE /api/interests/[id] - Delete/withdraw interest
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