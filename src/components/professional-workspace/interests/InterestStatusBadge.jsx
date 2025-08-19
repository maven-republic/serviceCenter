// src/components/professional-workspace/interests/InterestStatusBadge.jsx - Fixed Status Alignment
'use client'

import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Clock, 
  DollarSign, 
  Target, 
  X, 
  CheckCircle,
  AlertTriangle,
  Users,
  Eye,
  UserCheck,
  Shield,
  Hourglass,
  Edit,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function InterestStatusBadge({ 
  status, 
  size = "default", // "sm" | "default" | "lg"
  showIcon = true,
  showDot = false,
  className
}) {
  
  // 🔍 DEBUG: Log the status being processed
  console.log('🎯 InterestStatusBadge rendering:', { 
    status, 
    type: typeof status,
    size,
    showIcon,
    showDot 
  });

  // Status configurations - ✅ FIXED: Aligned with database schema
  const getStatusConfig = (status) => {
    const statusString = String(status).toLowerCase().trim();
    
    console.log('🔍 Processing status:', { 
      originalStatus: status,
      processedStatus: statusString,
      type: typeof statusString 
    });

    switch (statusString) {
      case 'pending':
        return {
          label: 'Pending Review',
          icon: Clock,
          variant: 'secondary',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'Waiting for customer to review your interest'
        }
      
      // ✅ ADDED: 'invited' status exists in DB interest enum
      case 'invited':
        return {
          label: 'Invited',
          icon: Users,
          variant: 'default',
          className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
          dotColor: 'bg-purple-500',
          description: 'Customer specifically invited you to quote'
        }
      
      case 'interested':
        return {
          label: 'Interest Expressed',
          icon: Heart,
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'You expressed interest in this project'
        }
      
      case 'quoted':
        return {
          label: 'Quote Sent',
          icon: DollarSign,
          variant: 'outline',
          className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
          dotColor: 'bg-orange-500',
          description: 'Customer is reviewing your quote'
        }
      
      // Customer selection status
      case 'selected':
        return {
          label: 'Selected!',
          icon: Target,
          variant: 'default',
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 animate-pulse duration-2000',
          dotColor: 'bg-green-500',
          description: 'Customer chose you! Please respond within 48 hours.',
          isSuccess: true,
          isUrgent: true
        }
      
      // ✅ FIXED: Changed from 'confirmed' to 'approved' to match DB schema
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          variant: 'default',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          dotColor: 'bg-emerald-500',
          description: 'Project approved and ready to proceed',
          isSuccess: true
        }

      // ✅ UPDATED: Quote updated status - matches DB enum
      case 'updated':
        return {
          label: 'Quote Updated',
          icon: Edit,
          variant: 'default',
          className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          dotColor: 'bg-amber-500',
          description: 'You updated your quote - waiting for customer approval',
          isUrgent: true
        }
      
      // ✅ FIXED: Only using statuses that exist in DB
      case 'rejected':
        return {
          label: 'Not Selected',
          icon: X,
          variant: 'secondary',
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          dotColor: 'bg-gray-400',
          description: 'Customer selected another professional'
        }
      
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          icon: X,
          variant: 'secondary',
          className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
          dotColor: 'bg-red-400',
          description: 'You withdrew your interest'
        }
      
      // ✅ REVIEWING: Handle reviewing status (appointment-level)
      case 'reviewing':
        return {
          label: 'Under Review',
          icon: RefreshCw,
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'Customer is reviewing your updated quote'
        }

      // ✅ APPOINTMENT-LEVEL STATUSES: For appointment status display
      case 'evaluating':
        return {
          label: 'Evaluating',
          icon: Eye,
          variant: 'outline',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          dotColor: 'bg-indigo-500',
          description: 'Customer is evaluating proposals'
        }

      case 'competing':
        return {
          label: 'Competing',
          icon: Users,
          variant: 'outline',
          className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
          dotColor: 'bg-orange-500',
          description: 'Multiple professionals are competing for this project'
        }

      case 'proposed':
        return {
          label: 'Proposed',
          icon: Shield,
          variant: 'outline',
          className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
          dotColor: 'bg-purple-500',
          description: 'Assessment proposal submitted'
        }

      case 'scheduled':
        return {
          label: 'Scheduled',
          icon: Clock,
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'Appointment or assessment is scheduled'
        }

      case 'assessing':
        return {
          label: 'Assessing',
          icon: Shield,
          variant: 'default',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          dotColor: 'bg-indigo-500',
          description: 'Assessment is in progress'
        }

      case 'assessed':
        return {
          label: 'Assessed',
          icon: CheckCircle,
          variant: 'default',
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
          dotColor: 'bg-green-500',
          description: 'Assessment completed'
        }

      case 'comparing':
        return {
          label: 'Comparing',
          icon: BarChart3,
          variant: 'outline',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
          dotColor: 'bg-yellow-500',
          description: 'Customer is comparing options'
        }

      case 'negotiating':
        return {
          label: 'Negotiating',
          icon: RefreshCw,
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'Negotiation in progress'
        }

      case 'revised':
        return {
          label: 'Revised',
          icon: Edit,
          variant: 'outline',
          className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          dotColor: 'bg-amber-500',
          description: 'Quote has been revised'
        }

      case 'converting':
        return {
          label: 'Converting',
          icon: RefreshCw,
          variant: 'default',
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
          dotColor: 'bg-green-500',
          description: 'Converting to booking',
          isSuccess: true
        }

      case 'converted':
        return {
          label: 'Converted',
          icon: CheckCircle,
          variant: 'default',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          dotColor: 'bg-emerald-500',
          description: 'Successfully converted to booking',
          isSuccess: true
        }

      case 'declined':
        return {
          label: 'Declined',
          icon: X,
          variant: 'secondary',
          className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
          dotColor: 'bg-red-400',
          description: 'Professional declined or customer declined'
        }

      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: X,
          variant: 'secondary',
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          dotColor: 'bg-gray-400',
          description: 'Appointment was cancelled'
        }

      case 'abandoned':
        return {
          label: 'Abandoned',
          icon: AlertTriangle,
          variant: 'secondary',
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          dotColor: 'bg-gray-400',
          description: 'Customer abandoned the request'
        }

      case 'expired':
        return {
          label: 'Expired',
          icon: AlertTriangle,
          variant: 'secondary',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
          dotColor: 'bg-yellow-500',
          description: 'Request expired due to timeout'
        }

      case 'superseded':
        return {
          label: 'Superseded',
          icon: RefreshCw,
          variant: 'secondary',
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          dotColor: 'bg-gray-400',
          description: 'Replaced by newer version'
        }
      
      default:
        // ✅ IMPROVED: Better fallback with actual status shown + DEBUG logging
        console.warn('❌ Unknown status in InterestStatusBadge:', { 
          status, 
          processedStatus: statusString,
          availableStatuses: [
            // Interest-level statuses
            'pending', 'invited', 'interested', 'quoted', 'selected', 
            'approved', 'updated', 'rejected', 'withdrawn',
            // Appointment-level statuses  
            'evaluating', 'competing', 'proposed', 'scheduled', 
            'assessing', 'assessed', 'comparing', 'negotiating', 
            'revised', 'reviewing', 'converting', 'converted', 
            'declined', 'cancelled', 'abandoned', 'expired', 'superseded'
          ]
        });

        return {
          label: statusString ? `${statusString.charAt(0).toUpperCase()}${statusString.slice(1)}` : 'Unknown',
          icon: AlertTriangle,
          variant: 'secondary',
          className: 'bg-gray-50 text-gray-600 border-gray-200',
          dotColor: 'bg-gray-400',
          description: `Unrecognized status: ${statusString || 'Unknown'}`
        }
    }
  }

  const config = getStatusConfig(status)
  const IconComponent = config.icon

  // ✅ DEBUG: Log the final config
  console.log('✅ Final status config:', { 
    status, 
    label: config.label, 
    className: config.className 
  });

  // Size configurations
  const sizeClasses = {
    sm: {
      badge: 'text-[10px] px-1.5 py-0.5 h-4',
      icon: 'h-2.5 w-2.5',
      dot: 'w-1 h-1'
    },
    default: {
      badge: 'text-sm px-2.5 py-1 h-6',
      icon: 'h-3.5 w-3.5',
      dot: 'w-2 h-2'
    },
    lg: {
      badge: 'text-base px-3 py-1.5 h-8',
      icon: 'h-4 w-4',
      dot: 'w-2.5 h-2.5'
    }
  }

  const sizeConfig = sizeClasses[size] || sizeClasses.default

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        config.className,
        sizeConfig.badge,
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        config.isSuccess && 'ring-1 ring-emerald-200',
        config.isUrgent && 'ring-1 ring-amber-300',
        className
      )}
      title={config.description}
    >
      {showDot && (
        <div className={cn(
          'rounded-full',
          config.dotColor,
          sizeConfig.dot,
          config.isUrgent && 'animate-pulse'
        )} />
      )}
      
      {showIcon && !showDot && (
        <IconComponent className={cn(
          sizeConfig.icon,
          config.isUrgent && 'animate-pulse'
        )} />
      )}
      
      <span>{config.label}</span>
    </Badge>
  )
}

// ✅ FIXED: Helper function with updated status priorities matching DB schema
export const getStatusPriority = (status) => {
  const priorities = {
    // High priority - needs immediate action
    'selected': 1,                    // Customer selected you
    'updated': 2,                     // Quote updated - awaiting approval
    'invited': 3,                     // Customer invitation
    
    // Active project statuses
    'approved': 4,                    // Project approved (was 'confirmed')
    'converting': 5,                  // Converting to booking
    'converted': 6,                   // Successfully converted
    'assessing': 7,                   // Assessment in progress
    'scheduled': 8,                   // Scheduled appointment
    'negotiating': 9,                 // In negotiation
    
    // Standard workflow statuses
    'quoted': 10,                     // Quote sent, waiting for customer
    'interested': 11,                 // Interest expressed
    'proposed': 12,                   // Assessment proposed
    'assessed': 13,                   // Assessment completed
    'revised': 14,                    // Quote revised
    'pending': 15,                    // Under review
    'reviewing': 16,                  // Customer reviewing updates
    
    // Customer evaluation statuses
    'evaluating': 17,                 // Customer evaluating
    'competing': 18,                  // Multiple professionals competing
    'comparing': 19,                  // Customer comparing options
    
    // Final decision statuses
    'rejected': 20,                   // Customer decision - not selected
    'declined': 21,                   // Professional or customer declined
    'withdrawn': 22,                  // Professional withdrew
    'cancelled': 23,                  // Appointment cancelled
    'superseded': 24,                 // Replaced by newer version
    'abandoned': 25,                  // Customer abandoned
    'expired': 26                     // Expired due to timeout
  }
  return priorities[status] || 99
}

// ✅ FIXED: Helper function with updated valid statuses
export const statusNeedsAction = (status) => {
  return ['selected', 'invited', 'updated', 'scheduled', 'assessing'].includes(status)
}

// ✅ FIXED: Helper function with updated positive outcomes
export const statusIsPositive = (status) => {
  return ['selected', 'approved', 'converted', 'assessed', 'scheduled', 'converting'].includes(status)
}

// Export named variations for convenience
export const InterestStatusDot = ({ status, size = "default", className }) => (
  <InterestStatusBadge 
    status={status} 
    size={size} 
    showIcon={false} 
    showDot={true}
    className={className}
  />
)

export const InterestStatusText = ({ status, size = "default", className }) => (
  <InterestStatusBadge 
    status={status} 
    size={size} 
    showIcon={false} 
    showDot={false}
    className={className}
  />
)

// Professional response status component
export const ResponseStatusBadge = ({ status, deadline, className }) => {
  // Calculate urgency based on deadline
  const getUrgencyStatus = () => {
    if (!deadline) return status
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60)
    
    if (status === 'selected') {
      if (hoursRemaining <= 6) {
        return 'urgent_response' // Very urgent - custom status for UI
      }
      return 'selected' // Normal urgent
    }
    
    return status
  }
  
  const displayStatus = getUrgencyStatus()
  
  return (
    <InterestStatusBadge 
      status={displayStatus}
      className={className}
    />
  )
}