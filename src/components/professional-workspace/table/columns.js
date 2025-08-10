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

// Status configuration for different contexts
const getStatusConfig = (status, mode = 'appointment') => {
  const configs = {
    // Appointment statuses from your DB schema
    pending: { 
      variant: 'secondary',
      className: 'bg-muted text-muted-foreground border-border',
      icon: Clock,
      label: 'Pending',
      dotColor: 'bg-muted-foreground'
    },
    interested: { 
      variant: 'outline',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Heart,
      label: 'Interested',
      dotColor: 'bg-blue-600'
    },
    competing: { 
      variant: 'outline',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Flame,
      label: 'Competing',
      dotColor: 'bg-amber-600'
    },
    evaluating: { 
      variant: 'outline',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Clock,
      label: 'Evaluating',
      dotColor: 'bg-purple-600'
    },
    proposed: { 
      variant: 'outline',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Edit,
      label: 'Proposed',
      dotColor: 'bg-indigo-600'
    },
    scheduled: { 
      variant: 'outline',
      className: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: Calendar,
      label: 'Scheduled',
      dotColor: 'bg-teal-600'
    },
    assessing: { 
      variant: 'outline',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Clock,
      label: 'Assessing',
      dotColor: 'bg-orange-600'
    },
    assessed: { 
      variant: 'outline',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Assessed',
      dotColor: 'bg-emerald-600'
    },
    quoted: { 
      variant: 'outline',
      className: 'bg-background text-foreground border-border hover:bg-muted/50',
      icon: DollarSign,
      label: 'Quoted',
      dotColor: 'bg-primary'
    },
    comparing: { 
      variant: 'outline',
      className: 'bg-violet-100 text-violet-800 border-violet-200',
      icon: Clock,
      label: 'Comparing',
      dotColor: 'bg-violet-600'
    },
    negotiating: { 
      variant: 'outline',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Edit,
      label: 'Negotiating',
      dotColor: 'bg-yellow-600'
    },
    reviewing: { 
      variant: 'outline',
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: Clock,
      label: 'Reviewing',
      dotColor: 'bg-cyan-600'
    },
    approved: { 
      variant: 'default',
      className: 'bg-green-600 text-white hover:bg-green-700',
      icon: Check,
      label: 'Approved',
      dotColor: 'bg-white'
    },
    converting: { 
      variant: 'default',
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
      icon: Clock,
      label: 'Converting',
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
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: X,
      label: 'Declined',
      dotColor: 'bg-red-600'
    },
    withdrawn: { 
      variant: 'secondary',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: X,
      label: 'Withdrawn',
      dotColor: 'bg-gray-600'
    },
    cancelled: { 
      variant: 'secondary',
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: X,
      label: 'Cancelled',
      dotColor: 'bg-red-600'
    },
    
    // Interest statuses (for interests mode)
    selected: {
      variant: 'default',
      className: 'bg-green-600 text-white hover:bg-green-700',
      icon: UserCheck,
      label: 'Selected',
      dotColor: 'bg-white'
    },
    confirmed: {
      variant: 'default',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Confirmed',
      dotColor: 'bg-emerald-600'
    },
    updated: {
      variant: 'default',
      className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      icon: Edit,
      label: 'Updated',
      dotColor: 'bg-amber-500'
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

// ===== CELL COMPONENTS =====

// Selection checkbox cell
const SelectionCell = ({ item, isSelected, onToggle }) => (
  <Checkbox
    checked={isSelected}
    onCheckedChange={onToggle}
    aria-label={`Select appointment for ${item.customer?.first_name || 'customer'}`}
    className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-3 w-3"
  />
)

// Type indicator cell (for available mode)
const TypeCell = ({ item }) => {
  const isInvitation = item.is_invited || (item.recipients && item.recipients.length > 0)
  
  return isInvitation ? (
    <Tooltip>
      <TooltipTrigger>
        <Badge className="bg-blue-600 text-white text-[10px] px-1 py-0 h-4">
          <Crown className="h-2 w-2 mr-0.5" />
          Invited
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>You were specifically invited for this project</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
      Open
    </Badge>
  )
}

// Customer information cell - FIXED FOR BOTH FLATTENED AND NESTED DATA
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
    return <span className="text-muted-foreground">Unknown Customer</span>
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-6 w-6 border border-border flex-shrink-0">
        <AvatarImage 
          src={profilePicture} 
          alt={`${firstName} ${lastName}`}
        />
        <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
          {firstName?.[0] || '?'}
          {lastName?.[0] || ''}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-xs truncate text-foreground">
          {firstName} {lastName} {(!firstName && !lastName) && 'Unknown Customer'}
        </div>
        {email && (
          <div className="hidden sm:flex items-center space-x-1 text-[10px] text-muted-foreground">
            <Mail className="h-2 w-2" />
            <span className="truncate max-w-[120px]">
              {email}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Service information cell - FIXED FOR BOTH FLATTENED AND NESTED DATA
const ServiceCell = ({ item, mode }) => {
  let serviceName, description
  
  if (mode === 'interests') {
    // Interests mode has nested structure
    serviceName = item.appointment?.service?.name ||        // From nested service object
                 item.service?.name ||                     // Fallback to direct service
                 item.appointment?.title ||                // Fallback to appointment title
                 'Untitled Service'
    
    description = item.appointment?.service?.description || // From nested service object
                 item.service?.description ||              // Fallback to direct service
                 item.appointment?.description ||          // Fallback to appointment description
                 item.appointment?.customer_message
  } else {
    // Available/assigned modes have flattened structure
    serviceName = item.service_name ||    // From your flattened API response
                 item.title ||           // Fallback to appointment title
                 'Untitled Service'
    
    description = item.service_description || // From your flattened API response
                 item.description || 
                 item.customer_message
  }
  
  return (
    <div className="min-w-0">
      <div className="font-medium text-xs truncate text-foreground">
        {serviceName}
      </div>
      {description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-[10px] text-muted-foreground truncate max-w-[150px] cursor-help">
              {description}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// Time cell with smart formatting - FIXED FOR BOTH DATA STRUCTURES
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
      <div className="font-medium text-xs text-foreground">
        {formatAppointmentTime(appointmentTime)}
      </div>
      {appointment.deadline && (
        <div className="text-[10px] text-muted-foreground flex items-center space-x-1">
          <AlertTriangle className="h-2 w-2" />
          <span>Due: {formatAppointmentTime(appointment.deadline)}</span>
        </div>
      )}
    </div>
  )
}

// Status badge cell - FIXED FOR BOTH DATA STRUCTURES
const StatusCell = ({ item, mode = 'available' }) => {
  // Based on your schema, get the correct status field
  const status = mode === 'interests' ? item.status : (item.appointment?.status || item.status)
  const statusConfig = getStatusConfig(status, mode)
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-fit">
          <div className="flex items-center gap-1 cursor-help w-fit">
            <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
            <Badge className={cn(statusConfig.className, "text-[10px] px-1 py-0 h-4")}>
              <statusConfig.icon className="h-2 w-2 mr-0.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-popover text-popover-foreground border-border">
        <p>{mode === 'interests' ? 'Interest' : 'Appointment'} status: {status}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Attachments indicator cell - FIXED FOR BOTH DATA STRUCTURES
const AttachmentsCell = ({ item, mode }) => {
  const appointment = mode === 'interests' ? item.appointment : item
  
  // Based on your schema, attachments are in the attachment table
  // This would need to be joined in your query, or passed as part of the data
  const attachments = appointment?.attachments || appointment?.attachment || []
  
  if (attachments.length === 0) {
    return <span className="text-[10px] text-muted-foreground">-</span>
  }
  
  return (
    <div className="flex items-center space-x-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</p>
        </TooltipContent>
      </Tooltip>
      
      {attachments.some(att => att.type?.startsWith('image/')) && (
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center text-[10px] text-muted-foreground">
              <Image className="h-2 w-2 mr-0.5" />
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
            <div className="flex items-center text-[10px] text-muted-foreground">
              <FileText className="h-2 w-2 mr-0.5" />
              <span>{attachments.filter(att => !att.type?.startsWith('image/')).length}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Documents attached</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// Date cell - FIXED FOR BOTH DATA STRUCTURES
const DateCell = ({ item, mode = 'available' }) => {
  const date = mode === 'interests' ? item.created_at : (item.appointment?.created_at || item.created_at)
  
  return (
    <div className="text-xs text-muted-foreground">
      {formatAppointmentTime(date)}
    </div>
  )
}

// Actions dropdown cell
const ActionsCell = ({ item, mode = 'available', onAction }) => {
  const appointment = mode === 'interests' ? item.appointment : item
  const itemId = appointment?.appointment_id || item.appointment_id
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
        {/* Available mode actions */}
        {mode === 'available' && (
          <DropdownMenuItem 
            className="flex items-center text-foreground hover:bg-muted"
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
            className="flex items-center text-foreground hover:bg-muted"
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
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="flex items-center text-foreground hover:bg-muted"
          onClick={() => onAction?.('share', item)}
        >
          <Send className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ===== COLUMN DEFINITIONS - FIXED FOR BOTH DATA STRUCTURES =====

// Base columns used across all modes
const baseColumns = [
  {
    key: 'selection',
    header: '',
    width: 'w-8',
    sortable: false,
    cell: SelectionCell,
    // FIXED: Use a function instead of component to avoid DOM prop passing
    headerCell: ({ selectedCount, totalCount, onSelectAll }) => {
      // Handle indeterminate properly
      const isIndeterminate = selectedCount > 0 && selectedCount < totalCount
      const isChecked = selectedCount === totalCount && totalCount > 0
      
      return (
        <Checkbox
          checked={isChecked}
          // FIXED: Pass undefined instead of false for indeterminate
          indeterminate={isIndeterminate ? true : undefined}
          onCheckedChange={onSelectAll}
          aria-label="Select all appointments"
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-3 w-3"
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