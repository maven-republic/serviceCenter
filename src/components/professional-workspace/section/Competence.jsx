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
        const { data: profData, error: profError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', user.account.account_id)
          .single()

        if (profError || !profData) throw profError

        const { data: servicesData, error: servicesError } = await supabase
          .from('professional_service')
          .select(`
            service_id,
            custom_price,
            custom_duration_minutes,
            service:service_id (
              name,
              description,
              subcategory_id,
              service_subcategory:subcategory_id (
                name,
                category_id,
                category:category_id (
                  name
                )
              )
            )
          `)
          .eq('professional_id', profData.professional_id)
          .eq('is_active', true)

        if (servicesError) throw servicesError

        const formatted = servicesData.map(s => ({
          name: s.service.name,
          description: s.service.description,
          category: s.service.service_subcategory.category.name,
          subcategory: s.service.service_subcategory.name,
          customPrice: s.custom_price,
          customDuration: s.custom_duration_minutes
        }))

        setServices(formatted)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching services:', err)
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
          <p>Loading services...</p>
        ) : error ? (
          <p className="text-danger">Error loading services: {error}</p>
        ) : (
          <div className="row g-3">
            {services.map((service, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <div className="d-flex flex-column align-items-start gap-1">
                  <span className={`badge ${serviceColors[i % serviceColors.length]} rounded-pill px-3 py-2`}>
                    {service.name}
                  </span>
                  <small>
                    <span className="badge bg-light text-muted border rounded-pill px-2 py-1 fw-normal">
                      {service.category}
                    </span>
                  </small>
                  {service.customPrice && (
                    <div className="small text-muted">J$ {service.customPrice.toFixed(2)}</div>
                  )}
                  {service.customDuration && (
                    <div className="small text-muted">{service.customDuration} min</div>
                  )}
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
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
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

