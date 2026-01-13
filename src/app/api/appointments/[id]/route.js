// src/app/api/appointments/[id]/route.js

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

// GET /api/appointments/[id] - Get specific appointment details
export async function GET(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams.id
  
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

// PATCH /api/appointments/[id] - Update appointment or handle accept/decline
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams.id
  
  console.log('🔥 Appointment PATCH API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📋 PATCH request body:', body)

    const { action, ...updateFields } = body

    // Fetch current appointment
    const { data: appointment, error: fetchError } = await supabase
      .from('appointment')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // ============================================
    // PATH A: ACCEPT/DECLINE DIRECT BOOKING REQUEST
    // ============================================
    if ((action === 'accept' || action === 'decline') && appointment.professional_id) {
      // Check if this is a PATH A appointment (has professional_id but no interests)
      const isPathA = !appointment.interest_count || appointment.interest_count === 0;
      
      if (!isPathA) {
        return NextResponse.json(
          { error: 'This action is only for direct booking requests. This appointment has active interests.' },
          { status: 400 }
        )
      }
      
      // Check if appointment is still pending
      if (appointment.status !== 'pending') {
        return NextResponse.json(
          { error: `Cannot ${action} appointment with status: ${appointment.status}` },
          { status: 400 }
        )
      }
      
      // Check if request has expired (24 hours)
      const createdAt = new Date(appointment.created_at)
      const now = new Date()
      const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60)
      
      if (hoursSinceCreated > 24) {
        return NextResponse.json(
          { error: 'This booking request has expired. Direct booking requests must be responded to within 24 hours.' },
          { status: 410 } // 410 Gone
        )
      }
      
      // ============================================
      // ACCEPT PATH A APPOINTMENT
      // ============================================
      if (action === 'accept') {
        console.log('🎯 Professional accepting PATH A appointment:', appointmentId);
        
        // Calculate scheduled_end time
        const scheduledStart = new Date(appointment.session);
        const scheduledEnd = new Date(scheduledStart);
        scheduledEnd.setMinutes(scheduledEnd.getMinutes() + (appointment.duration || 60));
        
        // Create booking
        const { data: booking, error: bookingError } = await supabase
          .from('booking')
          .insert({
            appointment_id: appointment.appointment_id,
            customer_id: appointment.customer_id,
            professional_id: appointment.professional_id,
            service_id: appointment.service_id,
            address_id: appointment.address_id,
            scheduled_start: appointment.session,
            scheduled_end: scheduledEnd.toISOString(),
            duration_minutes: appointment.duration || 60,
            urgency: appointment.urgency || 'standard',
            status: 'accepted',
            customer_notes: appointment.customer_message,
            sync_source: 'manual'
          })
          .select()
          .single();
        
        if (bookingError) {
          console.error('❌ Booking creation failed:', bookingError);
          return NextResponse.json(
            { error: 'Failed to create booking', details: bookingError.message },
            { status: 500 }
          )
        }
        
        console.log('✅ PATH A booking created:', booking.booking_id);
        
        // Update appointment to 'scheduled'
        const { error: updateError } = await supabase
          .from('appointment')
          .update({
            status: 'scheduled',
            converted_to_booking_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('appointment_id', appointmentId);
        
        if (updateError) {
          console.error('❌ Failed to update appointment:', updateError);
          // Booking was created, so we should try to continue
          console.warn('⚠️ Booking created but appointment update failed');
        }
        
        // TODO: Send email notification to customer
        // await sendCustomerBookingAcceptedEmail(appointment, booking)
        console.log('📧 TODO: Send acceptance notification to customer');
        
        return NextResponse.json({
          success: true,
          message: 'Direct booking accepted successfully',
          booking: booking,
          appointment: {
            ...appointment,
            status: 'scheduled',
            booking_id: booking.booking_id,
            converted_to_booking_at: new Date().toISOString()
          }
        });
      }
      
      // ============================================
      // DECLINE PATH A APPOINTMENT
      // ============================================
      if (action === 'decline') {
        console.log('❌ Professional declining PATH A appointment:', appointmentId);
        
        const { error: declineError } = await supabase
          .from('appointment')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('appointment_id', appointmentId);
        
        if (declineError) {
          return NextResponse.json(
            { error: 'Failed to decline appointment', details: declineError.message },
            { status: 500 }
          )
        }
        
        // TODO: Send email notification to customer
        // await sendCustomerBookingDeclinedEmail(appointment)
        console.log('📧 TODO: Send decline notification to customer');
        
        return NextResponse.json({
          success: true,
          message: 'Direct booking declined',
          appointment: {
            ...appointment,
            status: 'cancelled',
            updated_at: new Date().toISOString()
          }
        });
      }
    }

    // ============================================
    // EXISTING PATCH LOGIC (for other updates)
    // ============================================
    
    // Validate allowed fields for update
    const allowedUpdateFields = [
      'title',
      'description',
      'session',
      'deadline',
      'urgency',
      'customer_message',
      'complexity',
      'flexibility',
      'duration',
      'status'
    ]

    // Build update object
    const updateData = {}
    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedUpdateFields.includes(key)) {
        updateData[key] = value
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Validate status transitions if status is being updated
    if (updateData.status) {
      const currentStatus = appointment.status
      const targetStatus = updateData.status
      
      // Define valid status transitions
      const validTransitions = {
        'pending': ['interested', 'cancelled'],
        'interested': ['competing', 'evaluating', 'cancelled'],
        'competing': ['evaluating', 'cancelled'],
        'evaluating': ['proposed', 'quoted', 'cancelled'],
        'proposed': ['quoted', 'approved', 'cancelled'],
        'quoted': ['comparing', 'approved', 'cancelled'],
        'comparing': ['approved', 'cancelled'],
        'approved': ['converting', 'cancelled'],
        'converting': ['converted', 'cancelled'],
        'scheduled': ['assessing', 'cancelled'],
        'assessing': ['assessed', 'cancelled'],
        'assessed': ['converted', 'cancelled']
      }

      const allowed = validTransitions[currentStatus]
      if (allowed && !allowed.includes(targetStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentStatus} to ${targetStatus}` },
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

    // Get enriched appointment data
    const [serviceData, customerData, professionalData, addressData, interestData] = await Promise.all([
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes')
        .eq('service_id', updatedAppointment.service_id)
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
        .eq('customer_id', updatedAppointment.customer_id)
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
        
      updatedAppointment.address_id ? supabase
        .from('address')
        .select('address_id, formatted_address, street_address, city, parish, latitude, longitude')
        .eq('address_id', updatedAppointment.address_id)
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

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams.id
  
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