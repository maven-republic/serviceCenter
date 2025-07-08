// src/hooks/useGoogleMaps.js
import { useEffect, useState } from 'react'

export function useGoogleMaps(apiKey) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (window.google) {
      setLoaded(true)
      return
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existingScript) {
      existingScript.onload = () => setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [apiKey])

  return loaded
}

