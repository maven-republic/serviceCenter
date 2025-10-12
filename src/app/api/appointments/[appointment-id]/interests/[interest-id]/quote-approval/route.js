// src/app/api/appointments/[id]/interests/[interest_id]/quote-approval/route.js
// FIXED: Now creates booking when customer approves quote update

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Customer approves or declines quote update
export async function POST(request, { params }) {
  console.log('🔵 POST /api/appointments/[id]/interests/[interest_id]/quote-approval')
  
  try {
    const resolvedParams = await params
    const appointmentId = resolvedParams['appointment-id']
    const interestId = resolvedParams['interest-id']    
    console.log('🔍 Processing quote approval:', { appointmentId, interestId })
    
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
      console.log('🔍 Request body:', {
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
    if (interest.status !== 'updated') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Interest status is "${interest.status}", expected "updated"` 
        },
        { status: 400 }
      )
    }

    console.log('✅ Interest found and ready for approval:', interest.interest_id)

    if (action === 'approve') {
      // ✅ APPROVE QUOTE UPDATE AND CREATE BOOKING
      console.log('✅ Customer approving quote update')

      // Update interest to approved status
      const { data: updatedInterest, error: updateError } = await supabase
        .from('interest')
        .update({
          status: 'approved',
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

      // Get appointment details for booking creation
      const { data: appointment, error: appointmentFetchError } = await supabase
        .from('appointment')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single()

      if (appointmentFetchError || !appointment) {
        console.error('❌ Failed to fetch appointment:', appointmentFetchError)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch appointment details' },
          { status: 500 }
        )
      }

      // 🆕 Step 1: Set appointment to converting
      console.log('🔄 Step 1: Setting appointment to converting status')
      const { error: convertingError } = await supabase
        .from('appointment')
        .update({
          status: 'converting',
          professional_id: interest.professional_id,
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId)

      if (convertingError) {
        console.error('❌ Failed to set converting status:', convertingError)
        return NextResponse.json(
          { success: false, error: 'Failed to update appointment status' },
          { status: 500 }
        )
      }

      // 🆕 Step 2: Validate availability
      console.log('🔍 Checking if professional is available...')
      const requestedStart = new Date(appointment.session)
      const requestedEnd = new Date(requestedStart.getTime() + ((appointment.duration || 60) * 60 * 1000))
      const dayOfWeek = requestedStart.getUTCDay()
      const timeString = requestedStart.toISOString().split('T')[1].substring(0, 8)
      const dateString = requestedStart.toISOString().split('T')[0]

      // Check for date-specific override
      const { data: override } = await supabase
        .from('availability_override')
        .select('*')
        .eq('professional_id', interest.professional_id)
        .eq('override_date', dateString)
        .maybeSingle()

      let availabilityCheck = { available: true }

      if (override) {
        if (!override.is_available) {
          availabilityCheck = { available: false, reason: 'Professional unavailable on this date' }
        } else if (timeString < override.start_time || timeString >= override.end_time) {
          availabilityCheck = { available: false, reason: 'Time outside available hours' }
        }
      } else {
        // Check regular availability
        const { data: regularAvailability } = await supabase
          .from('availability')
          .select('*')
          .eq('professional_id', interest.professional_id)
          .eq('day_of_week', dayOfWeek)

        if (!regularAvailability || regularAvailability.length === 0) {
          availabilityCheck = { available: false, reason: 'No availability on this day' }
        } else {
          const matchingSlot = regularAvailability.find(slot => 
            timeString >= slot.start_time && timeString < slot.end_time
          )

          if (!matchingSlot) {
            availabilityCheck = { available: false, reason: 'Time outside available hours' }
          } else {
            const endTimeString = requestedEnd.toISOString().split('T')[1].substring(0, 8)
            if (endTimeString > matchingSlot.end_time) {
              availabilityCheck = { available: false, reason: 'Duration exceeds available time block' }
            }
          }
        }
      }

      // Check for conflicting bookings
      if (availabilityCheck.available) {
        const { data: existingBookings } = await supabase
          .from('booking')
          .select('scheduled_start, scheduled_end, duration_minutes')
          .eq('professional_id', interest.professional_id)
          .in('status', ['pending', 'accepted', 'confirmed', 'progressing'])
          .gte('scheduled_start', dateString)
          .lte('scheduled_start', `${dateString}T23:59:59`)

        if (existingBookings) {
          for (const booking of existingBookings) {
            const bookingStart = new Date(booking.scheduled_start)
            const bookingEnd = booking.scheduled_end 
              ? new Date(booking.scheduled_end)
              : new Date(bookingStart.getTime() + ((booking.duration_minutes || 60) * 60 * 1000))
            
            if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
              availabilityCheck = { available: false, reason: 'Conflicts with existing booking' }
              break
            }
          }
        }
      }

      if (!availabilityCheck.available) {
        console.error('❌ Professional no longer available:', availabilityCheck.reason)
        
        // Roll back appointment status
        await supabase
          .from('appointment')
          .update({ status: 'approved' })
          .eq('appointment_id', appointmentId)
        
        return NextResponse.json(
          { 
            error: 'Cannot create booking: Professional is no longer available',
            reason: availabilityCheck.reason
          },
          { status: 409 }
        )
      }

      console.log('✅ Professional is available, creating booking...')

      // Calculate scheduled_end
      const scheduledEnd = new Date(requestedStart.getTime() + ((appointment.duration || 60) * 60 * 1000))

      // 🆕 Step 3: Create booking
      console.log('📝 Creating booking with data:', {
        appointment_id: appointment.appointment_id,
        customer_id: appointment.customer_id,
        professional_id: interest.professional_id,
        service_id: appointment.service_id,
        address_id: appointment.address_id,
        scheduled_start: appointment.session,
        scheduled_end: scheduledEnd.toISOString(),
        duration_minutes: appointment.duration,
        urgency: appointment.urgency,
        status: 'accepted'
      })

      const { data: booking, error: bookingError } = await supabase
        .from('booking')
        .insert({
          appointment_id: appointment.appointment_id,
          customer_id: appointment.customer_id,
          professional_id: interest.professional_id,
          service_id: appointment.service_id,
          address_id: appointment.address_id,
          scheduled_start: appointment.session,
          scheduled_end: scheduledEnd.toISOString(),
          duration_minutes: appointment.duration || 60,
          urgency: appointment.urgency,
          status: 'accepted',
          customer_notes: appointment.customer_message,
          sync_source: 'manual'
        })
        .select()
        .single()

      if (bookingError) {
        console.error('❌ BOOKING CREATION FAILED:', {
          error: bookingError,
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code
        })
        
        // Roll back appointment status
        await supabase
          .from('appointment')
          .update({ status: 'approved' })
          .eq('appointment_id', appointmentId)
        
        return NextResponse.json(
          { error: `Failed to create booking: ${bookingError.message}` },
          { status: 500 }
        )
      }

      console.log('✅ Booking created successfully:', booking.booking_id)

      // 🆕 Step 4: Update appointment to converted
      console.log('📋 Step 4: Setting appointment to converted status')
      const { error: finalUpdateError } = await supabase
        .from('appointment')
        .update({ 
          status: 'converted',
          professional_id: interest.professional_id,
          converted_to_booking_at: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId)

      if (finalUpdateError) {
        console.error('❌ Error setting final status:', finalUpdateError)
      } else {
        console.log('✅ Appointment conversion completed successfully')
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
      }

      console.log('✅ Quote update approved and booking created successfully')

      return NextResponse.json({
        success: true,
        message: 'Quote approved and booking created successfully',
        interest: updatedInterest,
        booking_id: booking.booking_id,
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
    const appointmentId = resolvedParams['appointment-id']
    const interestId = resolvedParams['interest-id']
    
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