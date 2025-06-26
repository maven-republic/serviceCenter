'use client'

import React, { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import ServiceInformation from '../section/ServiceInformation'

const serviceColors = [
  'bg-info-subtle text-info',
  'bg-success-subtle text-success',
  'bg-warning-subtle text-warning',
  'bg-danger-subtle text-danger',
  'bg-primary-subtle text-primary',
  'bg-secondary-subtle text-secondary'
]

export default function ProfessionalServices() {
  const { user } = useUserStore()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.account?.account_id) return setIsLoading(false)

      try {
        // Get professional ID
        const { data: profData, error: profError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', user.account.account_id)
          .single()

        if (profError || !profData) {
          throw new Error('Professional profile not found')
        }

        console.log('Professional ID:', profData.professional_id)

        // ✅ Method 1: Simple query without nested relationships
        const { data: professionalServices, error: servicesError } = await supabase
          .from('professional_service')
          .select('service_id, custom_price, custom_duration_minutes')
          .eq('professional_id', profData.professional_id)
          .eq('is_active', true)

        if (servicesError) {
          console.error('Professional services query error:', servicesError)
          throw new Error('Failed to fetch professional services')
        }

        if (!professionalServices || professionalServices.length === 0) {
          setServices([])
          return
        }

        console.log('Professional services:', professionalServices)

        // ✅ Get service IDs
        const serviceIds = professionalServices.map(ps => ps.service_id)

        // ✅ Fetch service details separately
        const { data: serviceDetails, error: serviceDetailsError } = await supabase
          .from('service')
          .select(`
            service_id,
            name,
            description,
            portfolio_id
          `)
          .in('service_id', serviceIds)

        if (serviceDetailsError) {
          console.error('Service details query error:', serviceDetailsError)
          throw new Error('Failed to fetch service details')
        }

        console.log('Service details:', serviceDetails)

        // ✅ Get unique portfolio IDs
        const portfolioIds = [...new Set(serviceDetails.map(s => s.portfolio_id).filter(Boolean))]

        // ✅ Fetch portfolio details separately
        const { data: portfolioDetails, error: portfolioDetailsError } = await supabase
          .from('portfolio')
          .select(`
            portfolio_id,
            name,
            vertical_id
          `)
          .in('portfolio_id', portfolioIds)

        if (portfolioDetailsError) {
          console.error('Portfolio details query error:', portfolioDetailsError)
        }

        console.log('Portfolio details:', portfolioDetails)

        // ✅ Get unique vertical IDs
        const verticalIds = [...new Set((portfolioDetails || []).map(p => p.vertical_id).filter(Boolean))]

        // ✅ Fetch vertical details separately
        const { data: verticalDetails, error: verticalDetailsError } = await supabase
          .from('vertical')
          .select(`
            vertical_id,
            name
          `)
          .in('vertical_id', verticalIds)

        if (verticalDetailsError) {
          console.error('Vertical details query error:', verticalDetailsError)
        }

        console.log('Vertical details:', verticalDetails)

        // ✅ Combine all data
        const formatted = professionalServices.map(ps => {
          const serviceDetail = serviceDetails.find(sd => sd.service_id === ps.service_id)
          const portfolioDetail = portfolioDetails?.find(pd => pd.portfolio_id === serviceDetail?.portfolio_id)
          const verticalDetail = verticalDetails?.find(vd => vd.vertical_id === portfolioDetail?.vertical_id)

          return {
            service_id: ps.service_id,
            name: serviceDetail?.name || 'Unknown Service',
            description: serviceDetail?.description || '',
            vertical: verticalDetail?.name || 'Unknown Vertical',
            portfolio: portfolioDetail?.name || 'Unknown Portfolio',
            customPrice: ps.custom_price,
            customDuration: ps.custom_duration_minutes
          }
        })

        setServices(formatted)
        console.log('✅ Services loaded:', formatted)

      } catch (err) {
        setError(err.message)
        console.error('❌ Error fetching services:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [user?.account?.account_id, supabase])

  const Header = (
    <div className="d-flex justify-content-between align-items-center bdrb1 pb15 mb25">
      <h5 className="list-title mb-0">Professional Services</h5>
      <button
        className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: '36px', height: '36px' }}
        onClick={() => setShowModal(true)}
        aria-label="Add or Manage Services"
      >
        <i className="fa fa-plus fs-5"></i>
      </button>
    </div>
  )

  return (
    <>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        {Header}

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading services...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error loading services: {error}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-tools text-muted mb-3" style={{ fontSize: '48px' }}></i>
            <h6 className="text-muted">No Services Added Yet</h6>
            <p className="text-muted small mb-3">
              Add services to showcase your professional expertise
            </p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {services.map((service, i) => (
    <div key={service.service_id} className="col-6 col-md-4 col-lg-3">
      <div className="card border-0 h-100">
        <div className="card-body p-3">
          
          {/* 🎯 PRIMARY: Service Name (Most Important) */}
          <h6 className="card-title fw-bold text-dark mb-2 lh-sm">
            {service.name}
          </h6>
          
          {/* 🎯 SECONDARY: Vertical (Business Context) */}
          <div className="mb-2">
            <span className="badge bg-primary-subtle text-primary px-2 py-1 fw-semibold rounded-pill">
              <i className="fas fa-layer-group me-1" style={{ fontSize: '0.75rem' }}></i>
              {service.vertical}
            </span>
          </div>
          
          {/* 🎯 TERTIARY: Portfolio (Specific Category) */}
          <div className="mb-3">
            <small className="text-muted fw-medium d-block">
              <i className="fas fa-folder-open me-1"></i>
              {service.portfolio}
            </small>
          </div>
          
          {/* 🎯 SUPPORTING: Service Details */}
          <div className="d-flex flex-column gap-1 mt-auto">
            {service.customPrice && (
              <div className="small text-success fw-semibold">
                <i className="fas fa-dollar-sign me-1"></i>
                J$ {service.customPrice.toFixed(2)}
              </div>
            )}
            {service.customDuration && (
              <div className="small text-info">
                <i className="fas fa-clock me-1"></i>
                {service.customDuration} min
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  ))}                                                                                                                                                                                    
</div>
        )}
      </div>

      {/* Service modal using ServiceInformation */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Manage Services</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)} 
                />
              </div>
              <div className="modal-body">
                <ServiceInformation />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}