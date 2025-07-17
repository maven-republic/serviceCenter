// src/app/api/appointments/[id]/interests/route.js (FIXED)
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/appointments/[id]/interests - Get all professional interests for an appointment
export async function GET(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🎯 Appointment Interests GET API called for appointment ID:', id)
  
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const include_withdrawn = searchParams.get('include_withdrawn') === 'true'
    const status_filter = searchParams.get('status')

    // Verify appointment exists
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('appointment_id, status, customer_id, title, service_id, created_at')
      .eq('appointment_id', id)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Appointment not found:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    // Step 1: Get basic interests (NO JOINS to avoid relationship conflicts)
    let query = supabase
      .from('interest')
      .select('*')
      .eq('appointment_id', id)
      .order('created_at', { ascending: false })

    // Filter out withdrawn interests unless specifically requested
    if (!include_withdrawn) {
      query = query.neq('status', 'withdrawn')
    }

    // Filter by status if specified
    if (status_filter) {
      query = query.eq('status', status_filter)
    }

    const { data: interests, error: interestsError } = await query

    if (interestsError) {
      console.error('❌ Error fetching interests:', interestsError)
      return NextResponse.json({ 
        error: 'Failed to fetch interests', 
        details: interestsError.message 
      }, { status: 500 })
    }

    if (!interests || interests.length === 0) {
      return NextResponse.json({
        success: true,
        appointment: {
          appointment_id: appointment.appointment_id,
          status: appointment.status,
          title: appointment.title,
          service_id: appointment.service_id
        },
        interests: [],
        summary: {
          total_interests: 0,
          active_interests: 0,
          quoted_interests: 0,
          selected_interest: null,
          assessment_required_count: 0,
          average_quote: 0
        },
        total: 0
      })
    }

    // Step 2: Get professional details separately (avoiding relationship conflicts)
    const professionalIds = interests.map(interest => interest.professional_id)
    
    const { data: professionals, error: profError } = await supabase
      .from('individual_professional')
      .select(`
        professional_id,
        account_id,
        verification_status,
        hourly_rate,
        daily_rate,
        rate_currency,
        bio,
        experience,
        service_radius
      `)
      .in('professional_id', professionalIds)

    if (profError) {
      console.error('❌ Error fetching professionals:', profError)
      return NextResponse.json({ 
        error: 'Failed to fetch professional details', 
        details: profError.message 
      }, { status: 500 })
    }

    // Step 3: Get account details separately
    const accountIds = professionals?.map(prof => prof.account_id) || []
    
    const { data: accounts, error: accountError } = await supabase
      .from('account')
      .select(`
        account_id,
        first_name,
        last_name,
        email,
        profile_picture_url
      `)
      .in('account_id', accountIds)

    if (accountError) {
      console.error('❌ Error fetching accounts:', accountError)
      return NextResponse.json({ 
        error: 'Failed to fetch account details', 
        details: accountError.message 
      }, { status: 500 })
    }

    // Step 4: Get additional data safely (with error handling)
    const getReviews = async () => {
      try {
        const { data } = await supabase
          .from('review')
          .select('professional_id, rating')
          .in('professional_id', professionalIds)
        return data || []
      } catch (e) {
        console.log('ℹ️ Reviews table not accessible, skipping ratings')
        return []
      }
    }

    const getServices = async () => {
      try {
        const { data } = await supabase
          .from('professional_service')
          .select('professional_id, service_id, base_price, price_type')
          .in('professional_id', professionalIds)
        return data || []
      } catch (e) {
        console.log('ℹ️ Professional services table not accessible, skipping')
        return []
      }
    }

    const getAssessments = async () => {
      try {
        const { data } = await supabase
          .from('assessment')
          .select('professional_id, assessment_type, status, scheduled_date, interest_id')
          .in('professional_id', professionalIds)
        return data || []
      } catch (e) {
        console.log('ℹ️ Assessment table not accessible, skipping')
        return []
      }
    }

    const [reviews, services, assessments] = await Promise.all([
      getReviews(),
      getServices(), 
      getAssessments()
    ])

    // Step 5: Combine all data manually
    const enrichedInterests = interests.map(interest => {
      const professional = professionals?.find(p => p.professional_id === interest.professional_id)
      const account = accounts?.find(a => a.account_id === professional?.account_id)
      
      // Calculate ratings for this professional
      const professionalReviews = reviews.filter(r => r.professional_id === interest.professional_id)
      const ratingAverage = professionalReviews.length > 0 
        ? professionalReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / professionalReviews.length
        : 0
      
      // Get services for this professional
      const professionalServices = services.filter(s => s.professional_id === interest.professional_id)
      
      // Get assessments for this professional  
      const professionalAssessments = assessments.filter(a => 
        a.professional_id === interest.professional_id &&
        a.interest_id === interest.interest_id
      )

      return {
        ...interest,
        professional: {
          ...professional,
          business_name: account ? `${account.first_name || ''} ${account.last_name || ''}`.trim() : 'Professional',
          rating_average: ratingAverage,
          rating_count: professionalReviews.length,
          services_offered_count: professionalServices.length,
          reviews_count: professionalReviews.length,
          account: account
        },
        assessment: professionalAssessments.length > 0 ? professionalAssessments[0] : null
      }
    })

    // Step 6: Calculate summary statistics
    const summary = {
      total_interests: enrichedInterests.length,
      active_interests: enrichedInterests.filter(i => !['withdrawn', 'rejected'].includes(i.status)).length,
      quoted_interests: enrichedInterests.filter(i => i.status === 'quoted' || i.amount).length,
      selected_interest: enrichedInterests.find(i => i.selected_by_customer),
      assessment_required_count: enrichedInterests.filter(i => i.assessment).length,
      average_quote: enrichedInterests
        .filter(i => i.amount)
        .reduce((sum, i) => sum + parseFloat(i.amount), 0) / 
        Math.max(1, enrichedInterests.filter(i => i.amount).length) || 0
    }

    console.log(`✅ Found ${enrichedInterests.length} interests for appointment ${id}`)

    return NextResponse.json({
      success: true,
      appointment: {
        appointment_id: appointment.appointment_id,
        status: appointment.status,
        title: appointment.title,
        service_id: appointment.service_id
      },
      interests: enrichedInterests,
      summary,
      total: enrichedInterests.length
    })

  } catch (error) {
    console.error('💥 Appointment interests GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  console.log('🎯 Appointment Interests POST API called for appointment ID:', id)
  
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { action, interest_ids, data } = body
    
    console.log('📝 Interest action request:', { action, interest_ids, data })

    // Validate required fields
    if (!action || !interest_ids || !Array.isArray(interest_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields: action and interest_ids' },
        { status: 400 }
      )
    }

    // Verify appointment exists
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointment')
      .select('appointment_id, status, customer_id')
      .eq('appointment_id', id)
      .single()

    if (appointmentError || !appointment) {
      console.error('❌ Appointment not found:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    if (action === 'select_professional') {
      console.log('✅ Selecting professional for appointment:', id)
      
      // First, unselect any previously selected professionals
      await supabase
        .from('interest')
        .update({ 
          selected_by_customer: false,
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', id)
        .eq('selected_by_customer', true)

      // Select the new professional(s) with proper timestamps
      const updateData = {
        selected_by_customer: true,
        status: 'selected',
        customer_selected_at: new Date().toISOString(), // NEW COLUMN
        customer_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add customer notes if provided
      if (data?.customer_notes) {
        updateData.customer_notes = data.customer_notes
      }

      const { data: updatedInterests, error: selectError } = await supabase
        .from('interest')
        .update(updateData)
        .in('interest_id', interest_ids)
        .eq('appointment_id', id)
        .select()

      if (selectError) {
        console.error('❌ Error selecting professional:', selectError)
        return NextResponse.json(
          { error: 'Failed to select professional', details: selectError.message },
          { status: 500 }
        )
      }

      // Update appointment status
      await supabase
        .from('appointment')
        .update({
          status: 'evaluating',
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', id)

      console.log('✅ Professional selected successfully')

      return NextResponse.json({
        success: true,
        message: 'Professional selected successfully',
        updated_interests: updatedInterests
      })

    } else if (action === 'reject_interests') {
      console.log('❌ Rejecting interests for appointment:', id)
      
      const updateData = {
        status: 'rejected',
        customer_rejected_at: new Date().toISOString(), // NEW COLUMN
        updated_at: new Date().toISOString()
      }

      // Store rejection reason in dedicated field
      if (data?.rejection_reason) {
        updateData.rejection_reason = data.rejection_reason // NEW COLUMN
      }

      const { data: rejectedInterests, error: rejectError } = await supabase
        .from('interest')
        .update(updateData)
        .in('interest_id', interest_ids)
        .eq('appointment_id', id)
        .select()

      if (rejectError) {
        console.error('❌ Error rejecting interests:', rejectError)
        return NextResponse.json(
          { error: 'Failed to reject interests', details: rejectError.message },
          { status: 500 }
        )
      }

      console.log('✅ Interests rejected successfully')

      return NextResponse.json({
        success: true,
        message: 'Interests rejected successfully',
        updated_interests: rejectedInterests
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: select_professional, reject_interests' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('💥 Appointment interests POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id]/interests - Update interest status
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const appointmentId = resolvedParams.id
    const body = await request.json()
    const { professional_id, status, notes } = body

    console.log('🔄 Updating interest status:', { appointmentId, professional_id, status })

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('interest')
      .update({ 
        status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)
      .eq('professional_id', professional_id)
      .select()

    if (error) {
      console.error('❌ Error updating interest:', error)
      return NextResponse.json({ 
        error: 'Failed to update interest', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Interest updated successfully:', data)

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('💥 Update Interest API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 }
  )
}

}