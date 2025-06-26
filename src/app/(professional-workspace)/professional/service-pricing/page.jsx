// src/app/(professional-workspace)/professional/service-pricing/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import ProfessionalServiceQuantification from '@/components/professional-workspace/section/professional-computation/ProfessionalServiceQuantification'

export default function ServicePricingPage() {
  const { user } = useUserStore()
  const [professionalId, setProfessionalId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfessionalId = async () => {
      if (!user?.account?.account_id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/professionals/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: user.account.account_id })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch professional profile')
        }

        const data = await response.json()
        if (data.success && data.professional_id) {
          setProfessionalId(data.professional_id)
        } else {
          throw new Error('Professional profile not found')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching professional ID:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfessionalId()
  }, [user?.account?.account_id])

  if (isLoading) {
    return (
      <div className="dashboard__content">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h6 className="text-muted">Loading pricing interface...</h6>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard__content">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!professionalId) {
    return (
      <div className="dashboard__content">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-user-times me-2"></i>
              <strong>Professional Profile Required:</strong> Please complete your professional profile to access pricing features.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard__content hover-bgc-color">
      {/* Page Header */}
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Advanced Service Valuation</h2>
            <p className="text para">
              Configure intelligent pricing for your services using sophisticated financial models including Monte Carlo simulations and Black-Scholes algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        <div className="col-12">
          <ProfessionalServiceQuantification professionalId={professionalId} />
        </div>
      </div>
    </div>
  )
}