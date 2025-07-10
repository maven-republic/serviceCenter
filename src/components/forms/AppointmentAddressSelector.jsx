'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Edit3, 
  MapPin, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react'
import Address from '@/components/Address/Address'
import { cn } from '@/lib/utils'

// Jamaica parishes for dropdown
const JAMAICA_PARISHES = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 'Manchester',
  'St. Elizabeth', 'Westmoreland', 'Hanover', 'St. James', 'Trelawny',
  'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'
]

// Helper function to extract address components from Google Place
const parseGooglePlace = (place) => {
  const components = place.address_components || []
  const geometry = place.geometry?.location
  
  let street_number = ''
  let route = ''
  let locality = ''
  let parish = ''

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
    }
  })

  // Try to match parish with Jamaica parishes
  const matchedParish = JAMAICA_PARISHES.find(p => 
    parish.toLowerCase().includes(p.toLowerCase()) || 
    p.toLowerCase().includes(parish.toLowerCase())
  )

  return {
    street_address: `${street_number} ${route}`.trim() || '',
    city: locality || '',
    parish: matchedParish || parish || '',
    community: '',
    landmark: '',
    is_rural: false,
    latitude: geometry?.lat?.() || null,
    longitude: geometry?.lng?.() || null,
    formatted_address: place.formatted_address || '',
    place_id: place.place_id || null,
    google_place_data: place
  }
}

export default function AppointmentAddressSelector({ 
  onAddressSelect, 
  currentAddress = null,
  className = ''
}) {
  const [selectedMode, setSelectedMode] = useState('search')
  const [addressData, setAddressData] = useState(currentAddress || {
    street_address: '',
    city: '',
    parish: '',
    community: '',
    landmark: '',
    is_rural: false,
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: null
  })
  const [errors, setErrors] = useState({})
  const [hasGoogleSelection, setHasGoogleSelection] = useState(false)

  // Update local state when currentAddress prop changes
  useEffect(() => {
    if (currentAddress) {
      setAddressData(currentAddress)
      if (currentAddress.place_id) {
        setHasGoogleSelection(true)
        setSelectedMode('search')
      }
    }
  }, [currentAddress])

  // Handle Google Places selection
  const handlePlaceSelect = useCallback((place) => {
    console.log('🗺️ Google Place selected:', place)
    
    const parsedAddress = parseGooglePlace(place)
    setAddressData(parsedAddress)
    setHasGoogleSelection(true)
    setErrors({})
    
    onAddressSelect?.(parsedAddress)
  }, [onAddressSelect])

  // Handle manual form changes
  const handleManualChange = useCallback((field, value) => {
    const newAddressData = {
      ...addressData,
      [field]: value
    }
    setAddressData(newAddressData)
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }

    onAddressSelect?.({
      ...newAddressData,
      latitude: null,
      longitude: null,
      place_id: null,
      formatted_address: `${newAddressData.street_address}, ${newAddressData.city}, ${newAddressData.parish}`.replace(/^,\s*|,\s*$/g, '')
    })
  }, [addressData, errors, onAddressSelect])

  // Validate manual form
  const validateManualForm = useCallback(() => {
    const newErrors = {}
    if (!addressData.street_address.trim()) {
      newErrors.street_address = 'Street address is required'
    }
    if (!addressData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!addressData.parish.trim()) {
      newErrors.parish = 'Parish is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [addressData])

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-6 space-y-6">
        
        {/* Mode Toggle */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Service Location</Label>
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              type="button"
              variant={selectedMode === 'search' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMode('search')}
              className="flex-1 gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              type="button"
              variant={selectedMode === 'manual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMode('manual')}
              className="flex-1 gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Manual
            </Button>
          </div>
        </div>

        {/* Search Mode */}
        {selectedMode === 'search' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address-search">Search for address in Jamaica</Label>
              <div className="relative">
                <Address
                  onSelect={handlePlaceSelect}
                  defaultValue={addressData.formatted_address}
                  placeholder="Start typing your address..."
                />
              </div>
            </div>

            {hasGoogleSelection && addressData.street_address && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="space-y-2">
                  <div className="font-medium text-green-800">
                    Address Selected
                  </div>
                  <div className="text-green-700">
                    {addressData.street_address}, {addressData.city}, {addressData.parish}
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setSelectedMode('manual')}
                    className="p-0 h-auto text-green-700 hover:text-green-800"
                  >
                    Edit details →
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {selectedMode === 'manual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Street Address */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street_address">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="street_address"
                  value={addressData.street_address}
                  onChange={(e) => handleManualChange('street_address', e.target.value)}
                  placeholder="123 Main Street"
                  className={cn(errors.street_address && "border-destructive")}
                />
                {errors.street_address && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.street_address}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={addressData.city}
                  onChange={(e) => handleManualChange('city', e.target.value)}
                  placeholder="Kingston"
                  className={cn(errors.city && "border-destructive")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Parish */}
              <div className="space-y-2">
                <Label htmlFor="parish">
                  Parish <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={addressData.parish} 
                  onValueChange={(value) => handleManualChange('parish', value)}
                >
                  <SelectTrigger className={cn(errors.parish && "border-destructive")}>
                    <SelectValue placeholder="Select Parish" />
                  </SelectTrigger>
                  <SelectContent>
                    {JAMAICA_PARISHES.map(parish => (
                      <SelectItem key={parish} value={parish}>
                        {parish}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parish && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.parish}
                  </p>
                )}
              </div>

              {/* Community */}
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={addressData.community}
                  onChange={(e) => handleManualChange('community', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={addressData.landmark}
                  onChange={(e) => handleManualChange('landmark', e.target.value)}
                  placeholder="Near landmark (optional)"
                />
              </div>
            </div>

            {/* Rural Location Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_rural"
                checked={addressData.is_rural}
                onCheckedChange={(checked) => handleManualChange('is_rural', checked)}
              />
              <Label 
                htmlFor="is_rural" 
                className="text-sm font-normal cursor-pointer"
              >
                This is a rural location
              </Label>
            </div>

            {/* Mode Switch Link */}
            <div className="pt-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setSelectedMode('search')}
                className="p-0 h-auto gap-2"
              >
                <Search className="h-3 w-3" />
                Switch to search
              </Button>
            </div>
          </div>
        )}

        {/* Address Summary */}
        {(hasGoogleSelection || addressData.street_address) && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Selected Address:</p>
                <p className="text-sm text-muted-foreground">
                  {addressData.street_address}
                  {addressData.city && `, ${addressData.city}`}
                  {addressData.parish && `, ${addressData.parish}`}
                </p>
                {addressData.community && (
                  <Badge variant="secondary" className="text-xs">
                    {addressData.community}
                  </Badge>
                )}
                {addressData.is_rural && (
                  <Badge variant="outline" className="text-xs">
                    Rural Location
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}