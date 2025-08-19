// src/components/professional-workspace/table/columns.js

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  MoreHorizontal,
  Heart,
  Check,
  X,
  Edit,
  Send,
  CheckCircle,
  Crown,
  Paperclip,
  Image,
  FileText,
  Mail,
  Phone,
  AlertTriangle,
  Clock,
  Flame,
  DollarSign,
  Building2,
  UserCheck,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ===== UTILITY FUNCTIONS =====

// Format date with smart relative time
const formatAppointmentTime = (dateString) => {
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

// Get appointment time from multiple possible fields - HANDLES BOTH DATA STRUCTURES
const getAppointmentTime = (appointment, mode) => {
  if (!appointment) return null
  
  if (mode === 'interests') {
    // Interests mode has nested structure
    const appt = appointment.appointment || appointment
    return appt.session || appt.appointment_time || appt.created_at
  } else {
    // Available/assigned modes have flattened structure
    return appointment.session || appointment.created_at || null
  }
}

// FLAT Status configuration - removed gradients and complex styling
const getStatusConfig = (status, mode = 'appointment') => {
  const configs = {
    // Appointment statuses - FLAT DESIGN
    pending: { 
      variant: 'outline',
      className: 'bg-white text-gray-600 border-gray-300',
      icon: Clock,
      label: 'Pending',
      dotColor: 'bg-gray-400'
    },
    interested: { 
      variant: 'outline',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Heart,
      label: 'Interested',
      dotColor: 'bg-blue-500'
    },
    competing: { 
      variant: 'outline',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Flame,
      label: 'Competing',
      dotColor: 'bg-orange-500'
    },
    evaluating: { 
      variant: 'outline',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Clock,
      label: 'Evaluating',
      dotColor: 'bg-purple-500'
    },
    proposed: { 
      variant: 'outline',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Edit,
      label: 'Proposed',
      dotColor: 'bg-indigo-500'
    },
    scheduled: { 
      variant: 'outline',
      className: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Calendar,
      label: 'Scheduled',
      dotColor: 'bg-teal-500'
    },
    assessing: { 
      variant: 'outline',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Clock,
      label: 'Assessing',
      dotColor: 'bg-orange-500'
    },
    assessed: { 
      variant: 'outline',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
      label: 'Assessed',
      dotColor: 'bg-emerald-500'
    },
    quoted: { 
      variant: 'outline',
      className: 'bg-white text-gray-700 border-gray-300',
      icon: DollarSign,
      label: 'Quoted',
      dotColor: 'bg-gray-500'
    },
    comparing: { 
      variant: 'outline',
      className: 'bg-violet-50 text-violet-700 border-violet-200',
      icon: Clock,
      label: 'Comparing',
      dotColor: 'bg-violet-500'
    },
    negotiating: { 
      variant: 'outline',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: Edit,
      label: 'Negotiating',
      dotColor: 'bg-yellow-500'
    },
    reviewing: { 
      variant: 'outline',
      className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: Clock,
      label: 'Reviewing',
      dotColor: 'bg-cyan-500'
    },
    approved: { 
      variant: 'default',
      className: 'bg-green-600 text-white border-green-600',
      icon: Check,
      label: 'Approved',
      dotColor: 'bg-white'
    },
    converting: { 
      variant: 'default',
      className: 'bg-blue-600 text-white border-blue-600',
      icon: Clock,
      label: 'Converting',
      dotColor: 'bg-white'
    },
    converted: { 
      variant: 'default',
      className: 'bg-blue-600 text-white border-blue-600',
      icon: Check,
      label: 'Converted',
      dotColor: 'bg-white'
    },
    declined: { 
      variant: 'outline',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: X,
      label: 'Declined',
      dotColor: 'bg-red-500'
    },
    withdrawn: { 
      variant: 'outline',
      className: 'bg-gray-50 text-gray-600 border-gray-200',
      icon: X,
      label: 'Withdrawn',
      dotColor: 'bg-gray-400'
    },
    cancelled: { 
      variant: 'outline',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: X,
      label: 'Cancelled',
      dotColor: 'bg-red-500'
    },
    
    // Interest statuses (for interests mode) - FLAT DESIGN
    selected: {
      variant: 'default',
      className: 'bg-green-600 text-white border-green-600',
      icon: UserCheck,
      label: 'Selected',
      dotColor: 'bg-white'
    },
    confirmed: {
      variant: 'outline',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
      label: 'Confirmed',
      dotColor: 'bg-emerald-500'
    },
    updated: {
      variant: 'outline',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Edit,
      label: 'Updated',
      dotColor: 'bg-amber-500'
    },
    rejected: {
      variant: 'outline',
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: X,
      label: 'Rejected',
      dotColor: 'bg-red-500'
    }
  }
  return configs[status] || configs.pending
}

// ===== FLAT CELL COMPONENTS =====

// Selection checkbox cell - FLAT DESIGN
const SelectionCell = ({ item, isSelected, onToggle }) => (
  <Checkbox
    checked={isSelected}
    onCheckedChange={onToggle}
    aria-label={`Select appointment for ${item.customer?.first_name || 'customer'}`}
    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white h-4 w-4"
  />
)

// Type indicator cell - FLAT DESIGN
const TypeCell = ({ item }) => {
  const isInvitation = item.is_invited || (item.recipients && item.recipients.length > 0)
  
  return isInvitation ? (
    <Tooltip>
      <TooltipTrigger>
        <Badge className="bg-blue-600 text-white text-xs px-2 py-1 h-5 border-0">
          <Crown className="h-3 w-3 mr-1" />
          Invited
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>You were specifically invited for this project</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <Badge variant="outline" className="text-xs px-2 py-1 h-5 bg-white text-gray-600 border-gray-300">
      Open
    </Badge>
  )
}

// Customer information cell - FLAT DESIGN
const CustomerCell = ({ item, mode }) => {
  let firstName, lastName, email, profilePicture
  
  if (mode === 'interests') {
    // Interests mode has nested structure
    firstName = item.appointment?.customer?.account?.first_name || item.customer?.account?.first_name || ''
    lastName = item.appointment?.customer?.account?.last_name || item.customer?.account?.last_name || ''
    email = item.appointment?.customer?.account?.email || item.customer?.account?.email || ''
    profilePicture = item.appointment?.customer?.account?.profile_picture_url || item.customer?.account?.profile_picture_url
  } else {
    // Available/assigned modes have flattened structure
    firstName = item.first_name || ''
    lastName = item.last_name || ''
    email = item.email || ''
    profilePicture = item.profile_picture_url
  }
  
  if (!firstName && !lastName && !email) {
    return <span className="text-gray-500">Unknown Customer</span>
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-7 w-7 border border-gray-200 flex-shrink-0">
        <AvatarImage 
          src={profilePicture} 
          alt={`${firstName} ${lastName}`}
        />
        <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-600">
          {firstName?.[0] || '?'}
          {lastName?.[0] || ''}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-gray-900 truncate">
          {firstName} {lastName} {(!firstName && !lastName) && 'Unknown Customer'}
        </div>
        {email && (
          <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[120px]">
              {email}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Service information cell - FLAT DESIGN
const ServiceCell = ({ item, mode }) => {
  let serviceName, description
  
  if (mode === 'interests') {
    // Interests mode has nested structure
    serviceName = item.appointment?.service?.name ||        
                 item.service?.name ||                     
                 item.appointment?.title ||                
                 'Untitled Service'
    
    description = item.appointment?.service?.description || 
                 item.service?.description ||              
                 item.appointment?.description ||          
                 item.appointment?.customer_message
  } else {
    // Available/assigned modes have flattened structure
    serviceName = item.service_name ||    
                 item.title ||           
                 'Untitled Service'
    
    description = item.service_description || 
                 item.description || 
                 item.customer_message
  }
  
  return (
    <div className="min-w-0">
      <div className="font-medium text-sm text-gray-900 truncate">
        {serviceName}
      </div>
      {description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-gray-500 truncate max-w-[150px] cursor-help">
              {description}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-white border border-gray-200">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// Time cell with smart formatting - FLAT DESIGN
const TimeCell = ({ item, mode }) => {
  let appointment, appointmentTime
  
  if (mode === 'interests') {
    // Interests mode has nested structure
    appointment = item.appointment || item
    appointmentTime = appointment.session || appointment.appointment_time || appointment.created_at
  } else {
    // Available/assigned modes have flattened structure
    appointment = item
    appointmentTime = getAppointmentTime(appointment, mode)
  }
  
  return (
    <div>
      <div className="font-medium text-sm text-gray-900">
        {formatAppointmentTime(appointmentTime)}
      </div>
      {appointment.deadline && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Due: {formatAppointmentTime(appointment.deadline)}</span>
        </div>
      )}
    </div>
  )
}

// Status badge cell - FIXED DESIGN
const StatusCell = ({ item, mode = 'available' }) => {
  let status, statusType, tooltipText
  
  if (mode === 'interests') {
    // Show interest-level status
    status = item.status
    statusType = 'interest'
    tooltipText = `Interest status: ${status}`
  } else {
    // Show appointment-level status for available/assigned modes
    status = item.status  // This is appointment status in these modes
    statusType = 'appointment'
    tooltipText = `Appointment status: ${status}`
  }
  
  const statusConfig = getStatusConfig(status, statusType)
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-fit">
          <div className="flex items-center gap-2 cursor-help w-fit">
            <div className={cn("w-2 h-2 rounded-full", statusConfig.dotColor)} />
            <Badge className={cn(statusConfig.className, "text-xs px-2 py-1 h-5 font-medium")}>
              <statusConfig.icon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-white border border-gray-200">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Attachments indicator cell - FLAT DESIGN
const AttachmentsCell = ({ item, mode }) => {
  const appointment = mode === 'interests' ? item.appointment : item
  
  // Based on your schema, attachments are in the attachment table
  const attachments = appointment?.attachments || appointment?.attachment || []
  
  if (attachments.length === 0) {
    return <span className="text-xs text-gray-400">-</span>
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Paperclip className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</p>
        </TooltipContent>
      </Tooltip>
      
      <div className="flex gap-1">
        {attachments.some(att => att.type?.startsWith('image/')) && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center text-xs text-gray-500">
                <Image className="h-3 w-3 mr-1" />
                <span>{attachments.filter(att => att.type?.startsWith('image/')).length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Images attached</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {attachments.some(att => !att.type?.startsWith('image/')) && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center text-xs text-gray-500">
                <FileText className="h-3 w-3 mr-1" />
                <span>{attachments.filter(att => !att.type?.startsWith('image/')).length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Documents attached</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

// Date cell - FLAT DESIGN
const DateCell = ({ item, mode = 'available' }) => {
  const date = mode === 'interests' ? item.created_at : (item.appointment?.created_at || item.created_at)
  
  return (
    <div className="text-sm text-gray-500">
      {formatAppointmentTime(date)}
    </div>
  )
}

// Actions dropdown cell - FLAT DESIGN
const ActionsCell = ({ item, mode = 'available', onAction }) => {
  const appointment = mode === 'interests' ? item.appointment : item
  const itemId = appointment?.appointment_id || item.appointment_id
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200">
        {/* Available mode actions */}
        {mode === 'available' && (
          <DropdownMenuItem 
            className="flex items-center text-gray-700 hover:bg-gray-50"
            onClick={() => onAction?.('express_interest', item)}
          >
            <Heart className="h-4 w-4 mr-2" />
            {item.is_invited ? 'Respond to Invitation' : 'Express Interest'}
          </DropdownMenuItem>
        )}

        {/* Interests mode actions */}
        {mode === 'interests' && item.status === 'selected' && (
          <DropdownMenuItem 
            className="flex items-center text-green-600 hover:bg-green-50"
            onClick={() => onAction?.('respond_to_selection', item)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Respond to Selection
          </DropdownMenuItem>
        )}

        {mode === 'interests' && ['interested', 'quoted', 'confirmed'].includes(item.status) && (
          <DropdownMenuItem 
            className="flex items-center text-gray-700 hover:bg-gray-50"
            onClick={() => onAction?.('update_interest', item)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Interest
          </DropdownMenuItem>
        )}

        {mode === 'interests' && (item.status === 'rejected' || item.status === 'declined_by_professional') && (
          <DropdownMenuItem 
            className="flex items-center text-blue-600 hover:bg-blue-50"
            onClick={() => onAction?.('reapply', item)}
          >
            <Heart className="h-4 w-4 mr-2" />
            Reapply
          </DropdownMenuItem>
        )}

        {/* Assigned mode actions */}
        {mode === 'assigned' && (
          <>
            <DropdownMenuItem 
              className="flex items-center text-green-600 hover:bg-green-50"
              onClick={() => onAction?.('accept', item)}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept Appointment
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center text-red-600 hover:bg-red-50"
              onClick={() => onAction?.('decline', item)}
            >
              <X className="h-4 w-4 mr-2" />
              Decline Appointment
            </DropdownMenuItem>
          </>
        )}

        {/* Common actions */}
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          className="flex items-center text-gray-700 hover:bg-gray-50"
          onClick={() => onAction?.('share', item)}
        >
          <Send className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ===== COLUMN DEFINITIONS - FLAT DESIGN =====

// Base columns used across all modes
const baseColumns = [
  {
    key: 'selection',
    header: '',
    width: 'w-8',
    sortable: false,
    cell: SelectionCell,
    // FLAT: Use a function instead of component to avoid DOM prop passing
    headerCell: ({ selectedCount, totalCount, onSelectAll }) => {
      // Handle indeterminate properly
      const isIndeterminate = selectedCount > 0 && selectedCount < totalCount
      const isChecked = selectedCount === totalCount && totalCount > 0
      
      return (
        <Checkbox
          checked={isChecked}
          indeterminate={isIndeterminate ? true : undefined}
          onCheckedChange={onSelectAll}
          aria-label="Select all appointments"
          className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white h-4 w-4"
        />
      )
    }
  },
  {
    key: 'customer',
    header: 'Customer',
    sortable: true,
    searchable: true,
    cell: CustomerCell,
    accessorFn: (item, mode) => {
      // Fixed to handle both flattened and nested data structures
      if (mode === 'interests') {
        const firstName = item.appointment?.customer?.account?.first_name || item.customer?.account?.first_name || ''
        const lastName = item.appointment?.customer?.account?.last_name || item.customer?.account?.last_name || ''
        return `${firstName} ${lastName}`.trim()
      } else {
        return `${item.first_name || ''} ${item.last_name || ''}`.trim()
      }
    }
  },
  {
    key: 'service',
    header: 'Service',
    sortable: true,
    searchable: true,
    cell: ServiceCell,
    accessorFn: (item, mode) => {
      // Fixed to handle both flattened and nested data structures
      if (mode === 'interests') {
        return item.appointment?.service?.name || item.service?.name || item.appointment?.title || ''
      } else {
        return item.service_name || item.title || ''
      }
    }
  },
  {
    key: 'time',
    header: 'Time',
    sortable: true,
    cell: TimeCell,
    accessorFn: (item, mode) => {
      // Fixed to handle both flattened and nested data structures
      if (mode === 'interests') {
        const appointment = item.appointment || item
        return appointment.session || appointment.appointment_time || appointment.created_at
      } else {
        return getAppointmentTime(item, mode)
      }
    }
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    cell: StatusCell,
    accessorFn: (item, mode) => {
      // Fixed to handle both flattened and nested data structures
      return item.status
    }
  },
  {
    key: 'attachments',
    header: 'Files',
    width: 'w-12',
    sortable: false,
    cell: AttachmentsCell
  },
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    cell: DateCell,
    accessorFn: (item, mode) => {
      // Fixed to handle both flattened and nested data structures
      return item.created_at
    }
  },
  {
    key: 'actions',
    header: '',
    width: 'w-12',
    sortable: false,
    cell: ActionsCell,
    cellClassName: 'text-right'
  }
]

// Mode-specific column configurations
export const getColumnsForMode = (mode = 'available') => {
  const columns = [...baseColumns]
  
  // Add type column for available mode (invitation indicator)
  if (mode === 'available') {
    columns.splice(1, 0, {
      key: 'type',
      header: 'Type',
      width: 'w-12',
      sortable: false,
      cell: TypeCell
    })
  }
  
  return columns.map(col => ({
    ...col,
    // Pass mode to cells that need it
    cell: (cellProps) => {
      if (typeof col.cell === 'function') {
        return col.cell({ 
          ...cellProps, 
          mode 
        })
      }
      return col.cell
    }
  }))
}

// Export column definitions for different modes
export const availableColumns = getColumnsForMode('available')
export const interestsColumns = getColumnsForMode('interests')
export const assignedColumns = getColumnsForMode('assigned')

// Default export
export default {
  available: availableColumns,
  interests: interestsColumns,
  assigned: assignedColumns,
  getColumnsForMode
}