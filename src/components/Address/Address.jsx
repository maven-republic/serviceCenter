'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'

const libraries = ['places']

export default function Address({ onSelect }) {
  const inputRef = useRef(null)
  const [autocomplete, setAutocomplete] = useState(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      const auto = new window.google.maps.places.Autocomplete(inputRef.current)
      auto.addListener('place_changed', () => {
        const place = auto.getPlace()
        if (!place || !place.geometry || !place.geometry.location) return
        onSelect(place)
      })
      setAutocomplete(auto)
    }
  }, [isLoaded, inputRef, autocomplete, onSelect])

  return (
    <input
      ref={inputRef}
      className="form-control"
      placeholder="Search for a location"
      type="text"
    />
  )
}
