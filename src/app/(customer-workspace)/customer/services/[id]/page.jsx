// File: src/app/(customer-workspace)/customer/services/[id]/page.jsx
// 📄 SIMPLIFIED SERVICE PAGE - Now using broken-down components

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import { useIsMobile } from '@/primitives/use-mobile'

// Import our new broken-down components
import LocationSelector from './components/LocationSelector'
import SelectedProfessionalsBar from './components/SelectedProfessionalsBar'
import LoadingSkeletons from './components/LoadingSkeletons'
import ViewModeToggle from './components/ViewModeToggle'

// Import existing components we're still using
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'
import AppointmentModal from '@/components/modal/AppointmentModal'

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  Loader2,
  CheckCircle,
  MessageSquare,
  Filter,
  ChevronDown,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServicePage() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  // USE USERSTORE INSTEAD OF DIRECT SESSION CALLS
  const { user, isLoading: userLoading, fetchUser } = useUserStore()
  
  // Core state - simplified to essentials
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceInformation, setServiceInformation] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(true)

  // UI state
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)

  // Selection state
  const [selectedProfessionals, setSelectedProfessionals] = useState([])
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  // Extract location from URL params
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
    setSelectedProfessionals([])
    
    alert(`Success! Your request has been sent to ${selectedProfessionals.length} professional${selectedProfessionals.length !== 1 ? 's' : ''}. You'll receive quotes soon!`)
    router.push('/customer/appointments')
  }, [selectedProfessionals.length, router])

  // Handle address confirmation
  const handleAddressConfirmed = useCallback((address) => {
    console.log('📍 Confirmed address lat/lng:', address)
    const query = new URLSearchParams({
      lat: address.lat || address.latitude,
      lng: address.lng || address.longitude,
    }).toString()
    router.push(`/customer/services/${serviceId}?${query}`)
  }, [serviceId, router])

  // Sort professionals based on selected criteria
  const sortedProfessionals = useCallback(() => {
    const sorted = [...professionals]
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'price':
        return sorted.sort((a, b) => (a.base_price || 0) - (b.base_price || 0))
      case 'distance':
      default:
        return sorted.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
    }
  }, [professionals, sortBy])

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
          console.error('⚠ Error initializing user:', error)
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
            friendly_name,
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
      console.log('📍 Valid location detected:', locationFromQuery)
      fetchNearbyProfessionals(locationFromQuery)
    }
  }, [locationFromQuery?.lat, locationFromQuery?.lng, fetchNearbyProfessionals])

  // Show loading while userStore is initializing
  if (userLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <LoadingSkeletons type="user" />
      </div>
    )
  }

  // EXTRACT ACCOUNT ID FROM USERSTORE
  const accountId = user?.account?.account_id || null
  const isLoggedIn = !!user && !!accountId

  console.log('🔍 SERVICE PAGE DEBUG:', {
    serviceId,
    locationFromQuery,
    hasLocation: !!locationFromQuery,
    showingAddressConfirmation: !locationFromQuery,
    user: user ? { email: user.email, accountId } : null,
    isLoggedIn,
    serviceInformation,
    isMobile,
    viewMode
  })

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 relative">
      
      {/* Show LocationSelector if no location provided */}
      {!locationFromQuery ? (
        <LocationSelector
          serviceId={serviceId}
          accountId={accountId}
          onLocationConfirmed={handleAddressConfirmed}
        />
      ) : loading ? (
        // Show loading state while fetching professionals
        <LoadingSkeletons type="professionals" viewMode={viewMode} isMobile={isMobile} />
      ) : professionals.length === 0 ? (
        // Show no professionals found
        <div className="max-w-2xl mx-auto py-4 sm:py-0">
          <NoProfessionalsFound serviceId={serviceId} />
        </div>
      ) : (
        // Show professionals section
        <div className={cn(
          "space-y-4 sm:space-y-6",
          selectedProfessionals.length > 0 ? "pb-20 sm:pb-24" : "pb-4 sm:pb-0"
        )}>
          {/* Instructions */}
          <Alert className="border-l-4 border-l-primary">
            <MessageSquare className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Select professionals</strong> to request quotes from. You can choose multiple professionals and compare their offers.
              {selectedProfessionals.length > 0 && (
                <span className="ml-2 text-primary font-medium">
                  ({selectedProfessionals.length} selected)
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Mobile Filter Bar */}
          {isMobile && (
            <>
              <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Sort
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      showFilters && "rotate-180"
                    )} />
                  </Button>
                  
                  <ViewModeToggle 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {professionals.length} found
                </div>
              </div>

              {/* Mobile Sort Options */}
              <div className={cn(
                "overflow-hidden transition-all duration-200",
                showFilters ? "max-h-40 mb-4" : "max-h-0"
              )}>
                <Card className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sort by</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {[
                      { value: 'distance', label: 'Distance' },
                      { value: 'rating', label: 'Rating' },
                      { value: 'price', label: 'Price' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setSortBy(option.value)
                          setShowFilters(false)
                        }}
                        className="w-full justify-start"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Desktop Results Header & Filters */}
          {!isMobile && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Available Professionals</h2>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{professionals.length} professional{professionals.length !== 1 ? 's' : ''} found</span>
                  </div>
                  
                  {selectedProfessionals.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>{selectedProfessionals.length} selected</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-input rounded-md px-3 py-1.5 bg-background"
                  >
                    <option value="distance">Sort by Distance</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="price">Sort by Price</option>
                  </select>
                  
                  <ViewModeToggle 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>
            </>
          )}

          {/* Professionals Grid */}
          <div className={cn(
            "grid gap-4 sm:gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {sortedProfessionals().map((professional) => (
              <ProfessionalManifest 
                key={professional.professional_id}
                data={professional} 
                serviceInformation={serviceInformation || { 
                  name: serviceInformation?.friendly_name || serviceInformation?.name || 'Loading...', 
                  service_id: serviceId 
                }}
                isSelected={isProfessionalSelected(professional.professional_id)}
                onToggleSelection={handleProfessionalToggle}
                selectionMode={true}
                viewMode={viewMode}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar - Using our new component! */}
      <SelectedProfessionalsBar
        selectedProfessionals={selectedProfessionals}
        onRequestQuotes={() => setShowAppointmentModal(true)}
        isMobile={isMobile}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        variant="marketplace"
        selectedProfessionals={selectedProfessionals}
        serviceInformation={serviceInformation}
        location={locationFromQuery}
        onSuccess={handleAppointmentSuccess}
        isMobile={isMobile}
      />
    </div>
  )
}