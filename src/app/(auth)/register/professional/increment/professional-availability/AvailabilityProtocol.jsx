'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Clock, Calendar, Users, Shield } from "lucide-react"

export default function AvailabilityProtocol({ rules, setRules }) {
  const updateRule = (name, value) => {
    setRules(prev => ({ ...prev, [name]: parseInt(value) }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Availability Protocol</CardTitle>
              <p className="text-muted-foreground mt-1">
                Set your scheduling preferences just like on Calendly. These rules control how clients can book with you.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardContent className="p-6 space-y-8">
          
          {/* Default Event Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Default Event Duration</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                How long each session lasts by default. Clients will see this as the standard booking time.
              </p>
            </div>
            <div className="space-y-2">
              <Select
                value={rules.default_event_duration?.toString() || ''}
                onValueChange={(value) => updateRule('default_event_duration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <hr className="border-border" />

          {/* Minimum Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Minimum Scheduling Notice</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Prevent last-minute bookings by requiring advance notice. Set to 0 to allow immediate bookings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="168"
                placeholder="e.g. 12"
                value={rules.min_notice_hours || ''}
                onChange={(e) => updateRule('min_notice_hours', e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground font-medium">hours</span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Buffer Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Buffer Between Bookings</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Add break time before or after each appointment. This helps prevent back-to-back scheduling.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="120"
                placeholder="e.g. 15"
                value={rules.buffer_minutes || ''}
                onChange={(e) => updateRule('buffer_minutes', e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground font-medium">minutes</span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Max Bookings Per Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Max Bookings Per Day</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Optional limit to avoid overbooking. Leave empty for unlimited bookings per day.
              </p>
            </div>
            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                max="20"
                placeholder="e.g. 5 (optional)"
                value={rules.max_bookings_per_day || ''}
                onChange={(e) => updateRule('max_bookings_per_day', e.target.value)}
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 How these settings work:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Duration:</strong> Default length for all appointments</li>
              <li>• <strong>Notice:</strong> How far in advance clients must book</li>
            </ul>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Buffer:</strong> Automatic break time between sessions</li>
              <li>• <strong>Daily limit:</strong> Maximum appointments per day</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}