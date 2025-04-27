'use client'

import { useEffect, useState } from 'react'
import Address from '@/components/Address/Address'
import { createClient } from '../../../utils/supabase/client'

export default function AddressConfirmation({ accountId, onConfirm }) {
  const [initialAddress, setInitialAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [addressError, setAddressError] = useState(null)

  const supabase = createClient()

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

  const handleSelect = (addressData) => {
    // Extract numeric latitude and longitude from Google PlaceResult
    const lat = addressData.geometry?.location?.lat?.()
    const lng = addressData.geometry?.location?.lng?.()
    if (typeof lat === 'number' && typeof lng === 'number') {
      onConfirm({ lat, lng })
    } else {
      console.error('Invalid location data:', addressData)
      setAddressError('Unable to determine latitude and longitude for this address.')
    }
  }

  return (
    <div className="container py-5">
      <h2 className="h4 mb-4 text-center">Confirm Your Service Address</h2>

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
            <div className="col-md-8">
              <Address onSelect={handleSelect} defaultValue={initialAddress} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
