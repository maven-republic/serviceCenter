// src/app/api/assessments/[id]/route.js (UPDATED)

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/assessments/[id] - Get specific assessment
export async function GET(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const include_details = searchParams.get('include_details') === 'true'

    let query = supabase.from('assessment')
    
    if (include_details) {
      query = query.select(`
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
          address:address_id(*),
          customer:customer_id(
            customer_id,
            account:account_id(*),
            phone:phone_id(*)
          )
        )
      `)
    } else {
      query = query.select('*')
    }

    const { data: assessment, error } = await query
      .eq('assessment_id', id)
      .single()

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/assessments/[id] - Update assessment
export async function PATCH(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  try {
    console.log('🎯 PATCH /api/assessments/' + id)
    
    const supabase = await createClient()
    const body = await request.json()

    console.log('🔥 Update data:', body)

    // Get current assessment
    const { data: current, error: fetchError } = await supabase
      .from('assessment')
      .select('*')
      .eq('assessment_id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = { updated_at: new Date().toISOString() }
    
    // Allowed fields to update - EXPANDED LIST
    const allowedFields = [
      // Status and timestamps
      'status',
      'started_at',
      'completed_at',
      
      // Proposal fields
      'proposed_date',
      'proposed_duration_minutes',
      'proposed_fee',
      'proposal_message',
      
      // Confirmation fields
      'confirmed_date',
      'confirmed_duration_minutes',
      
      // Assessment findings
      'professional_assessment_notes',
      'complexity_vs_customer_estimate',
      'customer_description_accurate',
      'customer_photos_sufficient',
      'customer_scope_understanding',
      'scope_changes_required',
      'scope_additions',
      'scope_reductions',
      'scope_change_explanation',
      'additional_issues_found',
      'condition_variance_from_photos',
      
      // Site access
      'parking_availability',
      'access_instructions',
      'site_access_notes',
      'work_area_details',
      'utilities_available',
      'workspace_constraints',
      
      // Additional requirements
      'additional_permits_required',
      'permit_details',
      'additional_specialists_needed',
      'code_compliance_issues',
      
      // Final quote
      'final_quote_provided',
      'final_quote_amount',
      'final_quote_breakdown',
      'final_quote_notes',
      'final_quote_valid_until',
      'revised_timeline_hours',
      'revised_timeline_days',
      'payment_terms',
      'deposit_percentage',
      'milestones',
      'warranty_offered',
      'warranty_duration_months',
      'exclusions',
      'assumptions',
      'terms_and_conditions',
      
      // Customer response
      'customer_response',
      'customer_approved_final_quote',
      'customer_final_decision_at',
      'customer_feedback_on_assessment',
      
      // Fee collection
      'fee_collected',
      'fee_collection_method',
      
      // Other
      'notes'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Validate status transitions
    if (body.status) {
      const validTransitions = {
        'proposed': ['accepted', 'cancelled'],
        'accepted': ['scheduled', 'cancelled'],
        'scheduled': ['confirmed', 'active', 'cancelled'],
        'confirmed': ['active', 'cancelled'],
        'active': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
        'absent': []
      }

      const allowed = validTransitions[current.status]
      if (allowed && !allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${current.status} to ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Update assessment
    const { data: assessment, error } = await supabase
      .from('assessment')
      .update(updateData)
      .eq('assessment_id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update assessment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Assessment updated:', assessment.assessment_id)

    // If final quote provided, update interest
    if (body.final_quote_provided === true && body.final_quote_amount) {
      console.log('💰 Updating interest with final quote...')
      
      const { error: interestError } = await supabase
        .from('interest')
        .update({
          amount: body.final_quote_amount,
          status: 'quoted',
          quoted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('interest_id', current.interest_id)

      if (interestError) {
        console.error('❌ Failed to update interest:', interestError)
      } else {
        console.log('✅ Interest updated with final quote')
      }
    }

    return NextResponse.json({
      success: true,
      assessment,
      message: 'Assessment updated successfully'
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/assessments/[id] - Cancel assessment
export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  try {
    const supabase = await createClient()

    // Mark as cancelled instead of hard delete
    const { data: assessment, error } = await supabase
      .from('assessment')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('assessment_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to cancel assessment', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Assessment cancelled:', id)

    return NextResponse.json({
      success: true,
      assessment,
      message: 'Assessment cancelled successfully'
    })

  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}