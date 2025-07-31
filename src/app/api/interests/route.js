// src/app/api/interests/route.js
// Professional interests management API - FIXED with stored procedure approach

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

    // ✅ COMPLETELY SAFE: Query without any joins that could cause relationship conflicts
    let query = supabase
      .from('interest')
      .select('*', { count: 'exact' })

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

    // If we need related data, fetch it separately to avoid relationship conflicts
    let enrichedInterests = interests || []
    
    if (interests && interests.length > 0) {
      // Get unique appointment IDs to fetch appointment data separately
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

        // Get services separately
        const serviceIds = [...new Set(appointments?.map(a => a.service_id).filter(Boolean))] || []
        let services = []
        if (serviceIds.length > 0) {
          const { data: servicesData } = await supabase
            .from('service')
            .select('service_id, name, base_price')
            .in('service_id', serviceIds)
          services = servicesData || []
        }

        // Get addresses separately
        const addressIds = [...new Set(appointments?.map(a => a.address_id).filter(Boolean))] || []
        let addresses = []
        if (addressIds.length > 0) {
          const { data: addressesData } = await supabase
            .from('address')
            .select('address_id, street_address, city, parish, formatted_address')
            .in('address_id', addressIds)
          addresses = addressesData || []
        }

        // Get customers separately
        const customerIds = [...new Set(appointments?.map(a => a.customer_id).filter(Boolean))] || []
        let customers = []
        let accounts = []
        if (customerIds.length > 0) {
          const { data: customersData } = await supabase
            .from('individual_customer')
            .select('customer_id, account_id')
            .in('customer_id', customerIds)
          customers = customersData || []

          // Get customer accounts separately
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

          const appointmentTime = appointment?.session
          const appointmentDuration = appointment?.duration || 60

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
            
            // Price range fields
            price_range_min: interest.price_range_min,
            price_range_max: interest.price_range_max,
            assessment_justification: interest.assessment_justification,
            
            // Related data
            appointment: appointment ? {
              ...appointment,
              service: service || null,
              address: address || null,
              customer: customer ? {
                ...customer,
                account: account || null
              } : null
            } : null,
            customer: customer ? {
              ...customer,
              account: account || null
            } : null,
            customer_id: customer?.customer_id || null,
            service: service || null,
            service_id: service?.service_id || null
          }
        })
      }
    }

    console.log('✅ Found', enrichedInterests.length, 'interests with customer account data')

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
      { error: 'Internal server error: ' + error.message, details: error.stack },
      { status: 500 }
    )
  }
}

// POST /api/interests - Create new interest (UPDATED with stored procedure)
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
      // Price range fields
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
      has_justification: !!assessment_justification,
      message_preview: (response_message || message || '').substring(0, 50) + '...'
    })

    // Validate required fields
    if (!appointment_id || !professional_id) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and professional_id' },
        { status: 400 }
      )
    }

    // Enhanced validation for assessment-only with price ranges
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

    // Validate price range order if both provided
    if (price_range_min && price_range_max) {
      if (parseFloat(price_range_min) >= parseFloat(price_range_max)) {
        return NextResponse.json(
          { error: 'Maximum price must be greater than minimum price' },
          { status: 400 }
        )
      }
    }

    // Validate and clean message field
    let cleanMessage = response_message || message || 'Professional is interested in this appointment'
    
    // Prevent source code from being submitted as message
    if (cleanMessage.includes('import ') || 
        cleanMessage.includes('export ') || 
        cleanMessage.includes('function ') ||
        cleanMessage.includes('const ') ||
        cleanMessage.length > 2000) {
      console.warn('⚠️ Source code detected in message field, using default message')
      cleanMessage = 'Professional is interested in this appointment'
    }

    console.log('💾 Creating interest with stored procedure to bypass PostgREST and RLS issues')

    // ✅ ULTIMATE FIX: Use stored procedure to completely bypass PostgREST and RLS
    const { data: result, error: interestError } = await supabase
      .rpc('create_interest_safe', {
        p_appointment_id: appointment_id,
        p_professional_id: professional_id,
        p_intent: intent,
        p_message: cleanMessage,
        p_assessment: assessment,
        p_modality: modality || 'none',
        p_fee: assessment && fee ? parseFloat(fee) : 0,
        p_amount: amount ? parseFloat(amount) : null,
        p_price_range_min: price_range_min ? parseFloat(price_range_min) : null,
        p_price_range_max: price_range_max ? parseFloat(price_range_max) : null,
        p_assessment_justification: assessment ? assessment_justification : null,
        p_response: response
      })

    if (interestError || !result?.success) {
      console.error('❌ Interest creation error:', interestError || result)
      return NextResponse.json(
        { error: 'Failed to create interest', details: interestError?.message || result?.error },
        { status: 500 }
      )
    }

    console.log('✅ Interest created successfully via stored procedure:', result)

    return NextResponse.json({
      success: true,
      interest: {
        interest_id: result.interest_id,
        appointment_id: result.appointment_id,
        professional_id: result.professional_id,
        message: cleanMessage,
        assessment,
        amount,
        price_range_min,
        price_range_max,
        assessment_justification,
        status: 'interested'
      },
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