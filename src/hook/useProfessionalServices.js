// src/hook/useProfessionalServices.js

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export const useProfessionalServices = (professionalId) => {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    averagePrice: 0,
    totalPotentialValue: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchServices = useCallback(async () => {
    if (!professionalId) return

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        professionalId: professionalId.toString(),
        status: statusFilter,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/quantification/professional-services?${queryParams}`)

      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const json = await response.json()
          message = json.error || message
        } catch {}
        throw new Error(message)
      }

      const result = await response.json()
      if (result.success) {
        setServices(result.data || [])
        setFilteredServices(result.data || [])
        setStats(result.stats || {
          total: 0,
          active: 0,
          inactive: 0,
          averagePrice: 0,
          totalPotentialValue: 0
        })
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err.message)
      toast.error(`Failed to load services: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [professionalId, statusFilter, searchTerm])

  const updateLocalStats = useCallback((list) => {
    if (!Array.isArray(list)) return
    const newStats = {
      total: list.length,
      active: list.filter(s => s?.is_active).length,
      inactive: list.filter(s => !s?.is_active).length,
      averagePrice: list.length > 0
        ? list.reduce((sum, s) => sum + (s?.custom_price || s?.service?.base_price || 0), 0) / list.length
        : 0,
      totalPotentialValue: list.filter(s => s?.is_active)
        .reduce((sum, s) => sum + (s?.custom_price || s?.service?.base_price || 0), 0)
    }
    setStats(newStats)
  }, [])

  useEffect(() => {
    if (!Array.isArray(services)) return setFilteredServices([])

    let filtered = [...services]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(service => {
        const s = service.service || {}
        const portfolio = s.portfolio || {}
        const vertical = portfolio.vertical || {}
        return (
          s.name?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term) ||
          portfolio.name?.toLowerCase().includes(term) ||
          vertical.name?.toLowerCase().includes(term) ||
          service.additional_notes?.toLowerCase().includes(term)
        )
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s =>
        statusFilter === 'active' ? s?.is_active : !s?.is_active
      )
    }

    setFilteredServices(filtered)
  }, [services, searchTerm, statusFilter])

  useEffect(() => {
    if (professionalId) fetchServices()
  }, [fetchServices])

  const addService = useCallback(async (data) => {
    if (!professionalId || !data.serviceId) return { success: false, error: 'Missing ID' }

    setLoading(true)
    try {
      const payload = {
        professionalId,
        serviceId: data.serviceId,
        customPrice: data.customPrice || null,
        customDurationMinutes: data.customDurationMinutes || null,
        additionalNotes: data.notes || '',
        isActive: data.isActive ?? true
      }

      const res = await fetch('/api/quantification/professional-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const json = await res.json()
          msg = json.error || msg
        } catch {}
        throw new Error(msg)
      }

      const result = await res.json()
      if (result.success) {
        const newService = result.data
        const updated = [newService, ...services]
        setServices(updated)
        updateLocalStats(updated)
        toast.success(`Service "${newService.service?.name || 'Unknown'}" added`)
        return { success: true, data: newService }
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      toast.error(`Failed to add service: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [professionalId, services])

  const updateService = useCallback(async (id, updateData) => {
    if (!id) return { success: false, error: 'Missing ID' }

    setLoading(true)
    try {
      const res = await fetch('/api/quantification/professional-services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalServiceId: id, ...updateData })
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const json = await res.json()
          msg = json.error || msg
        } catch {}
        throw new Error(msg)
      }

      const result = await res.json()
      if (result.success) {
        const updatedService = result.data
        const updatedList = services.map(s => s.professional_service_id === id ? updatedService : s)
        setServices(updatedList)
        updateLocalStats(updatedList)
        toast.success(`Service "${updatedService.service?.name || 'Unknown'}" updated`)
        return { success: true, data: updatedService }
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      toast.error(`Update failed: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [services])

  const deleteService = useCallback(async (id) => {
    if (!id) return { success: false, error: 'Missing ID' }

    setLoading(true)
    try {
      const res = await fetch(`/api/quantification/professional-services?professionalServiceId=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const json = await res.json()
          msg = json.error || msg
        } catch {}
        throw new Error(msg)
      }

      const result = await res.json()
      if (result.success) {
        const updated = services.filter(s => s.professional_service_id !== id)
        setServices(updated)
        updateLocalStats(updated)
        toast.success(result.message || 'Service removed')
        return { success: true }
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [services])

  const toggleServiceStatus = useCallback((id, current) =>
    updateService(id, { isActive: !current }), [updateService])

  return {
    services: filteredServices,
    allServices: services,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refresh: fetchServices,
    handleSearch: setSearchTerm,
    handleStatusFilter: setStatusFilter,
    clearFilters: () => {
      setSearchTerm('')
      setStatusFilter('all')
    },
    getServicePrice: (s) => s?.custom_price || s?.service?.base_price || 0,
    getServiceDuration: (s) => s?.custom_duration_minutes || s?.service?.duration_minutes || 0,
    getPricingModel: (s) => s?.service?.pricing_model || 'quote',
    getServiceHierarchy: (s) => {
      const p = s?.service?.portfolio
      const v = p?.vertical
      const i = v?.industry
      return {
        industry: i?.name || 'Unknown Industry',
        vertical: v?.name || 'Unknown Vertical',
        portfolio: p?.name || 'Unknown Portfolio',
        service: s?.service?.name || 'Unknown Service'
      }
    }
  }
}
