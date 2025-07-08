// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Search, 
  Filter, 
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationModal from '@/components/professional-workspace/modal/AppointmentInformationModal'

export default function ManageAppointments() {
  const { user } = useUserStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)
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

  // Calculate stats with proper error handling and fallbacks
  const calculateStats = () => {
    const safeAppointments = Array.isArray(appointments) ? appointments : [];
    
    return {
      pending: safeAppointments.filter(a => a?.status === 'pending').length,
      accepted: safeAppointments.filter(a => a?.status === 'accepted' || a?.status === 'converted').length,
      quoted: safeAppointments.filter(a => a?.status === 'quoted').length,
      declined: safeAppointments.filter(a => a?.status === 'declined').length,
      total: safeAppointments.length
    };
  };

  const statsData = calculateStats();

  // Analytics-style stats configuration (black, white, grey theme)
  const statsConfig = [
    {
      title: 'Pending',
      value: statsData.pending,
      icon: Clock,
      description: 'Awaiting response',
      bgColor: 'bg-card',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground',
      borderColor: 'border',
      isActive: statsData.pending > 0
    },
    {
      title: 'Accepted',
      value: statsData.accepted,
      icon: CheckCircle,
      description: 'Confirmed bookings',
      bgColor: 'bg-card',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground',
      borderColor: 'border',
      isActive: statsData.accepted > 0
    },
    {
      title: 'Quoted',
      value: statsData.quoted,
      icon: DollarSign,
      description: 'Quotes provided',
      bgColor: 'bg-card',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground',
      borderColor: 'border',
      isActive: statsData.quoted > 0
    },
    {
      title: 'Declined',
      value: statsData.declined,
      icon: XCircle,
      description: 'Not proceeded',
      bgColor: 'bg-card',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground',
      borderColor: 'border',
      isActive: statsData.declined > 0
    }
  ];

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

      // Close modal if open
      if (showModal) {
        setShowModal(false)
        setSelectedAppointment(null)
      }

      // Show success message
      // TODO: Add toast notification

    } catch (err) {
      console.error(`❌ Error ${action}ing appointment:`, err)
      setError(err.message)
    }
  }, [showModal])

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
      setShowModal(true)

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
  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage)
    }
  }

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Appointments', count: appointments.length },
    { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
    { key: 'quoted', label: 'Quoted', count: appointments.filter(a => a.status === 'quoted').length },
    { key: 'accepted', label: 'Accepted', count: appointments.filter(a => a.status === 'accepted').length },
    { key: 'converted', label: 'Converted', count: appointments.filter(a => a.status === 'converted').length }
  ]

  if (!user?.profile?.professional_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Appointments</h1>
          <p className="text-muted-foreground">Please complete your professional profile to view appointments.</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground">You need to complete your professional profile before you can view and manage appointments.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Appointments</h1>
        <p className="text-muted-foreground">Review and respond to appointment requests from customers.</p>
      </div>

      {/* Stats Cards - Analytics Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`${stat.bgColor} border-${stat.borderColor} hover:shadow-sm transition-shadow duration-200`}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${stat.valueColor}`}>
                        {stat.value || 0}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/30 ${stat.iconColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                
                {/* Progress indicator */}
                <div className="mt-4">
                  <div className="w-full bg-muted/50 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        stat.isActive ? 'bg-foreground' : 'bg-muted'
                      }`}
                      style={{
                        width: statsData.total > 0 ? `${(stat.value / statsData.total) * 100}%` : '0%'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {statsData.total > 0 ? Math.round((stat.value / statsData.total) * 100) : 0}% of total appointments
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card - Analytics Style */}
      <Card className="bg-card border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            Key metrics for your appointment management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">{statsData.total}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {statsData.total > 0 ? Math.round(((statsData.accepted + statsData.quoted) / statsData.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {statsData.pending}
              </div>
              <div className="text-sm text-muted-foreground">Need Action</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {statsData.quoted}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(filter => (
              <Button
                key={filter.key}
                variant={filters.status === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(filter.key)}
                className="h-8"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error: {error}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchAppointments(pagination.page)}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading your appointments...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                <p className="text-muted-foreground">
                  {filters.status === 'all' 
                    ? "You don't have any appointment requests yet." 
                    : `No ${filters.status} appointments found.`
                  }
                </p>
              </div>
            ) : (
              <AppointmentInformationTable
                appointments={filteredAppointments}
                onView={handleViewAppointment}
                onAccept={(id) => handleAppointmentAction(id, 'accept')}
                onDecline={(id) => handleAppointmentAction(id, 'decline')}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = index + 1
                    } else if (pagination.page <= 3) {
                      pageNum = index + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + index
                    } else {
                      pageNum = pagination.page - 2 + index
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <AppointmentInformationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onAccept={() => handleAppointmentAction(selectedAppointment.appointment_id, 'accept')}
          onDecline={() => handleAppointmentAction(selectedAppointment.appointment_id, 'decline')}
        />
      )}
    </div>
  )
}