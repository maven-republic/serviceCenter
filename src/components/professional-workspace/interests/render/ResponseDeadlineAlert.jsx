// src/components/professional-workspace/interests/render/ResponseDeadlineAlert.jsx
'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ResponseDeadlineAlert({ deadlineInfo }) {
  if (!deadlineInfo) return null

  // Show active deadline warning with improved visual hierarchy
  if (!deadlineInfo.hasExpired) {
    // Determine visual style based on hours remaining
    const getUrgencyStyle = (urgencyLevel) => {
      switch (urgencyLevel) {
        case 'urgent':   // 0-6 hours = Red (urgent!)
          return "border-red-200 bg-red-50 text-red-800"
        case 'warning':  // 6-24 hours = Amber (should respond soon)
          return "border-amber-200 bg-amber-50 text-amber-800"
        case 'info':     // 24-48 hours = Blue (be aware)
          return "border-blue-200 bg-blue-100 text-blue-800"
        case 'normal':   // 48+ hours = Gray (plenty of time)
        default:
          return "border-gray-200 bg-gray-50 text-gray-800"
      }
    }

    return (
      <Alert className={cn(
        "mt-4",
        getUrgencyStyle(deadlineInfo.urgencyLevel)
      )}>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>DEADLINE:</strong> {deadlineInfo.deadlineText} 
        </AlertDescription>
      </Alert>
    )
  }

  // Show expired deadline warning
  return (
    <Alert className="mt-4 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-red-800">
        <strong>Response deadline has passed.</strong> Contact the customer directly if you're still interested.
      </AlertDescription>
    </Alert>
  )
}