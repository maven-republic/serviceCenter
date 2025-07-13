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
  FileText
} from 'lucide-react'

export default function AppointmentInformationTable({
  appointments = [],
  onView,
  onAccept,
  onDecline,
  onViewAttachments,
  loading = false,
  pagination,
  onPageChange
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
      setSelectedRows(new Set(appointments.map(apt => apt.appointment_id)))
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
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // Handle nested values
      if (sortConfig.key === 'customer_name') {
        aValue = `${a.customer?.account?.first_name || ''} ${a.customer?.account?.last_name || ''}`.trim()
        bValue = `${b.customer?.account?.first_name || ''} ${b.customer?.account?.last_name || ''}`.trim()
      }

      if (sortConfig.key === 'service_name') {
        aValue = a.service?.name || a.title || ''
        bValue = b.service?.name || b.title || ''
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
  }, [appointments, sortConfig])

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
      }
    }
    return configs[status] || configs.pending
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
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 bg-background">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No appointments found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any appointment requests yet. Once customers start booking services, 
            they'll appear here for you to review and manage.
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
              <CardTitle className="text-lg text-foreground">Appointments Overview</CardTitle>
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
                    onClick={() => handleSort('preferred_start')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Appointment Time </span>
                      {getSortIcon('preferred_start')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Status</span>
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  
                  {/* Files Column */}
                  <TableHead className="py-4 bg-background/95 text-muted-foreground font-medium">
                    Files
                  </TableHead>
                  
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('urgency')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Priority</span>
                      {getSortIcon('urgency')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors py-4 bg-background/95 text-muted-foreground"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Requested</span>
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
                {sortedAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status)
                  const priorityConfig = getPriorityConfig(appointment.urgency)
                  const isSelected = selectedRows.has(appointment.appointment_id)
                  const attachments = appointment.attachments || []
                  
                  return (
                    <TableRow 
                      key={appointment.appointment_id}
                      className={cn(
                        "h-20 transition-all duration-200 hover:bg-muted/50 border-b border-border group",
                        isSelected && "bg-primary/5 border-l-4 border-l-primary"
                      )}
                    >
                      {/* Checkbox */}
                      <TableCell className="py-6">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRowSelect(appointment.appointment_id)}
                          aria-label={`Select appointment for ${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </TableCell>

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
                          {appointment.description && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px] cursor-help">
                                  {appointment.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
                                <p>{appointment.description}</p>
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

                      {/* Preferred Time */}
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-foreground">
                            {formatDate(appointment.preferred_start)}
                          </div>
                          {appointment.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Due: {formatDate(appointment.deadline)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
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

                      {/* Priority */}
                      <TableCell className="py-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "flex items-center space-x-2 px-3 py-2 rounded-md cursor-help w-fit transition-colors",
                              priorityConfig.className
                            )}>
                              <div className={cn("w-2 h-2 rounded-full", priorityConfig.dotColor)} />
                              <priorityConfig.icon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {priorityConfig.label}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border-border">
                            <p>Priority level: {priorityConfig.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Requested */}
                      <TableCell className="py-6">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(appointment.created_at)}
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
                              disabled={!!actionLoading[appointment.appointment_id]}
                            >
                              {actionLoading[appointment.appointment_id] ? (
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
                              onClick={() => onView(appointment.appointment_id)}
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
                            
                            {appointment.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => handleAction(
                                    appointment.appointment_id, 
                                    'accept', 
                                    () => onAccept(appointment.appointment_id)
                                  )}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-muted hover:text-accent-foreground"
                                  onClick={() => handleAction(
                                    appointment.appointment_id, 
                                    'decline', 
                                    () => onDecline(appointment.appointment_id)
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
                              Archive Appointment
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
              {appointments.length > 0 && (
                <span>
                  • {appointments.filter(a => a.status === 'pending').length} pending
                  • {appointments.filter(a => a.status === 'accepted').length} accepted
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