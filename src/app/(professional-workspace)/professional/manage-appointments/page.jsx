// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Heart,
  Users,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Target,
  Crown,
  RefreshCw,
  ChevronDown,
  Grid,
  List
} from 'lucide-react'
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationView from '@/components/sheet/AppointmentInformationView'
import AppointmentSearch from '@/components/professional-workspace/appointments/AppointmentSearch'
import AppointmentEmptyState from '@/components/professional-workspace/appointments/AppointmentEmptyState'
// REMOVED: import AppointmentLoadingState from '@/components/professional-workspace/appointments/AppointmentLoadingState'
import AppointmentPagination from '@/components/professional-workspace/appointments/AppointmentPagination'
import AppointmentErrorState from '@/components/professional-workspace/appointments/AppointmentErrorState'
import AppointmentAttachmentViewer from '@/components/professional-workspace/appointments/AppointmentAttachmentViewer'
import { useTableData } from '@/components/professional-workspace/table/primitives/useTableData'
import { useTableSelection } from '@/components/professional-workspace/table/primitives/useTableSelection'

// Mobile Appointment Card Component
const MobileAppointmentCard = ({ 
  appointment, 
  mode, 
  professionalId, 
  onView, 
  onAction 
}) => {
  const isInvited = appointment.is_invited || (appointment.recipients?.includes(professionalId))
  const isInterestMode = mode === 'interests'
  
  // Handle different data structures
  const displayData = isInterestMode ? {
    ...appointment,
    customer: appointment.appointment?.customer || appointment.customer,
    service: appointment.appointment?.service || appointment.service,
    appointment_id: appointment.appointment?.appointment_id || appointment.appointment_id
  } : appointment
  
  const customerName = displayData.customer?.account ? 
    `${displayData.customer.account.first_name || ''} ${displayData.customer.account.last_name || ''}`.trim() :
    `${displayData.first_name || ''} ${displayData.last_name || ''}`.trim() || 'Unknown Customer'
  
  const serviceName = displayData.service?.name || displayData.service_name || displayData.title || 'Untitled Service'
  
  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    if (diffDays === 1) return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    if (diffDays === -1) return `Yesterday`
    if (Math.abs(diffDays) < 7) return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const getStatusColor = (status, mode) => {
    if (mode === 'interests') {
      const configs = {
        interested: 'bg-blue-100 text-blue-800',
        quoted: 'bg-amber-100 text-amber-800',
        selected: 'bg-green-100 text-green-800',
        confirmed: 'bg-emerald-100 text-emerald-800',
        rejected: 'bg-red-100 text-red-800',
        updated: 'bg-purple-100 text-purple-800'
      }
      return configs[status] || 'bg-gray-100 text-gray-800'
    } else {
      const configs = {
        pending: 'bg-gray-100 text-gray-800',
        interested: 'bg-blue-100 text-blue-800',
        competing: 'bg-orange-100 text-orange-800',
        quoted: 'bg-amber-100 text-amber-800',
        accepted: 'bg-green-100 text-green-800',
        converted: 'bg-emerald-100 text-emerald-800',
        declined: 'bg-red-100 text-red-800'
      }
      return configs[status] || 'bg-gray-100 text-gray-800'
    }
  }
  
  const getActionButton = () => {
    if (mode === 'available') {
      return (
        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation()
            onAction('express_interest', appointment)
          }}
          className={`w-full ${isInvited ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary/90'}`}
        >
          {isInvited ? (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Respond to Invitation
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Express Interest
            </>
          )}
        </Button>
      )
    } else if (mode === 'interests') {
      if (appointment.status === 'selected') {
        return (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              onAction('respond_to_selection', appointment)
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Respond to Selection
          </Button>
        )
      } else if (['interested', 'quoted', 'updated'].includes(appointment.status)) {
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onAction('update_interest', appointment)
            }}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Update Interest
          </Button>
        )
      }
    } else if (mode === 'assigned') {
      return (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onAction('decline', appointment)
            }}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            Decline
          </Button>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAction('accept', appointment)
            }}
            className="flex-1"
          >
            Accept
          </Button>
        </div>
      )
    }
    return null
  }
  
  const timeValue = isInterestMode ? 
    (appointment.appointment?.session || appointment.appointment?.created_at) :
    (appointment.session || appointment.created_at)
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20"
      onClick={() => onView(displayData.appointment_id || appointment.appointment_id, isInterestMode ? {
        mode: 'interests',
        interestData: appointment,
        appointmentData: appointment.appointment || appointment
      } : undefined)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base truncate">
                {customerName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {serviceName}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {isInvited && (
                <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                  <Crown className="h-3 w-3 mr-1" />
                  Invited
                </Badge>
              )}
              <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(appointment.status, mode)}`}>
                {appointment.status}
              </Badge>
            </div>
          </div>
          
          {/* Time and urgency */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeValue)}</span>
            </div>
            
            {appointment.urgency && appointment.urgency !== 'standard' && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  appointment.urgency === 'urgent' ? 'border-red-300 text-red-700 bg-red-50' :
                  appointment.urgency === 'high' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                  'border-gray-300 text-gray-700 bg-gray-50'
                }`}
              >
                {appointment.urgency}
              </Badge>
            )}
          </div>
          
          {/* Description preview */}
          {(displayData.description || displayData.customer_message) && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {displayData.description || displayData.customer_message}
            </p>
          )}
          
          {/* Interest-specific info */}
          {isInterestMode && appointment.amount && (
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-green-700">My Quote:</span>
              <span className="font-semibold text-green-800">
                JMD ${parseFloat(appointment.amount).toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Competition indicator */}
          {mode === 'available' && appointment.interest_summary?.total_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 p-2 rounded">
              <Users className="h-3 w-3" />
              <span>{appointment.interest_summary.total_count} professionals interested</span>
            </div>
          )}
          
          {/* Action button */}
          <div className="pt-2">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Quick Stats Component
const MobileQuickStats = ({ tabCounts, activeTab }) => {
  const getActiveCount = () => {
    switch (activeTab) {
      case 'available': return tabCounts.available
      case 'interests': return tabCounts.interests
      case 'assigned': return tabCounts.assigned
      default: return 0
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
      <div>
        <p className="text-sm text-muted-foreground">Total {activeTab}</p>
        <p className="text-2xl font-bold text-primary">{getActiveCount()}</p>
      </div>
      {activeTab === 'available' && tabCounts.invitations > 0 && (
        <Badge className="bg-blue-600 text-white">
          <Crown className="h-3 w-3 mr-1" />
          {tabCounts.invitations} invitations
        </Badge>
      )}
    </div>
  )
}

// Mobile View Toggle Component
const MobileViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        size="sm"
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        onClick={() => onViewModeChange('cards')}
        className="flex-1"
      >
        <Grid className="h-4 w-4 mr-2" />
        Cards
      </Button>
      <Button
        size="sm"
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        onClick={() => onViewModeChange('table')}
        className="flex-1"
      >
        <List className="h-4 w-4 mr-2" />
        Table
      </Button>
    </div>
  )
}

export default function ManageAppointments() {
  const { user } = useUserStore()
  const [appointments, setAppointments] = useState([])
  const [interests, setInterests] = useState([])
  const [professional, setProfessional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const [activeTab, setActiveTab] = useState('available')
  
  // Mobile-specific state
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [isMobile, setIsMobile] = useState(false)
  
  // File viewer state
  const [selectedAppointmentForFiles, setSelectedAppointmentForFiles] = useState(null)
  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false)
  
  // Basic pagination for API calls
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Tab-specific counts with invitation breakdown
  const [tabCounts, setTabCounts] = useState({
    available: 0,
    invitations: 0,
    interests: 0,
    assigned: 0
  })

  // Detect mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // ✅ Use table hooks for enhanced functionality
  const currentData = activeTab === 'interests' ? interests : appointments
  
  const {
    processedData,
    searchQuery,
    paginationInfo,
    dataStats,
    handleSearch,
    clearAllFilters,
    goToPage,
    setPageSize
  } = useTableData({
    data: currentData,
    mode: activeTab,
    pageSize: pagination.limit
  })

  const {
    selection,
    selectedItems,
    selectionState,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    bulkOperations
  } = useTableSelection({
    data: processedData,
    mode: activeTab
  })

  // ✅ Fetch professional data
  const fetchProfessionalData = useCallback(async () => {
    if (!user?.profile?.professional_id) return

    try {
      console.log('🔍 Fetching professional data for:', user.profile.professional_id)
      
      const response = await fetch(`/api/professionals/${user.profile.professional_id}`)
      
      if (!response.ok) {
        console.warn('⚠️ Professional API failed, using fallback data')
        setProfessional({
          id: user.profile.professional_id,
          professional_id: user.profile.professional_id,
          account: user.profile || {
            first_name: 'Professional',
            last_name: '',
            email: user.email || ''
          }
        })
        return
      }

      const data = await response.json()
      console.log('✅ Professional data fetched successfully')
      
      setProfessional({
        ...data.professional,
        id: data.professional?.id || data.professional?.professional_id || user.profile.professional_id,
        professional_id: data.professional?.professional_id || data.professional?.id || user.profile.professional_id
      })

    } catch (error) {
      console.error('❌ Error fetching professional data:', error)
      setProfessional({
        id: user.profile.professional_id,
        professional_id: user.profile.professional_id,
        account: user.profile || {
          first_name: 'Professional',
          last_name: '',
          email: user.email || ''
        }
      })
    }
  }, [user?.profile?.professional_id, user?.email, user?.profile])

  // ✅ Comprehensive refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing all data...')
    fetchData(pagination.page)
    fetchTabCounts()
    fetchProfessionalData()
    clearSelection()
  }, [pagination.page, clearSelection])

  // ✅ UPDATED: Fetch available appointments with interest data for state detection
  const fetchAvailableAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_filter: 'available',
        professional_id: user.profile.professional_id,
        status: 'pending',
        include_interests: 'true',
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      console.log('🔍 Fetching available appointments with interests:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }

      const data = JSON.parse(responseText)

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch available appointments')
      }

      console.log('✅ Available appointments fetched:', data.appointments?.length || 0)

      setAppointments(data.appointments || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))

    } catch (err) {
      console.error('❌ Error fetching available appointments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, pagination.limit])

  // Fetch professional's interests
  const fetchProfessionalInterests = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_id: user.profile.professional_id,
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      console.log('🎯 Fetching professional interests:', params.toString())

      const response = await fetch(`/api/interests?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }

      const data = JSON.parse(responseText)

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch interests')
      }

      console.log('✅ Professional interests fetched:', data.interests?.length || 0)

      setInterests(data.interests || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))

    } catch (err) {
      console.error('❌ Error fetching interests:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, pagination.limit])

  // Fetch assigned appointments
  const fetchAssignedAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_id: user.profile.professional_id,
        professional_filter: 'assigned',
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      console.log('🔍 Fetching assigned appointments:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }

      const data = JSON.parse(responseText)

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch assigned appointments')
      }

      console.log('✅ Assigned appointments fetched:', data.appointments?.length || 0)

      setAppointments(data.appointments || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))

    } catch (err) {
      console.error('❌ Error fetching assigned appointments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, pagination.limit])

  // ✅ Fetch tab counts with invitation breakdown
  const fetchTabCounts = useCallback(async () => {
    if (!user?.profile?.professional_id) return

    try {
      let availableCount = 0
      let invitationCount = 0
      let interestsCount = 0  
      let assignedCount = 0

      // Available appointments count WITH invitation detection
      try {
        const availableRes = await fetch(`/api/appointments?professional_filter=available&professional_id=${user.profile.professional_id}&status=pending&limit=50`)
        
        if (availableRes.ok) {
          const availableText = await availableRes.text()
          
          if (availableText.trim()) {
            const availableData = JSON.parse(availableText)
            const appointments = availableData.appointments || []
            
            availableCount = availableData.total || 0
            invitationCount = appointments.filter(apt => apt.is_invited)?.length || 0
          }
        }
      } catch (error) {
        console.error('❌ Error fetching available count:', error)
      }

      // Professional interests count
      try {
        const interestsRes = await fetch(`/api/interests?professional_id=${user.profile.professional_id}&limit=1`)
        
        if (interestsRes.ok) {
          const interestsText = await interestsRes.text()
          
          if (interestsText.trim()) {
            const interestsData = JSON.parse(interestsText)
            interestsCount = interestsData.total || 0
          }
        }
      } catch (error) {
        console.error('❌ Error fetching interests count:', error)
      }

      // Assigned appointments count
      try {
        const assignedRes = await fetch(`/api/appointments?professional_id=${user.profile.professional_id}&professional_filter=assigned&limit=1`)
        
        if (assignedRes.ok) {
          const assignedText = await assignedRes.text()
          
          if (assignedText.trim()) {
            const assignedData = JSON.parse(assignedText)
            assignedCount = assignedData.total || 0
          }
        }
      } catch (error) {
        console.error('❌ Error fetching assigned count:', error)
      }

      setTabCounts({
        available: availableCount,
        invitations: invitationCount,
        interests: interestsCount,
        assigned: assignedCount
      })

    } catch (err) {
      console.error('❌ Error in fetchTabCounts:', err)
      setTabCounts({
        available: 0,
        invitations: 0,
        interests: 0,
        assigned: 0
      })
    }
  }, [user?.profile?.professional_id])

  // Unified fetch function based on active tab
  const fetchData = useCallback((page = 1) => {
    switch (activeTab) {
      case 'available':
        fetchAvailableAppointments(page)
        break
      case 'interests':
        fetchProfessionalInterests(page)
        break
      case 'assigned':
        fetchAssignedAppointments(page)
        break
      default:
        fetchAvailableAppointments(page)
    }
  }, [activeTab, fetchAvailableAppointments, fetchProfessionalInterests, fetchAssignedAppointments])

  // Load data when tab changes or component mounts
  useEffect(() => {
    fetchData(1)
    fetchTabCounts()
    fetchProfessionalData()
  }, [activeTab, fetchData, fetchTabCounts, fetchProfessionalData])

  // âœ… UPDATED: Express interest with better error handling and debugging
const handleExpressInterest = useCallback(async (appointmentId, interestData) => {
  if (!appointmentId) return

  const appointment = appointments.find(apt => apt.appointment_id === appointmentId)
  const isInvitation = appointment?.is_invited || false

  try {
    const requestBody = {
      appointment_id: appointmentId,
      professional_id: user.profile.professional_id,
      ...interestData,
      invitation_response: isInvitation,
      intent: isInvitation ? 'high' : (interestData.intent || 'standard')
    }

    console.log('ðŸ"¤ Sending interest request:', requestBody)

    const response = await fetch('/api/interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log('ðŸ"¥ Raw response:', responseText)
    console.log('ðŸ"Š Response status:', response.status)
    console.log('ðŸ"‹ Response headers:', Object.fromEntries(response.headers.entries()))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('âŒ JSON Parse Error:', parseError)
      console.error('âŒ Response was:', responseText.substring(0, 500))
      throw new Error(
        `Server returned invalid JSON (Status ${response.status}). ` +
        `Response starts with: "${responseText.substring(0, 100)}..."`
      )
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    console.log('âœ… Interest expressed successfully:', data)

    handleRefresh()
    clearSelection()

    if (showSheet) {
      setShowSheet(false)
      setSelectedAppointment(null)
    }

    setTimeout(() => {
      setActiveTab('interests')
    }, 100)

  } catch (err) {
    console.error('âŒ Error expressing interest:', err)
    alert(`Failed to express interest: ${err.message}`)
    setError(`Failed to express interest: ${err.message}`)
  }
}, [user?.profile?.professional_id, showSheet, appointments, handleRefresh, clearSelection])

  // Update existing interest
  const handleUpdateInterest = useCallback(async (interestId, updateData) => {
    if (!interestId) return

    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update interest')
      }

      handleRefresh()
      clearSelection()

      if (showSheet) {
        setShowSheet(false)
        setSelectedAppointment(null)
      }

    } catch (err) {
      console.error('❌ Error updating interest:', err)
      setError(err.message)
    }
  }, [showSheet, handleRefresh, clearSelection])

// Handle appointment action (accept/decline) - FINAL FIX
const handleAppointmentAction = useCallback(async (appointmentId, action, additionalData = {}) => {
  if (!appointmentId || !action) return

  try {
    // Get current appointment to check its status
    const currentAppointment = appointments.find(apt => apt.appointment_id === appointmentId)
    
    console.log('Current appointment status:', currentAppointment?.status)
    
    if (action === 'decline') {
      // Decline is straightforward
      const updateData = {
        status: 'declined',
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
        throw new Error(data.error || `Failed to decline appointment`)
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...data.appointment }
            : apt
        )
      )
    } else {
      // For accept: Check status and handle accordingly
      const status = currentAppointment?.status
      
      // If already converting or converted, don't update status - just close and refresh
      if (['converting', 'converted'].includes(status)) {
        console.log(`Appointment already ${status}, skipping status update`)
        
        // Close sheet
        if (showSheet) {
          setShowSheet(false)
          setSelectedAppointment(null)
        }
        
        // Refresh to get latest booking data
        handleRefresh()
        return
      }
      
      // If approved, we need to trigger the conversion without sending status again
      // The API auto-converts approved → converting, so we shouldn't send status update
      if (status === 'approved') {
        console.log('Appointment already approved, refreshing to get conversion status')
        
        // Close sheet
        if (showSheet) {
          setShowSheet(false)
          setSelectedAppointment(null)
        }
        
        // Refresh to get the booking
        handleRefresh()
        return
      }
      
      // Only update to 'approved' if status is something else (pending, interested, etc.)
      const updateData = {
        status: 'approved',
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
        throw new Error(data.error || `Failed to accept appointment`)
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...data.appointment }
            : apt
        )
      )
    }

    // Close sheet and refresh
    if (showSheet) {
      setShowSheet(false)
      setSelectedAppointment(null)
    }
    
    handleRefresh()

  } catch (err) {
    console.error(`Error ${action}ing appointment:`, err)
    setError(err.message)
  }
}, [showSheet, appointments, handleRefresh])

// Handle view appointment - FIXED to fetch complete interest data
  const handleViewAppointment = useCallback(async (appointmentId, additionalData = null) => {
    console.log('👁️ Viewing appointment:', appointmentId, { additionalData, currentTab: activeTab })

    // 🔥 FIXED: For interests mode, always fetch complete interest data
    if (additionalData?.mode === 'interests' && additionalData?.interestData) {
      try {
        // Fetch complete interest data to ensure we have all fields (including assessment)
        const interestId = additionalData.interestData.interest_id
        
        console.log('🔍 Fetching complete interest data for:', interestId)
        
        const interestResponse = await fetch(`/api/interests/${interestId}`)
        
        if (interestResponse.ok) {
          const interestData = await interestResponse.json()
          
          // Use the complete interest data from API
          const completeInterest = interestData.interest || additionalData.interestData
          
          console.log('✅ Complete interest loaded:', {
            id: completeInterest.interest_id,
            assessment: completeInterest.assessment,
            amount: completeInterest.amount,
            status: completeInterest.status
          })
          
          const enhancedInterestData = {
            ...completeInterest,
            professional_id: completeInterest.professional_id || 
                            completeInterest.professionalId ||
                            user?.profile?.professional_id
          }
          
          setSelectedAppointment({
            ...additionalData.appointmentData,
            mode: 'interests',
            interests: [enhancedInterestData],
            viewMode: activeTab,
            interest_id: enhancedInterestData.interest_id,
            status: enhancedInterestData.status,
            professional_id: enhancedInterestData.professional_id
          })
          
          setShowSheet(true)
          return
        } else {
          console.warn('⚠️ Failed to fetch complete interest, using cached data')
          // Fall back to cached data
          const enhancedInterestData = {
            ...additionalData.interestData,
            professional_id: additionalData.interestData.professional_id || 
                            additionalData.interestData.professionalId ||
                            user?.profile?.professional_id
          }
          
          setSelectedAppointment({
            ...additionalData.appointmentData,
            mode: 'interests',
            interests: [enhancedInterestData],
            viewMode: activeTab,
            interest_id: enhancedInterestData.interest_id,
            status: enhancedInterestData.status,
            professional_id: enhancedInterestData.professional_id
          })
          
          setShowSheet(true)
          return
        }
      } catch (error) {
        console.error('❌ Error fetching complete interest:', error)
        // Fall back to cached data
        const enhancedInterestData = {
          ...additionalData.interestData,
          professional_id: additionalData.interestData.professional_id || 
                          additionalData.interestData.professionalId ||
                          user?.profile?.professional_id
        }
        
        setSelectedAppointment({
          ...additionalData.appointmentData,
          mode: 'interests',
          interests: [enhancedInterestData],
          viewMode: activeTab,
          interest_id: enhancedInterestData.interest_id,
          status: enhancedInterestData.status,
          professional_id: enhancedInterestData.professional_id
        })
        
        setShowSheet(true)
        return
      }
    }

    // 🔧 Handle available appointments (including those with existing responses)
    if (activeTab === 'available') {
      if (additionalData?.appointmentData) {
        setSelectedAppointment({
          ...additionalData.appointmentData,
          mode: 'available',
          viewMode: 'available',
          interests: additionalData.interestData ? [additionalData.interestData] : []
        })
        
        setShowSheet(true)
        return
      }
    }

    // 🔄 Original API fetch logic for other cases
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointment details')
      }

      setSelectedAppointment({
        ...data.appointment,
        mode: activeTab,
        viewMode: activeTab
      })
      setShowSheet(true)

    } catch (err) {
      console.error('❌ Error fetching appointment details:', err)
      setError(err.message)
    }
  }, [activeTab, user?.profile?.professional_id])

  // Handle view attachments
  const handleViewAttachments = useCallback((appointment) => {
    setSelectedAppointmentForFiles(appointment)
    setAttachmentViewerOpen(true)
  }, [])

  // ✅ UPDATED: Handle actions - Open detailed form instead of auto-submitting
  const handleAction = useCallback(async (actionType, item) => {
    try {
      console.log('🎯 Handling action:', actionType, 'for item:', item.appointment_id)
      
      switch (actionType) {
        case 'express_interest':
          console.log('🎯 Opening detailed form for:', item.appointment_id)
          await handleViewAppointment(item.appointment_id)
          break
        case 'respond_to_selection':
          handleViewAppointment(item.appointment?.appointment_id)
          break
        case 'update_interest':
          await handleUpdateInterest(item.interest_id)
          break
        case 'reapply':
          await handleExpressInterest(item.appointment?.appointment_id, { intent: 'standard' })
          break
        case 'accept':
          await handleAppointmentAction(item.appointment_id, 'accept')
          break
        case 'decline':
          await handleAppointmentAction(item.appointment_id, 'decline')
          break
        case 'share':
          console.log('Share:', item)
          break
        default:
          console.warn('Unknown action:', actionType)
      }
      
      if (!['express_interest', 'respond_to_selection'].includes(actionType)) {
        handleRefresh()
      }
    } catch (error) {
      console.error('Action failed:', actionType, error)
    }
  }, [handleViewAppointment, handleUpdateInterest, handleExpressInterest, handleAppointmentAction, handleRefresh])

  // ✅ Handle bulk actions
  const handleBulkAction = useCallback(async (action, selectedIds) => {
    console.log(`📄 Performing bulk ${action} on:`, selectedIds)

    try {
      switch (action) {
        case 'express_interest':
          for (const id of selectedIds) {
            await handleExpressInterest(id, { intent: 'standard' })
          }
          break
        case 'export':
          const selectedData = selectedItems
          const dataStr = JSON.stringify(selectedData, null, 2)
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
          
          const exportFileDefaultName = `${activeTab}_appointments_${new Date().toISOString().split('T')[0]}.json`
          
          const linkElement = document.createElement('a')
          linkElement.setAttribute('href', dataUri)
          linkElement.setAttribute('download', exportFileDefaultName)
          linkElement.click()
          break
        default:
          console.warn('Unknown bulk action:', action)
      }

      clearSelection()
      
    } catch (err) {
      console.error(`❌ Error performing bulk ${action}:`, err)
      setError(`Failed to perform bulk ${action}: ${err.message}`)
    }
  }, [selectedItems, activeTab, handleExpressInterest, clearSelection])

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchData(pagination.page)
  }, [fetchData, pagination.page])

  // ✅ Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize)
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }))
    fetchData(1)
  }, [setPageSize, fetchData])

  // ✅ Handle pagination from the new hook or external pagination
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage)
    }
  }, [fetchData, pagination.totalPages])
// Mobile Cards View Component
  const MobileCardsView = ({ data }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <AppointmentEmptyState
          mode={activeTab}
          emptyMessage={
            activeTab === 'available' ? "No available appointments in your area" :
            activeTab === 'interests' ? "No interests expressed yet" :
            "No assigned appointments"
          }
          emptyDescription={
            activeTab === 'available' ? "Check back later for new appointment opportunities and invitations" :
            activeTab === 'interests' ? "Browse available appointments and invitations to express interest" :
            "Express interest in available appointments and respond to invitations to get selected"
          }
        />
      )
    }

    return (
      <div className="space-y-4">
        {data.map((appointment) => (
          <MobileAppointmentCard
            key={appointment.appointment_id || appointment.interest_id}
            appointment={appointment}
            mode={activeTab}
            professionalId={user?.profile?.professional_id}
            onView={handleViewAppointment}
            onAction={handleAction}
          />
        ))}
      </div>
    )
  }


  return (
    <div className={`space-y-3 ${isMobile ? 'p-4' : 'p-6'} bg-background min-h-screen`}>
      {/* Error State */}
      {error && (
        <AppointmentErrorState 
          error={error} 
          onRetry={handleRetry}
        />
      )}

      {/* Mobile Quick Stats */}
      {isMobile && (
        <MobileQuickStats tabCounts={tabCounts} activeTab={activeTab} />
      )}

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tab Navigation with Invitation Indicators - Responsive Layout */}
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1 h-auto">
          <TabsTrigger 
            value="available" 
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 min-h-[48px] sm:min-h-[40px] data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Available</span>
              {tabCounts.available > 0 && (
                <Badge variant="secondary" className="text-xs h-4 px-1.5 min-w-[20px] flex items-center justify-center">
                  {tabCounts.available}
                </Badge>
              )}
            </div>
            {tabCounts.invitations > 0 && (
              <Badge className="bg-blue-600 text-white text-xs h-4 px-2 rounded-full sm:ml-1">
                <Crown className="h-3 w-3 mr-1 hidden sm:inline" />
                <span className="sm:hidden">{tabCounts.invitations} invited</span>
                <span className="hidden sm:inline">{tabCounts.invitations} invited</span>
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="interests" 
            className="flex items-center justify-center gap-2 py-2 px-2 sm:px-4 min-h-[48px] sm:min-h-[40px] data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Interests</span>
            {tabCounts.interests > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1.5 min-w-[20px] flex items-center justify-center">
                {tabCounts.interests}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="assigned" 
            className="flex items-center justify-center gap-2 py-2 px-2 sm:px-4 min-h-[48px] sm:min-h-[40px] data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Assigned</span>
            {tabCounts.assigned > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1.5 min-w-[20px] flex items-center justify-center">
                {tabCounts.assigned}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Search and Controls */}
        <div className="space-y-3">
          <AppointmentSearch
            searchQuery={searchQuery}
            appointments={currentData}
            onSearch={handleSearch}
            mode={activeTab}
            dataStats={dataStats}
          />

          {/* Mobile View Toggle */}
          {isMobile && (
            <div className="flex items-center justify-between">
              <MobileViewToggle 
                viewMode={viewMode} 
                onViewModeChange={setViewMode} 
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>

     <TabsContent value="available" className="space-y-4">
          {tabCounts.invitations > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-600">
                    <Badge className="bg-blue-600 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs">
                      {tabCounts.invitations}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">
                      🎉 You have {tabCounts.invitations} invitation{tabCounts.invitations !== 1 ? 's' : ''}!
                    </p>
                    <p className="text-sm text-blue-600">
                      Customers specifically selected you for their projects. Respond quickly to win these opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-1">
            {isMobile && viewMode === 'cards' ? (
              <MobileCardsView data={processedData} />
            ) : (
              <>
                <AppointmentInformationTable
                  appointments={processedData}
                  professionalId={user?.profile?.professional_id}
                  professional={professional}
                  onView={handleViewAppointment}
                  onExpressInterest={handleAction}
                  onViewAttachments={handleViewAttachments}
                  onRefresh={handleRefresh}
                  loading={loading}
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  mode="available"
                  selectionState={selectionState}
                  onSelectionChange={toggleSelection}
                  onSelectAll={toggleSelectAll}
                />

                <AppointmentPagination
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  onPageSizeChange={handlePageSizeChange}
                  selectionState={selectionState}
                  dataStats={dataStats}
                  mode={activeTab}
                  onBulkAction={handleBulkAction}
                  showPageSizeSelector={!isMobile}
                  showQuickJump={!isMobile}
                  showDataStats={!isMobile}
                  showBulkActions={!isMobile}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <div className="space-y-1">
            {isMobile && viewMode === 'cards' ? (
              <MobileCardsView data={processedData} />
            ) : (
              <>
                <AppointmentInformationTable
                  appointments={processedData}
                  professionalId={user?.profile?.professional_id}
                  professional={professional}
                  onView={handleViewAppointment}
                  onUpdateInterest={handleUpdateInterest}
                  onViewAttachments={handleViewAttachments}
                  onRefresh={handleRefresh}
                  loading={loading}
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  mode="interests"
                  selectionState={selectionState}
                  onSelectionChange={toggleSelection}
                  onSelectAll={toggleSelectAll}
                />

                <AppointmentPagination
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  onPageSizeChange={handlePageSizeChange}
                  selectionState={selectionState}
                  dataStats={dataStats}
                  mode={activeTab}
                  onBulkAction={handleBulkAction}
                  showPageSizeSelector={!isMobile}
                  showQuickJump={!isMobile}
                  showDataStats={!isMobile}
                  showBulkActions={!isMobile}
                />
              </>
            )}
          </div>
        </TabsContent>

     <TabsContent value="assigned" className="space-y-4">
          <div className="space-y-1">
            {isMobile && viewMode === 'cards' ? (
              <MobileCardsView data={processedData} />
            ) : (
              <>
                <AppointmentInformationTable
                  appointments={processedData}
                  professionalId={user?.profile?.professional_id}
                  professional={professional}
                  onView={handleViewAppointment}
                  onAccept={(id) => handleAppointmentAction(id, 'accept')}
                  onDecline={(id) => handleAppointmentAction(id, 'decline')}
                  onViewAttachments={handleViewAttachments}
                  onRefresh={handleRefresh}
                  loading={loading}
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  mode="assigned"
                  selectionState={selectionState}
                  onSelectionChange={toggleSelection}
                  onSelectAll={toggleSelectAll}
                />

                <AppointmentPagination
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  onPageSizeChange={handlePageSizeChange}
                  selectionState={selectionState}
                  dataStats={dataStats}
                  mode={activeTab}
                  onBulkAction={handleBulkAction}
                  showPageSizeSelector={!isMobile}
                  showQuickJump={!isMobile}
                  showDataStats={!isMobile}
                  showBulkActions={!isMobile}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ Appointment Detail Sheet */}
      <AppointmentInformationView
        open={showSheet}
        onOpenChange={(open) => {
          setShowSheet(open)
          if (!open) {
            setSelectedAppointment(null)
          }
        }}
        appointment={selectedAppointment?.appointment || selectedAppointment}
        interests={selectedAppointment?.interests || []}
        professionalId={user?.profile?.professional_id}
        professional={professional}
        mode={selectedAppointment?.mode || activeTab}
        onAccept={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'accept')}
        onDecline={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'decline')}
        onExpressInterest={handleExpressInterest}
        onUpdateInterest={handleUpdateInterest}
        onRefresh={handleRefresh}
      />

      {/* ✅ Attachment Viewer Modal */}
      <AppointmentAttachmentViewer
        open={attachmentViewerOpen}
        onOpenChange={setAttachmentViewerOpen}
        appointment={selectedAppointmentForFiles}
      />
    </div>
  )
}