// import { createClient } from '@/utils/supabase/server'
// import { createClient } from '@/utils/supabase/server'

import { createApiClient } from '@/utils/supabase/api'


export async function POST(req) {
  const supabase = createApiClient()
  const { service_id, location } = await req.json()
  console.log('📦 API received:', { service_id, location });


  if (!service_id || !location?.lat || !location?.lng) {
    return new Response(
      JSON.stringify({ error: 'Missing service_id or location' }),
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase.rpc('get_nearby_professionals', {
      input_lat: location.lat,
      input_lng: location.lng,
      input_service_id: service_id
    })

    console.log('🔍 RPC data outlined:', data, 'RPC error:', error)

    if (error) {
      console.error('Supabase RPC error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

