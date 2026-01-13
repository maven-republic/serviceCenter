// src/app/api/assessments/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/assessments - List assessments with optional filtering
export async function GET(request) {
  try {
    console.log('🎯 GET /api/assessments called')
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const interest_id = searchParams.get('interest_id')
    const appointment_id = searchParams.get('appointment_id')
    const professional_id = searchParams.get('professional_id')
    const status = searchParams.get('status')
    const include_details = searchParams.get('include_details') === 'true'

    console.log('📋 Query params:', { 
      interest_id, 
      appointment_id, 
      professional_id, 
      status, 
      include_details 
    })

    // Require at least one filter parameter
    if (!interest_id && !appointment_id && !professional_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Must specify at least one filter: interest_id, appointment_id, or professional_id' 
        },
        { status: 400 }
      )
    }

    // Build query based on detail level
    let query

    if (include_details) {
      console.log('📊 Fetching with detailed relationships...')
      
      // ✅ FIXED: Use explicit foreign key name to avoid ambiguity
      query = supabase
        .from('assessment')
        .select(`
          *,
          interest!inner(
            interest_id,
            professional_id,
            amount,
            status,
            assessment,
            message
          ),
appointment:appointment_id(
  appointment_id,
  title,
  description,
  customer_message,
  status,
  session,
  address:address_id(
    address_id,
    street_address,
    city,
    parish,
        country
  ),
  individual_customer!fk_appointment_customer(
    customer_id,
    account:individual_customer_account_id_fkey(
      account_id,
      first_name,
      last_name,
      email,
      profile_picture_url,
      phone:phone_account_id_fkey(
        phone_id,
        phone_number,
        is_primary
      )
    )
  )
)
        `)
    } else {
      console.log('📄 Fetching simple assessment data...')
      
      query = supabase
        .from('assessment')
        .select('*')
    }

    // Apply filters
    if (interest_id) {
      console.log('🔍 Filtering by interest_id:', interest_id)
      query = query.eq('interest_id', interest_id)
    }

    if (appointment_id) {
      console.log('🔍 Filtering by appointment_id:', appointment_id)
      query = query.eq('appointment_id', appointment_id)
    }

    if (professional_id) {
      console.log('🔍 Filtering by professional_id:', professional_id)
      
      if (include_details) {
        // When using joins, filter through the interest relationship
        query = query.eq('interest.professional_id', professional_id)
      } else {
        // Simple query can filter directly
        query = query.eq('professional_id', professional_id)
      }
    }

    if (status) {
      console.log('🔍 Filtering by status:', status)
      query = query.eq('status', status)
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    // Execute query
    const { data: assessments, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch assessments', 
          details: error.message 
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully fetched ${assessments?.length || 0} assessments`)

    return NextResponse.json({
      success: true,
      assessments: assessments || [],
      count: assessments?.length || 0
    })

  } catch (error) {
    console.error('💥 Unexpected API Error:', error)
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

// POST /api/assessments - Create new assessment
export async function POST(request) {
  try {
    console.log('🎯 POST /api/assessments called')
    
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📥 Request body:', body)

    const {
      interest_id,
      appointment_id,
      professional_id,
      service_delivery_address_id,
      proposed_date,
      proposed_time,
      proposed_duration_minutes = 60,
      proposed_fee = 0,
      assessment_type = 'local',
      assessment_justification,
      proposal_message,
      status = 'proposed'
    } = body

    // Validate required fields
    if (!interest_id || !appointment_id || !professional_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          required: ['interest_id', 'appointment_id', 'professional_id']
        },
        { status: 400 }
      )
    }

    // Check if assessment already exists for this interest
    console.log('🔍 Checking for existing assessment...')
    
    const { data: existing, error: checkError } = await supabase
      .from('assessment')
      .select('assessment_id, status')
      .eq('interest_id', interest_id)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking for existing assessment:', checkError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to check existing assessment',
          details: checkError.message
        },
        { status: 500 }
      )
    }

    if (existing) {
      console.log('⚠️ Assessment already exists:', existing.assessment_id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Assessment already exists for this interest',
          existing_assessment_id: existing.assessment_id,
          existing_status: existing.status
        },
        { status: 409 }
      )
    }

    // Combine date and time if both provided
    let finalProposedDate = proposed_date
    
    if (proposed_date && proposed_time) {
      // Combine date and time into a single timestamp
      const dateStr = proposed_date.split('T')[0] // Get YYYY-MM-DD
      finalProposedDate = `${dateStr}T${proposed_time}:00` // Combine with time
      console.log('📅 Combined date/time:', finalProposedDate)
    }

    // Prepare assessment data
    const assessmentData = {
      interest_id,
      appointment_id,
      professional_id,
      service_delivery_address_id,
      proposed_date: finalProposedDate,
      proposed_duration_minutes,
      proposed_fee,
      assessment_type,
      assessment_justification,
      proposal_message,
      status,
      created_at: new Date().toISOString()
    }

    console.log('📝 Creating assessment with data:', assessmentData)

    // Create assessment
    const { data: assessment, error: insertError } = await supabase
      .from('assessment')
      .insert(assessmentData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Failed to create assessment:', insertError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create assessment', 
          details: insertError.message 
        },
        { status: 500 }
      )
    }

    console.log('✅ Assessment created successfully:', assessment.assessment_id)

    return NextResponse.json({
      success: true,
      assessment,
      message: 'Assessment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('💥 Unexpected API Error:', error)
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