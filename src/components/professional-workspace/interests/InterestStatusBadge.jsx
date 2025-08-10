// src/components/professional-workspace/interests/InterestStatusBadge.jsx
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
  
  // ✅ DEBUG: Log the status being processed
  console.log('🎯 InterestStatusBadge rendering:', { 
    status, 
    type: typeof status,
    size,
    showIcon,
    showDot 
  });

  // Status configurations
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
      
      // ✅ CONFIRMED: Professional confirmed status - this should handle your DB values
      case 'confirmed':
        return {
          label: 'Confirmed',
          icon: CheckCircle,
          variant: 'default',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          dotColor: 'bg-emerald-500',
          description: 'You confirmed availability and are ready to proceed',
          isSuccess: true
        }

      // ✅ UPDATED: Quote updated status - this should handle your DB values
      case 'updated':
        return {
          label: ' Updated',
          icon: Edit,
          variant: 'default',
          className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          dotColor: 'bg-amber-500',
          description: 'You updated your quote - waiting for customer approval',
          isUrgent: true
        }
      
      // Professional declined selection
      case 'declined_by_professional':
      case 'declined':
        return {
          label: 'Declined',
          icon: X,
          variant: 'secondary',
          className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
          dotColor: 'bg-red-400',
          description: 'You declined this selection'
        }
      
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
      
      case 'accepted':
        return {
          label: 'Accepted',
          icon: CheckCircle,
          variant: 'default',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          dotColor: 'bg-emerald-500',
          description: 'You accepted the project assignment',
          isSuccess: true
        }
      
      case 'expired':
        return {
          label: 'Expired',
          icon: AlertTriangle,
          variant: 'secondary',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
          dotColor: 'bg-yellow-500',
          description: 'Interest expired due to timeout'
        }
      
      // Response deadline approaching
      case 'response_needed':
        return {
          label: 'Response Needed',
          icon: Hourglass,
          variant: 'default',
          className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse duration-1500',
          dotColor: 'bg-amber-500',
          description: 'Customer is waiting for your response',
          isUrgent: true
        }
      
      // Assessment phase
      case 'assessment_scheduled':
        return {
          label: 'Assessment Scheduled',
          icon: Shield,
          variant: 'default',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          dotColor: 'bg-indigo-500',
          description: 'Assessment appointment is scheduled'
        }
      
      case 'viewed':
        return {
          label: 'Viewed',
          icon: Eye,
          variant: 'outline',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          dotColor: 'bg-indigo-500',
          description: 'Customer has viewed your interest'
        }

      // ✅ REVIEWING: Handle reviewing status (appointment-level, when customer needs to approve quote updates)
      case 'reviewing':
        return {
          label: 'Under Review',
          icon: RefreshCw,
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          dotColor: 'bg-blue-500',
          description: 'Customer is reviewing your updated quote'
        }
      
      default:
        // ✅ IMPROVED: Better fallback with actual status shown + DEBUG logging
        console.warn('❌ Unknown status in InterestStatusBadge:', { 
          status, 
          processedStatus: statusString,
          availableStatuses: [
            'pending', 'invited', 'interested', 'quoted', 'selected', 
            'confirmed', 'updated', 'declined', 'rejected', 'withdrawn', 
            'accepted', 'expired', 'response_needed', 'assessment_scheduled', 
            'viewed', 'reviewing'
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

// Helper function to get status priority for sorting
export const getStatusPriority = (status) => {
  const priorities = {
    'selected': 1,                    // Highest priority - needs immediate action
    'response_needed': 2,             // Urgent response required
    'updated': 3,                     // Quote updated - awaiting approval
    'confirmed': 4,                   // Success state
    'assessment_scheduled': 5,        // Active project
    'quoted': 6,                      // Waiting for customer
    'interested': 7,                  // Standard interest
    'invited': 8,                     // Invitation received
    'pending': 9,                     // Under review
    'reviewing': 10,                  // Customer reviewing updates
    'viewed': 11,                     // Customer activity
    'accepted': 12,                   // Completed action
    'rejected': 13,                   // Customer decision
    'declined': 14,                   // Professional decision
    'declined_by_professional': 14,   // Professional decision
    'withdrawn': 15,                  // Professional action
    'expired': 16                     // Lowest priority
  }
  return priorities[status] || 99
}

// Helper function to check if status needs action
export const statusNeedsAction = (status) => {
  return ['selected', 'response_needed', 'invited', 'updated'].includes(status)
}

// Helper function to check if status is positive outcome
export const statusIsPositive = (status) => {
  return ['selected', 'confirmed', 'accepted', 'assessment_scheduled'].includes(status)
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
        return 'response_needed' // Very urgent
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