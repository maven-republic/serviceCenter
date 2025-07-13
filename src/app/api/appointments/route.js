// src/app/api/appointments/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📝 appointment request received:', body)

    const {
      customer_id,
      professional_id,
      service_id,
      address_id,
      description,       // Customer's project description
      deadline,          // Customer's project deadline
      preferred_start,
      preferred_end,
      urgency,
      customer_message,
      service_location,  // New address data if customer provides different location
      attachment_ids     // NEW: Array of {asset_id, purpose} objects
    } = body

    // Validate required fields - added description
    if (!customer_id || !service_id || !preferred_start || !description) {
      console.error('❌ Missing required fields:', { customer_id, service_id, preferred_start, description })
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, service_id, preferred_start, and description are required' },
        { status: 400 }
      )
    }

    // Validate customer exists
    const { data: customer, error: customerError } = await supabase
      .from('individual_customer')
      .select('customer_id, account_id')
      .eq('customer_id', customer_id)
      .single()

    if (customerError || !customer) {
      console.error('❌ Customer not found:', customerError)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate professional exists (if specified)
    if (professional_id) {
      const { data: professional, error: professionalError } = await supabase
        .from('individual_professional')
        .select('professional_id, account_id')
        .eq('professional_id', professional_id)
        .single()

      if (professionalError || !professional) {
        console.error('❌ Professional not found:', professionalError)
        return NextResponse.json(
          { error: 'Professional not found' },
          { status: 404 }
        )
      }
    }

    // Validate service exists
    const { data: service, error: serviceError } = await supabase
      .from('service')
      .select('service_id, name, base_price')
      .eq('service_id', service_id)
      .single()

    if (serviceError || !service) {
      console.error('❌ Service not found:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Validate attachments if provided
    if (attachment_ids && attachment_ids.length > 0) {
      console.log('📎 Validating', attachment_ids.length, 'attachments')
      
      // Check all assets exist and belong to the customer
      const assetIds = attachment_ids.map(att => att.asset_id)
      const { data: assets, error: assetError } = await supabase
        .from('asset')
        .select('id, uploader, filename')
        .in('id', assetIds)

      if (assetError) {
        console.error('❌ Error validating assets:', assetError)
        return NextResponse.json(
          { error: 'Failed to validate attachments' },
          { status: 500 }
        )
      }

      // Check if all assets exist
      if (assets.length !== assetIds.length) {
        const foundIds = assets.map(a => a.id)
        const missingIds = assetIds.filter(id => !foundIds.includes(id))
        console.error('❌ Missing assets:', missingIds)
        return NextResponse.json(
          { error: 'Some attachments not found' },
          { status: 400 }
        )
      }

      // Check if all assets belong to the customer
      const customerAccountId = customer.account_id
      const invalidAssets = assets.filter(asset => asset.uploader !== customerAccountId)
      if (invalidAssets.length > 0) {
        console.error('❌ Invalid asset ownership:', invalidAssets.map(a => a.id))
        return NextResponse.json(
          { error: 'You can only attach files you uploaded' },
          { status: 403 }
        )
      }

      console.log('✅ All attachments validated')
    }

    let finalAddressId = address_id

    // Handle service location - create new address if provided
    if (service_location && !address_id) {
      console.log('📍 Creating new service address')
      
      const { data: newAddress, error: addressError } = await supabase
        .from('address')
        .insert([{
          account_id: customer.account_id,
          address_type: 'service',
          is_primary: false,
          street_address: service_location.street_address || '',
          city: service_location.city || '',
          parish: service_location.parish || '',
          community: service_location.community || null,
          landmark: service_location.landmark || null,
          is_rural: service_location.is_rural || false,
          latitude: service_location.latitude,
          longitude: service_location.longitude,
          place_id: service_location.place_id || null,
          formatted_address: service_location.formatted_address || null,
          google_place_data: service_location.google_place_data || null
        }])
        .select('address_id')
        .single()

      if (addressError) {
        console.error('❌ Failed to create service address:', addressError)
        return NextResponse.json(
          { error: 'Failed to create service address' },
          { status: 500 }
        )
      }

      finalAddressId = newAddress.address_id
      console.log('✅ Service address created:', finalAddressId)

      // Create contextual location record
      await supabase
        .from('contextual_location')
        .insert([{
          account_id: customer.account_id,
          address_id: finalAddressId,
          service_id: service_id,
          label: 'service_request'
        }])
    }

    // Validate dates
    const now = new Date()
    const startDate = new Date(preferred_start)
    
    if (startDate <= now) {
      return NextResponse.json(
        { error: 'Preferred start time must be in the future' },
        { status: 400 }
      )
    }

    if (preferred_end) {
      const endDate = new Date(preferred_end)
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'Preferred end time must be after start time' },
          { status: 400 }
        )
      }
    }

    // Validate deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (deadlineDate <= startDate) {
        return NextResponse.json(
          { error: 'Project deadline must be after the preferred start time' },
          { status: 400 }
        )
      }
    }

    // Create appointment request with project details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment') 
      .insert([{
        customer_id,
        professional_id: professional_id || null,
        service_id,
        address_id: finalAddressId,
        
        // PROJECT DETAILS - title auto-populated from service name
        title: service.name,               // Use service name as title
        description: description,          // Customer's project description
        deadline: deadline || null,        // Customer's project deadline
        
        // SCHEDULING DETAILS
        preferred_start,
        preferred_end: preferred_end || null,
        urgency: urgency || 'standard',
        customer_message: customer_message || null,
        status: 'pending'
      }])
      .select('*')
      .single()

    if (appointmentError) {
      console.error('❌ Error creating appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to create appointment: ' + appointmentError.message },
        { status: 500 }
      )
    }

    console.log('✅ appointment created successfully:', appointment.appointment_id)

    // Handle file attachments
    if (attachment_ids && attachment_ids.length > 0) {
      console.log('📎 Creating attachment records for appointment:', appointment.appointment_id)
      
      const attachmentRecords = attachment_ids.map((attachment, index) => ({
        appointment_id: appointment.appointment_id,
        asset_id: attachment.asset_id,
        purpose: attachment.purpose || 'reference',
        position: index,
        required: false
      }))

      const { data: createdAttachments, error: attachmentError } = await supabase
        .from('attachment')
        .insert(attachmentRecords)
        .select('*')

      if (attachmentError) {
        console.error('❌ Failed to create attachments:', attachmentError)
        // Don't fail the appointment, just log the error
        console.warn('⚠️ Appointment created but attachments failed')
      } else {
        console.log('✅ Created', createdAttachments.length, 'attachment records')
      }
    }

    // Get related data separately to avoid relationship conflicts
    const [serviceData, customerData, professionalData, addressData, attachmentData] = await Promise.all([
      // Get service
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes')
        .eq('service_id', service_id)
        .single(),
        
      // Get customer with account
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
        .eq('customer_id', customer_id)
        .single(),
        
      // Get professional with account (if professional_id exists)
      professional_id ? supabase
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
        .eq('professional_id', professional_id)
        .single() : { data: null },
        
      // Get address
      finalAddressId ? supabase
        .from('address')
        .select('address_id, formatted_address, street_address, city, parish, latitude, longitude')
        .eq('address_id', finalAddressId)
        .single() : { data: null },

      // Get attachments with asset details
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
        .order('position')
    ])

    // Combine the results
    const enrichedAppointment = {
      ...appointment,
      service: serviceData.data,
      customer: customerData.data,
      professional: professionalData.data,
      address: addressData.data,
      attachments: attachmentData.data || []
    }

    // TODO: Send notification to professional(s)
    // if (professional_id) {
    //   await sendNotificationToProfessional(professional_id, appointment)
    // } else {
    //   await notifyAvailableProfessionals(service_id, finalAddressId, appointment)
    // }

    // TODO: Send confirmation email to customer
    // await sendAppointmentConfirmationEmail(customer.account_id, appointment)

    return NextResponse.json({
      success: true,
      appointment: enrichedAppointment,
      message: 'appointment request created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ appointment request API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const customer_id = searchParams.get('customer_id')
    const professional_id = searchParams.get('professional_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    
    console.log('📋 Fetching appointments:', { customer_id, professional_id, status })

    // Get appointment requests without complex joins first
    let query = supabase
      .from('appointment') 
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (customer_id) {
      query = query.eq('customer_id', customer_id)
    }
    
    if (professional_id) {
      query = query.eq('professional_id', professional_id)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error, count } = await query

    if (error) {
      console.error('❌ Error fetching appointment requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointment requests' },
        { status: 500 }
      )
    }

    // Enrich each request with related data including attachments
    const enrichedAppointments = await Promise.all(
      (requests || []).map(async (request) => {
        const [serviceData, customerData, professionalData, addressData, attachmentData] = await Promise.all([
          // Service data
          supabase
            .from('service')
            .select('service_id, name, description, base_price, duration_minutes')
            .eq('service_id', request.service_id)
            .single(),
            
          // Customer data with account
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
            .eq('customer_id', request.customer_id)
            .single(),
            
          // Professional data with account (if exists)
          request.professional_id ? supabase
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
            .eq('professional_id', request.professional_id)
            .single() : { data: null },
            
          // Address data (if exists)
          request.address_id ? supabase
            .from('address')
            .select('address_id, formatted_address, street_address, city, parish, latitude, longitude')
            .eq('address_id', request.address_id)
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
            .eq('appointment_id', request.appointment_id)
            .order('position')
        ])

        return {
          ...request,
          service: serviceData.data,
          customer: customerData.data,
          professional: professionalData.data,
          address: addressData.data,
          attachments: attachmentData.data || []
        }
      })
    )

    console.log(`✅ Found ${enrichedAppointments?.length || 0} appointment requests`)

    return NextResponse.json({
      appointments: enrichedAppointments || [],
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('❌ appointment requests fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}