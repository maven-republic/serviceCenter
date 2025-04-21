'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

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
  }, [scriptLoaded])

  return (
    <>
      {/* Load Google Maps script here (client-side only) */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAak7S3z7NSzQ8g1bbBFpJZSbIqv-nMb-w&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="mb25 form-floating">
        <input
          ref={inputRef}
          type="text"
          id="addressInput"
          placeholder="Enter your address"
          className="form-control has-value"
        />
        <label htmlFor="addressInput" className="form-label fw500 dark-color">Address</label>
      </div>
    </>
  )
}
