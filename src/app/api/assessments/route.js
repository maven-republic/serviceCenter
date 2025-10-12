

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🎯 GET /api/assessments called')
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const interest_id = searchParams.get('interest_id')
    const appointment_id = searchParams.get('appointment_id')
    const professional_id = searchParams.get('professional_id')
    const status = searchParams.get('status')
    const include_details = searchParams.get('include_details') === 'true'

    if (!interest_id && !appointment_id && !professional_id) {
      return NextResponse.json(
        { error: 'Must specify interest_id, appointment_id, or professional_id' },
        { status: 400 }
      )
    }

    let query
    
    if (include_details) {
      // ✅ FIXED: Use explicit foreign key name for account relationship
      query = supabase
        .from('assessment')
        .select(`
          *,
          interest!inner(
            interest_id,
            professional_id,
            amount,
            status
          ),
          appointment:appointment_id(
            appointment_id,
            title,
            description,
            customer_message,
            status,
            address:address_id(
              address_id,
              street_address,
              city,
              parish,
              postal_code,
              country
            ),
            customer:customer_id(
              customer_id,
              account:individual_customer_account_id_fkey(
                account_id,
                first_name,
                last_name,
                email,
                profile_picture_url
              ),
              phone:phone_id(
                phone_id,
                phone_number
              )
            )
          )
        `)
    } else {
      query = supabase
        .from('assessment')
        .select('*')
    }

    query = query.order('created_at', { ascending: false })

    if (interest_id) query = query.eq('interest_id', interest_id)
    if (appointment_id) query = query.eq('appointment_id', appointment_id)
    if (professional_id) {
      if (include_details) {
        query = query.eq('interest.professional_id', professional_id)
      } else {
        query = query.eq('professional_id', professional_id)
      }
    }
    if (status) query = query.eq('status', status)

    const { data: assessments, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assessments', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${assessments?.length || 0} assessments`)

    return NextResponse.json({
      success: true,
      assessments: assessments || []
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ... rest of your POST function stays the same
// POST /api/assessments - Create assessment
export async function POST(request) {
  try {
    console.log('🎯 POST /api/assessments called')
    
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      interest_id,
      appointment_id,
      professional_id,
      service_delivery_address_id,
      proposed_date,
      proposed_duration_minutes = 60,
      proposed_fee = 0,
      assessment_type = 'local',
      proposal_message,
      status = 'proposed'
    } = body

    // Validate required fields
    if (!interest_id || !appointment_id || !professional_id) {
      return NextResponse.json(
        { error: 'Missing required fields: interest_id, appointment_id, professional_id' },
        { status: 400 }
      )
    }

    // Check if assessment already exists
    const { data: existing } = await supabase
      .from('assessment')
      .select('assessment_id')
      .eq('interest_id', interest_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Assessment already exists for this interest' },
        { status: 409 }
      )
    }

    // Create assessment
    const { data: assessment, error } = await supabase
      .from('assessment')
      .insert({
        interest_id,
        appointment_id,
        professional_id,
        service_delivery_address_id,
        proposed_date,
        proposed_duration_minutes,
        proposed_fee,
        assessment_type,
        proposal_message,
        status
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create assessment:', error)
      return NextResponse.json(
        { error: 'Failed to create assessment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Assessment created:', assessment.assessment_id)

    return NextResponse.json({
      success: true,
      assessment,
      message: 'Assessment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}