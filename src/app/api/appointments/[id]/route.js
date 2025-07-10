// src/app/api/appointments/[id]/route.js
// Handle individual appointment actions (GET, PATCH, DELETE)

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/appointments/[id] - Get specific appointment details
export async function GET(request, { params }) {
  // ✅ Fix: Await params for Next.js 15+
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🔥 Single Appointment GET API called for ID:', id)
  
  try {
    const supabase = await createClient()

    // Get the appointment first
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('*')
      .eq('appointment_id', id)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Appointment not found:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Get related data separately (matching your existing pattern)
    const [serviceData, customerData, professionalData, addressData] = await Promise.all([
      // Service data
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes, pricing_model')
        .eq('service_id', appointment.service_id)
        .single(),
        
      // Customer data with account and phone
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
        
      // Professional data with account (if exists)
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
        
      // Address data (if exists)
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
        .single() : { data: null }
    ])

    // Get customer phone numbers separately
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

    // Combine the results
    const enrichedAppointment = {
      ...appointment,
      service: serviceData.data,
      customer: {
        ...customerData.data,
        phone: customerPhone
      },
      professional: professionalData.data,
      address: addressData.data
    }

    console.log('✅ Appointment found:', appointment.appointment_id)

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

// PATCH /api/appointments/[id] - Update appointment status and details
export async function PATCH(request, { params }) {
  // ✅ Fix: Await params for Next.js 15+
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🔥 Appointment PATCH API called for ID:', id)
  
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔥 Update request:', body)

    // Get current appointment to validate ownership/permissions
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointment')
      .select('appointment_id, professional_id, customer_id, status, service_id, address_id')
      .eq('appointment_id', id)
      .single()

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {}
    
    // Handle status changes
    if (body.status) {
      updateData.status = body.status
      
      // Set timestamps for status changes
      if (body.status === 'converted') {
        updateData.converted_to_booking_at = new Date().toISOString()
      }

      // Validate status transitions
      const validTransitions = {
        'pending': ['quoted', 'declined', 'accepted'],
        'quoted': ['accepted', 'declined'],
        'accepted': ['converted'],
        'declined': [], // Final state
        'converted': [] // Final state
      }

      if (!validTransitions[currentAppointment.status]?.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentAppointment.status} to ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Handle other field updates
    const allowedFields = [
      'preferred_start', 'preferred_end', 'urgency', 'customer_message',
      'title', 'description', 'deadline', 'complexity', 'flexibility', 'scope'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    updateData.updated_at = new Date().toISOString()

    console.log('🔥 Updating appointment with:', updateData)

    // Update appointment
    const { data: updatedAppointment, error } = await supabase
      .from('appointment')
      .update(updateData)
      .eq('appointment_id', id)
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

    // Handle special status changes
    if (body.status === 'accepted') {
      console.log('📝 Creating booking from accepted appointment...')
      
      try {
        // Create booking record
        const { data: booking, error: bookingError } = await supabase
          .from('booking')
          .insert([{
            appointment_id: updatedAppointment.appointment_id,
            customer_id: updatedAppointment.customer_id,
            professional_id: updatedAppointment.professional_id,
            service_id: updatedAppointment.service_id,
            address_id: updatedAppointment.address_id,
            scheduled_start: updatedAppointment.preferred_start,
            scheduled_end: updatedAppointment.preferred_end,
            duration_minutes: body.duration_minutes || 60, // Default 1 hour
            urgency: updatedAppointment.urgency,
            status: 'confirmed',
            customer_notes: updatedAppointment.customer_message,
            sync_source: 'manual'
          }])
          .select()
          .single()

        if (bookingError) {
          console.error('❌ Error creating booking:', bookingError)
          // Don't fail the appointment update, just log the error
        } else {
          console.log('✅ Booking created:', booking.booking_id)
          
          // Update appointment to converted status
          await supabase
            .from('appointment')
            .update({ 
              status: 'converted',
              converted_to_booking_at: new Date().toISOString()
            })
            .eq('appointment_id', id)
        }
      } catch (bookingError) {
        console.error('❌ Booking creation failed:', bookingError)
      }
    }

    // Get enriched appointment data to return (using same pattern as GET)
    const [serviceData, customerData, addressData] = await Promise.all([
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
        
      currentAppointment.address_id ? supabase
        .from('address')
        .select('address_id, formatted_address, street_address, city, parish')
        .eq('address_id', currentAppointment.address_id)
        .single() : { data: null }
    ])

    const enrichedAppointment = {
      ...updatedAppointment,
      service: serviceData.data,
      customer: customerData.data,
      address: addressData.data
    }

    // TODO: Send notifications (implement in Phase 2)
    if (body.status === 'accepted') {
      console.log('📧 TODO: Send acceptance notification to customer')
    } else if (body.status === 'declined') {
      console.log('📧 TODO: Send decline notification to customer')
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

// DELETE /api/appointments/[id] - Delete appointment (optional - for cancellations)
export async function DELETE(request, { params }) {
  // ✅ Fix: Await params for Next.js 15+
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🔥 Appointment DELETE API called for ID:', id)
  
  try {
    const supabase = await createClient()

    // Check if appointment exists and can be deleted
    const { data: appointment, error: fetchError } = await supabase
      .from('appointment')
      .select('appointment_id, status, customer_id, professional_id')
      .eq('appointment_id', id)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending appointments
    if (!['pending', 'quoted'].includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Only pending or quoted appointments can be deleted' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('appointment')
      .delete()
      .eq('appointment_id', id)

    if (error) {
      console.error('❌ Error deleting appointment:', error)
      return NextResponse.json(
        { error: 'Failed to delete appointment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Appointment deleted:', id)

    // TODO: Send cancellation notifications (implement in Phase 2)

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