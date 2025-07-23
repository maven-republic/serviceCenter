// Updated src/app/(customer-workspace)/customer/services/[id]/page.jsx
// FIXED: Use userStore instead of direct session calls

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  Loader2,
  CheckCircle,
  MessageSquare
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore' // USE USERSTORE
import AddressConfirmation from '@/components/AddressConfirmation/AddressConfirmation'
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'
import AppointmentModal from '@/components/modal/AppointmentModal'

export default function ProfessionalCollectionInterface() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // USE USERSTORE INSTEAD OF DIRECT SESSION CALLS
  const { user, isLoading: userLoading, fetchUser } = useUserStore()
  
  // Professional and service state
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceInformation, setServiceInformation] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(true)

  // Multi-select state
  const [selectedProfessionals, setSelectedProfessionals] = useState([])
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const locationFromQuery = lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : null

  // Handle professional selection toggle
  const handleProfessionalToggle = useCallback((professional) => {
    setSelectedProfessionals(prev => {
      const isSelected = prev.find(p => p.professional_id === professional.professional_id)
      if (isSelected) {
        return prev.filter(p => p.professional_id !== professional.professional_id)
      } else {
        return [...prev, professional]
      }
    })
  }, [])

  // Check if professional is selected
  const isProfessionalSelected = useCallback((professionalId) => {
    return selectedProfessionals.some(p => p.professional_id === professionalId)
  }, [selectedProfessionals])

  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointment) => {
    console.log('✅ Appointment created successfully:', appointment)
    setShowAppointmentModal(false)
    setSelectedProfessionals([]) // Clear selection
    
    // Show success message and redirect
    alert(`Success! Your request has been sent to ${selectedProfessionals.length} professional${selectedProfessionals.length !== 1 ? 's' : ''}. You'll receive quotes soon!`)
    
    // Optionally redirect to appointments page
    router.push('/customer/appointments')
  }, [selectedProfessionals.length, router])

  // SIMPLIFIED: Get user data from userStore
  useEffect(() => {
    const initializeUser = async () => {
      if (!user && !userLoading) {
        console.log('🔄 No user in store, attempting to fetch...')
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            await fetchUser(session.user, supabase)
          } else {
            console.log('👤 No session found - user needs to log in')
          }
        } catch (error) {
          console.error('❌ Error initializing user:', error)
        }
      }
    }

    initializeUser()
  }, [user, userLoading, fetchUser])

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return

      try {
        setServiceLoading(true)
        const supabase = createClient()
        
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
    if (!location?.lat || !location?.lng || !serviceId) return

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
    if (locationFromQuery?.lat && locationFromQuery?.lng) {
      console.log('🔍 Valid location detected:', locationFromQuery)
      fetchNearbyProfessionals(locationFromQuery)
    }
  }, [locationFromQuery?.lat, locationFromQuery?.lng, fetchNearbyProfessionals])

  const handleAddressConfirmed = (address) => {
    console.log('📍 Confirmed address lat/lng:', address)
    const query = new URLSearchParams({
      lat: address.lat || address.latitude,
      lng: address.lng || address.longitude,
    }).toString()
    router.push(`/customer/services/${serviceId}?${query}`)
  }

  // Loading skeletons (keeping your existing ones)
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

  // Show loading while userStore is initializing
  if (userLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  // EXTRACT ACCOUNT ID FROM USERSTORE
  const accountId = user?.account?.account_id || null
  const isLoggedIn = !!user && !!accountId

  console.log('🔍 SERVICE PAGE DEBUG:', {
    serviceId,
    locationFromQuery,
    lat,
    lng,
    hasLocation: !!locationFromQuery,
    showingAddressConfirmation: !locationFromQuery,
    user: user ? { email: user.email, accountId } : null,
    isLoggedIn,
    serviceInformation
  })

  return (
    <div className="container max-w-7xl mx-auto px-4 relative">
      
      {/* Main Content */}
      {!locationFromQuery ? (
        <div className="max-w-2xl mx-auto">
       

           
            <CardContent>
                           
              <AddressConfirmation 
                accountId={accountId} 
                onLocationConfirmed={handleAddressConfirmed} 
              />
            </CardContent>
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
        <div className="space-y-6 pb-32">
          {/* Instructions */}
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <strong>Select professionals</strong> to request quotes from. You can choose multiple professionals and compare their offers.
            </AlertDescription>
          </Alert>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Available Professionals</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{professionals.length} professional{professionals.length !== 1 ? 's' : ''} found</span>
              </div>
              {selectedProfessionals.length > 0 && (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span>{selectedProfessionals.length} selected</span>
                </div>
              )}
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
                isSelected={isProfessionalSelected(pro.professional_id)}
                onToggleSelection={handleProfessionalToggle}
                selectionMode={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar - Request Quotes Button */}
      {selectedProfessionals.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
          <div className="container max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>
                  {selectedProfessionals.length} professional{selectedProfessionals.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => setShowAppointmentModal(true)}
                className="gap-2 px-8"
              >
                <MessageSquare className="h-4 w-4" />
                Request Quotes from {selectedProfessionals.length} Professional{selectedProfessionals.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        variant="marketplace"
        selectedProfessionals={selectedProfessionals}
        serviceInformation={serviceInformation}
        location={locationFromQuery}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  )
}