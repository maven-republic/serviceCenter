// src/app/api/appointments/[id]/interests/[interest_id]/quote-approval/route.js
// NEW API endpoint for customer quote approval/decline

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Customer approves or declines quote update
export async function POST(request, { params }) {
  console.log('🔵 POST /api/appointments/[id]/interests/[interest_id]/quote-approval')
  
  try {
    const resolvedParams = await params
    const { id: appointmentId, interest_id: interestId } = resolvedParams
    
    console.log('📝 Processing quote approval:', { appointmentId, interestId })
    
    if (!appointmentId || !interestId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID and Interest ID are required' },
        { status: 400 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('📝 Request body:', {
        action: body.action,
        hasNotes: !!body.customer_notes
      })
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { action, customer_notes } = body

    // Validate action
    if (!action || !['approve', 'decline'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "decline"' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the interest record
    const { data: interest, error: findError } = await supabase
      .from('interest')
      .select('*')
      .eq('interest_id', interestId)
      .eq('appointment_id', appointmentId)
      .single()

    if (findError || !interest) {
      console.error('❌ Interest not found:', findError)
      return NextResponse.json(
        { success: false, error: 'Interest record not found' },
        { status: 404 }
      )
    }

    // Verify interest is in the correct state for approval
    if (interest.status !== 'updated_quote') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Interest status is "${interest.status}", expected "updated_quote"` 
        },
        { status: 400 }
      )
    }

    console.log('✅ Interest found and ready for approval:', interest.interest_id)

    if (action === 'approve') {
      // ✅ APPROVE QUOTE UPDATE
      console.log('✅ Customer approving quote update')

      // Update interest to confirmed status
      const { data: updatedInterest, error: updateError } = await supabase
        .from('interest')
        .update({
          status: 'confirmed',
          customer_approved_quote_update: true,
          customer_approved_quote_at: new Date().toISOString(),
          customer_notes: customer_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('interest_id', interestId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Failed to update interest:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to approve quote update', details: updateError.message },
          { status: 500 }
        )
      }

      // Assign professional to appointment (now that quote is approved)
      const { error: appointmentError } = await supabase
        .from('appointment')
        .update({
          professional_id: interest.professional_id,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId)

      if (appointmentError) {
        console.error('❌ Failed to update appointment:', appointmentError)
        return NextResponse.json(
          { success: false, error: 'Failed to confirm appointment', details: appointmentError.message },
          { status: 500 }
        )
      }

      // Update quote history record
      const { error: historyError } = await supabase
        .from('quote_update_history')
        .update({
          customer_response: 'approved',
          customer_response_at: new Date().toISOString(),
          customer_response_notes: customer_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('interest_id', interestId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (historyError) {
        console.warn('⚠️ Failed to update quote history:', historyError)
        // Don't fail for history update
      }

      console.log('✅ Quote update approved successfully')

      return NextResponse.json({
        success: true,
        message: 'Quote update approved successfully',
        interest: updatedInterest,
        action: 'approve'
      })

    } else if (action === 'decline') {
      // ❌ DECLINE QUOTE UPDATE
      console.log('❌ Customer declining quote update')

      // Update interest back to selected status (customer needs new response)
      const { data: updatedInterest, error: updateError } = await supabase
        .from('interest')
        .update({
          status: 'selected', // Back to selected - professional needs to respond again
          customer_declined_quote_update: true,
          customer_declined_quote_at: new Date().toISOString(),
          customer_notes: customer_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('interest_id', interestId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Failed to update interest:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to decline quote update', details: updateError.message },
          { status: 500 }
        )
      }

      // Update quote history record
      const { error: historyError } = await supabase
        .from('quote_update_history')
        .update({
          customer_response: 'declined',
          customer_response_at: new Date().toISOString(),
          customer_response_notes: customer_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('interest_id', interestId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (historyError) {
        console.warn('⚠️ Failed to update quote history:', historyError)
        // Don't fail for history update
      }

      console.log('✅ Quote update declined successfully')

      return NextResponse.json({
        success: true,
        message: 'Quote update declined. Professional will need to provide a new response.',
        interest: updatedInterest,
        action: 'decline'
      })
    }

  } catch (error) {
    console.error('❌ API Error in quote approval:', error)
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

// GET - Get quote update history for an interest
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { id: appointmentId, interest_id: interestId } = resolvedParams
    
    if (!appointmentId || !interestId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID and Interest ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get quote update history
    const { data: quoteHistory, error } = await supabase
      .from('quote_update_history')
      .select('*')
      .eq('interest_id', interestId)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch quote history:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote history', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quote_history: quoteHistory || []
    })

  } catch (error) {
    console.error('❌ API Error fetching quote history:', error)
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