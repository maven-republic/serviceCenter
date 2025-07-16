// src/app/api/accounts/[id]/address/route.js
// Fetch customer's registered address for AddressConfirmation component

import { createClient } from '@/utils/supabase/server'

export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { id: accountId } = await params

    if (!accountId) {
      return Response.json({ error: 'Account ID is required' }, { status: 400 })
    }

    console.log('🔍 Fetching address for account ID:', accountId)

    // Query for customer's primary home address
    const { data: address, error } = await supabase
      .from('address')
      .select(`
        address_id,
        account_id,
        address_type,
        is_primary,
        street_address,
        city,
        parish,
        country,
        community,
        landmark,
        is_rural,
        special_instructions,
        formatted_address,
        place_id,
        latitude,
        longitude,
        google_place_data,
        created_at
      `)
      .eq('account_id', accountId)
      .eq('address_type', 'home')  // Look for home address from registration
      .eq('is_primary', true)      // Primary address
      .single()

    if (error) {
      console.error('❌ Error fetching address:', error)
      
      // If no address found, return empty result (not an error)
      if (error.code === 'PGRST116') {
        console.log('📝 No registered address found for account:', accountId)
        return Response.json({ 
          address: null, 
          message: 'No registered address found' 
        }, { status: 200 })
      }
      
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Address found:', {
      address_id: address.address_id,
      address_type: address.address_type,
      is_primary: address.is_primary,
      formatted_address: address.formatted_address
    })

    // Format address for AddressConfirmation component
    const formattedAddress = {
      ...address,
      // Ensure lat/lng are available in multiple formats for compatibility
      lat: address.latitude,
      lng: address.longitude,
      geometry: address.latitude && address.longitude ? {
        location: {
          lat: address.latitude,
          lng: address.longitude
        }
      } : null
    }

    return Response.json({ 
      address: formattedAddress,
      message: 'Address retrieved successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Unexpected error in address fetch:', error)
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}