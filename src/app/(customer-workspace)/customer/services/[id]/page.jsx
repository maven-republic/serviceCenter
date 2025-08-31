// File: src/app/(customer-workspace)/customer/services/[id]/page.jsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import { useIsMobile } from '@/primitives/use-mobile'

// Import components
import LoadingSkeletons from './components/LoadingSkeletons'
import ViewModeToggle from './components/ViewModeToggle'
import SelectedProfessionalsBar from './components/SelectedProfessionalsBar'
import ProfessionalManifest from '@/components/ProfessionalManifest'
import NoProfessionalsFound from '@/components/NoProfessionalFound/NoProfessionalsFound'
import AppointmentModal from '@/components/modal/AppointmentModal'

// Import UI components
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  CheckCircle,
  MessageSquare,
  Filter,
  ChevronDown,
  X,
  Search,
  MapPin,
  Star,
  DollarSign,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServicePage() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const { user, isLoading: userLoading, fetchUser } = useUserStore()
  
  // Core state
  const [professionals, setProfessionals] = useState([])
  const [filteredProfessionals, setFilteredProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceInformation, setServiceInformation] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(true)
  const [serviceError, setServiceError] = useState(null)

  // UI state
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [locationBased, setLocationBased] = useState(false)

  // Selection state
  const [selectedProfessionals, setSelectedProfessionals] = useState([])
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  // Extract location from URL params for optional location-based filtering
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
    console.log('Appointment created successfully:', appointment)
    setShowAppointmentModal(false)
    setSelectedProfessionals([])
    
    alert(`Success! Your request has been sent to ${selectedProfessionals.length} professional${selectedProfessionals.length !== 1 ? 's' : ''}. You'll receive quotes soon!`)
    router.push('/customer/appointments')
  }, [selectedProfessionals.length, router])

  // Initialize user
  useEffect(() => {
    const initializeUser = async () => {
      if (!user && !userLoading) {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            await fetchUser(session.user, supabase)
          }
        } catch (error) {
          console.error('Error initializing user:', error)
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
        setServiceError(null)
        
        const supabase = createClient()
        
        const { data: service, error } = await supabase
          .from('service')
          .select('service_id, name, description, base_price, duration_minutes')
          .eq('service_id', serviceId)
          .single()

        if (error) {
          console.error('Service fetch error details:', error)
          setServiceError(`Failed to load service: ${error.message || 'Unknown error'}`)
          return
        }

        if (!service) {
          setServiceError('Service not found')
          return
        }

        console.log('Service loaded successfully:', service)
        setServiceInformation(service)
        
      } catch (err) {
        console.error('Service fetch exception:', err)
        setServiceError(`Error loading service: ${err.message}`)
      } finally {
        setServiceLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

  // Fetch all professionals offering this service
  const fetchServiceProfessionals = useCallback(async () => {
    if (!serviceId) return

    try {
      setLoading(true)
      console.log('Fetching all professionals for service:', serviceId)

      // Use the marketplace availability API to get all professionals
      const response = await fetch(`/api/services/${serviceId}/marketplace-availability?start_date=${new Date().toISOString().split('T')[0]}&end_date=${getDateDaysFromNow(30)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Service professionals response:', data)

      // Process the marketplace data to get unique professionals
      const professionalMap = new Map()
      
      if (data.available_slots && Array.isArray(data.available_slots)) {
        data.available_slots.forEach(slot => {
          if (slot.professionals_available && Array.isArray(slot.professionals_available)) {
            slot.professionals_available.forEach(prof => {
              if (!professionalMap.has(prof.professional_id)) {
                professionalMap.set(prof.professional_id, {
                  professional_id: prof.professional_id,
                  name: prof.name || 'Professional',
                  first_name: prof.name ? prof.name.split(' ')[0] : 'Professional',
                  last_name: prof.name ? prof.name.split(' ').slice(1).join(' ') : '',
                  rating: Math.random() * 2 + 4, // Placeholder rating 4-5
                  hourly_rate: Math.floor(Math.random() * 150) + 50, // Placeholder rate $50-200
                  total_reviews: Math.floor(Math.random() * 100) + 5, // Placeholder reviews
                  verification_status: 'verified',
                  response_time: Math.floor(Math.random() * 24) + 1, // 1-24 hours
                  availability_slots: 0,
                  min_notice_hours: prof.min_notice_hours || 1,
                  buffer_minutes: prof.buffer_minutes || 15
                })
              }
              
              // Count available slots for this professional
              const professional = professionalMap.get(prof.professional_id)
              professional.availability_slots++
            })
          }
        })
      }

      const allProfessionals = Array.from(professionalMap.values())
      console.log('Processed professionals:', allProfessionals)
      
      setProfessionals(allProfessionals)
      setFilteredProfessionals(allProfessionals)
      
    } catch (err) {
      console.error('Error fetching service professionals:', err)
      setProfessionals([])
      setFilteredProfessionals([])
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  // Load professionals when service ID is available
  useEffect(() => {
    if (serviceId && serviceInformation) {
      fetchServiceProfessionals()
    }
  }, [serviceId, serviceInformation, fetchServiceProfessionals])

  // Filter and sort professionals
  useEffect(() => {
    let filtered = [...professionals]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(prof => 
        (prof.first_name?.toLowerCase() || '').includes(query) ||
        (prof.last_name?.toLowerCase() || '').includes(query) ||
        (prof.name?.toLowerCase() || '').includes(query)
      )
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(prof => (prof.rating || 0) >= ratingFilter)
    }

    // Apply price range filter
    filtered = filtered.filter(prof => {
      const rate = prof.hourly_rate || 0
      return rate >= priceRange.min && rate <= priceRange.max
    })

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'price_low':
        filtered.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0))
        break
      case 'price_high':
        filtered.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0))
        break
      case 'availability':
        filtered.sort((a, b) => (b.availability_slots || 0) - (a.availability_slots || 0))
        break
      case 'response_time':
        filtered.sort((a, b) => (a.response_time || 24) - (b.response_time || 24))
        break
      default:
        // Keep original order
        break
    }

    setFilteredProfessionals(filtered)
  }, [professionals, searchQuery, ratingFilter, priceRange, sortBy])

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setRatingFilter(0)
    setPriceRange({ min: 0, max: 10000 })
    setSortBy('rating')
  }

  // Helper function to get date days from now
  function getDateDaysFromNow(days) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Show loading while user is initializing
  if (userLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <LoadingSkeletons type="user" />
      </div>
    )
  }

  // Show service error
  if (serviceError) {
    return (
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Alert variant="destructive">
          <AlertDescription>{serviceError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show service loading
  if (serviceLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <LoadingSkeletons type="service" />
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-4 relative">
      
      {/* Service Header */}
      {serviceInformation && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{serviceInformation.name}</h1>
            {serviceInformation.description && (
              <p className="text-muted-foreground mb-4">{serviceInformation.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {serviceInformation.base_price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>From ${serviceInformation.base_price}</span>
                </div>
              )}
             
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeletons type="professionals" viewMode={viewMode} isMobile={isMobile} />
      ) : professionals.length === 0 ? (
        <div className="max-w-2xl mx-auto py-4 sm:py-0">
          <NoProfessionalsFound serviceId={serviceId} />
        </div>
      ) : (
        <div className={cn(
          "space-y-4 sm:space-y-6",
          selectedProfessionals.length > 0 ? "pb-20 sm:pb-24" : "pb-4 sm:pb-0"
        )}>
          
         

          {/* Search and Filter Bar */}
            <CardContent className="p-4">
              <div className="space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search professionals by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

              </div>
            </CardContent>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {filteredProfessionals.length} of {professionals.length} professional{professionals.length !== 1 ? 's' : ''}
                  {searchQuery && <span className="text-primary"> matching "{searchQuery}"</span>}
                </span>
              </div>
              
              {selectedProfessionals.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span>{selectedProfessionals.length} selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Professionals Grid */}
          {filteredProfessionals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No professionals found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={handleResetFilters} variant="outline">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {filteredProfessionals.map((professional) => (
                <ProfessionalManifest 
                  key={professional.professional_id}
                  data={professional} 
                  serviceInformation={serviceInformation}
                  isSelected={isProfessionalSelected(professional.professional_id)}
                  onToggleSelection={handleProfessionalToggle}
                  selectionMode={true}
                  viewMode={viewMode}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fixed Bottom Bar */}
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
        location={locationFromQuery} // Optional location if provided
        onSuccess={handleAppointmentSuccess}
        isMobile={isMobile}
      />
    </div>
  )
}