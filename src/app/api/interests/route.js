// src/app/api/interests/route.js
// Professional interests management API - FIXED with customer account data

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/interests - Get professional's interests (FIXED)
export async function GET(request) {
  try {
    console.log('🎯 GET /api/interests called')
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const professional_id = searchParams.get('professional_id')
    const appointment_id = searchParams.get('appointment_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0

    console.log('🔍 Query params:', { professional_id, appointment_id, status, limit, offset })

    if (!professional_id && !appointment_id) {
      return NextResponse.json(
        { error: 'Must specify either professional_id or appointment_id' },
        { status: 400 }
      )
    }

    // ✅ FIXED: Updated query to include customer account data
    let query = supabase
      .from('interest')
      .select(`
        *,
        appointment:appointment_id (
          appointment_id,
          title,
          description,
          status,
          session,
          duration,
          urgency,
          deadline,
          flexibility,
          complexity,
          customer_message,
          created_at,
          service:service_id (
            service_id,
            name,
            base_price
          ),
          customer:customer_id (
            customer_id,
            account_id,
            account!individual_customer_account_id_fkey (
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
            formatted_address
          )
        )
      `, { count: 'exact' })

    // Filter by professional_id if provided
    if (professional_id) {
      query = query.eq('professional_id', professional_id)
    }

    // Filter by appointment_id if provided
    if (appointment_id) {
      query = query.eq('appointment_id', appointment_id)
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Pagination and ordering
    const { data: interests, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error fetching interests:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message, details: error },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${interests?.length || 0} interests`)

    // Transform the data to include new price range fields
    const transformedInterests = interests?.map(interest => {
      const appointmentTime = interest.appointment?.session
      const appointmentDuration = interest.appointment?.duration || 60
      
      return {
        ...interest,
        // Customer's requested appointment time
        appointment_time: appointmentTime,
        appointment_duration: appointmentDuration,
        appointment_end_time: appointmentTime ? 
          new Date(new Date(appointmentTime).getTime() + appointmentDuration * 60000).toISOString() : null,
        
        // Professional's response details  
        professional_response: interest.response,
        professional_suggested_time: interest.suggested,
        professional_suggested_duration: interest.alternate,
        professional_suggested_end_time: interest.suggested ? 
          new Date(new Date(interest.suggested).getTime() + (interest.alternate || 60) * 60000).toISOString() : null,
        professional_message: interest.message,
        professional_replied_at: interest.replied,
        
        // NEW: Price range fields
        price_range_min: interest.price_range_min,
        price_range_max: interest.price_range_max,
        assessment_justification: interest.assessment_justification,
        
        // Add customer/service data at top level
        customer: interest.appointment?.customer,
        customer_id: interest.appointment?.customer?.customer_id,
        service: interest.appointment?.service,
        service_id: interest.appointment?.service?.service_id
      }
    }) || []

    console.log('✅ Found', transformedInterests.length, 'interests with customer account data')

    return NextResponse.json({
      success: true,
      interests: transformedInterests,
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in interests GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, details: error.stack },
      { status: 500 }
    )
  }
}

// POST /api/interests - Create new interest (UPDATED with price range support)
export async function POST(request) {
  try {
    console.log('🎯 POST /api/interests called')
    
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      appointment_id,
      professional_id,
      intent = 'standard',
      message,
      amount,
      assessment = false,
      modality = 'none',
      fee = 0,
      notes,
      // NEW: Price range fields
      price_range_min,
      price_range_max,
      assessment_justification,
      // Response fields
      response = 'pending',
      suggested_time,
      suggested_duration,
      response_message
    } = body

    console.log('📝 Interest request:', { 
      appointment_id, 
      professional_id, 
      intent, 
      assessment, 
      response,
      price_range_min,
      price_range_max,
      has_justification: !!assessment_justification
    })

    // Validate required fields
    if (!appointment_id || !professional_id) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and professional_id' },
        { status: 400 }
      )
    }

    // NEW: Enhanced validation for assessment-only with price ranges
    if (assessment && !amount) {
      if (!price_range_min && !price_range_max) {
        return NextResponse.json(
          { error: 'Price range is required when assessment is needed without immediate quote' },
          { status: 400 }
        )
      }
      
      if (!assessment_justification || !assessment_justification.trim()) {
        return NextResponse.json(
          { error: 'Assessment justification is required when assessment is needed without immediate quote' },
          { status: 400 }
        )
      }
    }

    // Validate appointment exists and is accepting interests
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('appointment_id, status, customer_id, title, interest_count, session, duration')
      .eq('appointment_id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if appointment accepts interests
    const acceptingStatuses = ['pending', 'interested', 'competing', 'evaluating']
    if (!acceptingStatuses.includes(appointment.status)) {
      return NextResponse.json(
        { error: `Cannot express interest in ${appointment.status} appointments` },
        { status: 400 }
      )
    }

    // Validate professional exists
    const { data: professional, error: professionalError } = await supabase
      .from('individual_professional')
      .select('professional_id, account_id, verification_status')
      .eq('professional_id', professional_id)
      .single()

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    // Check if professional already has interest in this appointment
    const { data: existingInterest } = await supabase
      .from('interest')
      .select('interest_id, status')
      .eq('appointment_id', appointment_id)
      .eq('professional_id', professional_id)
      .single()

    if (existingInterest) {
      return NextResponse.json(
        { error: 'You have already expressed interest in this appointment' },
        { status: 409 }
      )
    }

    // Create interest record with new price range fields
    const interestData = {
      appointment_id,
      professional_id,
      intent,
      message: response_message || message || `Professional is interested in: ${appointment.title}`,
      amount: amount || null,
      assessment,
      modality: modality || 'none',
      fee: fee || 0,
      notes: notes || null,
      status: 'interested',
      selected_by_customer: false,
      // NEW: Price range fields
      price_range_min: price_range_min ? parseFloat(price_range_min) : null,
      price_range_max: price_range_max ? parseFloat(price_range_max) : null,
      assessment_justification: assessment_justification || null,
      // Response fields
      response: response,
      suggested: suggested_time || null,
      alternate: suggested_duration || null,
      replied: response !== 'pending' ? new Date().toISOString() : null
    }

    console.log('💾 Creating interest with data:', interestData)

    const { data: newInterest, error: interestError } = await supabase
      .from('interest')
      .insert([interestData])
      .select(`
        *,
        appointment:appointment_id (
          appointment_id,
          title,
          session,
          duration,
          customer:customer_id (
            customer_id,
            account:account_id (
              account_id,
              first_name,
              last_name,
              email,
              profile_picture_url
            )
          )
        )
      `)
      .single()

    if (interestError) {
      console.error('❌ Interest creation error:', interestError)
      return NextResponse.json(
        { error: 'Failed to create interest', details: interestError.message },
        { status: 500 }
      )
    }

    // Update appointment interest count and status
    const newInterestCount = (appointment.interest_count || 0) + 1
    let newAppointmentStatus = appointment.status

    if (appointment.status === 'pending') {
      newAppointmentStatus = 'interested'
    } else if (appointment.status === 'interested' && newInterestCount > 1) {
      newAppointmentStatus = 'competing'
    }

    await supabase
      .from('appointment')
      .update({
        interest_count: newInterestCount,
        last_interest_at: new Date().toISOString(),
        status: newAppointmentStatus
      })
      .eq('appointment_id', appointment_id)

    console.log('✅ Interest created successfully:', newInterest.interest_id)

    return NextResponse.json({
      success: true,
      interest: newInterest,
      message: 'Interest expressed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in interests POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}