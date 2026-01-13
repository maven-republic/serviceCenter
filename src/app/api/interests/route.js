// src/app/api/interests/route.js
// Professional interests management API - Complete with assessment scheduling

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/interests - Get professional's interests
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

    // Query without joins to avoid relationship conflicts
    let query = supabase
      .from('interest')
      .select('*', { count: 'exact' })

    if (professional_id) {
      query = query.eq('professional_id', professional_id)
    }

    if (appointment_id) {
      query = query.eq('appointment_id', appointment_id)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

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

    // Enrich interests with related data
    let enrichedInterests = interests || []
    
    if (interests && interests.length > 0) {
      const appointmentIds = [...new Set(interests.map(i => i.appointment_id))]
      
      if (appointmentIds.length > 0) {
        const { data: appointments } = await supabase
          .from('appointment')
          .select(`
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
            customer_id,
            service_id,
            address_id
          `)
          .in('appointment_id', appointmentIds)

        // Get services
        const serviceIds = [...new Set(appointments?.map(a => a.service_id).filter(Boolean))] || []
        let services = []
        if (serviceIds.length > 0) {
          const { data: servicesData } = await supabase
            .from('service')
            .select('service_id, name, base_price')
            .in('service_id', serviceIds)
          services = servicesData || []
        }

        // Get addresses
        const addressIds = [...new Set(appointments?.map(a => a.address_id).filter(Boolean))] || []
        let addresses = []
        if (addressIds.length > 0) {
          const { data: addressesData } = await supabase
            .from('address')
            .select('address_id, street_address, city, parish, formatted_address')
            .in('address_id', addressIds)
          addresses = addressesData || []
        }

        // Get customers
        const customerIds = [...new Set(appointments?.map(a => a.customer_id).filter(Boolean))] || []
        let customers = []
        let accounts = []
        if (customerIds.length > 0) {
          const { data: customersData } = await supabase
            .from('individual_customer')
            .select('customer_id, account_id')
            .in('customer_id', customerIds)
          customers = customersData || []

          const accountIds = [...new Set(customers.map(c => c.account_id).filter(Boolean))] || []
          if (accountIds.length > 0) {
            const { data: accountsData } = await supabase
              .from('account')
              .select('account_id, first_name, last_name, email, profile_picture_url')
              .in('account_id', accountIds)
            accounts = accountsData || []
          }
        }

        // Enrich interests with related data
        enrichedInterests = interests.map(interest => {
          const appointment = appointments?.find(a => a.appointment_id === interest.appointment_id)
          const service = services?.find(s => s.service_id === appointment?.service_id)
          const address = addresses?.find(a => a.address_id === appointment?.address_id)
          const customer = customers?.find(c => c.customer_id === appointment?.customer_id)
          const account = accounts?.find(a => a.account_id === customer?.account_id)

          return {
            ...interest,
            appointment: appointment ? {
              ...appointment,
              service: service || null,
              address: address || null,
              customer: customer ? {
                ...customer,
                account: account || null
              } : null
            } : null
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      interests: enrichedInterests,
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in interests GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/interests - Create new interest with assessment scheduling
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
      specification,
      price_range_min,
      price_range_max,
      assessment_justification,
      // ✅ Assessment scheduling fields
      assessment_proposed_date,
      assessment_proposed_time,
      assessment_duration_minutes = 60,
      // ✅ Availability window
      earliest_start,
      latest_start,
      estimated_duration_hours,
      invitation_response
    } = body

    console.log('🔍 Interest request:', { 
      appointment_id, 
      professional_id, 
      intent, 
      assessment,
      has_assessment_date: !!assessment_proposed_date,
      has_assessment_time: !!assessment_proposed_time,
      assessment_duration_minutes,
      price_range_min,
      price_range_max,
      earliest_start,
      latest_start
    })

    // ===== VALIDATION =====
    
    if (!appointment_id || !professional_id) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and professional_id' },
        { status: 400 }
      )
    }

    if (assessment && modality === 'local') {
      if (!assessment_proposed_date) {
        return NextResponse.json(
          { error: 'Assessment date is required for site visits' },
          { status: 400 }
        )
      }
      
      if (!assessment_proposed_time) {
        return NextResponse.json(
          { error: 'Assessment time is required for site visits' },
          { status: 400 }
        )
      }
    }

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

    if (price_range_min && price_range_max) {
      if (parseFloat(price_range_min) >= parseFloat(price_range_max)) {
        return NextResponse.json(
          { error: 'Maximum price must be greater than minimum price' },
          { status: 400 }
        )
      }
    }

    // ✅ Check for duplicate interest
    const { data: existingInterest } = await supabase
      .from('interest')
      .select('interest_id')
      .eq('appointment_id', appointment_id)
      .eq('professional_id', professional_id)
      .neq('status', 'withdrawn')
      .single()

    if (existingInterest) {
      return NextResponse.json(
        { error: 'You have already expressed interest in this appointment' },
        { status: 409 }
      )
    }

    let cleanMessage = message || 'Professional is interested in this appointment'
    
    if (cleanMessage.includes('import ') || 
        cleanMessage.includes('export ') || 
        cleanMessage.includes('function ') ||
        cleanMessage.includes('const ') ||
        cleanMessage.length > 2000) {
      console.warn('⚠️ Invalid message detected, using default')
      cleanMessage = 'Professional is interested in this appointment'
    }

    // ✅ FIXED: Combine date + time BEFORE creating interest
    let combinedAssessmentDateTime = null
    
    if (assessment && assessment_proposed_date && assessment_proposed_time) {
      try {
        const dateStr = String(assessment_proposed_date).trim()
        const timeStr = String(assessment_proposed_time).trim()
        const combinedStr = `${dateStr}T${timeStr}:00`
        const dateObj = new Date(combinedStr)
        
        if (!isNaN(dateObj.getTime())) {
          combinedAssessmentDateTime = dateObj.toISOString()
          console.log('✅ Combined assessment datetime:', combinedAssessmentDateTime)
        } else {
          console.error('❌ Invalid date/time combination:', combinedStr)
        }
      } catch (dateError) {
        console.error('❌ Error parsing assessment date/time:', dateError)
      }
    }

    // ===== CREATE INTEREST RECORD =====
    
    console.log('📤 Creating interest record...')
    
    const interestData = {
      appointment_id,
      professional_id,
      intent,
      message: cleanMessage,
      assessment,
      modality: modality || 'none',
      fee: assessment && fee ? parseFloat(fee) : 0,
      duration: parseInt(assessment_duration_minutes) || 60,
      amount: amount ? parseFloat(amount) : null,
      price_range_min: price_range_min ? parseFloat(price_range_min) : null,
      price_range_max: price_range_max ? parseFloat(price_range_max) : null,
      assessment_justification: assessment ? assessment_justification : null,
      // ✅ FIXED: Store combined datetime in interest table
      assessment_proposed_date: combinedAssessmentDateTime,
      earliest_start: earliest_start ? new Date(earliest_start).toISOString() : null,
      latest_start: latest_start ? new Date(latest_start).toISOString() : null,
      estimated_duration_hours: estimated_duration_hours ? parseFloat(estimated_duration_hours) : null,
      notes: notes || null,
      specification: specification || null,
      status: 'interested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📋 Interest data:', {
      ...interestData,
      message_length: cleanMessage.length,
      has_assessment_proposed_date: !!combinedAssessmentDateTime,
      has_earliest: !!earliest_start,
      has_latest: !!latest_start
    })

    const { data: newInterest, error: interestError } = await supabase
      .from('interest')
      .insert(interestData)
      .select()
      .single()

    if (interestError) {
      console.error('❌ Failed to create interest:', interestError)
      return NextResponse.json(
        { error: 'Failed to create interest', details: interestError.message },
        { status: 500 }
      )
    }

    console.log('✅ Interest created:', newInterest.interest_id)

    // ===== CREATE ASSESSMENT RECORD IF NEEDED =====
    
    let assessmentRecord = null
    
    if (assessment) {
      console.log('📅 Creating assessment record...')

      // Get service delivery address from appointment
      const { data: appointmentData } = await supabase
        .from('appointment')
        .select('address_id')
        .eq('appointment_id', appointment_id)
        .single()

      const assessmentData = {
        interest_id: newInterest.interest_id,
        appointment_id: appointment_id,
        professional_id: professional_id,
        service_delivery_address_id: appointmentData?.address_id || null,
        proposed_date: combinedAssessmentDateTime, // ✅ Use the same combined value
        proposed_duration_minutes: parseInt(assessment_duration_minutes) || 60,
        proposed_fee: fee ? parseFloat(fee) : 0,
        assessment_type: modality === 'local' ? 'local' : modality === 'remote' ? 'remote' : 'phone',
        proposal_message: assessment_justification || null,
        assessment_justification: assessment_justification || null,
        status: 'proposed',
        customer_response: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📤 Assessment data:', {
        interest_id: assessmentData.interest_id,
        proposed_date_set: !!combinedAssessmentDateTime,
        proposed_date_value: combinedAssessmentDateTime
      })

      const { data: createdAssessment, error: assessmentError } = await supabase
        .from('assessment')
        .insert(assessmentData)
        .select()
        .single()

      if (assessmentError) {
        console.error('❌ Failed to create assessment:', assessmentError)
        console.warn('⚠️ Interest created but assessment creation failed')
      } else {
        assessmentRecord = createdAssessment
        console.log('✅ Assessment created:', createdAssessment.assessment_id)
        console.log('✅ Assessment proposed_date:', createdAssessment.proposed_date)
      }
    }

    // ===== RETURN SUCCESS RESPONSE =====

    console.log('✅ Interest expressed successfully')

    // ✅ FIXED: Properly serialize all data to avoid 500 errors
    const responsePayload = {
      success: true,
      interest: {
        interest_id: newInterest.interest_id,
        appointment_id: newInterest.appointment_id,
        professional_id: newInterest.professional_id,
        status: newInterest.status || 'interested',
        // ✅ Convert numeric values properly
        amount: newInterest.amount ? parseFloat(newInterest.amount) : null,
        price_range_min: newInterest.price_range_min ? parseFloat(newInterest.price_range_min) : null,
        price_range_max: newInterest.price_range_max ? parseFloat(newInterest.price_range_max) : null,
        fee: newInterest.fee ? parseFloat(newInterest.fee) : 0,
        // ✅ Handle strings
        message: newInterest.message || null,
        assessment_justification: newInterest.assessment_justification || null,
        modality: newInterest.modality || 'none',
        intent: newInterest.intent || 'standard',
        // ✅ Convert booleans
        assessment: Boolean(newInterest.assessment),
        // ✅ Convert dates to ISO strings
        created_at: newInterest.created_at ? new Date(newInterest.created_at).toISOString() : new Date().toISOString(),
        updated_at: newInterest.updated_at ? new Date(newInterest.updated_at).toISOString() : new Date().toISOString(),
        assessment_proposed_date: newInterest.assessment_proposed_date ? 
          new Date(newInterest.assessment_proposed_date).toISOString() : null,
        earliest_start: newInterest.earliest_start ? 
          new Date(newInterest.earliest_start).toISOString() : null,
        latest_start: newInterest.latest_start ? 
          new Date(newInterest.latest_start).toISOString() : null,
        estimated_duration_hours: newInterest.estimated_duration_hours ? 
          parseFloat(newInterest.estimated_duration_hours) : null,
        duration: newInterest.duration ? parseInt(newInterest.duration) : 60
      },
      message: invitation_response 
        ? 'Successfully responded to invitation!' 
        : 'Interest expressed successfully!'
    }

    // ✅ Add assessment record if it exists (properly serialized)
    if (assessmentRecord) {
      responsePayload.interest.assessment_record = {
        assessment_id: assessmentRecord.assessment_id,
        status: assessmentRecord.status || 'proposed',
        proposed_date: assessmentRecord.proposed_date ? 
          new Date(assessmentRecord.proposed_date).toISOString() : null,
        proposed_duration_minutes: assessmentRecord.proposed_duration_minutes ? 
          parseInt(assessmentRecord.proposed_duration_minutes) : 60,
        proposed_fee: assessmentRecord.proposed_fee ? 
          parseFloat(assessmentRecord.proposed_fee) : 0,
        assessment_type: assessmentRecord.assessment_type || null
      }
    }

    console.log('📤 Sending response payload')

    return NextResponse.json(responsePayload, { status: 201 })

  } catch (error) {
    console.error('💥 CRITICAL ERROR in interests POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}