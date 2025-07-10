// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationView from '@/components/sheet/AppointmentInformationView'
import AppointmentStatistics from '@/components/professional-workspace/appointments/AppointmentStatistics'
import AppointmentSearch from '@/components/professional-workspace/appointments/AppointmentSearch'
import AppointmentEmptyState from '@/components/professional-workspace/appointments/AppointmentEmptyState'
import AppointmentLoadingState from '@/components/professional-workspace/appointments/AppointmentLoadingState'
import AppointmentPagination from '@/components/professional-workspace/appointments/AppointmentPagination'
import AppointmentErrorState from '@/components/professional-workspace/appointments/AppointmentErrorState'
import AppointmentProfileIncomplete from '@/components/professional-workspace/appointments/AppointmentProfileIncomplete'


export default function ManageAppointments() {
  const { user } = useUserStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Fetch appointments from API
  const fetchAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) {
      console.log('No professional ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_id: user.profile.professional_id,
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      console.log('🔍 Fetching appointments with params:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments')
      }

      console.log('✅ Appointments fetched:', data.appointments?.length || 0)

      setAppointments(data.appointments || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))

    } catch (err) {
      console.error('❌ Error fetching appointments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, filters.status, pagination.limit])

  // Initial load
  useEffect(() => {
    fetchAppointments(1)
  }, [fetchAppointments])

  // Handle appointment action (accept/decline)
  const handleAppointmentAction = useCallback(async (appointmentId, action, additionalData = {}) => {
    if (!appointmentId || !action) return

    console.log(`🔄 ${action}ing appointment:`, appointmentId)

    try {
      const updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        ...additionalData
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} appointment`)
      }

      console.log(`✅ Appointment ${action}ed successfully`)

      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...data.appointment }
            : apt
        )
      )

      // Close sheet if open
      if (showSheet) {
        setShowSheet(false)
        setSelectedAppointment(null)
      }

      // TODO: Add toast notification instead of alert
      // toast.success(`Appointment ${action}ed successfully!`)

    } catch (err) {
      console.error(`❌ Error ${action}ing appointment:`, err)
      setError(err.message)
      // TODO: Add toast notification instead of alert
      // toast.error(`Error: ${err.message}`)
    }
  }, [showSheet])

  // Handle view appointment details
  const handleViewAppointment = useCallback(async (appointmentId) => {
    console.log('👁️ Viewing appointment:', appointmentId)

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointment details')
      }

      setSelectedAppointment(data.appointment)
      setShowSheet(true)

    } catch (err) {
      console.error('❌ Error fetching appointment details:', err)
      setError(err.message)
    }
  }, [])

  // Filter appointments locally by search
  const filteredAppointments = appointments.filter(appointment => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase()
    const customerName = `${appointment.customer?.account?.first_name || ''} ${appointment.customer?.account?.last_name || ''}`.toLowerCase()
    const serviceName = appointment.service?.name?.toLowerCase() || ''
    const description = appointment.description?.toLowerCase() || ''
    
    return customerName.includes(searchLower) || 
           serviceName.includes(searchLower) || 
           description.includes(searchLower)
  })

  // Handle status filter change
  const handleStatusFilter = useCallback((status) => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }, [])

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage)
    }
  }, [fetchAppointments, pagination.totalPages])

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    handleStatusFilter('all')
    handleSearch('')
  }, [handleStatusFilter, handleSearch])

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchAppointments(pagination.page)
  }, [fetchAppointments, pagination.page])

  // Early return for incomplete profile
  if (!user?.profile?.professional_id) {
    return <AppointmentProfileIncomplete />
  }

  return (
    <div className="space-y-3 p-6 bg-background min-h-screen">
      {/* Professional Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Appointments
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Review and respond to appointment requests from customers. 
          Keep track of your schedule and manage your professional services.
        </p>
      </div>

      {/* Statistics Overview */}
      <AppointmentStatistics appointments={appointments} />

      {/* Error State */}
      {error && (
        <AppointmentErrorState 
          error={error} 
          onRetry={handleRetry}
        />
      )}

      {/* Main Content Area - MINIMAL SPACING */}
      <div className="space-y-1">
        
        {/* Search and Filters */}
        <AppointmentSearch
          filters={filters}
          appointments={appointments}
          onStatusFilter={handleStatusFilter}
          onSearch={handleSearch}
        />

        {/* Appointments Content - TIGHT PLACEMENT */}
        {loading ? (
          <AppointmentLoadingState />
        ) : filteredAppointments.length === 0 ? (
          <AppointmentEmptyState
            filters={filters}
            onClearFilters={handleClearAllFilters}
          />
        ) : (
          <AppointmentInformationTable
            appointments={filteredAppointments}
            onView={handleViewAppointment}
            onAccept={(id) => handleAppointmentAction(id, 'accept')}
            onDecline={(id) => handleAppointmentAction(id, 'decline')}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}

        {/* Pagination */}
        {!loading && filteredAppointments.length > 0 && (
          <AppointmentPagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Appointment Detail Sheet */}
      <AppointmentInformationView
        open={showSheet}
        onOpenChange={(open) => {
          setShowSheet(open)
          if (!open) {
            setSelectedAppointment(null)
          }
        }}
        appointment={selectedAppointment}
        onAccept={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'accept')}
        onDecline={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'decline')}
      />
    </div>
  )
}