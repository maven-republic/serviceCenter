'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  Loader2
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import AddressConfirmation from '@/components/AddressConfirmation/AddressConfirmation'
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'

export default function ProfessionalCollectionInterface() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize Supabase client
  const supabase = createClient()

  // Session and account state
  const [session, setSession] = useState(null)
  const [account, setAccount] = useState(null)
  const [accountLoading, setAccountLoading] = useState(true)
  
  // Professional and service state
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceInformation, setServiceInformation] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(true)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const locationFromQuery = lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : null

  // Get session and account data
  useEffect(() => {
    const getSessionAndAccount = async () => {
      try {
        setAccountLoading(true)
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setAccountLoading(false)
          return
        }
        
        setSession(session)
        
        // If no session, still allow browsing but without account
        if (!session?.user?.email) {
          console.log('No session found - allowing anonymous browsing')
          setAccountLoading(false)
          return
        }

        // Get account data
        const { data: accountData, error: accountError } = await supabase
          .from('account')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (accountError) {
          console.error('Error fetching account:', accountError)
          // Don't block if account fetch fails
        } else {
          setAccount(accountData)
        }
      } catch (err) {
        console.error('Error in session/account fetch:', err)
      } finally {
        setAccountLoading(false)
      }
    }

    getSessionAndAccount()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
   (event, session) => {
     // Only handle significant auth changes, ignore token refreshes
     if (event !== 'TOKEN_REFRESHED') {
       console.log('Auth state changed:', event, session?.user?.email)
       setSession(session)
       if (!session) {
         setAccount(null)
       }
     }
   }
 )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return

      try {
        setServiceLoading(true)
        
        const { data: service, error } = await supabase
          .from('service')
          .select(`
            service_id,
            name,
            description,
            base_price,
            duration_minutes,
            portfolio:portfolio_id (
              name,
              vertical:vertical_id (
                name,
                industry:industry_id (
                  name
                )
              )
            )
          `)
          .eq('service_id', serviceId)
          .single()

        if (error) {
          console.error('Error fetching service:', error)
        } else {
          setServiceInformation(service)
        }
      } catch (err) {
        console.error('Error fetching service:', err)
      } finally {
        setServiceLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

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

  // Fetch professionals once location is ready
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

  // Debug logging
  useEffect(() => {
    console.log('🔍 DEBUG SESSION:', {
      session: session,
      user: session?.user,
      email: session?.user?.email,
      accountLoading: accountLoading,
      account: account
    })
  }, [session, accountLoading, account])

  // Loading skeleton components
  const ServiceHeaderSkeleton = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const ProfessionalsGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Show loading while checking session/account
  if (accountLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4">
      
      {/* Service Header */}


      {/* Main Content */}
      {!locationFromQuery ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Choose Service Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressConfirmation 
                accountId={account?.account_id || null} 
                onConfirm={handleAddressConfirmed} 
              />
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Professionals</h2>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading professionals...</span>
            </div>
          </div>
          <ProfessionalsGridSkeleton />
        </div>
      ) : professionals.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <NoProfessionalsFound serviceId={serviceId} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Available Professionals
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{professionals.length} professional{professionals.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>

          {/* Professionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <ProfessionalManifest 
                key={pro.professional_id}
                data={pro} 
                serviceInformation={serviceInformation || { 
                  name: 'Loading...', 
                  service_id: serviceId 
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}





