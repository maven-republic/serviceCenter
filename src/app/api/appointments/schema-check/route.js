// src/app/api/appointments/schema-check/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Checking database schema...')
    const supabase = await createClient()
    
    // Check what columns actually exist in individual_professional table
    const { data: professionalColumns, error: profError } = await supabase
      .from('individual_professional')
      .select('*')
      .limit(1)
    
    if (profError) {
      return NextResponse.json({
        error: 'Cannot access individual_professional table',
        details: profError.message
      }, { status: 500 })
    }

    // Check account table columns
    const { data: accountColumns, error: accountError } = await supabase
      .from('account')
      .select('*')
      .limit(1)
    
    if (accountError) {
      return NextResponse.json({
        error: 'Cannot access account table',
        details: accountError.message,
        professional_sample: professionalColumns?.[0] || null
      }, { status: 500 })
    }

    // Get the professional for our test interest
    const testProfessionalId = 'a99aec93-eb3a-4882-a32d-b8fae1ee5a06'
    const { data: testProfessional, error: testProfError } = await supabase
      .from('individual_professional')
      .select('*')
      .eq('professional_id', testProfessionalId)
      .single()

    // Try to get their account info
    let testAccount = null
    if (testProfessional?.account_id) {
      const { data: accountData } = await supabase
        .from('account')
        .select('*')
        .eq('account_id', testProfessional.account_id)
        .single()
      testAccount = accountData
    }

    return NextResponse.json({
      success: true,
      schema: {
        individual_professional: {
          available_columns: professionalColumns?.[0] ? Object.keys(professionalColumns[0]) : [],
          sample_data: professionalColumns?.[0] || null
        },
        account: {
          available_columns: accountColumns?.[0] ? Object.keys(accountColumns[0]) : [],
          sample_data: accountColumns?.[0] || null
        }
      },
      test_professional: testProfessional,
      test_account: testAccount,
      diagnosis: {
        has_business_name: professionalColumns?.[0] ? 'business_name' in professionalColumns[0] : false,
        has_rating_average: professionalColumns?.[0] ? 'rating_average' in professionalColumns[0] : false,
        has_verification_status: professionalColumns?.[0] ? 'verification_status' in professionalColumns[0] : false,
        missing_columns: []
      }
    })

  } catch (error) {
    console.error('💥 Schema check error:', error)
    return NextResponse.json({ 
      error: 'Schema check failed', 
      details: error.message
    }, { status: 500 })
  }
}