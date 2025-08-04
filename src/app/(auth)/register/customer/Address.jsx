'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Address({ onSelect }) {
  const inputRef = useRef(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google?.maps) return
    
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'jm' },
      fields: ['place_id', 'geometry', 'formatted_address', 'address_components']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place && place.geometry && onSelect) {
        onSelect(place)
      }
    })
  }, [scriptLoaded, onSelect])

  return (
    <>
      {/* Load Google Maps script here (client-side only) */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAak7S3z7NSzQ8g1bbBFpJZSbIqv-nMb-w&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="space-y-2">
        <Label htmlFor="addressInput" className="text-sm font-medium text-foreground">
          Address
        </Label>
        <Input
          ref={inputRef}
          type="text"
          id="addressInput"
          placeholder="Enter your address"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Start typing your address and select from the suggestions
        </p>
      </div>
    </>
  )
}