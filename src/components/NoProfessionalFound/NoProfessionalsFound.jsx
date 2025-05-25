'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function NoProfessionalsFound({ serviceId }) {
  const router = useRouter()

  return (
    <div className="d-flex align-items-center justify-content-center flex-column" style={{ minHeight: '400px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem' }}>📭</div>
      <h2 className="h3 mt-3" style={{ color: '#222222' }}>No Professionals Nearby</h2>
      <p className="mt-2" style={{ color: '#6b7177' }}>
        We have not found any professionals in your area.<br />
        Please adjust your location.
      </p>
      <button
        onClick={() => router.push(`/customer/services/${serviceId}`)}
        className="btn btn-primary mt-4 px-4 py-2"
        style={{ borderRadius: '8px' }}
      >
        Change Address
      </button>
    </div>
  )
}

