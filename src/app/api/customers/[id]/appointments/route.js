// src/app/api/customers/[id]/appointments/route.js - CORRECTED VERSION
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const resolvedParams = await params
  const { id: customer_id } = resolvedParams
  
  console.log('🎯 Customer Appointments API called for:', customer_id)
  
  try {
    const supabase = await createClient()
    console.log('✅ Supabase client created successfully')

    const { searchParams } = new URL(request.url)
    const status_filter = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = parseInt(searchParams.get('offset')) || 0
    
    console.log('📋 Query parameters:', { status_filter, limit, offset })

    // ✅ CORRECTED: Using actual column names from schema
    let query = supabase
      .from('appointment')
      .select(`
        *,
        service:service(
          service_id,
          name,
          description,
          base_price,
          duration_minutes
        ),
        address:address(
          address_id,
          street_address,
          city,
          parish,
          formatted_address
        ),
        interests:interest(
          interest_id,
          professional_id,
          status,
          created_at,
          amount,
          message
        )
      `, { count: 'exact' })
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false })

    // Filter by status if specified
    if (status_filter && status_filter !== 'all') {
      query = query.eq('status', status_filter)
    }

    // Execute the query with pagination
    const { data: rawAppointments, error: appointmentError, count } = await query
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

    console.log(`📊 Found ${rawAppointments?.length || 0} appointments for customer ${customer_id}`)

    // If no appointments found, return empty array
    if (!rawAppointments || rawAppointments.length === 0) {
      console.log('🔭 No appointments found for customer')
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

    // ✅ Transform data to consistent format with calculated fields
    const transformedAppointments = rawAppointments.map(appointment => {
      // Calculate interest counts from the joined data
      const interests = appointment.interests || []
      const activeStatuses = ['interested', 'competing', 'evaluating', 'quoted', 'selected', 'confirmed']
      
      const totalInterests = interests.length
      const activeInterests = interests.filter(interest => 
        activeStatuses.includes(interest.status)
      ).length

      return {
        // Core appointment data
        appointment_id: appointment.appointment_id,
        customer_id: appointment.customer_id,
        service_id: appointment.service_id,
        address_id: appointment.address_id,
        professional_id: appointment.professional_id,
        title: appointment.title,
        description: appointment.description,
        customer_message: appointment.customer_message,
        status: appointment.status,
        urgency: appointment.urgency,
        session: appointment.session,
        deadline: appointment.deadline,
        duration: appointment.duration,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        converted_to_booking_at: appointment.converted_to_booking_at,
        
        // ✅ CONSISTENT STRUCTURE: Always include interest_summary
        interest_summary: {
          total_interests: totalInterests,
          active_interests: activeInterests,
          last_interest_at: interests.length > 0 
            ? new Date(Math.max(...interests.map(i => new Date(i.created_at).getTime()))).toISOString()
            : null
        },
        
        // ✅ BACKWARD COMPATIBILITY: Keep original field names during transition
        total_interests: totalInterests,
        active_interest: activeInterests,
        interest_count: totalInterests,
        last_interest_at: interests.length > 0 
          ? new Date(Math.max(...interests.map(i => new Date(i.created_at).getTime()))).toISOString()
          : null,
        
        // Related data (cleaned up) - using correct schema fields
        service: appointment.service ? {
          service_id: appointment.service.service_id,
          name: appointment.service.name,
          description: appointment.service.description,
          base_price: appointment.service.base_price,
          duration_minutes: appointment.service.duration_minutes
        } : null,
        
        address: appointment.address ? {
          address_id: appointment.address.address_id,
          street_address: appointment.address.street_address,
          city: appointment.address.city,
          parish: appointment.address.parish,
          formatted_address: appointment.address.formatted_address
        } : null,
        
        // Include interests array for detailed views (using correct schema fields)
        interests: interests.map(interest => ({
          interest_id: interest.interest_id,
          professional_id: interest.professional_id,
          status: interest.status,
          created_at: interest.created_at,
          amount: interest.amount,
          message: interest.message
        }))
      }
    })

    // Calculate summary statistics
    const summary = {
      total_appointments: count || 0,
      pending_appointments: transformedAppointments.filter(a => a.status === 'pending').length,
      active_appointments: transformedAppointments.filter(a => 
        ['interested', 'competing', 'evaluating', 'quoted'].includes(a.status)
      ).length,
      completed_appointments: transformedAppointments.filter(a => a.status === 'converted').length,
      total_interests_received: transformedAppointments.reduce((sum, apt) => 
        sum + apt.interest_summary.total_interests, 0
      )
    }

    console.log(`✅ Successfully returned ${transformedAppointments.length} appointments with interest counts`)
    console.log('📈 Summary:', summary)

    return NextResponse.json({
      success: true,
      appointments: transformedAppointments,
      summary,
      total: count,
      // ✅ API versioning for future changes
      version: '1.1',
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Customer appointments API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        customer_id: customer_id,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}