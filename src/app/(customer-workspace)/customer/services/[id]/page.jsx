'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import AddressConfirmation from '@/components/AddressConfirmation/AddressConfirmation'
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'

export default function ProfessionalCollectionInterface() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const supabase = useSupabaseClient()

  // Local account state instead of importing from layout
  const [account, setAccount] = useState(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const locationFromQuery = lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : null

  // Fetch account data locally
  useEffect(() => {
    const fetchAccount = async () => {
      if (!session?.user?.email) {
        setAccountLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('account')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (error) {
          console.error('Error fetching account:', error)
        } else {
          setAccount(data)
        }
      } catch (err) {
        console.error('Error fetching account:', err)
      } finally {
        setAccountLoading(false)
      }
    }

    fetchAccount()
  }, [session?.user?.email, supabase])

  const fetchNearbyProfessionals = useCallback(async (location) => {
    if (!location) return
    if (!location.lat || !location.lng) return
    if (!serviceId) return

    try {
      setLoading(true)

      console.log('📡 Fetching nearby professionals for location:', location)

      const res = await fetch('/api/professionals/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, location }),
      })

      const data = await res.json()
      console.log('📦 Professionals fetched:', data)

      setProfessionals(data)
    } catch (err) {
      console.error('Error fetching professionals:', err)
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  // Fetch professionals once location is fully ready
  useEffect(() => {
    if (
      locationFromQuery &&
      typeof locationFromQuery.lat === 'number' &&
      typeof locationFromQuery.lng === 'number'
    ) {
      console.log('🔍 Valid location detected:', locationFromQuery)
      fetchNearbyProfessionals(locationFromQuery)
    }
  }, [locationFromQuery?.lat, locationFromQuery?.lng, fetchNearbyProfessionals])

  const handleAddressConfirmed = (address) => {
    console.log('📍 Confirmed address lat/lng:', address)

    const query = new URLSearchParams({
      lat: address.lat,
      lng: address.lng,
    }).toString()

    router.push(`/customer/services/${serviceId}?${query}`)
  }

  // Show loading while account is being fetched
  if (accountLoading) {
    return (
      <div className="container py-5">
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading your account info...</span>
          </div>
          <p className="mt-3">Loading your account info...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {!account ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading your account info...</span>
          </div>
          <p className="mt-3">Loading your account info...</p>
        </div>
      ) : !locationFromQuery ? (
        <AddressConfirmation accountId={account.account_id} onConfirm={handleAddressConfirmed} />
      ) : loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading professionals...</span>
          </div>
          <p className="mt-3">Loading professionals...</p>
        </div>
      ) : professionals.length === 0 ? (
        <NoProfessionalsFound serviceId={serviceId} />
      ) : (
        <div className="row g-4">
          {professionals.map((pro) => (
            <div className="col-md-6 col-lg-4" key={pro.professional_id}>
              <ProfessionalManifest data={pro} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}