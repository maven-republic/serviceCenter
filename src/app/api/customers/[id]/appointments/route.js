// src/app/api/customers/[id]/appointments/route.js - FIXED VERSION
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { id: customer_id } = params
  console.log('🎯 Customer Appointments API called for:', customer_id)
  
  try {
    // FIX: Await the createClient() function since it's async
    const supabase = await createClient()
    console.log('✅ Supabase client created successfully')

    const { searchParams } = new URL(request.url)
    const status_filter = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = parseInt(searchParams.get('offset')) || 0
    
    console.log('📋 Query parameters:', { status_filter, limit, offset })

    // Simple query first to test
    console.log('🔍 Fetching basic appointments...')
    
    let query = supabase
      .from('appointment')
      .select('*', { count: 'exact' })
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false })

    // Filter by status if specified
    if (status_filter && status_filter !== 'all') {
      query = query.eq('status', status_filter)
    }

    // Execute the query
    const { data: appointments, error: appointmentError, count } = await query
      .range(offset, offset + limit - 1)

    if (appointmentError) {
      console.error('❌ Error fetching appointments:', appointmentError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch appointments', 
          details: appointmentError.message,
          hint: appointmentError.hint,
          customer_id: customer_id 
        },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${appointments?.length || 0} appointments for customer ${customer_id}`)

    // If no appointments found, return empty array
    if (!appointments || appointments.length === 0) {
      console.log('📭 No appointments found for customer')
      return NextResponse.json({
        success: true,
        appointments: [],
        summary: {
          total_appointments: 0,
          pending_appointments: 0,
          active_appointments: 0,
          completed_appointments: 0,
          total_interests_received: 0
        },
        total: 0
      })
    }

    // For now, return basic appointment data without complex joins
    // We can add the enrichment later once basic functionality works
    const summary = {
      total_appointments: count || 0,
      pending_appointments: appointments.filter(a => a.status === 'pending').length,
      active_appointments: appointments.filter(a => 
        ['interested', 'competing', 'evaluating', 'quoted'].includes(a.status)
      ).length,
      completed_appointments: appointments.filter(a => a.status === 'converted').length,
      total_interests_received: 0 // We'll calculate this later
    }

    console.log(`✅ Successfully returned ${appointments.length} appointments for customer ${customer_id}`)

    return NextResponse.json({
      success: true,
      appointments: appointments,
      summary,
      total: count
    })

  } catch (error) {
    console.error('💥 Customer appointments API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        customer_id: customer_id 
      },
      { status: 500 }
    )
  }
}