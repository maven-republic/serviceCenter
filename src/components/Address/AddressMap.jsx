// components/AddressMap.jsx
'use client'

import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '350px'
}

const defaultCenter = { lat: 18.1096, lng: -77.2975 } // Jamaica center

export default function AddressMap({ lat, lng, radius }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })

  if (!isLoaded || !lat || !lng) return null

  const center = { lat: parseFloat(lat), lng: parseFloat(lng) }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      <Marker position={center} />
      <Circle
        center={center}
        radius={parseFloat(radius) * 1000} // km → meters
        options={{
          strokeColor: '#4285F4',
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: '#4285F4',
          fillOpacity: 0.2
        }}
      />
    </GoogleMap>
  )
}

