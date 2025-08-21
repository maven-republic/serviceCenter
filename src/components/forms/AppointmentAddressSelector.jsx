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
  AlertCircle,
  Navigation,
  Map,
  ChevronRight,
  X,
  RotateCcw
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
  const [isMobile, setIsMobile] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Reset to search mode
  const resetToSearch = useCallback(() => {
    setSelectedMode('search')
    setShowManualForm(false)
    setHasGoogleSelection(false)
    setErrors({})
    setAddressData({
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
  }, [])

  // Mobile Search Summary Component
  const MobileSearchSummary = () => {
    if (!hasGoogleSelection || !addressData.street_address) return null

    return (
      <Card className="mt-4 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-green-800 text-sm">
                Address Found
              </div>
              <div className="text-green-700 text-sm mt-1 leading-relaxed">
                {addressData.street_address}
                {addressData.city && <><br />{addressData.city}, {addressData.parish}</>}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualForm(true)}
                  className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToSearch}
                  className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Search Again
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mobile Manual Form Modal
  const MobileManualForm = () => (
    <div className={cn(
      "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out",
      showManualForm ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0">
          <div>
            <h3 className="font-semibold text-lg">Enter Address Manually</h3>
            <p className="text-sm text-muted-foreground">Fill in your address details</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowManualForm(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="street_address_mobile">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="street_address_mobile"
              value={addressData.street_address}
              onChange={(e) => handleManualChange('street_address', e.target.value)}
              placeholder="123 Main Street"
              className={cn(
                "h-12",
                errors.street_address && "border-destructive"
              )}
            />
            {errors.street_address && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.street_address}
              </p>
            )}
          </div>

          {/* City and Parish */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city_mobile">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city_mobile"
                value={addressData.city}
                onChange={(e) => handleManualChange('city', e.target.value)}
                placeholder="Kingston"
                className={cn(
                  "h-12",
                  errors.city && "border-destructive"
                )}
              />
              {errors.city && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parish_mobile">
                Parish <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={addressData.parish} 
                onValueChange={(value) => handleManualChange('parish', value)}
              >
                <SelectTrigger className={cn(
                  "h-12",
                  errors.parish && "border-destructive"
                )}>
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
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.parish}
                </p>
              )}
            </div>
          </div>

          {/* Community and Landmark */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="community_mobile">Community</Label>
              <Input
                id="community_mobile"
                value={addressData.community}
                onChange={(e) => handleManualChange('community', e.target.value)}
                placeholder="Community name (optional)"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark_mobile">Landmark</Label>
              <Input
                id="landmark_mobile"
                value={addressData.landmark}
                onChange={(e) => handleManualChange('landmark', e.target.value)}
                placeholder="Near landmark (optional)"
                className="h-12"
              />
            </div>
          </div>

          {/* Rural Location Checkbox */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <Checkbox
              id="is_rural_mobile"
              checked={addressData.is_rural}
              onCheckedChange={(checked) => handleManualChange('is_rural', checked)}
            />
            <Label 
              htmlFor="is_rural_mobile" 
              className="text-sm font-normal cursor-pointer"
            >
              This is a rural location
            </Label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManualForm(false)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (validateManualForm()) {
                  setShowManualForm(false)
                }
              }}
              className="flex-1 h-12"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
        
        {/* Mode Toggle */}
        <div className="space-y-3">
          <Label className={`font-medium ${isMobile ? 'text-base' : 'text-base'}`}>Service Location</Label>
          
          {isMobile ? (
            // Mobile: Simple toggle buttons
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                type="button"
                variant={selectedMode === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMode('search')}
                className="flex-1 gap-2 h-10"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant={selectedMode === 'manual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMode('manual')}
                className="flex-1 gap-2 h-10"
              >
                <Edit3 className="h-4 w-4" />
                Manual
              </Button>
            </div>
          ) : (
            // Desktop: Same as before
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
          )}
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
                  className={isMobile ? 'h-12' : ''}
                />
              </div>
              {isMobile && (
                <p className="text-xs text-muted-foreground">
                  Tap the search box and start typing your address
                </p>
              )}
            </div>

            {/* Mobile Search Summary */}
            {isMobile && <MobileSearchSummary />}

            {/* Desktop Success State */}
            {!isMobile && hasGoogleSelection && addressData.street_address && (
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
            {isMobile ? (
              // Mobile: Show button to open modal
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManualForm(true)}
                  className="w-full h-12 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    <span>Enter Address Manually</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Show current manual address if exists */}
                {addressData.street_address && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">{addressData.street_address}</div>
                        {(addressData.city || addressData.parish) && (
                          <div className="text-muted-foreground">
                            {addressData.city}, {addressData.parish}
                          </div>
                        )}
                        {addressData.community && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {addressData.community}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedMode('search')}
                  className="p-0 h-auto gap-2 text-sm"
                >
                  <Search className="h-3 w-3" />
                  Switch to search
                </Button>
              </div>
            ) : (
              // Desktop: Show full form inline
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

                {/* Rural Location Checkbox */}
                <div className="md:col-span-2">
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
                </div>

                {/* Mode Switch Link */}
                <div className="md:col-span-2 pt-2">
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
          </div>
        )}

        {/* Address Summary */}
        {(hasGoogleSelection || addressData.street_address) && !isMobile && (
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

      {/* Mobile Manual Form Modal */}
      {isMobile && <MobileManualForm />}
    </Card>
  )
}