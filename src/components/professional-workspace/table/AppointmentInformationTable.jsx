// src/components/professional-workspace/table/AppointmentInformationTable.jsx
'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  MoreHorizontal,
  Settings,
  Clock,
  AlertTriangle,
  Flame,
  Minus,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  MessageSquare,
  Building2,
  Paperclip,
  Image,
  FileText,
  Star,
  Heart,
  Send,
  UserCheck
} from 'lucide-react'

export default function AppointmentInformationTable({
  appointments = [],
  professionalId, // ✅ NEW: Professional ID for invitation detection
  onView,
  onAccept,
  onDecline,
  onExpressInterest, // ✅ NEW: For available appointments
  onUpdateInterest, // ✅ NEW: For interests
  onViewAttachments,
  loading = false,
  pagination,
  onPageChange,
  mode = 'assigned' // ✅ NEW: 'available', 'interests', 'assigned'
}) {
  const [actionLoading, setActionLoading] = useState({})
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  })
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Handle action with loading state per appointment
  const handleAction = async (appointmentId, action, actionHandler) => {
    setActionLoading(prev => ({ ...prev, [appointmentId]: action }))
    try {
      await actionHandler()
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: null }))
    }
  }

  // ✅ NEW: Handle express interest action
  const handleExpressInterest = async (appointment) => {
    const isInvitation = appointment.is_invited || (appointment.recipients && appointment.recipients.includes(professionalId))
    
    // Basic interest data - can be enhanced with a form modal
    const interestData = {
      intent: isInvitation ? 'high' : 'standard',
      message: isInvitation 
        ? 'Thank you for the invitation. I am very interested in this project and would love to discuss the details with you.'
        : 'I am interested in this project and believe I can provide excellent service. I would appreciate the opportunity to work with you.',
      assessment: false
    }

    await handleAction(
      appointment.appointment_id,
      'express_interest',
      () => onExpressInterest(appointment.appointment_id, interestData)
    )
  }

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Row selection
  const handleRowSelect = (appointmentId) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(appointmentId)) {
      newSelected.delete(appointmentId)
    } else {
      newSelected.add(appointmentId)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === appointments.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(appointments.map(apt => 
        mode === 'interests' ? apt.appointment?.appointment_id : apt.appointment_id
      )))
    }
  }

  // Clear selection when appointments change
  useMemo(() => {
    setSelectedRows(new Set())
  }, [appointments])

  // Sort appointments
  const sortedAppointments = useMemo(() => {
    if (!sortConfig.key) return appointments

    return [...appointments].sort((a, b) => {
      // Handle interests mode where data is nested
      const aData = mode === 'interests' ? a.appointment : a
      const bData = mode === 'interests' ? b.appointment : b

      let aValue = aData[sortConfig.key]
      let bValue = bData[sortConfig.key]

      // Handle nested values
      if (sortConfig.key === 'customer_name') {
        aValue = `${aData.customer?.account?.first_name || ''} ${aData.customer?.account?.last_name || ''}`.trim()
        bValue = `${bData.customer?.account?.first_name || ''} ${bData.customer?.account?.last_name || ''}`.trim()
      }

      if (sortConfig.key === 'service_name') {
        aValue = aData.service?.name || aData.title || ''
        bValue = bData.service?.name || bData.title || ''
      }

      // For interests mode, also check interest-specific fields
      if (mode === 'interests') {
        if (sortConfig.key === 'interest_status') {
          aValue = a.status
          bValue = b.status
        }
        if (sortConfig.key === 'interest_intent') {
          aValue = a.intent
          bValue = b.intent
        }
      }

      // Handle urgency/priority sorting with fallbacks
      if (sortConfig.key === 'urgency') {
        aValue = aData.urgency || aData.priority || 'standard'
        bValue = bData.urgency || bData.priority || 'standard'
      }
      if (sortConfig.key === 'appointment_time') {
        aValue = new Date(aData.appointment_time || 0)
        bValue = new Date(bData.appointment_time || 0)
      }

      // Handle dates
      if (sortConfig.key.includes('_at') || sortConfig.key.includes('start')) {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [appointments, sortConfig, mode])

  // ✅ DEBUG: Log appointment structure to help identify available fields
  useMemo(() => {
    if (appointments.length > 0) {
      console.log('🔍 Sample appointment structure:', appointments[0])
      console.log('🔍 Available fields:', Object.keys(appointments[0]))
      if (mode === 'interests' && appointments[0].appointment) {
        console.log('🔍 Nested appointment fields:', Object.keys(appointments[0].appointment))
      }
      
      // ✅ NEW: Debug appointment time fields specifically with null checks
      const appointment = mode === 'interests' ? appointments[0]?.appointment : appointments[0]
      if (appointment) {
        console.log('🕒 Appointment time fields check:', {
          session: appointment.session,              // ✅ YOUR MAIN FIELD!
          appointment_time: appointment.appointment_time,
          scheduled_time: appointment.scheduled_time,
          start_time: appointment.start_time,
          datetime: appointment.datetime,
          date: appointment.date,
          time: appointment.time,
          created_at: appointment.created_at
        })
      } else {
        console.log('⚠️ Appointment data is undefined')
      }
    }
  }, [appointments, mode])

  // ✅ NEW: Get appointment data based on mode
  const getAppointmentData = (item) => {
    if (!item) return null
    return mode === 'interests' ? item.appointment : item
  }

  // ✅ NEW: Get appointment time with multiple field fallbacks
  const getAppointmentTime = (appointment) => {
    if (!appointment) return null
    
    return appointment.session ||           // ✅ YOUR DATA USES THIS!
           appointment.appointment_time || 
           appointment.scheduled_time || 
           appointment.start_time || 
           appointment.datetime || 
           appointment.date || 
           appointment.time ||
           appointment.created_at ||
           null
  }
  const getInvitationStatus = (appointment) => {
    if (mode !== 'available') return false
    return appointment.is_invited || (appointment.recipients && appointment.recipients.includes(professionalId))
  }

  // Professional status configuration using semantic tokens
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground border-border',
        icon: Clock,
        label: 'Pending',
        dotColor: 'bg-muted-foreground'
      },
      quoted: { 
        variant: 'outline',
        className: 'bg-background text-foreground border-border hover:bg-muted/50',
        icon: Building2,
        label: 'Quoted',
        dotColor: 'bg-primary'
      },
      accepted: { 
        variant: 'default',
        className: 'bg-primary text-primary-foreground hover:bg-primary/90',
        icon: Check,
        label: 'Accepted',
        dotColor: 'bg-primary-foreground'
      },
      converted: { 
        variant: 'default',
        className: 'bg-primary text-primary-foreground hover:bg-primary/90',
        icon: Check,
        label: 'Converted',
        dotColor: 'bg-primary-foreground'
      },
      declined: { 
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground border-border',
        icon: X,
        label: 'Declined',
        dotColor: 'bg-muted-foreground'
      },
      // ✅ NEW: Interest-specific statuses
      selected: {
        variant: 'default',
        className: 'bg-green-600 text-white hover:bg-green-700',
        icon: UserCheck,
        label: 'Selected',
        dotColor: 'bg-white'
      },
      rejected: {
        variant: 'secondary',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        label: 'Rejected',
        dotColor: 'bg-red-600'
      }
    }
    return configs[status] || configs.pending
  }

  // ✅ NEW: Interest intent configuration
  const getIntentConfig = (intent) => {
    const configs = {
      high: { 
        icon: Flame,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'High Interest',
        dotColor: 'bg-orange-600'
      },
      standard: { 
        icon: Heart,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Standard',
        dotColor: 'bg-blue-600'
      },
      low: { 
        icon: Minus,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Low Interest',
        dotColor: 'bg-gray-600'
      }
    }
    return configs[intent] || configs.standard
  }

  // Professional priority configuration using semantic tokens
  const getPriorityConfig = (urgency) => {
    const configs = {
      urgent: { 
        icon: Flame,
        className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        label: 'Urgent',
        dotColor: 'bg-destructive-foreground'
      },
      high: { 
        icon: ArrowUp,
        className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        label: 'High',
        dotColor: 'bg-secondary-foreground'
      },
      standard: { 
        icon: Minus,
        className: 'bg-muted text-muted-foreground hover:bg-muted/80',
        label: 'Standard',
        dotColor: 'bg-muted-foreground'
      },
      low: { 
        icon: ArrowDown,
        className: 'bg-muted/50 text-muted-foreground hover:bg-muted',
        label: 'Low',
        dotColor: 'bg-muted-foreground'
      }
    }
    return configs[urgency] || configs.standard
  }

  // Format date for display with better handling
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Handle different time periods
      if (diffDays === 0) {
        return `Today ${date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`
      } else if (diffDays === 1) {
        return `Tomorrow ${date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`
      } else if (diffDays === -1) {
        return `Yesterday ${date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`
      } else if (Math.abs(diffDays) < 7) {
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }
    } catch (error) {
      console.error('Date formatting error:', error)
      return '-'
    }
  }

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-foreground" />
      : <ArrowDown className="h-4 w-4 text-foreground" />
  }

  // ✅ NEW: Get table title based on mode
  const getTableTitle = () => {
    switch (mode) {
      case 'available':
        return 'Available Appointments'
      case 'interests':
        return 'My Interests'
      case 'assigned':
        return 'Assigned Appointments'
      default:
        return 'Appointments Overview'
    }
  }

  // Professional loading skeleton
  const LoadingSkeleton = () => (
    <Card className="w-full bg-card border-border">
      <CardHeader className="py-2 px-4 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 bg-muted" />
          <Skeleton className="h-8 w-24 bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="bg-background p-6">
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="flex items-center space-x-4 pb-3 border-b border-border">
            <Skeleton className="h-4 w-4 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </div>
          
          {/* Table rows skeleton */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4">
              <Skeleton className="h-4 w-4 bg-muted" />
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-muted" />
                  <Skeleton className="h-3 w-24 bg-muted" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-6 w-16 bg-muted" />
              <Skeleton className="h-4 w-16 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-8 w-8 bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  if (appointments.length === 0) {
    const emptyMessages = {
      available: {
        title: 'No available appointments',
        description: 'There are currently no appointment opportunities in your area. Check back later for new opportunities and invitations.'
      },
      interests: {
        title: 'No interests expressed',
        description: 'You haven\'t expressed interest in any appointments yet. Browse available appointments to get started.'
      },
      assigned: {
        title: 'No assigned appointments',
        description: 'You don\'t have any assigned appointments yet. Express interest in available appointments to get selected by customers.'
      }
    }

    const message = emptyMessages[mode] || emptyMessages.assigned

    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 bg-background">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">{message.title}</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {message.description}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full bg-card border-border">
        {/* Professional Table Header */}
        <CardHeader className="flex-shrink-0 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-lg text-foreground">{getTableTitle()}</CardTitle>
              {selectedRows.size > 0 && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {selectedRows.size} of {appointments.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="bg-background hover:bg-muted border-border text-foreground">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message ({selectedRows.size})
                  </Button>
                  <Button variant="outline" size="sm" className="bg-background hover:bg-muted border-border text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Archive ({selectedRows.size})
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm" className="bg-background hover:bg-muted border-border text-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Scrollable Table Content */}
        <CardContent className="p-0 flex-1 bg-background">
          <div className="border-0 rounded-none max-h-[600px] overflow-y-auto">
            <Table>
              {/* Professional Sticky Header */}
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="w-12 py-4 bg-background/95">
                    <Checkbox
                      checked={selectedRows.size === appointments.length && appointments.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all appointments"
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  </TableHead>
                  
                  {/* ✅ NEW: Invitation indicator for available mode */}
                  {mode === 'available' && (
                    <TableHead className="py-4 bg-background/95 text-muted-foreground font-medium w-16">
                      Type
                    </TableHead>
                  )}
                  
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Customer</span>
                      {getSortIcon('customer_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('service_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Service</span>
                      {getSortIcon('service_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('appointment_time')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Appointment Time</span>
                      {getSortIcon('appointment_time')}
                    </div>
                  </TableHead>
                  
                  {/* ✅ NEW: Different status columns based on mode */}
                  {mode === 'interests' ? (
                    <>
                      <TableHead 
                        className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                        onClick={() => handleSort('interest_status')}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Interest Status</span>
                          {getSortIcon('interest_status')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                        onClick={() => handleSort('interest_intent')}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Intent</span>
                          {getSortIcon('interest_intent')}
                        </div>
                      </TableHead>
                    </>
                  ) : (
                    <TableHead 
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Status</span>
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                  )}
                  
                  {/* Files Column */}
                  <TableHead className="py-4 bg-background/95 text-muted-foreground font-medium">
                    Files
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {mode === 'interests' ? 'Expressed' : 'Requested'}
                      </span>
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-20 py-4 bg-background/95 text-muted-foreground font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Professional Table Body */}
              <TableBody>
                {sortedAppointments.map((item) => {
                  const appointment = getAppointmentData(item)
                  
                  // ✅ Early return if appointment is null/undefined
                  if (!appointment) {
                    console.warn('⚠️ Skipping undefined appointment:', item)
                    return null
                  }
                  
                  const isInvitation = getInvitationStatus(appointment)
                  const statusConfig = getStatusConfig(
                    mode === 'interests' ? item.status : appointment.status
                  )
                  const intentConfig = mode === 'interests' ? getIntentConfig(item.intent) : null
                  const itemId = appointment.appointment_id
                  const isSelected = selectedRows.has(itemId)
                  const attachments = appointment.attachments || []
                  
                  // ✅ DEBUG: Check what's causing the styling
                  console.log('Row styling debug:', {
                    appointmentId: itemId,
                    isInvitation,
                    isSelected,
                    appointmentData: appointment
                  })
                  
                  return (
                    <TableRow 
                      key={itemId}
                      className={cn(
                        "h-20 transition-all duration-200 hover:bg-muted/50 border-b border-border group",
                        isSelected && "bg-primary/5 border-l-4 border-l-primary"
                        // ✅ REMOVED: invitation background styling
                        // isInvitation && "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500"
                      )}
                    >
                      {/* Checkbox */}
                      <TableCell className="py-6">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRowSelect(itemId)}
                          aria-label={`Select appointment for ${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </TableCell>

                      {/* ✅ NEW: Invitation/Type indicator for available mode */}
                      {mode === 'available' && (
                        <TableCell className="py-6">
                          {isInvitation ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="bg-blue-600 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Invited
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You were specifically invited for this project</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Open
                            </Badge>
                          )}
                        </TableCell>
                      )}

                      {/* Customer */}
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage 
                              src={appointment.customer?.account?.profile_picture_url} 
                              alt={`${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                            />
                            <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                              {appointment.customer?.account?.first_name?.[0] || '?'}
                              {appointment.customer?.account?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="font-medium text-sm truncate text-foreground">
                              {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {appointment.customer?.account?.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Service */}
                      <TableCell className="py-6">
                        <div className="min-w-0 space-y-1">
                          <div className="font-medium text-sm truncate text-foreground">
                            {appointment.service?.name || appointment.title || 'Untitled Service'}
                          </div>
                          {(appointment.description || appointment.customer_message) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px] cursor-help">
                                  {appointment.description || appointment.customer_message}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
                                <p>{appointment.description || appointment.customer_message}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {appointment.location && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {appointment.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Appointment Time */}
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-foreground">
                            {formatDate(getAppointmentTime(appointment))}
                          </div>
                          {appointment.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Due: {formatDate(appointment.deadline)}</span>
                            </div>
                          )}
                          {/* ✅ NEW: Debug display to see what we're getting */}
                          {process.env.NODE_ENV === 'development' && appointment && (
                            <div className="text-xs text-red-500">
                              Debug: {JSON.stringify({
                                session: appointment.session,     // ✅ YOUR MAIN FIELD!
                                appointment_time: appointment.appointment_time,
                                scheduled_time: appointment.scheduled_time,
                                start_time: appointment.start_time,
                                date: appointment.date,
                                created_at: appointment.created_at
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status - Different based on mode */}
                      {mode === 'interests' ? (
                        <>
                          {/* Interest Status */}
                          <TableCell className="py-6">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help w-fit">
                                  <div className={cn("w-2 h-2 rounded-full", statusConfig.dotColor)} />
                                  <Badge className={statusConfig.className}>
                                    <statusConfig.icon className="h-3 w-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>Interest status: {statusConfig.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Interest Intent */}
                          <TableCell className="py-6">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help w-fit">
                                  <div className={cn("w-2 h-2 rounded-full", intentConfig.dotColor)} />
                                  <Badge className={intentConfig.className}>
                                    <intentConfig.icon className="h-3 w-3 mr-1" />
                                    {intentConfig.label}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>Interest level: {intentConfig.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="py-6">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help w-fit">
                                <div className={cn("w-2 h-2 rounded-full", statusConfig.dotColor)} />
                                <Badge className={statusConfig.className}>
                                  <statusConfig.icon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover text-popover-foreground border-border">
                              <p>Appointment status: {statusConfig.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}

                      {/* Files Column */}
                      <TableCell className="py-6">
                        {attachments.length === 0 ? (
                          <span className="text-muted-foreground text-sm">No files</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{attachments.length}</span>
                            {attachments.some(att => att.asset?.type === 'image') && (
                              <Image className="h-3 w-3 text-blue-600" />
                            )}
                            {attachments.some(att => att.asset?.type === 'document') && (
                              <FileText className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Requested/Expressed Date */}
                      <TableCell className="py-6">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(mode === 'interests' ? item.created_at : appointment.created_at)}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted data-[state=open]:bg-muted transition-colors text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                              disabled={!!actionLoading[itemId]}
                            >
                              {actionLoading[itemId] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Open appointment actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border" align="end">
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                              onClick={() => onView(itemId)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            {/* View Customer Files */}
                            <DropdownMenuItem 
                              onClick={() => onViewAttachments(appointment)}
                              disabled={!appointment.attachments || appointment.attachments.length === 0}
                              className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Customer Files
                            </DropdownMenuItem>
                            
                            {/* ✅ NEW: Mode-specific actions */}
                            {mode === 'available' && onExpressInterest && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => handleExpressInterest(appointment)}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  {isInvitation ? 'Respond to Invitation' : 'Express Interest'}
                                </DropdownMenuItem>
                              </>
                            )}

                            {mode === 'interests' && onUpdateInterest && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => onUpdateInterest(item.interest_id, { status: 'withdrawn' })}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Withdraw Interest
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {mode === 'assigned' && appointment.status === 'pending' && onAccept && onDecline && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => handleAction(
                                    itemId, 
                                    'accept', 
                                    () => onAccept(itemId)
                                  )}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => handleAction(
                                    itemId, 
                                    'decline', 
                                    () => onDecline(itemId)
                                  )}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Decline Appointment
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="cursor-pointer hover:bg-muted hover:text-accent-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              Reschedule
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="cursor-pointer hover:bg-muted text-muted-foreground hover:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Professional Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                {selectedRows.size > 0 ? selectedRows.size : '0'} of {appointments.length} row(s) selected
              </span>
              {appointments.length > 0 && mode !== 'interests' && (
                <span>
                  • {appointments.filter(a => a.status === 'pending').length} pending
                  • {appointments.filter(a => a.status === 'accepted').length} accepted
                </span>
              )}
              {appointments.length > 0 && mode === 'interests' && (
                <span>
                  • {appointments.filter(a => a.status === 'pending').length} pending
                  • {appointments.filter(a => a.status === 'selected').length} selected
                  • {appointments.filter(a => a.status === 'rejected').length} rejected
                </span>
              )}
              {/* ✅ NEW: Show invitation count for available mode */}
              {mode === 'available' && appointments.length > 0 && (
                <span>
                  • {appointments.filter(a => getInvitationStatus(a)).length} invitations
                </span>
              )}
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="bg-background hover:bg-muted border-border text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="bg-background hover:bg-muted border-border text-foreground"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}