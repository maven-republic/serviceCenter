import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()

    const { data: units, error } = await supabase
      .from('valuation_unit')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ Valuation Units Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch valuation units',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Fetched valuation units:', units?.length || 0)

    return NextResponse.json({
      success: true,
      units: units || []
    })

  } catch (error) {
    console.error('❌ Valuation Units API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error',
      details: error.message
    }, { status: 500 })
  }
}