// src/app/api/appointments/debug-interests/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🧪 Testing interests query...')
    const supabase = await createClient()
    const testId = '2cd442b7-87ed-4565-b28f-d55929c10c5e'
    
    // Test 1: Basic interests table access
    console.log('Test 1: Basic interests access')
    const { data: basicInterests, error: basicError } = await supabase
      .from('interest')
      .select('interest_id, appointment_id, professional_id, status')
      .eq('appointment_id', testId)
    
    if (basicError) {
      return NextResponse.json({
        test: 'basic_interests',
        error: basicError.message,
        success: false
      }, { status: 500 })
    }

    // Test 2: Check if professional table exists and has correct structure
    console.log('Test 2: Professional table structure')
    const { data: professionalTest, error: profError } = await supabase
      .from('individual_professional')
      .select('professional_id, business_name, verification_status, rating_average, rating_count, account_id')
      .limit(1)
    
    if (profError) {
      return NextResponse.json({
        test: 'professional_table',
        error: profError.message,
        success: false,
        basic_interests: basicInterests
      }, { status: 500 })
    }

    // Test 3: Check if account table exists and has correct structure  
    console.log('Test 3: Account table structure')
    const { data: accountTest, error: accountError } = await supabase
      .from('account')
      .select('account_id, first_name, last_name, email, profile_picture_url')
      .limit(1)
    
    if (accountError) {
      return NextResponse.json({
        test: 'account_table',
        error: accountError.message,
        success: false,
        basic_interests: basicInterests,
        professional_test: professionalTest
      }, { status: 500 })
    }

    // Test 4: Try the complex JOIN query step by step
    console.log('Test 4: Complex JOIN query')
    let complexQuery = null
    let complexError = null
    
    try {
      const { data: complexData, error: complexErr } = await supabase
        .from('interest')
        .select(`
          *,
          professional:professional_id (
            professional_id,
            business_name,
            verification_status,
            rating_average,
            rating_count,
            account:account_id (
              account_id,
              first_name,
              last_name,
              email,
              profile_picture_url
            )
          )
        `)
        .eq('appointment_id', testId)
        .order('created_at', { ascending: false })
      
      complexQuery = complexData
      complexError = complexErr
    } catch (error) {
      complexError = error
    }

    // Test 5: Check for specific interests for this appointment
    console.log('Test 5: Checking actual interests')
    const { data: interestDetails, error: detailError } = await supabase
      .from('interest')
      .select('*')
      .eq('appointment_id', testId)

    return NextResponse.json({
      success: true,
      appointment_id: testId,
      tests: {
        basic_interests: {
          success: !basicError,
          error: basicError?.message || null,
          count: basicInterests?.length || 0,
          data: basicInterests?.slice(0, 2) || []
        },
        professional_table: {
          success: !profError,
          error: profError?.message || null,
          sample: professionalTest?.slice(0, 1) || []
        },
        account_table: {
          success: !accountError,
          error: accountError?.message || null,
          sample: accountTest?.slice(0, 1) || []
        },
        complex_query: {
          success: !complexError,
          error: complexError?.message || null,
          count: complexQuery?.length || 0,
          data: complexQuery?.slice(0, 1) || []
        },
        interest_details: {
          success: !detailError,
          error: detailError?.message || null,
          interests: interestDetails || []
        }
      },
      diagnosis: basicInterests?.length === 0 
        ? '🔍 No interests found for this appointment. This explains the empty response, but should not cause a 500 error.'
        : `✅ Found ${basicInterests?.length} interests. The 500 error might be in the complex JOIN query.`,
      next_steps: [
        complexError ? '❌ Fix the complex JOIN query' : '✅ Complex query works',
        basicInterests?.length === 0 ? '📝 Create test interests for this appointment' : '✅ Interests exist',
        '🧪 Test the actual interests API endpoint with these findings'
      ]
    })

  } catch (error) {
    console.error('💥 Debug API error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}