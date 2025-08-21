// Enhanced Mobile Responsive Service Page
// File: src/app/(customer-workspace)/customer/services/[id]/page.jsx

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
  MessageSquare,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  X
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import AddressConfirmation from '@/components/AddressConfirmation/AddressConfirmation'
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'
import AppointmentModal from '@/components/modal/AppointmentModal'
import { useIsMobile } from '@/primitives/use-mobile'
import { cn } from '@/lib/utils'

export default function ProfessionalCollectionInterface() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  // USE USERSTORE INSTEAD OF DIRECT SESSION CALLS
  const { user, isLoading: userLoading, fetchUser } = useUserStore()
  
  // Professional and service state
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceInformation, setServiceInformation] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(true)

  // Mobile UI state
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('distance') // 'distance', 'rating', 'price'

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

  const handleAddressConfirmed = (address) => {
    console.log('📍 Confirmed address lat/lng:', address)
    const query = new URLSearchParams({
      lat: address.lat || address.latitude,
      lng: address.lng || address.longitude,
    }).toString()
    router.push(`/customer/services/${serviceId}?${query}`)
  }

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

  // Mobile-optimized loading skeleton
  const ServiceHeaderSkeleton = () => (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-sm" />
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
              <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
              <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const ProfessionalsGridSkeleton = () => (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      viewMode === 'grid' 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    )}>
      {[...Array(isMobile ? 3 : 6)].map((_, i) => (
        <Card key={i} className={cn(
          "overflow-hidden",
          viewMode === 'grid' ? "h-72 sm:h-80" : "h-32 sm:h-40"
        )}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className={cn(
              "flex gap-3",
              viewMode === 'list' ? "items-center" : "flex-col sm:flex-row sm:items-center"
            )}>
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              </div>
              {viewMode === 'list' && (
                <Skeleton className="h-8 w-16 sm:w-20 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          {viewMode === 'grid' && (
            <CardContent className="space-y-2 sm:space-y-3">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                <Skeleton className="h-8 w-16 sm:w-20" />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )

  // Mobile Filter/Sort Bar
  const MobileFilterBar = () => (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg mb-4 sm:hidden">
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
        
        <div className="flex rounded-md border overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-2 rounded-none border-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-2 rounded-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {professionals.length} found
      </div>
    </div>
  )

  // Mobile Sort Options
  const MobileSortOptions = () => (
    <div className={cn(
      "overflow-hidden transition-all duration-200 sm:hidden",
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
  )

  // Desktop Filter Bar
  const DesktopFilterBar = () => (
    <div className="hidden sm:flex items-center justify-between gap-4 mb-6">
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
        
        <div className="flex rounded-md border overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3 rounded-none border-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-3 rounded-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Show loading while userStore is initializing
  if (userLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading your account...</p>
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
    serviceInformation,
    isMobile,
    viewMode
  })

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 relative">
      
      {/* Main Content */}
      {!locationFromQuery ? (
        <div className="max-w-2xl mx-auto py-4 sm:py-0">
          {/* DEBUG INFO */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs sm:text-sm">
              <h3 className="font-bold text-yellow-800">🔍 Debug Info:</h3>
              <ul className="text-yellow-700 mt-2 space-y-1">
                <li>Service ID: {serviceId}</li>
                <li>Location from URL: {locationFromQuery ? 'Found' : 'Missing'}</li>
                <li>User Email: {user?.email || 'No user'}</li>
                <li>Account ID: {accountId || 'No account'}</li>
                <li>Is Mobile: {isMobile ? 'YES' : 'NO'}</li>
              </ul>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                Choose Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AddressConfirmation 
                accountId={accountId} 
                onLocationConfirmed={handleAddressConfirmed} 
              />
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <div className="space-y-3 py-4 sm:py-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Available Professionals</h2>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                Loading professionals...
              </span>
            </div>
          </div>
          <ProfessionalsGridSkeleton />
        </div>
      ) : professionals.length === 0 ? (
        <div className="max-w-2xl mx-auto py-4 sm:py-0">
          <NoProfessionalsFound serviceId={serviceId} />
        </div>
      ) : (
        <div className={cn(
          "space-y-4 sm:space-y-6",
          selectedProfessionals.length > 0 ? "pb-20 sm:pb-24" : "pb-4 sm:pb-0"
        )}>
          {/* Instructions */}
          <Alert className="border-l-4 border-l-primary">
            <MessageSquare className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Select professionals</strong> to request quotes from. You can choose multiple professionals and compare their offers.
            </AlertDescription>
          </Alert>

          {/* Mobile Filter Bar */}
          <MobileFilterBar />
          <MobileSortOptions />

          {/* Desktop Results Header */}
          <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Available Professionals</h2>
          </div>

          {/* Desktop Filter Bar */}
          <DesktopFilterBar />

          {/* Professionals Grid */}
          <div className={cn(
            "grid gap-4 sm:gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {sortedProfessionals().map((pro) => (
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
                viewMode={viewMode}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Fixed Bottom Bar - Request Quotes Button */}
      {selectedProfessionals.length > 0 && (
        <div className={cn(
          "fixed bottom-0 bg-background/95 backdrop-blur-sm border-t shadow-lg p-3 sm:p-4 z-40",
          // Adjust positioning based on sidebar state and screen size
          "left-0 right-0",
          // Lower z-index to not interfere with sidebar (which is z-50)
          "lg:left-0" // Always full width on mobile, adjust on desktop if needed
        )}>
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  {selectedProfessionals.length} professional{selectedProfessionals.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <Button 
                size={isMobile ? "default" : "lg"}
                onClick={() => setShowAppointmentModal(true)}
                className="gap-2 px-4 sm:px-8 h-11 sm:h-12 text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden xs:inline">Request Quotes from </span>
                <span className="xs:hidden">Request from </span>
                {selectedProfessionals.length} 
                <span className="hidden sm:inline">
                  Professional{selectedProfessionals.length !== 1 ? 's' : ''}
                </span>
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
        isMobile={isMobile}
      />
    </div>
  )
}