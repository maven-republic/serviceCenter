// src/app/api/professional/profile/route.js
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { account_id } = body

    if (!account_id) {
      return NextResponse.json({ 
        success: false,
        error: 'Account ID is required' 
      }, { status: 400 })
    }

    // Get professional profile
    const { data: professional, error } = await supabase
      .from('individual_professional')
      .select('professional_id, account_id')
      .eq('account_id', account_id)
      .single()

    if (error || !professional) {
      console.error('Professional profile not found:', error)
      return NextResponse.json({
        success: false,
        error: 'Professional profile not found',
        details: error?.message
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      professional_id: professional.professional_id,
      account_id: professional.account_id
    })

  } catch (error) {
    console.error('Professional profile API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch professional profile',
      details: error.message
    }, { status: 500 })
  }
}