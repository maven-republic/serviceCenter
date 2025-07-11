'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Shield, Users } from "lucide-react"

export default function AvailabilityProtocol({ rules, setRules }) {
  const updateRule = (name, value) => {
    setRules(prev => ({ ...prev, [name]: parseInt(value) }))
  }

  return (
    <div className="space-y-4">
      
      {/* Default Event Duration */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-primary" />
          <Label className="text-sm font-medium">Event Duration</Label>
        </div>
        <Select
          value={rules.default_event_duration?.toString() || ''}
          onValueChange={(value) => updateRule('default_event_duration', value)}
        >
          <SelectTrigger className="h-9">
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
        <p className="text-xs text-muted-foreground">
          Standard booking length
        </p>
      </div>

      {/* Minimum Notice */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-primary" />
          <Label className="text-sm font-medium">Min Notice (hours)</Label>
        </div>
        <Input
          type="number"
          min="0"
          max="168"
          placeholder="e.g. 12"
          value={rules.min_notice_hours || ''}
          onChange={(e) => updateRule('min_notice_hours', e.target.value)}
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Advance booking requirement
        </p>
      </div>

      {/* Buffer Time */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-primary" />
          <Label className="text-sm font-medium">Buffer (minutes)</Label>
        </div>
        <Input
          type="number"
          min="0"
          max="120"
          placeholder="e.g. 15"
          value={rules.buffer_minutes || ''}
          onChange={(e) => updateRule('buffer_minutes', e.target.value)}
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Break between bookings
        </p>
      </div>

      {/* Max Bookings Per Day */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-primary" />
          <Label className="text-sm font-medium">Daily Limit</Label>
        </div>
        <Input
          type="number"
          min="1"
          max="20"
          placeholder="e.g. 5 (optional)"
          value={rules.max_bookings_per_day || ''}
          onChange={(e) => updateRule('max_bookings_per_day', e.target.value)}
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Max bookings per day
        </p>
      </div>

      {/* Compact Info */}
      <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
        <div className="font-medium text-blue-900 mb-1">💡 Quick Tips:</div>
        <div className="text-blue-800 space-y-0.5">
          <div>• Duration: Default length for all appointments</div>
          <div>• Notice: Prevent last-minute bookings</div>
          <div>• Buffer: Automatic break time between sessions</div>
          <div>• Limit: Maximum appointments per day</div>
        </div>
      </div>
    </div>
  )
}