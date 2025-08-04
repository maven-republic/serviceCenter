// src/app/api/appointments/test/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🧪 Testing appointments API...')
    const supabase = await createClient()
    
    // Test: Get sample appointments
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointment')
      .select('appointment_id, title, status, customer_id, created_at')
      .limit(5)
    
    if (appointmentError) {
      return NextResponse.json({ 
        error: 'Failed to fetch appointments', 
        details: appointmentError.message
      }, { status: 500 })
    }

    // Test the specific appointment
    const testId = '2cd442b7-87ed-4565-b28f-d55929c10c5e'
    const { data: specificAppointment, error: specificError } = await supabase
      .from('appointment')
      .select('appointment_id, title, status, customer_id, service_id')
      .eq('appointment_id', testId)
      .single()

    return NextResponse.json({
      success: true,
      test_appointment: {
        id: testId,
        exists: !specificError && specificAppointment,
        data: specificAppointment,
        error: specificError?.message || null
      },
      sample_appointments: appointments || [],
      instructions: appointments?.length > 0 
        ? `✅ Use one of these valid IDs: ${appointments.map(a => a.appointment_id).slice(0, 2).join(', ')}`
        : '❌ No appointments found. Create an appointment first.'
    })

  } catch (error) {
    console.error('💥 Test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message
    }, { status: 500 })
  }
}