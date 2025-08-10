// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationView from '@/components/sheet/AppointmentInformationView'
import AppointmentSearch from '@/components/professional-workspace/appointments/AppointmentSearch'
import AppointmentEmptyState from '@/components/professional-workspace/appointments/AppointmentEmptyState'
import AppointmentLoadingState from '@/components/professional-workspace/appointments/AppointmentLoadingState'
import AppointmentPagination from '@/components/professional-workspace/appointments/AppointmentPagination'
import AppointmentErrorState from '@/components/professional-workspace/appointments/AppointmentErrorState'
import AppointmentProfileIncomplete from '@/components/professional-workspace/appointments/AppointmentProfileIncomplete'
import AppointmentAttachmentViewer from '@/components/professional-workspace/appointments/AppointmentAttachmentViewer'
import { useTableData } from '@/components/professional-workspace/table/primitives/useTableData'
import { useTableSelection } from '@/components/professional-workspace/table/primitives/useTableSelection'

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

  // ✅ NEW: Use table hooks for enhanced functionality
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
    clearSelection() // Clear any selections on refresh
  }, [pagination.page, clearSelection])

  // ✅ Fetch available appointments with invitation detection
  const fetchAvailableAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_filter: 'available',
        professional_id: user.profile.professional_id,
        status: 'pending',
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

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
  }, [user?.profile?.professional_id, pagination.limit])

  // ✅ Fetch tab counts with invitation breakdown
  const fetchTabCounts = useCallback(async () => {
    if (!user?.profile?.professional_id) return

    try {
      console.log('🔢 Fetching tab counts for professional:', user.profile.professional_id)

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

      console.log('📊 Final tab counts:', { availableCount, invitationCount, interestsCount, assignedCount })

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

  // ✅ Express interest with invitation awareness
  const handleExpressInterest = useCallback(async (appointmentId, interestData) => {
    if (!appointmentId) return

    const appointment = appointments.find(apt => apt.appointment_id === appointmentId)
    const isInvitation = appointment?.is_invited || false

    console.log('🎯 Expressing interest in appointment:', appointmentId)
    console.log('🎯 Is invitation response:', isInvitation)

    try {
      const requestBody = {
        appointment_id: appointmentId,
        professional_id: user.profile.professional_id,
        ...interestData,
        invitation_response: isInvitation,
        intent: isInvitation ? 'high' : (interestData.intent || 'standard')
      }

      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Server returned invalid JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      console.log('✅ Interest expressed successfully:', data)

      const successMessage = isInvitation 
        ? 'Response to invitation sent successfully!'
        : 'Interest expressed successfully!'

      handleRefresh()
      clearSelection()

      if (showSheet) {
        setShowSheet(false)
        setSelectedAppointment(null)
      }

      alert(successMessage)

    } catch (err) {
      console.error('❌ Error expressing interest:', err)
      setError(`Failed to express interest: ${err.message}`)
      alert(`Error expressing interest: ${err.message}`)
    }
  }, [user?.profile?.professional_id, showSheet, appointments, handleRefresh, clearSelection])

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

      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...data.appointment }
            : apt
        )
      )

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
        viewMode: activeTab
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

  // ✅ Handle bulk actions
  const handleBulkAction = useCallback(async (action, selectedIds) => {
    console.log(`🔄 Performing bulk ${action} on:`, selectedIds)

    try {
      switch (action) {
        case 'express_interest':
          // Bulk express interest for available appointments
          for (const id of selectedIds) {
            await handleExpressInterest(id, { intent: 'standard' })
          }
          break
        case 'export':
          // Export selected data
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

  // Early return for incomplete profile
  if (!user?.profile?.professional_id) {
    return <AppointmentProfileIncomplete />
  }

  return (
    <div className="space-y-3 p-6 bg-background min-h-screen">
      {/* Professional Header */}
      {/* <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Appointments
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Discover new opportunities, manage your interests, and track your assigned appointments.
        </p>
      </div> */}

      {/* Error State */}
      {error && (
        <AppointmentErrorState 
          error={error} 
          onRetry={handleRetry}
        />
      )}

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tab Navigation with Invitation Indicators */}
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

        {/* ✅ Updated Search with Full Hook Integration */}
        <AppointmentSearch
          searchQuery={searchQuery}
          appointments={currentData}
          onSearch={handleSearch}
          mode={activeTab}
          dataStats={dataStats}
        />

        {/* Tab Content */}
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
            {loading ? (
              <AppointmentLoadingState />
            ) : processedData.length === 0 ? (
              <AppointmentEmptyState
                
                
                mode={activeTab}
                emptyMessage="No available appointments in your area"
                emptyDescription="Check back later for new appointment opportunities and invitations"
              />
            ) : (
              <>
                <AppointmentInformationTable
                  appointments={processedData}
                  professionalId={user?.profile?.professional_id}
                  professional={professional}
                  onView={handleViewAppointment}
                  onExpressInterest={handleExpressInterest}
                  onViewAttachments={handleViewAttachments}
                  onRefresh={handleRefresh}
                  loading={loading}
                  // ✅ Use internal pagination from useTableData
                  pagination={paginationInfo}
                  onPageChange={goToPage}
                  mode="available"
                  // ✅ Pass selection state
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
                  showPageSizeSelector={true}
                  showQuickJump={true}
                  showDataStats={true}
                  showBulkActions={true}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <div className="space-y-1">
            {loading ? (
              <AppointmentLoadingState />
            ) : processedData.length === 0 ? (
              <AppointmentEmptyState
                emptyMessage="No interests expressed yet"
                emptyDescription="Browse available appointments and invitations to express interest"
              />
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
                  showPageSizeSelector={true}
                  showQuickJump={true}
                  showDataStats={true}
                  showBulkActions={true}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <div className="space-y-1">
            {loading ? (
              <AppointmentLoadingState />
            ) : processedData.length === 0 ? (
              <AppointmentEmptyState
                emptyMessage="No assigned appointments"
                emptyDescription="Express interest in available appointments and respond to invitations to get selected"
              />
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
                  showPageSizeSelector={true}
                  showQuickJump={true}
                  showDataStats={true}
                  showBulkActions={true}
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
        appointment={selectedAppointment}
        professionalId={user?.profile?.professional_id}
        professional={professional}
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