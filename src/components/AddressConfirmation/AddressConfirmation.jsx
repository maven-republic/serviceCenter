'use client'

import { useEffect, useState, useRef } from 'react'
import Address from '@/components/Address/Address'
import { createClient } from '@/utils/supabase/client'
import useSearchStore from '@/store/searchStore'
import { Edit2 } from 'lucide-react'

export default function AddressConfirmation({ accountId, onConfirm }) {
  const [initialAddress, setInitialAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [addressError, setAddressError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const { setConfirmedAddress } = useSearchStore()
  const supabase = createClient()
  const addressRef = useRef(null)

  // Add this line after setConfirmedAddress(parsedAddress)
console.log('🔍 Verifying storage - confirmed address in store:', useSearchStore.getState().confirmedAddress)

  useEffect(() => {
    async function fetchPrimaryAddress() {
      if (!accountId) return

      setLoadingAddress(true)
      const { data, error } = await supabase
        .from('address')
        .select('*')
        .eq('account_id', accountId)
        .eq('is_primary', true)
        .single()

      if (error) {
        console.error('Failed to fetch primary address:', error)
        setAddressError('Failed to load your address. Please enter it manually.')
      } else if (data) {
        console.log('✅ Primary address loaded:', data)
        setInitialAddress(data.formatted_address)
      } else {
        console.log('⚠️ No primary address found.')
        setAddressError('No saved address found. Please enter your address.')
      }

      setLoadingAddress(false)
    }

    fetchPrimaryAddress()
  }, [accountId])

  const handleSelect = (place) => {
    console.log('🗺️ Address selected from Google Places:', place)
    
    // Parse Google Place into standard format
    const parseGooglePlace = (place) => {
      const components = place.address_components || []
      const geometry = place.geometry?.location
      
      let street_number = ''
      let route = ''
      let locality = ''
      let parish = ''
      let country = ''

      components.forEach(component => {
        const types = component.types
        if (types.includes('street_number')) {
          street_number = component.long_name
        } else if (types.includes('route')) {
          route = component.long_name
        } else if (types.includes('locality')) {
          locality = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          parish = component.long_name
        } else if (types.includes('country')) {
          country = component.long_name
        }
      })

      // Jamaica parishes for matching
      const JAMAICA_PARISHES = [
        'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 'Manchester',
        'St. Elizabeth', 'Westmoreland', 'Hanover', 'St. James', 'Trelawny',
        'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'
      ]

      const matchedParish = JAMAICA_PARISHES.find(p => 
        parish.toLowerCase().includes(p.toLowerCase()) || 
        p.toLowerCase().includes(parish.toLowerCase())
      )

      return {
        street_address: `${street_number} ${route}`.trim() || '',
        city: locality || '',
        parish: matchedParish || parish || '',
        community: '',
        landmark: '',
        is_rural: false,
        latitude: geometry?.lat?.() || null,
        longitude: geometry?.lng?.() || null,
        formatted_address: place.formatted_address || '',
        place_id: place.place_id || null,
        google_place_data: place
      }
    }
    
    const parsedAddress = parseGooglePlace(place)
    console.log('📍 Parsed address data:', parsedAddress)
    
    // Store the full address in searchStore
    setConfirmedAddress(parsedAddress)
    
    // Extract coordinates for URL
    const lat = place.geometry?.location?.lat?.()
    const lng = place.geometry?.location?.lng?.()
    
    if (typeof lat === 'number' && typeof lng === 'number') {
      // Call parent's onConfirm with coordinates (for URL)
      onConfirm({ lat, lng })
    } else {
      console.error('Invalid location data:', place)
      setAddressError('Unable to determine latitude and longitude for this address.')
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    // focus the address input if possible
    addressRef.current?.focus()
  }

  return (
    <div className="container py-5">
      <h2 className="h4 mb-4 text-center">
        Confirm or Edit Your Service Address
      </h2>

      {loadingAddress ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading your address...</p>
        </div>
      ) : (
        <>
          {addressError && (
            <div className="alert alert-warning text-center" role="alert">
              {addressError}
            </div>
          )}

          <div className="row justify-content-center">
            <div className="col-md-8 position-relative">
              <Address
                ref={addressRef}
                onSelect={handleSelect}
                defaultValue={initialAddress}
                disabled={!isEditing}
              />
              {!isEditing && (
                <button
                  type="button"
                  className="position-absolute top-50 end-0 translate-middle-y me-3 bg-white border-0"
                  onClick={handleEditClick}
                  aria-label="Edit address"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              This address will be used to find professionals near you and will be pre-filled in your booking requests.
            </small>
          </div>
        </>
      )}
    </div>
  )
}