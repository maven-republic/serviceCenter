"use client"

import { useState, useEffect } from "react"
import { createClient } from '../../../../utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import { toast } from "sonner"
import ServiceAddForm from "@/components/professional-workspace/forms/ServiceAddForm"
import ServiceCollections from "@/components/collections/ServiceCollections"

export default function ServiceInformation() {
  const supabase = createClient()
  const { user } = useUserStore()
  const [professionalId, setProfessionalId] = useState(null)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
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

  const refreshServices = async () => {
    try {
      setLoading(true)

      const { data: profServices, error } = await supabase
        .from('professional_service')
        .select('professional_service_id, custom_price, custom_duration_minutes, additional_notes, service:service_id(name, service_subcategory(category_id, name))')
        .eq('professional_id', professionalId)
        .eq('is_active', true)

      if (error) throw error
      setProfessionalServices(profServices || [])
    } catch (err) {
      toast.error('Failed to refresh services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const { data: categoryData } = await supabase
          .from('service_category')
          .select('*')
          .eq('is_active', true)
          .order('display_order')

        const { data: serviceData } = await supabase
          .from('service')
          .select('service_id, name, description, service_subcategory(category_id)')
          .eq('is_active', true)

        setCategories(categoryData || [])
        setServices(serviceData || [])
      } catch (err) {
        setError(err.message)
        toast.error('Failed to load metadata')
      }
    }

    fetchMeta()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = services.filter(s => s.service_subcategory?.category_id === selectedCategory)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }, [selectedCategory, services])

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

      let newEntry

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

        const { data } = await supabase
          .from('professional_service')
          .select('professional_service_id, service:service_id(name, service_subcategory(category_id, name)), custom_price, custom_duration_minutes, additional_notes')
          .eq('professional_service_id', existing.professional_service_id)
          .single()

        newEntry = data
        toast.success('Service reactivated')
      } else {
        const { data, error } = await supabase
          .from('professional_service')
          .insert({
            professional_id: professionalId,
            service_id: newService.serviceId,
            custom_price: newService.customPrice || null,
            custom_duration_minutes: newService.customDuration || null,
            additional_notes: newService.additionalNotes || null,
            is_active: true
          })
          .select('professional_service_id, service:service_id(name, service_subcategory(category_id, name)), custom_price, custom_duration_minutes, additional_notes')

        if (error) throw error
        newEntry = data[0]
        toast.success('Service added')
      }

      setProfessionalServices(prev => [...prev, newEntry])
      setNewService({ serviceId: '', customPrice: '', customDuration: '', additionalNotes: '' })
      setShowAddForm(false)
    } catch (err) {
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
          categories={categories}
          filteredServices={filteredServices}
          selectedCategory={selectedCategory}
          newService={newService}
          onCategoryChange={(e) => {
            setSelectedCategory(e.target.value)
            setNewService({ ...newService, serviceId: '' })
          }}
          onServiceSelect={(e) => handleServiceSelect(e.target.value)}
          onChange={handleCustomDetailsChange}
          onSubmit={addNewService}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={addingService}
        />
      )}

      <ServiceCollections services={professionalServices} onDelete={refreshServices} />
    </div>
  )
}
