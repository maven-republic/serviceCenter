// src/app/api/appointments/[appointment-id]/route.js
// Enhanced to support interest-based workflow

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/appointments/[appointment-id] - Get specific appointment details with interests
export async function GET(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Single Appointment GET API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()

    // Get the appointment first
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

    // Get related data including interests
    const [serviceData, customerData, professionalData, addressData, attachmentData, interestData] = await Promise.all([
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
        .single() : { data: null },

      // Attachment data with asset details
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

      // NEW: Interest data with professional and assessment info
      supabase
        .from('interest')
        .select(`
          *,
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
              email,
              profile_picture_url
            )
          ),
          assessment:assessment!left (
            assessment_id,
            status,
            proposed_date,
            proposed_fee,
            final_quote_amount,
            customer_approved_final_quote
          )
        `)
        .eq('appointment_id', appointment.appointment_id)
        .order('created_at', { ascending: false })
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
      address: addressData.data,
      attachments: attachmentData.data || [],
      interests: interestData.data || [], // NEW: Include all professional interests
      workflow_type: appointment.professional_id ? 'direct' : 'marketplace', // NEW: Workflow indicator
      // NEW: Interest summary
      interest_summary: {
        total_count: interestData.data?.length || 0,
        active_count: interestData.data?.filter(i => !['withdrawn', 'rejected'].includes(i.status)).length || 0,
        quoted_count: interestData.data?.filter(i => i.amount || i.status === 'quoted').length || 0,
        selected_interest: interestData.data?.find(i => i.selected_by_customer) || null,
        assessment_required_count: interestData.data?.filter(i => i.assessment).length || 0
      }
    }

    console.log('✅ Appointment found with', interestData.data?.length || 0, 'interests:', appointment.appointment_id)

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

// PATCH /api/appointments/[appointment-id] - Update appointment status and details (enhanced for interests)
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Appointment PATCH API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔥 Update request:', body)

    // Get current appointment to validate ownership/permissions
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointment')
      .select('appointment_id, professional_id, customer_id, status, service_id, address_id, interest_count')
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
    
    // Handle status changes with new interest-based states
    if (body.status) {
      updateData.status = body.status
      
      // Set timestamps for status changes
      if (body.status === 'converted') {
        updateData.converted_to_booking_at = new Date().toISOString()
      }

      // Enhanced status transitions for interest-based workflow
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
        'approved': ['converting', 'converted'],
        'converting': ['converted'],
        'converted': [], // Final state
        'declined': [], // Final state
        'abandoned': [], // Final state
        'expired': [] // Final state
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
      'session', 'preferred_end', 'urgency', 'customer_message',
      'title', 'description', 'deadline', 'complexity', 'flexibility'
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

    // Handle special status changes in interest-based workflow
    if (body.status === 'approved') {
      console.log('📝 Creating booking from approved appointment with selected professional...')
      
      try {
        // Get the selected professional from interests
        const { data: selectedInterest } = await supabase
          .from('interest')
          .select('professional_id, amount')
          .eq('appointment_id', appointmentId)
          .eq('selected_by_customer', true)
          .single()

        if (selectedInterest) {
          // Create booking record
          const { data: booking, error: bookingError } = await supabase
            .from('booking')
            .insert([{
              appointment_id: updatedAppointment.appointment_id,
              customer_id: updatedAppointment.customer_id,
              professional_id: selectedInterest.professional_id,
              service_id: updatedAppointment.service_id,
              address_id: updatedAppointment.address_id,
              scheduled_start: updatedAppointment.preferred_start,
              scheduled_end: updatedAppointment.preferred_end,
              duration_minutes: body.duration_minutes || 60,
              urgency: updatedAppointment.urgency,
              status: 'confirmed',
              customer_notes: updatedAppointment.customer_message,
              sync_source: 'manual'
            }])
            .select()
            .single()

          if (bookingError) {
            console.error('❌ Error creating booking:', bookingError)
          } else {
            console.log('✅ Booking created:', booking.booking_id)
            
            // Update appointment to converted status
            await supabase
              .from('appointment')
              .update({ 
                status: 'converted',
                professional_id: selectedInterest.professional_id,
                converted_to_booking_at: new Date().toISOString()
              })
              .eq('appointment_id', appointmentId)
          }
        }
      } catch (bookingError) {
        console.error('❌ Booking creation failed:', bookingError)
      }
    }

    // Get enriched appointment data to return (using same pattern as GET)
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

      // Get updated interests
      supabase
        .from('interest')
        .select(`
          interest_id,
          professional_id,
          status,
          amount,
          selected_by_customer,
          professional:professional_id (
            professional_id,
            business_name,
            account:account_id (
              first_name,
              last_name
            )
          )
        `)
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

    // TODO: Send notifications based on status changes
    if (body.status === 'approved') {
      console.log('📧 TODO: Send approval notification to selected professional')
    } else if (body.status === 'declined') {
      console.log('📧 TODO: Send decline notification to all interested professionals')
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

// DELETE /api/appointments/[appointment-id] - Delete appointment (enhanced for interests)
export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const appointmentId = resolvedParams['appointment-id']
  
  console.log('🔥 Appointment DELETE API called for ID:', appointmentId)
  
  try {
    const supabase = await createClient()

    // Check if appointment exists and can be deleted
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

    // Enhanced deletion rules for interest-based workflow
    const deletableStatuses = ['pending', 'interested', 'competing', 'evaluating', 'quoted']
    if (!deletableStatuses.includes(appointment.status)) {
      return NextResponse.json(
        { error: 'Only pending appointments or those with interests can be deleted' },
        { status: 400 }
      )
    }

    // Check if there are active interests
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

    // Mark all interests as withdrawn before deleting appointment
    await supabase
      .from('interest')
      .update({ 
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)

    // Delete the appointment (will cascade to attachments)
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

    // TODO: Send cancellation notifications to all interested professionals

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