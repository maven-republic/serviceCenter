// src/app/api/appointments/[appointment-id]/route.js
// FIXED: Added availability validation before booking creation

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return null;
  const start = new Date(startTime);
  const end = new Date(start.getTime() + (durationMinutes * 60000));
  return end.toISOString();
}

// 🆕 FIX #3: Helper function to validate availability before booking
async function validateAvailabilityForBooking(professionalId, startDateTime, durationMinutes) {
  try {
    const supabase = await createClient()
    const requestedStart = new Date(startDateTime)
    const requestedEnd = new Date(requestedStart.getTime() + (durationMinutes * 60 * 1000))

    const dayOfWeek = requestedStart.getUTCDay()
    const timeString = requestedStart.toISOString().split('T')[1].substring(0, 8)
    const dateString = requestedStart.toISOString().split('T')[0]

    console.log('🔍 Validating booking availability:', {
      professionalId,
      dateString,
      dayOfWeek,
      timeString
    })

    // Check for date-specific override
    const { data: override } = await supabase
      .from('availability_override')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('override_date', dateString)
      .maybeSingle()

    if (override) {
      if (!override.is_available) {
        return { available: false, reason: 'Professional unavailable on this date' }
      }
      if (timeString < override.start_time || timeString >= override.end_time) {
        return { available: false, reason: 'Time outside available hours' }
      }
    } else {
      // Check regular availability
      const { data: regularAvailability } = await supabase
        .from('availability')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)

      if (!regularAvailability || regularAvailability.length === 0) {
        return { available: false, reason: 'No availability on this day' }
      }

      const matchingSlot = regularAvailability.find(slot => 
        timeString >= slot.start_time && timeString < slot.end_time
      )

      if (!matchingSlot) {
        return { available: false, reason: 'Time outside available hours' }
      }

      const endTimeString = requestedEnd.toISOString().split('T')[1].substring(0, 8)
      if (endTimeString > matchingSlot.end_time) {
        return { available: false, reason: 'Duration exceeds available time block' }
      }
    }

    // Check for conflicting appointments
    const { data: existingAppointments } = await supabase
      .from('appointment')
      .select('session, duration')
      .eq('professional_id', professionalId)
      .in('status', ['approved', 'converting', 'converted'])
      .gte('session', dateString)
      .lte('session', `${dateString}T23:59:59`)

    if (existingAppointments) {
      for (const appt of existingAppointments) {
        const apptStart = new Date(appt.session)
        const apptEnd = new Date(apptStart.getTime() + ((appt.duration || 60) * 60 * 1000))
        
        if (requestedStart < apptEnd && requestedEnd > apptStart) {
          return { available: false, reason: 'Conflicts with existing appointment' }
        }
      }
    }

    // Check for conflicting bookings
    const { data: existingBookings } = await supabase
      .from('booking')
      .select('scheduled_start, scheduled_end, duration_minutes')
      .eq('professional_id', professionalId)
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
          return { available: false, reason: 'Conflicts with existing booking' }
        }
      }
    }

    console.log('✅ Booking time slot is available')
    return { available: true }
  } catch (error) {
    console.error('❌ Error validating booking availability:', error)
    return { available: false, reason: 'Error checking availability' }
  }
}

// GET /api/appointments/[appointment-id] - Get specific appointment details
export async function GET(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Single Appointment GET API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Appointment not found:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Get related data
    const [serviceData, customerData, professionalData, addressData, attachmentData, interestData] = await Promise.all([
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes, pricing_model')
        .eq('service_id', appointment.service_id)
        .single(),
        
      supabase
        .from('individual_customer')
        .select(`
          customer_id,
          account_id,
          account!inner (
            account_id,
            first_name,
            last_name,
            email,
            profile_picture_url
          )
        `)
        .eq('customer_id', appointment.customer_id)
        .single(),
        
      appointment.professional_id ? supabase
        .from('individual_professional')
        .select(`
          professional_id,
          account_id,
          account!inner (
            account_id,
            first_name,
            last_name,
            email,
            profile_picture_url
          )
        `)
        .eq('professional_id', appointment.professional_id)
        .single() : { data: null },
        
      appointment.address_id ? supabase
        .from('address')
        .select(`
          address_id,
          street_address,
          city,
          parish,
          community,
          landmark,
          formatted_address,
          latitude,
          longitude,
          is_rural
        `)
        .eq('address_id', appointment.address_id)
        .single() : { data: null },

      supabase
        .from('attachment')
        .select(`
          id,
          purpose,
          position,
          asset:asset_id (
            id,
            filename,
            original,
            path,
            size,
            type,
            created
          )
        `)
        .eq('appointment_id', appointment.appointment_id)
        .order('position'),

      supabase
        .from('interest')
        .select('*')
        .eq('appointment_id', appointment.appointment_id)
        .order('created_at', { ascending: false })
    ])

    // Get customer phone
    let customerPhone = null
    if (customerData.data) {
      const { data: phoneData } = await supabase
        .from('phone')
        .select('phone_number, phone_type, is_primary')
        .eq('account_id', customerData.data.account_id)
        .eq('is_primary', true)
        .single()
      
      customerPhone = phoneData
    }

    const enrichedAppointment = {
      ...appointment,
      service: serviceData.data,
      customer: {
        ...customerData.data,
        phone: customerPhone
      },
      professional: professionalData.data,
      address: addressData.data,
      attachments: attachmentData.data || [],
      interests: interestData.data || [],
      workflow_type: appointment.professional_id ? 'direct' : 'marketplace',
      interest_summary: {
        total_count: (interestData.data || []).length,
        active_count: (interestData.data || []).filter(i => !['withdrawn', 'rejected'].includes(i.status)).length,
        quoted_count: (interestData.data || []).filter(i => i.amount || i.status === 'quoted').length,
        selected_interest: (interestData.data || []).find(i => i.selected_by_customer) || null,
        assessment_required_count: (interestData.data || []).filter(i => i.assessment).length
      }
    }

    console.log('✅ Appointment found with', (interestData.data || []).length, 'interests')

    return NextResponse.json({ 
      success: true,
      appointment: enrichedAppointment 
    })

  } catch (error) {
    console.error('💥 Single appointment GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/appointments/[appointment-id] - Update appointment
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Appointment PATCH API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔥 Update request:', body)

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointment')
      .select('appointment_id, professional_id, customer_id, status, service_id, address_id, interest_count, session, duration')
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {}

    const allowedFields = [
      'session', 'preferred_end', 'urgency', 'customer_message',
      'title', 'description', 'deadline', 'complexity', 'flexibility'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    updateData.updated_at = new Date().toISOString()

    // Handle status changes
    if (body.status) {
      let targetStatus = body.status
      
      // Handle approved → converting transition
      if (body.status === 'approved' && currentAppointment.status === 'approved') {
        console.log('📋 Appointment already approved, setting to converting')
        targetStatus = 'converting'
      } else if (body.status === 'approved') {
        console.log('📋 Step 1: Setting appointment to converting status')
        targetStatus = 'converting'
      }
      
      updateData.status = targetStatus
      
      if (targetStatus === 'converted') {
        updateData.converted_to_booking_at = new Date().toISOString()
      }

      // Validate status transition
      const validTransitions = {
        'pending': ['interested', 'competing', 'abandoned', 'expired'],
        'interested': ['competing', 'evaluating', 'quoted', 'approved'],
        'competing': ['evaluating', 'quoted', 'approved'],
        'evaluating': ['proposed', 'scheduled', 'quoted'],
        'proposed': ['scheduled', 'assessing'],
        'scheduled': ['assessing', 'assessed'],
        'assessing': ['assessed'],
        'assessed': ['quoted'],
        'quoted': ['comparing', 'approved', 'declined'],
        'comparing': ['approved', 'declined'],
        'reviewing': ['approved', 'declined'],
        'approved': ['converting', 'declined'],
        'converting': ['converted'],
        'converted': [],
        'declined': [],
        'abandoned': [],
        'expired': []
      }

      if (!validTransitions[currentAppointment.status]?.includes(targetStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentAppointment.status} to ${targetStatus}` },
          { status: 400 }
        )
      }
    }

    console.log('🔥 Updating appointment with:', updateData)

    // Update appointment
    const { data: updatedAppointment, error } = await supabase
      .from('appointment')
      .update(updateData)
      .eq('appointment_id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating appointment:', error)
      return NextResponse.json(
        { error: 'Failed to update appointment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Appointment updated:', updatedAppointment.appointment_id)

    // 🆕 FIX #3: Validate availability before creating booking
    if (body.status === 'approved') {
      console.log('📋 Step 2: Creating booking from converting appointment...')
      
      try {
        // Find selected professional
        const { data: selectedInterest, error: interestError } = await supabase
          .from('interest')
          .select('professional_id, amount, status')
          .eq('appointment_id', appointmentId)
          .or('selected_by_customer.eq.true,status.eq.approved')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        console.log('📋 Step 2a: Selected interest:', { selectedInterest, interestError })

        if (interestError || !selectedInterest) {
          console.error('❌ No selected professional found:', interestError)
          console.log('⚠️ Booking creation skipped - no selected professional')
        } else {
          console.log('📋 Step 2b: Found professional:', selectedInterest.professional_id)

          // 🆕 FIX #3: VALIDATE AVAILABILITY BEFORE CREATING BOOKING
          console.log('🔍 Checking if professional is still available...')
          const availabilityCheck = await validateAvailabilityForBooking(
            selectedInterest.professional_id,
            updatedAppointment.session,
            updatedAppointment.duration || 60
          )

          if (!availabilityCheck.available) {
            console.error('❌ Professional no longer available:', availabilityCheck.reason)
            return NextResponse.json(
              { 
                error: 'Cannot create booking: Professional is no longer available at this time',
                reason: availabilityCheck.reason,
                suggestion: 'Please select a different time slot or professional'
              },
              { status: 409 }
            )
          }

          console.log('✅ Professional is available, creating booking...')

          // Create booking
          const { data: booking, error: bookingError } = await supabase
            .from('booking')
            .insert([{
              appointment_id: updatedAppointment.appointment_id,
              customer_id: updatedAppointment.customer_id,
              professional_id: selectedInterest.professional_id,
              service_id: updatedAppointment.service_id,
              address_id: updatedAppointment.address_id,
              scheduled_start: updatedAppointment.session,
              scheduled_end: calculateEndTime(updatedAppointment.session, updatedAppointment.duration),
              duration_minutes: updatedAppointment.duration || 60,
              urgency: updatedAppointment.urgency,
              status: 'accepted',
              customer_notes: updatedAppointment.customer_message,
              sync_source: 'manual'
            }])
            .select()
            .single()

          if (bookingError) {
            console.error('❌ Error creating booking:', bookingError)
            return NextResponse.json(
              { error: 'Failed to create booking', details: bookingError.message },
              { status: 500 }
            )
          } else {
            console.log('✅ Booking created successfully:', booking.booking_id)
            
            // Step 3: Update appointment to 'converted'
            console.log('📋 Step 3: Setting appointment to converted status')
            const { error: finalUpdateError } = await supabase
              .from('appointment')
              .update({ 
                status: 'converted',
                professional_id: selectedInterest.professional_id,
                converted_to_booking_at: new Date().toISOString()
              })
              .eq('appointment_id', appointmentId)

            if (finalUpdateError) {
              console.error('❌ Error setting final status:', finalUpdateError)
            } else {
              console.log('✅ Appointment conversion completed successfully')
            }
          }
        }
      } catch (bookingError) {
        console.error('❌ Booking creation failed:', bookingError)
        return NextResponse.json(
          { error: 'Failed to create booking', details: bookingError.message },
          { status: 500 }
        )
      }
    }

    // Get enriched appointment data to return
    const [serviceData, customerData, professionalData, addressData, interestData] = await Promise.all([
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes')
        .eq('service_id', currentAppointment.service_id)
        .single(),
        
      supabase
        .from('individual_customer')
        .select(`
          customer_id,
          account_id,
          account!inner (
            account_id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('customer_id', currentAppointment.customer_id)
        .single(),
        
      updatedAppointment.professional_id ? supabase
        .from('individual_professional')
        .select(`
          professional_id,
          account_id,
          account!inner (
            account_id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('professional_id', updatedAppointment.professional_id)
        .single() : { data: null },
        
      currentAppointment.address_id ? supabase
        .from('address')
        .select('address_id, formatted_address, street_address, city, parish')
        .eq('address_id', currentAppointment.address_id)
        .single() : { data: null },

      supabase
        .from('interest')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false })
    ])

    const enrichedAppointment = {
      ...updatedAppointment,
      service: serviceData.data,
      customer: customerData.data,
      professional: professionalData.data,
      address: addressData.data,
      interests: interestData.data || [],
      workflow_type: updatedAppointment.professional_id ? 'direct' : 'marketplace'
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: enrichedAppointment
    })

  } catch (error) {
    console.error('💥 Appointment PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[appointment-id] - Delete appointment
export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Appointment DELETE API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()

    const { data: appointment, error: fetchError } = await supabase
      .from('appointment')
      .select('appointment_id, status, customer_id, professional_id, interest_count')
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const deletableStatuses = ['pending', 'interested', 'competing', 'evaluating', 'quoted']
    if (!deletableStatuses.includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Only pending appointments or those with interests can be deleted' },
        { status: 400 }
      )
    }

    if (appointment.interest_count > 0) {
      const { data: activeInterests } = await supabase
        .from('interest')
        .select('interest_id, status')
        .eq('appointment_id', appointmentId)
        .not('status', 'in', '(withdrawn,rejected)')

      if (activeInterests && activeInterests.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete appointment with active professional interests. Please reject all interests first.' },
          { status: 400 }
        )
      }
    }

    // Mark interests as withdrawn
    await supabase
      .from('interest')
      .update({ 
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)

    const { error } = await supabase
      .from('appointment')
      .delete()
      .eq('appointment_id', appointmentId)

    if (error) {
      console.error('❌ Error deleting appointment:', error)
      return NextResponse.json(
        { error: 'Failed to delete appointment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Appointment deleted:', appointmentId)

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })

  } catch (error) {
    console.error('💥 Appointment DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}