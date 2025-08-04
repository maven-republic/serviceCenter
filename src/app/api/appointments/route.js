// src/app/api/appointments/route.js
// Enhanced to support targeted marketplace workflow - FIXED VERSION

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/appointments - Fetch appointments
export async function GET(request) {
  try {
    console.log('🔥 GET /api/appointments called');
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const professional_id = searchParams.get('professional_id')
    const professional_filter = searchParams.get('professional_filter') // 'available', 'assigned'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0

    console.log('🔍 Query params:', { professional_id, professional_filter, status, limit, offset })

    let query = supabase
      .from('appointment')
      .select(`
        *,
        service:service_id (
          service_id,
          name,
          description,
          base_price
        ),
        customer:customer_id (
          customer_id,
          account!individual_customer_account_id_fkey (
            account_id,
            first_name,
            last_name,
            email,
            profile_picture_url
          )
        ),
        professional:professional_id (
          professional_id,
          account!individual_professional_account_id_fkey (
            account_id,
            first_name,
            last_name,
            email
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
      `, { count: 'exact' })

    // ✅ ENHANCED: Handle different professional filters with invitation support
    if (professional_filter === 'available') {
      if (professional_id) {
        // Show appointments that are either:
        // 1. Open to all (no professional assigned, no recipients) 
        // 2. Targeted to this specific professional (professional in recipients array)
        console.log('🎯 Fetching available appointments including invitations for professional:', professional_id)
        
        query = query
          .eq('status', 'pending')
          .is('professional_id', null)
          .or(`recipients.is.null,recipients.cs.{${professional_id}}`)
      } else {
        // For general discovery without professional ID, just show open marketplace
        console.log('🌐 Fetching general open marketplace appointments')
        
        query = query
          .eq('status', 'pending')
          .is('professional_id', null)
          .is('recipients', null)
      }
    } else if (professional_filter === 'assigned' && professional_id) {
      // Assigned to specific professional
      query = query.eq('professional_id', professional_id)
    } else if (professional_id) {
      // All appointments related to this professional
      query = query.eq('professional_id', professional_id)
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Pagination and ordering
    const { data: appointments, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message, details: error },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${appointments?.length || 0} appointments`)

    // ✅ NEW: Add invitation metadata to appointments
    const enrichedAppointments = appointments?.map(appointment => {
      const isInvited = professional_id && appointment.recipients && 
        appointment.recipients.includes(professional_id)
      
      return {
        ...appointment,
        is_invited: isInvited,
        invitation_type: isInvited ? 'targeted' : 
          (!appointment.recipients || appointment.recipients.length === 0) ? 'open' : 'other_targeted'
      }
    }) || []

    return NextResponse.json({
      success: true,
      appointments: enrichedAppointments,
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in appointments GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, details: error.stack },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request) {
  try {
    console.log('🔥 POST /api/appointments called');
    
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📝 Received request body keys:', Object.keys(body));

    // ✅ FIXED: Extract fields that match your database schema
    const {
      customer_id,
      professional_id,
      service_id,
      address_id,
      title,
      description,
      deadline,
      session, // This will map to your 'session' column
      urgency,
      customer_message,
      complexity,
      flexibility,
      service_location,
      attachment_ids,
      open_to_all_professionals = true,
      recipients = [], // For targeted marketplace (renamed from selected_professional_ids)
      max_interests = 10,
      auto_accept_verified = false
    } = body

    console.log('📊 Extracted data:', {
      customer_id,
      professional_id,
      service_id,
      address_id,
      title,
      session,
      description_length: description?.length,
      attachment_count: attachment_ids?.length,
      recipients_count: recipients?.length,
      open_to_all_professionals
    });

    // Validate required fields
    if (!customer_id || !service_id || !session || !description) {
      console.error('❌ Missing required fields:', { 
        customer_id: !!customer_id, 
        service_id: !!service_id, 
        session: !!session, 
        description: !!description 
      });
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, service_id, session, and description are required' },
        { status: 400 }
      )
    }

    // Validate customer exists
    console.log('🔍 Validating customer:', customer_id);
    const { data: customer, error: customerError } = await supabase
      .from('individual_customer')
      .select('customer_id, account_id')
      .eq('customer_id', customer_id)
      .single()

    if (customerError) {
      console.error('❌ Customer validation error:', customerError);
      return NextResponse.json(
        { error: 'Customer not found', details: customerError.message },
        { status: 404 }
      )
    }
    console.log('✅ Customer found:', customer.customer_id);

    // Validate professional exists (if specified for direct booking)
    if (professional_id) {
      console.log('🔍 Validating professional:', professional_id);
      const { data: professional, error: professionalError } = await supabase
        .from('individual_professional')
        .select('professional_id, account_id, verification_status')
        .eq('professional_id', professional_id)
        .single()

      if (professionalError) {
        console.error('❌ Professional validation error:', professionalError);
        return NextResponse.json(
          { error: 'Professional not found', details: professionalError.message },
          { status: 404 }
        )
      }
      console.log('✅ Professional found:', professional.professional_id);
    }

    // Validate selected professionals (for targeted marketplace)
    if (recipients && recipients.length > 0) {
      console.log('🔍 Validating selected professionals:', recipients);
      const { data: selectedProfessionals, error: selectedProError } = await supabase
        .from('individual_professional')
        .select('professional_id, account_id, verification_status')
        .in('professional_id', recipients)

      if (selectedProError) {
        console.error('❌ Selected professionals validation error:', selectedProError);
        return NextResponse.json(
          { error: 'Error validating selected professionals', details: selectedProError.message },
          { status: 500 }
        )
      }

      if (selectedProfessionals.length !== recipients.length) {
        console.error('❌ Some selected professionals not found');
        return NextResponse.json(
          { error: 'Some selected professionals not found' },
          { status: 400 }
        )
      }
      console.log('✅ All selected professionals validated:', selectedProfessionals.length);
    }

    // Validate service exists
    console.log('🔍 Validating service:', service_id);
    const { data: service, error: serviceError } = await supabase
      .from('service')
      .select('service_id, name, base_price')
      .eq('service_id', service_id)
      .single()

    if (serviceError) {
      console.error('❌ Service validation error:', serviceError);
      return NextResponse.json(
        { error: 'Service not found', details: serviceError.message },
        { status: 404 }
      )
    }
    console.log('✅ Service found:', service.name);

    // Validate attachments if provided
    if (attachment_ids && attachment_ids.length > 0) {
      console.log('📎 Validating', attachment_ids.length, 'attachments');
      
      const assetIds = attachment_ids.map(att => att.asset_id)
      const { data: assets, error: assetError } = await supabase
        .from('asset')
        .select('id, uploader, filename')
        .in('id', assetIds)

      if (assetError) {
        console.error('❌ Asset validation error:', assetError);
        return NextResponse.json(
          { error: 'Failed to validate attachments', details: assetError.message },
          { status: 500 }
        )
      }

      if (assets.length !== assetIds.length) {
        console.error('❌ Some assets not found');
        return NextResponse.json(
          { error: 'Some attachments not found' },
          { status: 400 }
        )
      }
      console.log('✅ All attachments validated');
    }

    let finalAddressId = address_id

    // Handle service location - create new address if provided
    if (service_location && !address_id) {
      console.log('📍 Creating new service address');
      
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
        console.error('❌ Address creation error:', addressError);
        return NextResponse.json(
          { error: 'Failed to create service address', details: addressError.message },
          { status: 500 }
        )
      }

      finalAddressId = newAddress.address_id
      console.log('✅ Service address created:', finalAddressId);
    }

    // ✅ FIXED: Validate dates properly
    const now = new Date()
    const startDate = new Date(session)
    
    if (startDate <= now) {
      return NextResponse.json(
        { error: 'Preferred start time must be in the future' },
        { status: 400 }
      )
    }

    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (deadlineDate <= startDate) {
        return NextResponse.json(
          { error: 'Project deadline must be after the preferred start time' },
          { status: 400 }
        )
      }
    }

    // Determine workflow type
    const isDirectBooking = !open_to_all_professionals && professional_id
    const isTargetedMarketplace = !open_to_all_professionals && recipients.length > 0
    const isOpenMarketplace = open_to_all_professionals

    console.log('🎯 Workflow type determined:', {
      isDirectBooking,
      isTargetedMarketplace,
      isOpenMarketplace,
      recipientsCount: recipients.length
    });

    // ✅ FIXED: Create appointment with correct field mapping
    console.log('🔥 Creating appointment record...');
    const appointmentInformation = {
      customer_id,
      professional_id: isDirectBooking ? professional_id : null,
      service_id,
      address_id: finalAddressId,
      title: title || service.name,
      description: description,
      deadline: deadline || null,
      session: session, // ✅ This matches your database column
      urgency: urgency || 'standard',
      customer_message: customer_message || null,
      complexity: complexity || null,
      flexibility: flexibility || null,
      status: isDirectBooking ? 'quoted' : 'pending',
      interest_count: 0,
      last_interest_at: null,
      recipients: isTargetedMarketplace ? recipients : null,
      duration: 60
    }

    console.log('📝 Appointment data to insert (keys):', Object.keys(appointmentInformation));
    console.log('📝 Critical fields:', {
      customer_id: appointmentInformation.customer_id,
      service_id: appointmentInformation.service_id,
      session: appointmentInformation.session,
      description_length: appointmentInformation.description?.length
    });

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment') 
      .insert([appointmentInformation])
      .select('*')
      .single()

    if (appointmentError) {
      console.error('❌ Appointment creation error:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to create appointment: ' + appointmentError.message },
        { status: 500 }
      )
    }

    console.log('✅ Appointment created successfully:', appointment.appointment_id);

    // Handle file attachments
    let createdAttachments = []
    if (attachment_ids && attachment_ids.length > 0) {
      console.log('📎 Creating attachment records...');
      
      const attachmentRecords = attachment_ids.map((attachment, index) => ({
        appointment_id: appointment.appointment_id,
        asset_id: attachment.asset_id,
        purpose: attachment.purpose || 'reference',
        position: index,
        required: false
      }))

      const { data: attachmentResults, error: attachmentError } = await supabase
        .from('attachment')
        .insert(attachmentRecords)
        .select('*')

      if (attachmentError) {
        console.error('❌ Attachment creation error:', attachmentError);
        console.warn('⚠️ Appointment created but attachments failed');
      } else {
        createdAttachments = attachmentResults
        console.log('✅ Created', createdAttachments.length, 'attachment records');
      }
    }

    // ✅ MAJOR FIX: Handle different workflow types - NO AUTO-INTERESTS FOR TARGETED
    let createdInterests = []

    if (isDirectBooking) {
      // ✅ Direct booking - create selected interest (ONLY workflow that auto-creates)
      console.log('🎯 Creating direct professional interest...');
      
      const { data: directInterest, error: interestError } = await supabase
        .from('interest')
        .insert([{
          appointment_id: appointment.appointment_id,
          professional_id: professional_id,
          intent: 'high',
          message: 'Direct booking request',
          assessment: false,
          status: 'selected',
          selected_by_customer: true,
          customer_viewed_at: new Date().toISOString()
        }])
        .select('*')
        .single()

      if (interestError) {
        console.error('❌ Direct interest creation error:', interestError);
        console.warn('⚠️ Appointment created but direct interest creation failed');
      } else {
        console.log('✅ Direct professional interest created');
        createdInterests = [directInterest]
        
        await supabase
          .from('appointment')
          .update({
            professional_id: professional_id,
            status: 'quoted',
            interest_count: 1,
            last_interest_at: new Date().toISOString()
          })
          .eq('appointment_id', appointment.appointment_id)
      }

    } else if (isTargetedMarketplace) {
      // ✅ FIXED: Targeted marketplace - NO automatic interests created
      // Store recipients for professional discovery, but professionals must express interest themselves
      console.log('🎯 Targeted marketplace appointment created - selected professionals must discover and express interest');
      console.log('🎯 Recipients stored in appointment.recipients field:', recipients.length, 'professionals');
      
      // Recipients are already stored in the appointment.recipients field
      // Professionals will see this as an "invitation" but must actively respond
      
    } else if (isOpenMarketplace) {
      // ✅ Open marketplace - NO automatic interests created
      console.log('🎯 Open marketplace appointment created - professionals will discover and respond');
    }

    console.log('🎉 Appointment creation process completed successfully');

    // Get enriched appointment data to return
    const [serviceData, customerData, professionalData, addressData, attachmentData] = await Promise.all([
      // Service data
      supabase
        .from('service')
        .select('service_id, name, description, base_price, duration_minutes')
        .eq('service_id', service_id)
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
        .eq('customer_id', customer_id)
        .single(),
        
      // Professional data with account (if exists)
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
        
      // Address data (if exists)
      finalAddressId ? supabase
        .from('address')
        .select('address_id, formatted_address, street_address, city, parish, latitude, longitude')
        .eq('address_id', finalAddressId)
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
        .order('position')
    ])

    // Combine the results
    const enrichedAppointment = {
      ...appointment,
      service: serviceData.data,
      customer: customerData.data,
      professional: professionalData.data,
      address: addressData.data,
      attachments: attachmentData.data || [],
      interests: createdInterests || [],
      workflow_type: isDirectBooking ? 'direct' : isTargetedMarketplace ? 'targeted' : 'marketplace'
    }

    // ✅ ENHANCED: Better success messages that reflect the new workflow
    const successMessage = isDirectBooking 
      ? 'Direct appointment request sent to professional'
      : isTargetedMarketplace 
        ? `Appointment request created. Your ${recipients.length} selected professional${recipients.length !== 1 ? 's' : ''} will be invited to respond.`
        : 'Appointment request posted to marketplace. Professionals will discover and respond with quotes.'

    return NextResponse.json({
      success: true,
      appointment: enrichedAppointment,
      message: successMessage
    }, { status: 201 })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in appointments API:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}