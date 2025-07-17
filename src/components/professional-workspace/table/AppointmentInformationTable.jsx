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
  UserCheck,
  Crown
} from 'lucide-react'

export default function AppointmentInformationTable({
  appointments = [],
  professionalId,
  onView,
  onAccept,
  onDecline,
  onExpressInterest,
  onUpdateInterest,
  onViewAttachments,
  loading = false,
  pagination,
  onPageChange,
  mode = 'assigned' // 'available', 'interests', 'assigned'
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

  // ✅ FIXED: Express interest now opens the form instead of auto-submitting
  const handleExpressInterest = (appointment) => {
    // Open the appointment details view which will show the form
    onView(appointment.appointment_id)
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

      if (sortConfig.key === 'urgency') {
        aValue = aData.urgency || aData.priority || 'standard'
        bValue = bData.urgency || bData.priority || 'standard'
      }
      if (sortConfig.key === 'appointment_time') {
        aValue = new Date(aData.session || aData.appointment_time || 0)
        bValue = new Date(bData.session || bData.appointment_time || 0)
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

  // Get appointment data based on mode
  const getAppointmentData = (item) => {
    if (!item) return null
    return mode === 'interests' ? item.appointment : item
  }

  // Get appointment time with multiple field fallbacks
  const getAppointmentTime = (appointment) => {
    if (!appointment) return null
    
    return appointment.session ||
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

  // Status configuration
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
      interested: {
        variant: 'default',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Heart,
        label: 'Interested',
        dotColor: 'bg-blue-600'
      },
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

  // Interest intent configuration
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
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

  // Get table title based on mode
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

  // Loading skeleton
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

        <CardContent className="p-0 flex-1 bg-background">
          <div className="border-0 rounded-none max-h-[600px] overflow-y-auto">
            <Table>
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

              <TableBody>
                {sortedAppointments.map((item) => {
                  const appointment = getAppointmentData(item)
                  
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
                  
                  return (
                    <TableRow 
                      key={itemId}
                      className={cn(
                        "h-20 transition-all duration-200 hover:bg-muted/50 border-b border-border group cursor-pointer",
                        isSelected && "bg-primary/5 border-l-4 border-l-primary"
                      )}
                      onClick={() => onView(itemId)}
                    >
                      <TableCell className="py-6" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRowSelect(itemId)}
                          aria-label={`Select appointment for ${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </TableCell>

                      {mode === 'available' && (
                        <TableCell className="py-6">
                          {isInvitation ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="bg-blue-600 text-white text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
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
                        </div>
                      </TableCell>

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
                        </div>
                      </TableCell>

                      {mode === 'interests' ? (
                        <>
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

                      <TableCell className="py-6">
                        <div className="flex items-center space-x-2">
                          {attachments.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onViewAttachments?.(appointment.appointment_id)
                                  }}
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {attachments.some(att => att.type?.startsWith('image/')) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Image className="h-3 w-3 mr-1" />
                                  <span>{attachments.filter(att => att.type?.startsWith('image/')).length}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>Images attached</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {attachments.some(att => !att.type?.startsWith('image/')) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3 mr-1" />
                                  <span>{attachments.filter(att => !att.type?.startsWith('image/')).length}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>Documents attached</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {attachments.length === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-6">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(mode === 'interests' ? item.created_at : appointment.created_at)}
                        </div>
                      </TableCell>

                      <TableCell className="text-right py-6" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                              disabled={actionLoading[itemId]}
                            >
                              {actionLoading[itemId] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                            <DropdownMenuItem 
                              className="flex items-center text-foreground hover:bg-muted"
                              onClick={() => onView(itemId)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {mode === 'available' && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="flex items-center text-foreground hover:bg-muted"
                                  onClick={() => handleExpressInterest(appointment)}
                                >
                                  <Heart className="h-4 w-4 mr-2" />
                                  {isInvitation ? 'Respond to Invitation' : 'Express Interest'}
                                </DropdownMenuItem>
                              </>
                            )}

                            {mode === 'interests' && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="flex items-center text-foreground hover:bg-muted"
                                  onClick={() => handleAction(
                                    itemId,
                                    'update_interest',
                                    () => onUpdateInterest?.(item.interest_id)
                                  )}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Update Interest
                                </DropdownMenuItem>
                              </>
                            )}

                            {mode === 'assigned' && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="flex items-center text-green-600 hover:bg-green-50"
                                  onClick={() => handleAction(
                                    itemId,
                                    'accept',
                                    () => onAccept?.(itemId)
                                  )}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center text-red-600 hover:bg-red-50"
                                  onClick={() => handleAction(
                                    itemId,
                                    'decline',
                                    () => onDecline?.(itemId)
                                  )}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Decline Appointment
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="flex items-center text-foreground hover:bg-muted"
                              onClick={() => {/* TODO: Share functionality */}}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Share
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
        </CardContent>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="bg-background hover:bg-muted border-border text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const current = pagination.currentPage
                    return page === 1 || 
                           page === pagination.totalPages || 
                           (page >= current - 1 && page <= current + 1)
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(page)}
                        className={cn(
                          "w-8 h-8 p-0",
                          page === pagination.currentPage 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background hover:bg-muted border-border text-foreground"
                        )}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="bg-background hover:bg-muted border-border text-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}