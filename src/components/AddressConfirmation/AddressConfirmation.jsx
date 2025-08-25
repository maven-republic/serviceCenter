'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Home, Edit3, Check, Loader2, AlertCircle, User, LogIn } from 'lucide-react'
import Address from '@/components/Address/Address'
import Link from 'next/link'

export default function AddressConfirmation({ 
  onLocationConfirmed,
  accountId = null,
  className = "" 
}) {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [registeredAddress, setRegisteredAddress] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addressMode, setAddressMode] = useState('loading') // 'loading', 'use-registered', 'edit-address', 'no-auth'
  const [error, setError] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('🏠 AddressConfirmation State:', {
      accountId,
      addressMode,
      hasRegisteredAddress: !!registeredAddress,
      hasSelectedAddress: !!selectedAddress,
      isLoading,
      error
    })
  }, [accountId, addressMode, registeredAddress, selectedAddress, isLoading, error])

  // Fetch customer's registered address on mount
  useEffect(() => {
    const fetchRegisteredAddress = async () => {
      // REQUIRE LOGIN - No guest mode
      if (!accountId) {
        console.log('❌ No account ID - user must be logged in')
        setAddressMode('no-auth')
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log('🔍 Fetching registered address for account:', accountId)
        
        // Try accounts endpoint first
        let response = await fetch(`/api/accounts/${accountId}/address`)
        
        console.log('📡 API Response status:', response.status)
        
        if (!response.ok) {
          console.log('🔄 First endpoint failed, trying customers endpoint as fallback')
          response = await fetch(`/api/customers/${accountId}/address`)
          console.log('📡 Fallback API Response status:', response.status)
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch address: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('📍 Address API response data:', data)
        
        if (data.address && data.address.formatted_address) {
          setRegisteredAddress(data.address)
          setSelectedAddress(data.address)
          setAddressMode('use-registered')
          console.log('✅ Registered address loaded successfully:', data.address.formatted_address)
        } else {
          console.log('📝 No registered address found - switching to edit mode')
          setAddressMode('edit-address')
        }
        
      } catch (error) {
        console.error('❌ Error fetching registered address:', error)
        setError(`Failed to load your address: ${error.message}`)
        setAddressMode('edit-address')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegisteredAddress()
  }, [accountId])

  // Handle address selection from Google Places
  const handleAddressSelect = (place) => {
    console.log('📍 Google Places address selected:', place)
    
    try {
      // Extract coordinates
      let lat, lng
      
      if (place.geometry?.location) {
        if (typeof place.geometry.location.lat === 'function') {
          lat = place.geometry.location.lat()
          lng = place.geometry.location.lng()
        } else {
          lat = place.geometry.location.lat
          lng = place.geometry.location.lng
        }
      }
      
      const formattedAddress = {
        formatted_address: place.formatted_address,
        place_id: place.place_id,
        latitude: lat,
        longitude: lng,
        lat: lat,
        lng: lng,
        geometry: place.geometry,
        address_components: place.address_components,
        google_place_data: place
      }
      
      setSelectedAddress(formattedAddress)
      setError(null)
      console.log('✅ Address formatted and stored:', formattedAddress)
      
    } catch (error) {
      console.error('❌ Error processing selected address:', error)
      setError('Error processing the selected address. Please try again.')
    }
  }

  // Switch to using registered address
  const handleUseRegisteredAddress = () => {
    if (registeredAddress) {
      setSelectedAddress(registeredAddress)
      setAddressMode('use-registered')
      setError(null)
      console.log('✅ Switched to using registered address')
    }
  }

  // Switch to editing/entering address
  const handleEditAddress = () => {
    setSelectedAddress(null)
    setAddressMode('edit-address')
    setError(null)
    console.log('📝 Switched to address editing mode')
  }

  // Confirm the selected location
  const handleConfirmLocation = async () => {
    if (!selectedAddress) {
      setError('Please select or enter an address first')
      return
    }

    try {
      setIsConfirming(true)
      setError(null)
      
      // Ensure coordinates are properly formatted
      let finalAddress = { ...selectedAddress }
      
      // Handle different coordinate formats
      if (selectedAddress.geometry?.location) {
        // Google Places format
        if (typeof selectedAddress.geometry.location.lat === 'function') {
          finalAddress.lat = selectedAddress.geometry.location.lat()
          finalAddress.lng = selectedAddress.geometry.location.lng()
        } else {
          finalAddress.lat = selectedAddress.geometry.location.lat
          finalAddress.lng = selectedAddress.geometry.location.lng
        }
      } else if (selectedAddress.latitude && selectedAddress.longitude) {
        // Database format
        finalAddress.lat = selectedAddress.latitude
        finalAddress.lng = selectedAddress.longitude
      }
      
      // Validate coordinates
      if (!finalAddress.lat || !finalAddress.lng) {
        throw new Error('Selected address is missing valid coordinates')
      }
      
      console.log('✅ Final confirmed address:', {
        formatted_address: finalAddress.formatted_address,
        lat: finalAddress.lat,
        lng: finalAddress.lng
      })
      
      // Send to parent component
      if (onLocationConfirmed) {
        onLocationConfirmed(finalAddress)
      }
      
    } catch (error) {
      console.error('❌ Error confirming location:', error)
      setError(`Failed to confirm location: ${error.message}`)
    } finally {
      setIsConfirming(false)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Loading Your Address...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Fetching your registered address...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render login required state
  if (addressMode === 'no-auth') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Login Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              Please log in to your account to continue with service booking.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">
              You need to be logged in to request quotes from professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/register/customer">
                  <User className="h-4 w-4 mr-2" />
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        
        
        {/* User status badge */}
        <div className="flex items-center gap-2">
          
          
          {/* {registeredAddress && (
            <Badge variant="outline" className="w-fit">
              <Home className="h-3 w-3 mr-1" />
              Address on File
            </Badge>
          )} */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Registered User - Use Registered Address */}
        {addressMode === 'use-registered' && registeredAddress && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Your registered address
                  </h3>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {registeredAddress.formatted_address}
                  </p>
                  {registeredAddress.special_instructions && (
                    <p className="text-green-600 text-xs mt-1 italic">
                      Note: {registeredAddress.special_instructions}
                    </p>
                  )}
                </div>
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleUseRegisteredAddress}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Use This Address
              </Button>
              
              <Button 
                onClick={handleEditAddress}
                variant="outline"
                className="flex-1"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Use Different Address
              </Button>
            </div>
          </div>
        )}

        {/* Address Editing Mode */}
        {addressMode === 'edit-address' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                {registeredAddress ? 'Different Service Location' : 'Enter Service Address'}
              </h3>
              <p className="text-blue-700 text-sm">
                {registeredAddress 
                  ? 'Enter the address where the service will be provided:'
                  : 'Start typing your address in Jamaica and select from suggestions:'
                }
              </p>
            </div>

            <Address
              onSelect={handleAddressSelect}
              placeholder="Enter service address in Jamaica..."
              defaultValue={selectedAddress?.formatted_address || ''}
            />

            {/* Back to registered address option */}
            {registeredAddress && (
              <Button
                onClick={handleUseRegisteredAddress}
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to my registered address
              </Button>
            )}
          </div>
        )}

        {/* Selected Address Preview */}
        {selectedAddress && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Selected service location
            </h4>
            <p className="text-gray-700 text-sm">
              {selectedAddress.formatted_address}
            </p>
            {selectedAddress.lat && selectedAddress.lng && (
              <p className="text-gray-500 text-xs mt-1">
                Coordinates: {selectedAddress.lat.toFixed(6)}, {selectedAddress.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmLocation}
          disabled={!selectedAddress || isConfirming}
          className="w-full"
          size="lg"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Confirming Location...
            </>
          ) : selectedAddress ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Find Professionals at This Location
            </>
          ) : (
            'Select Address First'
          )}
        </Button>

        
      </CardContent>
    </Card>
  )
}