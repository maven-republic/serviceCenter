// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationView from '@/components/sheet/AppointmentInformationView'
import AppointmentStatistics from '@/components/professional-workspace/appointments/AppointmentStatistics'
import AppointmentSearch from '@/components/professional-workspace/appointments/AppointmentSearch'
import AppointmentEmptyState from '@/components/professional-workspace/appointments/AppointmentEmptyState'
import AppointmentLoadingState from '@/components/professional-workspace/appointments/AppointmentLoadingState'
import AppointmentPagination from '@/components/professional-workspace/appointments/AppointmentPagination'
import AppointmentErrorState from '@/components/professional-workspace/appointments/AppointmentErrorState'
import AppointmentProfileIncomplete from '@/components/professional-workspace/appointments/AppointmentProfileIncomplete'
import AppointmentAttachmentViewer from '@/components/professional-workspace/appointments/AppointmentAttachmentViewer'

export default function ManageAppointments() {
  const { user } = useUserStore()
  const [appointments, setAppointments] = useState([])
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const [activeTab, setActiveTab] = useState('available') // available, interests, assigned
  
  // File viewer state
  const [selectedAppointmentForFiles, setSelectedAppointmentForFiles] = useState(null)
  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false)
  
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

  // Tab-specific counts with invitation breakdown
  const [tabCounts, setTabCounts] = useState({
    available: 0,
    invitations: 0, // New: count of invitations within available
    interests: 0,
    assigned: 0
  })

  // ✅ ENHANCED: Fetch available appointments with invitation detection
  const fetchAvailableAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_filter: 'available',
        professional_id: user.profile.professional_id, // ✅ KEY: Pass professional ID for invitation detection
        status: 'pending',
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      console.log('🔍 Fetching available appointments with invitations:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('📄 Available appointments response:', responseText.substring(0, 200))

      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }

      const data = JSON.parse(responseText)

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch available appointments')
      }

      console.log('✅ Available appointments fetched:', data.appointments?.length || 0)
      
      // ✅ NEW: Log invitation breakdown
      const invitationCount = data.appointments?.filter(apt => apt.is_invited)?.length || 0
      const openCount = data.appointments?.filter(apt => !apt.is_invited)?.length || 0
      console.log('🎯 Invitations found:', invitationCount, 'Open marketplace:', openCount)

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
  }, [user?.profile?.professional_id, filters.status, pagination.limit])

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

      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      console.log('🎯 Fetching professional interests:', params.toString())

      const response = await fetch(`/api/interests?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('📄 Interests response:', responseText.substring(0, 200))

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
  }, [user?.profile?.professional_id, filters.status, pagination.limit])

  // Fetch assigned appointments (existing logic)
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

      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      console.log('🔍 Fetching assigned appointments:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      console.log('📄 Assigned appointments response:', responseText.substring(0, 200))

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
  }, [user?.profile?.professional_id, filters.status, pagination.limit])

  // ✅ ENHANCED: Fetch tab counts with invitation breakdown
  const fetchTabCounts = useCallback(async () => {
    if (!user?.profile?.professional_id) return

    try {
      console.log('🔢 Fetching tab counts for professional:', user.profile.professional_id)

      // Make calls sequentially to better identify which one fails
      let availableCount = 0
      let invitationCount = 0
      let interestsCount = 0  
      let assignedCount = 0

      // 1. Available appointments count WITH invitation detection
      try {
        const availableRes = await fetch(`/api/appointments?professional_filter=available&professional_id=${user.profile.professional_id}&status=pending&limit=50`)
        console.log('📊 Available response status:', availableRes.status)
        
        if (availableRes.ok) {
          const availableText = await availableRes.text()
          console.log('📊 Available response text:', availableText.substring(0, 200))
          
          if (availableText.trim()) {
            const availableData = JSON.parse(availableText)
            const appointments = availableData.appointments || []
            
            availableCount = availableData.total || 0
            invitationCount = appointments.filter(apt => apt.is_invited)?.length || 0
            
            console.log('🎯 Available breakdown:', { 
              total: availableCount, 
              invitations: invitationCount, 
              open: availableCount - invitationCount 
            })
          }
        } else {
          console.warn('⚠️ Available appointments API failed:', availableRes.status)
        }
      } catch (error) {
        console.error('❌ Error fetching available count:', error)
      }

      // 2. Professional interests count
      try {
        const interestsRes = await fetch(`/api/interests?professional_id=${user.profile.professional_id}&limit=1`)
        console.log('📊 Interests response status:', interestsRes.status)
        
        if (interestsRes.ok) {
          const interestsText = await interestsRes.text()
          console.log('📊 Interests response text:', interestsText.substring(0, 200))
          
          if (interestsText.trim()) {
            const interestsData = JSON.parse(interestsText)
            interestsCount = interestsData.total || 0
          }
        } else {
          console.warn('⚠️ Interests API failed:', interestsRes.status)
        }
      } catch (error) {
        console.error('❌ Error fetching interests count:', error)
      }

      // 3. Assigned appointments count
      try {
        const assignedRes = await fetch(`/api/appointments?professional_id=${user.profile.professional_id}&professional_filter=assigned&limit=1`)
        console.log('📊 Assigned response status:', assignedRes.status)
        
        if (assignedRes.ok) {
          const assignedText = await assignedRes.text()
          console.log('📊 Assigned response text:', assignedText.substring(0, 200))
          
          if (assignedText.trim()) {
            const assignedData = JSON.parse(assignedText)
            assignedCount = assignedData.total || 0
          }
        } else {
          console.warn('⚠️ Assigned appointments API failed:', assignedRes.status)
        }
      } catch (error) {
        console.error('❌ Error fetching assigned count:', error)
      }

      console.log('📊 Final tab counts:', { availableCount, invitationCount, interestsCount, assignedCount })

      setTabCounts({
        available: availableCount,
        invitations: invitationCount,
        interests: interestsCount,
        assigned: assignedCount
      })

    } catch (err) {
      console.error('❌ Error in fetchTabCounts:', err)
      // Set default counts if everything fails
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

  // Load data when tab changes
  useEffect(() => {
    fetchData(1)
    fetchTabCounts()
  }, [activeTab, fetchData, fetchTabCounts])

  // ✅ ENHANCED: Express interest with invitation awareness
  const handleExpressInterest = useCallback(async (appointmentId, interestData) => {
    if (!appointmentId) return

    // ✅ NEW: Find the appointment to check if it's an invitation
    const appointment = appointments.find(apt => apt.appointment_id === appointmentId)
    const isInvitation = appointment?.is_invited || false

    console.log('🎯 Expressing interest in appointment:', appointmentId)
    console.log('🎯 Is invitation response:', isInvitation)
    console.log('🔍 Interest data being sent:', interestData)
    console.log('🔍 Professional ID:', user?.profile?.professional_id)

    try {
      const requestBody = {
        appointment_id: appointmentId,
        professional_id: user.profile.professional_id,
        ...interestData,
        // ✅ NEW: Add invitation context to the interest
        invitation_response: isInvitation,
        intent: isInvitation ? 'high' : (interestData.intent || 'standard')
      }
      
      console.log('🔍 Full request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)

      // Get response text first to see what we're actually getting
      const responseText = await response.text()
      console.log('🔍 Raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError)
        console.error('❌ Raw response was:', responseText)
        throw new Error(`Server returned invalid JSON. Status: ${response.status}. Raw response: ${responseText.substring(0, 200)}`)
      }

      if (!response.ok) {
        console.error('❌ API Error Response:', data)
        
        // Show the actual error from the API
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        const errorDetails = data.details ? ` Details: ${JSON.stringify(data.details)}` : ''
        
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      console.log('✅ Interest expressed successfully:', data)

      // ✅ ENHANCED: Success message based on invitation status
      const successMessage = isInvitation 
        ? 'Response to invitation sent successfully! The customer will review your proposal.'
        : 'Interest expressed successfully! You\'ll be notified if the customer selects you.'

      // Refresh available appointments and tab counts
      fetchAvailableAppointments(pagination.page)
      fetchTabCounts()

      // Close sheet if open
      if (showSheet) {
        setShowSheet(false)
        setSelectedAppointment(null)
      }

      // Show success message
      // TODO: Replace with toast notification
      alert(successMessage)

    } catch (err) {
      console.error('❌ Complete error details:', err)
      console.error('❌ Error stack:', err.stack)
      
      // Show the actual error to the user instead of generic message
      setError(`Failed to express interest: ${err.message}`)
      
      // Also alert so it's immediately visible
      alert(`Error expressing interest: ${err.message}`)
    }
  }, [user?.profile?.professional_id, pagination.page, showSheet, fetchAvailableAppointments, fetchTabCounts, appointments])

  // Update existing interest
  const handleUpdateInterest = useCallback(async (interestId, updateData) => {
    if (!interestId) return

    console.log('🔄 Updating interest:', interestId)

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

      console.log('✅ Interest updated successfully')

      // Refresh interests and tab counts
      fetchProfessionalInterests(pagination.page)
      fetchTabCounts()

      // Close sheet if open
      if (showSheet) {
        setShowSheet(false)
        setSelectedAppointment(null)
      }

    } catch (err) {
      console.error('❌ Error updating interest:', err)
      setError(err.message)
    }
  }, [pagination.page, showSheet, fetchProfessionalInterests, fetchTabCounts])

  // Handle appointment action (accept/decline) - for assigned appointments
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

    } catch (err) {
      console.error(`❌ Error ${action}ing appointment:`, err)
      setError(err.message)
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

      setSelectedAppointment({
        ...data.appointment,
        viewMode: activeTab // Pass current tab context
      })
      setShowSheet(true)

    } catch (err) {
      console.error('❌ Error fetching appointment details:', err)
      setError(err.message)
    }
  }, [activeTab])

  // Handle view attachments
  const handleViewAttachments = useCallback((appointment) => {
    setSelectedAppointmentForFiles(appointment)
    setAttachmentViewerOpen(true)
  }, [])

  // Filter data locally by search
  const getFilteredData = () => {
    const dataSource = activeTab === 'interests' ? interests : appointments
    
    if (!filters.search) return dataSource
    
    const searchLower = filters.search.toLowerCase()
    
    return dataSource.filter(item => {
      // For interests, search in appointment data
      const appointment = activeTab === 'interests' ? item.appointment : item
      
      const customerName = `${appointment.customer?.account?.first_name || ''} ${appointment.customer?.account?.last_name || ''}`.toLowerCase()
      const serviceName = appointment.service?.name?.toLowerCase() || ''
      const description = appointment.description?.toLowerCase() || ''
      
      return customerName.includes(searchLower) || 
             serviceName.includes(searchLower) || 
             description.includes(searchLower)
    })
  }

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
      fetchData(newPage)
    }
  }, [fetchData, pagination.totalPages])

  // Handle clear filters
  const handleClearAllFilters = useCallback(() => {
    handleStatusFilter('all')
    handleSearch('')
  }, [handleStatusFilter, handleSearch])

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchData(pagination.page)
  }, [fetchData, pagination.page])

  // Early return for incomplete profile
  if (!user?.profile?.professional_id) {
    return <AppointmentProfileIncomplete />
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-3 p-6 bg-background min-h-screen">
      {/* Professional Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Appointments
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Discover new opportunities, manage your interests, and track your assigned appointments.
        </p>
      </div>

      {/* Statistics Overview */}
      <AppointmentStatistics 
        appointments={appointments} 
        interests={interests}
        activeTab={activeTab}
      />

      {/* Error State */}
      {error && (
        <AppointmentErrorState 
          error={error} 
          onRetry={handleRetry}
        />
      )}

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* ✅ ENHANCED: Tab Navigation with Invitation Indicators */}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span>Available</span>
              <div className="flex items-center gap-1">
                {tabCounts.available > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tabCounts.available}
                  </Badge>
                )}
                {/* ✅ NEW: Special invitation indicator */}
                {tabCounts.invitations > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    {tabCounts.invitations} invited
                  </Badge>
                )}
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center gap-2">
            My Interests
            {tabCounts.interests > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.interests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            Assigned
            {tabCounts.assigned > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.assigned}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <AppointmentSearch
          filters={filters}
          appointments={filteredData}
          onStatusFilter={handleStatusFilter}
          onSearch={handleSearch}
          mode={activeTab}
        />

        {/* ✅ ENHANCED: Tab Content with Invitation Support */}
        <TabsContent value="available" className="space-y-4">
          {/* ✅ NEW: Invitation Summary for Available Tab */}
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
            {loading ? (
              <AppointmentLoadingState />
            ) : filteredData.length === 0 ? (
              <AppointmentEmptyState
                filters={filters}
                onClearFilters={handleClearAllFilters}
                mode={activeTab}
                emptyMessage="No available appointments in your area"
                emptyDescription="Check back later for new appointment opportunities and invitations"
              />
            ) : (
              <AppointmentInformationTable
                appointments={filteredData}
                professionalId={user?.profile?.professional_id} // ✅ Pass professional ID for invitation detection
                onView={handleViewAppointment}
                onExpressInterest={handleExpressInterest}
                onViewAttachments={handleViewAttachments}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                mode="available"
              />
            )}

            {!loading && filteredData.length > 0 && (
              <AppointmentPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <div className="space-y-1">
            {loading ? (
              <AppointmentLoadingState />
            ) : filteredData.length === 0 ? (
              <AppointmentEmptyState
                filters={filters}
                onClearFilters={handleClearAllFilters}
                emptyMessage="No interests expressed yet"
                emptyDescription="Browse available appointments and invitations to express interest"
              />
            ) : (
              <AppointmentInformationTable
                appointments={filteredData}
                professionalId={user?.profile?.professional_id} // ✅ Pass professional ID
                onView={handleViewAppointment}
                onUpdateInterest={handleUpdateInterest}
                onViewAttachments={handleViewAttachments}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                mode="interests"
              />
            )}

            {!loading && filteredData.length > 0 && (
              <AppointmentPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <div className="space-y-1">
            {loading ? (
              <AppointmentLoadingState />
            ) : filteredData.length === 0 ? (
              <AppointmentEmptyState
                filters={filters}
                onClearFilters={handleClearAllFilters}
                emptyMessage="No assigned appointments"
                emptyDescription="Express interest in available appointments and respond to invitations to get selected"
              />
            ) : (
              <AppointmentInformationTable
                appointments={filteredData}
                professionalId={user?.profile?.professional_id} // ✅ Pass professional ID
                onView={handleViewAppointment}
                onAccept={(id) => handleAppointmentAction(id, 'accept')}
                onDecline={(id) => handleAppointmentAction(id, 'decline')}
                onViewAttachments={handleViewAttachments}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                mode="assigned"
              />
            )}

            {!loading && filteredData.length > 0 && (
              <AppointmentPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ ENHANCED: Appointment Detail Sheet with Professional ID */}
      <AppointmentInformationView
        open={showSheet}
        onOpenChange={(open) => {
          setShowSheet(open)
          if (!open) {
            setSelectedAppointment(null)
          }
        }}
        appointment={selectedAppointment}
        professionalId={user?.profile?.professional_id} // ✅ Pass professional ID for invitation context
        onAccept={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'accept')}
        onDecline={() => handleAppointmentAction(selectedAppointment?.appointment_id, 'decline')}
        onExpressInterest={handleExpressInterest}
        onUpdateInterest={handleUpdateInterest}
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