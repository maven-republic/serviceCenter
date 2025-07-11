'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Edit2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Navigation,
  Home,
  Search,
  MapPinHouse,
  Plus
} from 'lucide-react'
import Address from '@/components/Address/Address'
import { createClient } from '@/utils/supabase/client'
import useSearchStore from '@/store/searchStore'
import { cn } from '@/lib/utils'

export default function AddressConfirmation({ 
  accountId = null, 
  onConfirm, 
  className = '' 
}) {
  const [homeAddress, setHomeAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressOptions, setShowAddressOptions] = useState(false)

  // FIXED: Get the entire store and extract the function safely
  const searchStore = useSearchStore()
  const setConfirmedAddress = searchStore?.setConfirmedAddress

  const supabase = createClient()
  const addressRef = useRef(null)

  // Debug logging
  useEffect(() => {
    console.log('🏠 AddressConfirmation Debug:', {
      accountId,
      loadingAddress,
      isEditing,
      selectedAddress,
      homeAddress,
      showAddressOptions,
      setConfirmedAddressExists: typeof setConfirmedAddress === 'function'
    })
  }, [accountId, loadingAddress, isEditing, selectedAddress, homeAddress, showAddressOptions, setConfirmedAddress])

  useEffect(() => {
    async function fetchHomeAddress() {
      // Always start by showing options if no account ID
      if (!accountId) {
        console.log('No account ID provided - starting in edit mode')
        setLoadingAddress(false)
        setIsEditing(true)
        setShowAddressOptions(false)
        return
      }

      console.log('🔍 Fetching home address for account:', accountId)
      setLoadingAddress(true)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Address fetch timeout - proceeding to edit mode')
        setLoadingAddress(false)
        setIsEditing(true)
        setAddressError('Loading took too long. Please enter your address manually.')
      }, 10000)

      try {
        const { data, error } = await supabase
          .from('address')
          .select('*')
          .eq('account_id', accountId)
          .eq('address_type', 'home')
          .eq('is_primary', true)
          .single()

        clearTimeout(timeoutId)
        console.log('🔍 Home address query result:', { data, error })

        if (error) {
          if (error.code === 'PGRST116') {
            // No home address found - this is unusual for registered users
            console.log('No home address found for registered user')
            setAddressError('No home address found. Please enter your service location.')
            setIsEditing(true)
          } else {
            console.error('Database error fetching home address:', error)
            setAddressError('Unable to load your home address. Please enter your service location.')
            setIsEditing(true)
          }
        } else if (data) {
          console.log('✅ Home address loaded:', data)
          const addressData = {
            formatted_address: data.formatted_address || '',
            street_address: data.street_address || '',
            city: data.city || '',
            parish: data.parish || '',
            latitude: parseFloat(data.latitude) || null,
            longitude: parseFloat(data.longitude) || null,
            place_id: data.place_id || null,
            address_type: 'home'
          }
          
          setHomeAddress(addressData)
          setShowAddressOptions(true) // Show the choice screen
        }
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Unexpected error fetching home address:', err)
        setAddressError('Please enter your service location.')
        setIsEditing(true)
      } finally {
        setLoadingAddress(false)
      }
    }

    fetchHomeAddress()
  }, [accountId, supabase])

  const handleUseHomeAddress = () => {
    if (!homeAddress) return
    
    console.log('🏠 Using home address as service location')
    setSelectedAddress(homeAddress)
    setShowAddressOptions(false)
    
    // FIXED: Store the address in searchStore with error handling
    if (setConfirmedAddress && typeof setConfirmedAddress === 'function') {
      try {
        setConfirmedAddress(homeAddress)
        console.log('🔍 Home address stored as service location')
      } catch (error) {
        console.error('❌ Error storing confirmed address:', error)
      }
    } else {
      console.warn('⚠️ setConfirmedAddress function not available')
    }
  }

  const handleUseDifferentAddress = () => {
    console.log('🗺️ User chose different address')
    setShowAddressOptions(false)
    setIsEditing(true)
    // Focus the address input
    setTimeout(() => {
      addressRef.current?.focus()
    }, 100)
  }

  const handleSelect = (place) => {
    console.log('🗺️ New address selected from Google Places:', place)
    
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

      const lat = geometry?.lat?.() || geometry?.lat || null
      const lng = geometry?.lng?.() || geometry?.lng || null

      return {
        street_address: `${street_number} ${route}`.trim() || '',
        city: locality || '',
        parish: matchedParish || parish || '',
        community: '',
        landmark: '',
        is_rural: false,
        latitude: lat,
        longitude: lng,
        formatted_address: place.formatted_address || '',
        place_id: place.place_id || null,
        google_place_data: place,
        address_type: 'service'
      }
    }
    
    const parsedAddress = parseGooglePlace(place)
    console.log('📍 Parsed service address data:', parsedAddress)
    
    setSelectedAddress(parsedAddress)
    setAddressError(null)
    setIsEditing(false)
    
    // FIXED: Store the full address in searchStore with error handling
    if (setConfirmedAddress && typeof setConfirmedAddress === 'function') {
      try {
        setConfirmedAddress(parsedAddress)
        console.log('🔍 Service address stored in search store')
      } catch (error) {
        console.error('❌ Error storing confirmed address:', error)
      }
    } else {
      console.warn('⚠️ setConfirmedAddress function not available')
    }
  }

  const handleConfirmAddress = () => {
    if (!selectedAddress) {
      setAddressError('Please select an address first.')
      return
    }

    const lat = selectedAddress.latitude
    const lng = selectedAddress.longitude
    
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      console.log('✅ Confirming service address with coordinates:', { lat, lng })
      // Call parent's onConfirm with coordinates (for URL)
      onConfirm({ lat, lng })
    } else {
      console.warn('❌ Invalid coordinates:', { lat, lng })
      setAddressError('Please select a valid address from the dropdown suggestions to get location coordinates.')
      setIsEditing(true)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setAddressError(null)
    // Focus the address input if possible
    setTimeout(() => {
      addressRef.current?.focus()
    }, 100)
  }

  const handleBackToOptions = () => {
    setIsEditing(false)
    setSelectedAddress(null)
    setShowAddressOptions(true)
    setAddressError(null)
  }

  // Loading state
  if (loadingAddress) {
    return (
      <Card className={cn("max-w-2xl mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 className=" w-5 animate-spin text-primary" />
            <CardTitle className="text-xl">Loading Your Address</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Confirm Service Location</h2>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          This address will be used to find professionals near you and will be pre-filled in your booking requests.
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          
          {/* Error Alert */}
          {addressError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{addressError}</AlertDescription>
            </Alert>
          )}

          {/* Address Choice Screen */}
          {showAddressOptions && homeAddress && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Where do you need the service?</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your service location below
                </p>
              </div>

              {/* Home Address Option */}
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Use my home address</h4>
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mb-2">
                        {homeAddress.formatted_address}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {homeAddress.city && (
                          <Badge variant="outline" className="text-xs">
                            <MapPinHouse className="h-3 w-3 mr-1" />
                            {homeAddress.city}
                          </Badge>
                        )}
                        {homeAddress.parish && (
                          <Badge variant="outline" className="text-xs">
                            <Navigation className="h-3 w-3 mr-1" />
                            {homeAddress.parish}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={handleUseHomeAddress}
                      className="flex-shrink-0"
                    >
                      Use This Address
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Different Address Option */}
              <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                        <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Use a different address</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter a different location for this service
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleUseDifferentAddress}
                      className="flex-shrink-0"
                    >
                      Enter Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Address Input Section */}
          {(isEditing || (!showAddressOptions && !selectedAddress)) && (
            <div className="space-y-4">
              <div className="relative">
                <Address
                  ref={addressRef}
                  onSelect={handleSelect}
                  placeholder="Enter your service address in Jamaica..."
                  className="pr-12"
                />
              </div>

              {/* Editing Mode Instructions */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Start typing your service address</p>
                  <p>We'll show suggestions as you type. Select one to get precise location coordinates.</p>
                </div>
              </div>

              {/* Back to options (if applicable) */}
              {homeAddress && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToOptions}
                    className="text-sm"
                  >
                    ← Back to address options
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Selected Address Display */}
          {selectedAddress && !isEditing && !showAddressOptions && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="space-y-2">
                  <div className="font-medium text-green-800 dark:text-green-200">
                    Service Location Confirmed
                  </div>
                  <div className="text-green-700 dark:text-green-300 space-y-1">
                    <div className="font-medium">
                      {selectedAddress.formatted_address}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAddress.address_type === 'home' && (
                        <Badge variant="secondary" className="text-xs">
                          <Home className="h-3 w-3 mr-1" />
                          Home Address
                        </Badge>
                      )}
                      {selectedAddress.city && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPinHouse className="h-3 w-3 mr-1" />
                          {selectedAddress.city}
                        </Badge>
                      )}
                      {selectedAddress.parish && (
                        <Badge variant="secondary" className="text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          {selectedAddress.parish}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Action Buttons */}
          {!showAddressOptions && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              {selectedAddress && !isEditing && (
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="flex-1 gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Change Address
                </Button>
              )}
              
              <Button
                onClick={handleConfirmAddress}
                disabled={!selectedAddress || isEditing}
                className="flex-1 gap-2"
                size="lg"
              >
                <CheckCircle className="h-4 w-4" />
                {selectedAddress && !isEditing ? 'Find Professionals' : 'Select Address First'}
              </Button>
            </div>
          )}

          {/* Help Text */}
          {!showAddressOptions && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                We'll show you professionals who can service this location
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}