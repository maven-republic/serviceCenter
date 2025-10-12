// src/components/professional-workspace/assessments/AssessmentStatus.jsx
'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Play,
  XCircle
} from 'lucide-react'

export default function AssessmentStatus({ status, size = "default", className }) {
  const statusConfig = {
    proposed: {
      label: 'Proposed',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Clock
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle
    },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Calendar
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle
    },
    active: {
      label: 'In Progress',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Play
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle
    },
    absent: {
      label: 'Customer Absent',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertCircle
    }
  }

  const config = statusConfig[status] || statusConfig.proposed
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <Badge 
      className={cn(
        config.className,
        sizeClasses[size],
        'flex items-center gap-1.5',
        className
      )}
    >
      <Icon className={cn(
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {config.label}
    </Badge>
  )
}