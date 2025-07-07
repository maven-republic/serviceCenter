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
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Loader2
} from 'lucide-react'

export default function AppointmentInformationTable({
  appointments = [],
  onView,
  onAccept,
  onDecline,
  loading = false
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
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [appointments, sortConfig])

  // Get status variant for Badge
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'quoted':
        return 'outline'
      case 'accepted':
        return 'default'
      case 'converted':
        return 'default'
      case 'declined':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Get priority icon and color
  const getPriorityIcon = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return <Flame className="h-4 w-4 text-red-500" />
      case 'high':
        return <ArrowUp className="h-4 w-4 text-orange-500" />
      case 'low':
        return <ArrowDown className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (isTomorrow) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-gray-700" />
      : <ArrowDown className="h-4 w-4 text-gray-700" />
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-8 w-[120px]" />
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
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
          <p className="text-gray-500">You don't have any appointment requests yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {/* Table Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle>Appointments</CardTitle>
            {selectedRows.size > 0 && (
              <Badge variant="outline">
                {selectedRows.size} of {appointments.length} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === appointments.length && appointments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('customer_name')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Customer</span>
                    {getSortIcon('customer_name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('service_name')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Service</span>
                    {getSortIcon('service_name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('preferred_start')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Preferred Time</span>
                    {getSortIcon('preferred_start')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('urgency')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Priority</span>
                    {getSortIcon('urgency')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Requested</span>
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAppointments.map((appointment) => (
                <TableRow 
                  key={appointment.appointment_id}
                  className={selectedRows.has(appointment.appointment_id) ? 'bg-muted/50' : ''}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(appointment.appointment_id)}
                      onCheckedChange={() => handleRowSelect(appointment.appointment_id)}
                    />
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={appointment.customer?.account?.profile_picture_url} />
                        <AvatarFallback>
                          {appointment.customer?.account?.first_name?.[0]}
                          {appointment.customer?.account?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.customer?.account?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Service */}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {appointment.service?.name || appointment.title}
                      </div>
                      {appointment.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appointment.description.length > 50 
                            ? `${appointment.description.substring(0, 50)}...`
                            : appointment.description
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Preferred Time */}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatDate(appointment.preferred_start)}
                      </div>
                      {appointment.deadline && (
                        <div className="text-sm text-red-500">
                          Due: {formatDate(appointment.deadline)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusVariant(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(appointment.urgency)}
                      <span className="text-sm">
                        {appointment.urgency === 'standard' ? 'Medium' :
                         appointment.urgency === 'low' ? 'Low' :
                         appointment.urgency === 'high' ? 'High' : 'Urgent'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Requested */}
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(appointment.created_at)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(appointment.appointment_id)}
                        disabled={!!actionLoading[appointment.appointment_id]}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(
                              appointment.appointment_id, 
                              'decline', 
                              () => onDecline(appointment.appointment_id)
                            )}
                            disabled={!!actionLoading[appointment.appointment_id]}
                            className="text-red-600 hover:text-red-700"
                          >
                            {actionLoading[appointment.appointment_id] === 'decline' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(
                              appointment.appointment_id, 
                              'accept', 
                              () => onAccept(appointment.appointment_id)
                            )}
                            disabled={!!actionLoading[appointment.appointment_id]}
                            className="text-green-600 hover:text-green-700"
                          >
                            {actionLoading[appointment.appointment_id] === 'accept' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {selectedRows.size > 0 ? selectedRows.size : '0'} of {appointments.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}