"use client"

import { useState, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import { toast } from "sonner"
import ServiceAddForm from "@/components/professional-workspace/forms/ServiceAddForm"
import ServiceCollections from "@/components/collections/ServiceCollections"

export default function ServiceInformation() {
  const supabase = createClient()
  const { user } = useUserStore()
  const [professionalId, setProfessionalId] = useState(null)
  
  // ✅ Updated state for new architecture
  const [verticals, setVerticals] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [services, setServices] = useState([])
  const [filteredPortfolios, setFilteredPortfolios] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  
  const [selectedVertical, setSelectedVertical] = useState('')
  const [selectedPortfolio, setSelectedPortfolio] = useState('')
  const [professionalServices, setProfessionalServices] = useState([])
  
  const [newService, setNewService] = useState({
    serviceId: '',
    customPrice: '',
    customDuration: '',
    additionalNotes: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingService, setAddingService] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const fetchProfessionalId = async () => {
      if (!user?.account?.account_id) return toast.error("User not authenticated")

      const { data, error } = await supabase
        .from('individual_professional')
        .select('professional_id')
        .eq('account_id', user.account.account_id)
        .single()

      if (error || !data) return toast.error('Could not load professional profile')
      setProfessionalId(data.professional_id)
    }

    fetchProfessionalId()
  }, [user?.account?.account_id])

  useEffect(() => {
    if (professionalId) {
      refreshServices()
    }
  }, [professionalId])

  // ✅ Updated refresh services for new structure
  const refreshServices = async () => {
    try {
      setLoading(true)

      // Get professional services
      const { data: profServiceIds, error: profError } = await supabase
        .from('professional_service')
        .select('professional_service_id, service_id, custom_price, custom_duration_minutes, additional_notes')
        .eq('professional_id', professionalId)
        .eq('is_active', true)

      if (profError) throw profError

      if (!profServiceIds || profServiceIds.length === 0) {
        setProfessionalServices([])
        return
      }

      // Get service details with portfolio and vertical info
      const serviceIds = profServiceIds.map(ps => ps.service_id)
      const { data: serviceDetails, error: serviceError } = await supabase
        .from('service')
        .select(`
          service_id,
          name,
          description,
          portfolio_id,
          portfolio (
            name,
            vertical_id,
            vertical (
              name
            )
          )
        `)
        .in('service_id', serviceIds)

      if (serviceError) throw serviceError

      // Combine professional service data with service details
      const combinedServices = profServiceIds.map(ps => {
        const serviceDetail = serviceDetails.find(sd => sd.service_id === ps.service_id)
        return {
          ...ps,
          service: serviceDetail
        }
      })

      setProfessionalServices(combinedServices || [])
    } catch (err) {
      console.error('Error refreshing services:', err)
      toast.error('Failed to refresh services')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Updated metadata fetching for new structure
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        // Fetch verticals
        const { data: verticalData, error: verticalError } = await supabase
          .from('vertical')
          .select('vertical_id, name, description, display_order')
          .eq('is_active', true)
          .order('display_order')

        if (verticalError) throw verticalError

        // Fetch portfolios
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio')
          .select('portfolio_id, vertical_id, name, description, display_order')
          .eq('is_active', true)
          .order('vertical_id, display_order')

        if (portfolioError) throw portfolioError

        // Fetch services
        const { data: serviceData, error: serviceError } = await supabase
          .from('service')
          .select('service_id, portfolio_id, name, description, display_order')
          .eq('is_active', true)
          .order('display_order')

        if (serviceError) throw serviceError

        setVerticals(verticalData || [])
        setPortfolios(portfolioData || [])
        setServices(serviceData || [])

        console.log('✅ Metadata loaded:', {
          verticals: verticalData?.length || 0,
          portfolios: portfolioData?.length || 0,
          services: serviceData?.length || 0
        })

      } catch (err) {
        setError(err.message)
        toast.error('Failed to load metadata')
        console.error('Error loading metadata:', err)
      }
    }

    fetchMeta()
  }, [])

  // ✅ Filter portfolios when vertical changes
  useEffect(() => {
    if (selectedVertical) {
      const filtered = portfolios.filter(p => p.vertical_id === selectedVertical)
      setFilteredPortfolios(filtered)
      setSelectedPortfolio('') // Reset portfolio selection
      setFilteredServices([]) // Reset service list
    } else {
      setFilteredPortfolios([])
      setSelectedPortfolio('')
      setFilteredServices([])
    }
  }, [selectedVertical, portfolios])

  // ✅ Filter services when portfolio changes
  useEffect(() => {
    if (selectedPortfolio) {
      const filtered = services.filter(s => s.portfolio_id === selectedPortfolio)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }, [selectedPortfolio, services])

  const handleCustomDetailsChange = (e) => {
    const { name, value } = e.target
    setNewService(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceSelect = (id) => {
    setNewService(prev => ({ ...prev, serviceId: id }))
  }

  const addNewService = async () => {
    if (!newService.serviceId) {
      toast.error('Please select a service')
      return
    }

    setAddingService(true)
    try {
      const { data: existing } = await supabase
        .from('professional_service')
        .select('professional_service_id')
        .eq('professional_id', professionalId)
        .eq('service_id', newService.serviceId)
        .single()

      if (existing) {
        await supabase
          .from('professional_service')
          .update({
            is_active: true,
            custom_price: newService.customPrice || null,
            custom_duration_minutes: newService.customDuration || null,
            additional_notes: newService.additionalNotes || null
          })
          .eq('professional_service_id', existing.professional_service_id)

        toast.success('Service reactivated')
      } else {
        const { error } = await supabase
          .from('professional_service')
          .insert({
            professional_id: professionalId,
            service_id: newService.serviceId,
            custom_price: newService.customPrice || null,
            custom_duration_minutes: newService.customDuration || null,
            additional_notes: newService.additionalNotes || null,
            is_active: true
          })

        if (error) throw error
        toast.success('Service added')
      }

      // Refresh the services list
      await refreshServices()
      
      // Reset form
      setNewService({ serviceId: '', customPrice: '', customDuration: '', additionalNotes: '' })
      setSelectedVertical('')
      setSelectedPortfolio('')
      setShowAddForm(false)
      
    } catch (err) {
      console.error('Error adding service:', err)
      toast.error('Failed to add service', { description: err.message })
    } finally {
      setAddingService(false)
    }
  }

  return (
    <div className="container ps-widget bgc-white bdrs4 p30 mb30">
      <div className="d-flex justify-content-between align-items-center mb25">
        <h5 className="list-title mb-0">Manage Your Services</h5>
        <button
          className="btn btn-icon btn-sm btn-primary rounded-circle"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-label="Add service"
        >
          <i className={`fa ${showAddForm ? 'fa-times' : 'fa-plus'} thin-icon`}></i>
        </button>
      </div>

      {showAddForm && (
        <ServiceAddForm
          verticals={verticals}
          portfolios={filteredPortfolios}
          services={filteredServices}
          selectedVertical={selectedVertical}
          selectedPortfolio={selectedPortfolio}
          newService={newService}
          onVerticalChange={(e) => {
            setSelectedVertical(e.target.value)
            setNewService({ ...newService, serviceId: '' })
          }}
          onPortfolioChange={(e) => {
            setSelectedPortfolio(e.target.value)
            setNewService({ ...newService, serviceId: '' })
          }}
          onServiceSelect={(e) => handleServiceSelect(e.target.value)}
          onChange={handleCustomDetailsChange}
          onSubmit={addNewService}
          onCancel={() => {
            setShowAddForm(false)
            setSelectedVertical('')
            setSelectedPortfolio('')
            setNewService({ serviceId: '', customPrice: '', customDuration: '', additionalNotes: '' })
          }}
          isSubmitting={addingService}
        />
      )}

      <ServiceCollections services={professionalServices} onDelete={refreshServices} />
    </div>
  )
}