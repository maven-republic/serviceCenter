'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Home, Edit3, Check, Loader2, AlertCircle, User, LogIn } from 'lucide-react'
import Address from '@/components/Address/Address'
import Link from 'next/link'

const ADDRESS_MODES = {
  LOADING: 'loading',
  USE_REGISTERED: 'use-registered',
  EDIT_ADDRESS: 'edit-address',
  NO_AUTH: 'no-auth'
}

export default function AddressConfirmation({ 
  onLocationConfirmed,
  accountId = null,
  className = "" 
}) {
  const [state, setState] = useState({
    isLoading: false,
    registeredAddress: null,
    selectedAddress: null,
    addressMode: ADDRESS_MODES.LOADING,
    error: null,
    isConfirming: false
  })

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Fetch registered address
  useEffect(() => {
    const fetchRegisteredAddress = async () => {
      if (!accountId) {
        updateState({ addressMode: ADDRESS_MODES.NO_AUTH })
        return
      }

      try {
        updateState({ isLoading: true, error: null })
        
        const endpoints = [
          `/api/accounts/${accountId}/address`,
          `/api/customers/${accountId}/address`
        ]
        
        let response
        for (const endpoint of endpoints) {
          response = await fetch(endpoint)
          if (response.ok) break
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch address: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.address?.formatted_address) {
          updateState({
            registeredAddress: data.address,
            selectedAddress: data.address,
            addressMode: ADDRESS_MODES.USE_REGISTERED
          })
        } else {
          updateState({ addressMode: ADDRESS_MODES.EDIT_ADDRESS })
        }
        
      } catch (error) {
        updateState({
          error: `Failed to load your address: ${error.message}`,
          addressMode: ADDRESS_MODES.EDIT_ADDRESS
        })
      } finally {
        updateState({ isLoading: false })
      }
    }

    fetchRegisteredAddress()
  }, [accountId])

  const formatAddress = (place) => {
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
    
    return {
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
  }

  const handleAddressSelect = (place) => {
    try {
      const formattedAddress = formatAddress(place)
      updateState({ selectedAddress: formattedAddress, error: null })
    } catch (error) {
      updateState({ error: 'Error processing the selected address. Please try again.' })
    }
  }

  const handleUseRegisteredAddress = () => {
    if (state.registeredAddress) {
      updateState({
        selectedAddress: state.registeredAddress,
        addressMode: ADDRESS_MODES.USE_REGISTERED,
        error: null
      })
    }
  }

  const handleEditAddress = () => {
    updateState({
      selectedAddress: null,
      addressMode: ADDRESS_MODES.EDIT_ADDRESS,
      error: null
    })
  }

  const handleConfirmLocation = async () => {
    if (!state.selectedAddress) {
      updateState({ error: 'Please select or enter an address first' })
      return
    }

    try {
      updateState({ isConfirming: true, error: null })
      
      const finalAddress = { ...state.selectedAddress }
      
      // Ensure coordinates are properly formatted
      if (state.selectedAddress.geometry?.location) {
        if (typeof state.selectedAddress.geometry.location.lat === 'function') {
          finalAddress.lat = state.selectedAddress.geometry.location.lat()
          finalAddress.lng = state.selectedAddress.geometry.location.lng()
        } else {
          finalAddress.lat = state.selectedAddress.geometry.location.lat
          finalAddress.lng = state.selectedAddress.geometry.location.lng
        }
      } else if (state.selectedAddress.latitude && state.selectedAddress.longitude) {
        finalAddress.lat = state.selectedAddress.latitude
        finalAddress.lng = state.selectedAddress.longitude
      }
      
      if (!finalAddress.lat || !finalAddress.lng) {
        throw new Error('Selected address is missing valid coordinates')
      }
      
      onLocationConfirmed?.(finalAddress)
      
    } catch (error) {
      updateState({ error: `Failed to confirm location: ${error.message}` })
    } finally {
      updateState({ isConfirming: false })
    }
  }

  const LoadingView = () => (
    <Card className={`${className} border shadow-none`}>
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

  const LoginRequiredView = () => (
    <Card className={`${className} border shadow-none`}>
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
      </CardContent>
    </Card>
  )

  const RegisteredAddressSection = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Your registered address
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
              {state.registeredAddress.formatted_address}
            </p>
            {state.registeredAddress.special_instructions && (
              <p className="text-green-600 text-xs mt-1 italic">
                Note: {state.registeredAddress.special_instructions}
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
  )

  const AddressEditSection = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          {state.registeredAddress ? 'Different Service Location' : 'Enter Service Address'}
        </h3>
        <p className="text-blue-700 text-sm">
          {state.registeredAddress 
            ? 'Enter the address where the service will be provided:'
            : 'Start typing your address in Jamaica and select from suggestions:'
          }
        </p>
      </div>

      <Address
        onSelect={handleAddressSelect}
        placeholder="Enter service address in Jamaica..."
        defaultValue={state.selectedAddress?.formatted_address || ''}
      />

      {state.registeredAddress && (
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
  )

  const SelectedAddressPreview = () => {
    if (!state.selectedAddress) return null

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Selected Service Location
        </h4>
        <p className="text-gray-700 text-sm">
          {state.selectedAddress.formatted_address}
        </p>
        {state.selectedAddress.lat && state.selectedAddress.lng && (
          <p className="text-gray-500 text-xs mt-1">
            {/* Coordinates: {state.selectedAddress.lat.toFixed(6)}, {state.selectedAddress.lng.toFixed(6)} */}
          </p>
        )}
      </div>
    )
  }

  if (state.isLoading) return <LoadingView />
  if (state.addressMode === ADDRESS_MODES.NO_AUTH) return <LoginRequiredView />

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Confirm Service Location
        </CardTitle>
        
        
      </CardHeader>

      <CardContent className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.addressMode === ADDRESS_MODES.USE_REGISTERED && state.registeredAddress && (
          <RegisteredAddressSection />
        )}

        {state.addressMode === ADDRESS_MODES.EDIT_ADDRESS && (
          <AddressEditSection />
        )}

        <SelectedAddressPreview />

        <Button
          onClick={handleConfirmLocation}
          disabled={!state.selectedAddress || state.isConfirming}
          className="w-full"
          size="lg"
        >
          {state.isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Confirming Location...
            </>
          ) : state.selectedAddress ? (
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