'use client'

import { useEffect, useState, useRef } from 'react'
import Address from '@/components/Address/Address'
import { createClient } from '@/utils/supabase/client'
import { Edit2 } from 'lucide-react'

export default function AddressConfirmation({ accountId, onConfirm }) {
  const [initialAddress, setInitialAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [addressError, setAddressError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const supabase = createClient()
  const addressRef = useRef(null)

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
    const lat = addressData.geometry?.location?.lat?.()
    const lng = addressData.geometry?.location?.lng?.()
    if (typeof lat === 'number' && typeof lng === 'number') {
      onConfirm({ lat, lng })
    } else {
      console.error('Invalid location data:', addressData)
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
        </>
      )}
    </div>
  )
}

