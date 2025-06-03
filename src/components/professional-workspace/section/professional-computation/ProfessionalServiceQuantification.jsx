// Location: src/components/professional-workspace/section/professional-computation/ProfessionalServiceQuantification.jsx
'use client'
import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'

import AddServiceQuantificationModal from "./AddServiceQuantificationModal"
import ServiceQuantificationConfiguration from "./ServiceQuantificationConfiguration"


export default function ProfessionalServiceQuantification() {
  const { user } = useUserStore()
  const [services, setServices] = useState([])
  const [availableServices, setAvailableServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = useSupabaseClient()

  // Use your existing API endpoints
  const fetchProfessionalServices = async () => {
    try {
      const response = await fetch('/api/quantification/professional-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'fetch',
          account_id: user.account.account_id 
        })
      })
      
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      console.error('Error fetching professional services:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch('/api/quantification/attributes', {
        method: 'GET'
      })
      
      if (!response.ok) throw new Error('Failed to fetch available services')
      const data = await response.json()
      setAvailableServices(data.services || [])
    } catch (err) {
      console.error('Error fetching available services:', err)
    }
  }

  useEffect(() => {
    if (user?.account?.account_id) {
      fetchProfessionalServices()
      fetchAvailableServices()
    }
  }, [user])

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30">
      <div className="d-flex justify-content-between align-items-center bdrb1 pb15 mb25">
        <h5 className="list-title mb-0">Service Quantification Management</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fa fa-plus me-2"></i>
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading quantification data...</span>
          </div>
        </div>
      ) : (
        <>
          {services.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-calculator fa-3x text-muted mb-3"></i>
              <h6 className="text-muted">No services quantified yet</h6>
              <p className="text-muted mb-4">Start by adding services with custom quantification parameters.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            <div className="row">
              {services.map((service) => (
                <ServiceQuantificationConfiguration
                  key={service.professional_service_id}
                  service={service}
                  onUpdate={fetchProfessionalServices}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showAddForm && (
        <AddServiceQuantificationModal
          availableServices={availableServices}
          existingServices={services}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            fetchProfessionalServices()
          }}
        />
      )}
    </div>
  )
}