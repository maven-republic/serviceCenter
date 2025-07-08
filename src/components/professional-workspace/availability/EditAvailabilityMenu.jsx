'use client'

import { format } from 'date-fns'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Repeat,
  Edit,
  X
} from 'lucide-react'

export default function EditAvailabilityMenu({ 
  date, 
  onEditDate, 
  onEditDay,
  onClose 
}) {
  const weekday = format(date, 'EEEE') // e.g. Monday

  const handleEditDate = (e) => {
    e.stopPropagation()
    onEditDate(date)
    onClose?.()
  }

  const handleEditDay = (e) => {
    e.stopPropagation()
    onEditDay(date.getDay())
    onClose?.()
  }

  const handleBackdropClick = (e) => {
    e.stopPropagation()
    onClose?.()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={handleBackdropClick}
      />
      
      {/* Menu Card */}
      <Card className="absolute top-2 left-2 z-50 min-w-48 shadow-lg border-border bg-background">
        <CardContent className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Edit Availability
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleBackdropClick}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <Separator className="mb-2" />

          {/* Menu Items */}
          <div className="space-y-1">
            {/* Edit This Date */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2 text-sm font-normal"
              onClick={handleEditDate}
            >
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <div className="flex-1 text-left">
                <div className="text-foreground">Edit this date</div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'MMM d, yyyy')}
                </div>
              </div>
            </Button>

            {/* Edit All Weekdays */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2 text-sm font-normal"
              onClick={handleEditDay}
            >
              <Repeat className="h-4 w-4 mr-2 text-purple-600" />
              <div className="flex-1 text-left">
                <div className="text-foreground">Edit all {weekday}s</div>
                <div className="text-xs text-muted-foreground">
                  Update weekly schedule
                </div>
              </div>
            </Button>
          </div>

          {/* Footer */}
          <Separator className="my-2" />
          <div className="px-2 py-1">
            <span className="text-xs text-muted-foreground">
              Click outside to close
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}