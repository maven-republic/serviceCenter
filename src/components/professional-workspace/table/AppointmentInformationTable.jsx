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
  DollarSign,
  Edit,
  Trash2,
  MessageSquare
} from 'lucide-react'

export default function AppointmentInformationTable({
  appointments = [],
  onView,
  onAccept,
  onDecline,
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

  // Get status variant and styling
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        variant: 'secondary', 
        icon: Clock, 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Pending'
      },
      quoted: { 
        variant: 'outline', 
        icon: DollarSign, 
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'Quoted'
      },
      accepted: { 
        variant: 'default', 
        icon: Check, 
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Accepted'
      },
      converted: { 
        variant: 'default', 
        icon: Check, 
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Converted'
      },
      declined: { 
        variant: 'destructive', 
        icon: X, 
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'Declined'
      },
      cancelled: { 
        variant: 'destructive', 
        icon: X, 
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'Cancelled'
      }
    }
    return configs[status] || configs.pending
  }

  // Get priority configuration
  const getPriorityConfig = (urgency) => {
    const configs = {
      urgent: { 
        icon: Flame, 
        color: 'text-red-500',
        label: 'Urgent',
        bgColor: 'bg-red-50'
      },
      high: { 
        icon: ArrowUp, 
        color: 'text-orange-500',
        label: 'High',
        bgColor: 'bg-orange-50'
      },
      standard: { 
        icon: Minus, 
        color: 'text-gray-500',
        label: 'Medium',
        bgColor: 'bg-gray-50'
      },
      low: { 
        icon: ArrowDown, 
        color: 'text-blue-500',
        label: 'Low',
        bgColor: 'bg-blue-50'
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

  // Loading skeleton with better structure
  const LoadingSkeleton = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header skeleton */}
          <div className="flex items-center space-x-4 pb-2 border-b">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Table rows skeleton */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <Skeleton className="h-4 w-4" />
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8" />
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
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
      <Card className="w-full">
        {/* Table Header */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-lg">Appointments</CardTitle>
              {selectedRows.size > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedRows.size} of {appointments.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message ({selectedRows.size})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedRows.size})
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border rounded-lg mx-6 mb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === appointments.length && appointments.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all appointments"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Customer</span>
                      {getSortIcon('customer_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('service_name')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Service</span>
                      {getSortIcon('service_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('preferred_start')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Preferred Time</span>
                      {getSortIcon('preferred_start')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('urgency')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Priority</span>
                      {getSortIcon('urgency')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Requested</span>
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status)
                  const priorityConfig = getPriorityConfig(appointment.urgency)
                  const isSelected = selectedRows.has(appointment.appointment_id)
                  
                  return (
                    <TableRow 
                      key={appointment.appointment_id}
                      className={`transition-colors hover:bg-muted/50 ${
                        isSelected ? 'bg-muted/30 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRowSelect(appointment.appointment_id)}
                          aria-label={`Select appointment for ${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                        />
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage 
                              src={appointment.customer?.account?.profile_picture_url} 
                              alt={`${appointment.customer?.account?.first_name} ${appointment.customer?.account?.last_name}`}
                            />
                            <AvatarFallback className="text-xs font-medium">
                              {appointment.customer?.account?.first_name?.[0] || '?'}
                              {appointment.customer?.account?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
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
                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {appointment.service?.name || appointment.title || 'Untitled Service'}
                          </div>
                          {appointment.description && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px] cursor-help">
                                  {appointment.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{appointment.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {appointment.location && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {appointment.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Preferred Time */}
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {formatDate(appointment.preferred_start)}
                          </div>
                          {appointment.deadline && (
                            <div className="text-xs text-red-600 flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Due: {formatDate(appointment.deadline)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant={statusConfig.variant}
                              className={`${statusConfig.color} cursor-help`}
                            >
                              <statusConfig.icon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Appointment status: {statusConfig.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex items-center space-x-2 px-2 py-1 rounded-md ${priorityConfig.bgColor} cursor-help`}>
                              <priorityConfig.icon className={`h-4 w-4 ${priorityConfig.color}`} />
                              <span className="text-sm font-medium">
                                {priorityConfig.label}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Priority level: {priorityConfig.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* Requested */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(appointment.created_at)}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted data-[state=open]:bg-muted transition-colors"
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
                          <DropdownMenuContent 
                            align="end" 
                            className="w-48 bg-background border border-border shadow-lg z-50"
                            style={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3), 0 20px 25px -5px rgb(0 0 0 / 0.2)'
                            }}
                          >
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => onView(appointment.appointment_id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {appointment.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600 focus:text-green-600"
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
                                  className="cursor-pointer text-red-600 focus:text-red-600"
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
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Phone className="mr-2 h-4 w-4" />
                              Call Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" />
                              Reschedule
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Appointment
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

          {/* Enhanced Table Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
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