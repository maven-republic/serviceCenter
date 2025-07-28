'use client'

import { useEffect, useRef, useState, forwardRef } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MapPin, Loader2 } from 'lucide-react'

const libraries = ['places']

const Address = forwardRef(({ 
  onSelect, 
  defaultValue = '', 
  disabled = false,
  className = '',
  placeholder = "Search for a location..." 
}, ref) => {
  const inputRef = useRef(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [value, setValue] = useState(defaultValue || '') // Ensure never null
  const [isLoading, setIsLoading] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete && !disabled) {
      try {
        console.log('🗺️ Initializing Google Places Autocomplete (legacy)')
        
        const auto = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'jm' }, // Restrict to Jamaica
        })

        auto.addListener('place_changed', () => {
          setIsLoading(true)
          const place = auto.getPlace()
          
          console.log('📍 Place selected:', place)
          
          if (place && place.geometry && place.geometry.location) {
            setValue(place.formatted_address || place.name || '')
            onSelect?.(place)
            console.log('✅ Valid place selected with coordinates')
          } else {
            console.warn('Selected place has no geometry:', place)
          }
          setIsLoading(false)
        })
        
        setAutocomplete(auto)
        console.log('✅ Google Places Autocomplete initialized')
      } catch (error) {
        console.error('Error initializing Google Places:', error)
      }
    }
  }, [isLoaded, disabled, autocomplete, onSelect])

  // Update value when defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  // Expose focus method via ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref({
          focus: () => inputRef.current?.focus(),
          blur: () => inputRef.current?.blur(),
          value: value
        })
      } else if (ref.current !== undefined) {
        ref.current = {
          focus: () => inputRef.current?.focus(),
          blur: () => inputRef.current?.blur(),
          value: value
        }
      }
    }
  }, [ref, value])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setValue(newValue)
    console.log('📝 Input value changed:', newValue)
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 p-3 border border-destructive rounded-md bg-destructive/5">
        <MapPin className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          Failed to load address search. Please check your connection.
        </span>
      </div>
    )
  }

  console.log('🎨 Address component rendering:', {
    isLoaded,
    disabled,
    value,
    placeholder,
    hasAutocomplete: !!autocomplete
  })

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={!isLoaded ? "Loading address search..." : placeholder}
          value={value}
          onChange={handleInputChange}
          disabled={disabled || !isLoaded}
          className={cn(
            "pl-10 pr-10",
            disabled && "bg-muted text-muted-foreground cursor-not-allowed",
            !isLoaded && "bg-muted",
            className
          )}
        />
        
        {(isLoading || !isLoaded) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>LOADING MAPS........</span>
          </div>
        </div>
      )}
    </div>
  )
})

Address.displayName = 'Address'

export default Address