'use client'

import { useState } from 'react'
import Address from '@/components/Address/Address'

export default function AddressConfirmation({ accountId, onConfirm }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getAddressComponent = (components, type) =>
    components.find((c) => c.types.includes(type))?.long_name || ''

  const handleSelect = async (place) => {
    setError(null)

    if (!place.geometry || !place.geometry.location) {
      console.error('Invalid place geometry:', place)
      setError('Please select a valid location from the dropdown.')
      return
    }

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()

    // Extract address components
    const street_number = getAddressComponent(place.address_components, 'street_number')
    const route = getAddressComponent(place.address_components, 'route')
    const city = getAddressComponent(place.address_components, 'locality')
    const parish = getAddressComponent(place.address_components, 'administrative_area_level_1')
    const street_address = `${street_number} ${route}`.trim()

    // 🧠 Check if the address is specific enough
    const hasStreet = street_number || route
    if (!hasStreet) {
      setError('Please select a more specific address (e.g., with street name or number).')
      return
    }

    if (!city || !parish) {
      setError('Missing address details. Please select a full address from the dropdown.')
      return
    }

    const payload = {
      account_id: accountId,
      address_type: 'service',
      is_primary: false,
      formatted_address: place.formatted_address,
      street_address,
      city,
      parish,
      lat,
      lng,
      google_place_data: {
        place_id: place.place_id,
        formatted_address: place.formatted_address,
        name: place.name || '',
        utc_offset_minutes: place.utc_offset_minutes || null,
        types: place.types || [],
        geometry: { lat, lng },
      },
    }

    try {
      setLoading(true)

      const res = await fetch('/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      console.log('📡 Raw response from /api/address:', text)

      let data
      try {
        data = JSON.parse(text)
      } catch (jsonErr) {
        console.error('🚫 Failed to parse JSON from /api/address:', jsonErr)
        setError('Something went wrong while saving the address.')
        return
      }

      if (!res.ok) {
        console.error('❌ Server error response:', data)
        setError(data?.error || 'Failed to save address')
        return
      }

      if (onConfirm) {
        onConfirm({ lat, lng });
      }
      
    } catch (err) {
      console.error('🔥 Network or server error:', err)
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4">
      <h5>Where do you need the service?</h5>
      <p className="text-muted mb-3">Confirm or change the address where this service will be performed.</p>

      <Address onSelect={handleSelect} />

      {loading && <p className="text-sm text-muted mt-2">Saving address...</p>}
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  )
}
