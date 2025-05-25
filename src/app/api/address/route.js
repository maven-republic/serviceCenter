// app/api/address/route.js

import { createClient } from '@/utils/supabase/server'

export async function POST(req) {
  const supabase = await createClient()
  const body = await req.json()

  const {
    account_id,
    formatted_address,
    place_id,
    latitude,
    longitude,
    google_place_data,
    street_address,
    city,
    parish,
    community,
    landmark,
    is_rural
  } = body

//   const locationPoint = `SRID=4326;POINT(${longitude} ${latitude})`

  // Step 1: Insert the address
  const { data: addressData, error: addressError } = await supabase
    .from('address')
    .insert([{
      account_id,
      address_type: 'service',
      is_primary: false,
      street_address,
      city,
      parish,
      community,
      landmark,
      is_rural,
      latitude,
      longitude,
      place_id,
      formatted_address,
      google_place_data,
    //   location: locationPoint
    }])
    .select()
    .single()

  if (addressError) {
    console.error('Error inserting address:', addressError)
    return new Response(JSON.stringify({ error: addressError.message }), {
      status: 500
    })
  }

  // Step 2: Insert into contextual_location
  const { data: contextualData, error: contextualError } = await supabase
    .from('contextual_location')
    .insert([{
      account_id,
      address_id: addressData.address_id,
      label: 'request'
    }])
    .select()
    .single()

  if (contextualError) {
    console.error('Error inserting contextual location:', contextualError)
    return new Response(JSON.stringify({ error: contextualError.message }), {
      status: 500
    })
  }

  return new Response(JSON.stringify({ address: addressData, context: contextualData }), {
    status: 201
  })
}
