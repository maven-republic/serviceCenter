'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function ProfessionalServices() {
  const { user } = useUserStore()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
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
              subcategory:subcategory_id (
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
          category: s.service.subcategory.category.name,
          subcategory: s.service.subcategory.name,
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

  if (isLoading) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Professional Services</h5>
        </div>
        <p>Loading services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Professional Services</h5>
        </div>
        <p>Error loading services: {error}</p>
      </div>
    )
  }

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Professional Services</h5>
      </div>
      <div className="col-lg-12">
        {services.length === 0 ? (
          <p>No services have been added yet.</p>
        ) : (
          <div className="row">
            {services.map((service, i) => (
              <div key={i} className="col-md-6 mb20">
                <div className="border p15 bdrs4">
                  <h5 className="mb10">{service.name}</h5>
                  <p className="text-muted mb10">{service.description}</p>
                  {service.customPrice && (
                    <div className="d-flex justify-content-between">
                      <span className="fw500">Custom Price:</span>
                      <span>${service.customPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {service.customDuration && (
                    <div className="d-flex justify-content-between">
                      <span className="fw500">Custom Duration:</span>
                      <span>{service.customDuration} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-start mt20">
          <Link className="ud-btn btn-thm" href="/dashboard/edit-services">
            Edit Services
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </div>
  )
}
