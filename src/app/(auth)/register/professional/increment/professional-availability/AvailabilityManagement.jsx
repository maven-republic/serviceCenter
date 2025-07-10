'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
]

export default function AvailabilityManagement({ availability, setAvailability }) {
  const handleToggle = (day) => {
    const exists = availability.find(slot => slot.day_of_week === day)
    if (exists) {
      setAvailability(prev => prev.filter(slot => slot.day_of_week !== day))
    } else {
      setAvailability(prev => [
        ...prev,
        { day_of_week: day, start_time: '09:00', end_time: '17:00' }
      ])
    }
  }

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev =>
      prev.map(slot =>
        slot.day_of_week === day ? { ...slot, [field]: value } : slot
      )
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Weekly Availability</CardTitle>
              <p className="text-muted-foreground mt-1">
                Select the days and hours you're generally available for bookings.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          {daysOfWeek.map(({ label, value }) => {
            const slot = availability.find(a => a.day_of_week === value)
            const isEnabled = !!slot
            
            return (
              <div key={value} className="space-y-4">
                {/* Day Toggle */}
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={`day-${value}`} 
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </Label>
                  <Switch
                    id={`day-${value}`}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(value)}
                  />
                </div>

                {/* Time Inputs */}
                {slot && (
                  <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${value}`} className="text-sm font-medium">
                        Start Time
                      </Label>
                      <input
                        id={`start-${value}`}
                        type="time"
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        value={slot.start_time}
                        onChange={e => handleTimeChange(value, 'start_time', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`end-${value}`} className="text-sm font-medium">
                        End Time
                      </Label>
                      <input
                        id={`end-${value}`}
                        type="time"
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        value={slot.end_time}
                        onChange={e => handleTimeChange(value, 'end_time', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Helper Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for setting availability:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• These are your default available hours for each day</li>
            <li>• You can override specific dates later using the calendar view</li>
            <li>• Consider your optimal working hours and energy levels</li>
            <li>• Leave buffer time between appointments if needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}