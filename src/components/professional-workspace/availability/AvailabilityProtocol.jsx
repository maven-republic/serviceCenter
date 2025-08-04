'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Settings,
  Info
} from 'lucide-react'

export default function AvailabilityProtocol({ rules, setRules, onSave, isSaving }) {
  const [hasChanges, setHasChanges] = useState(false)

  const updateRule = (name, value) => {
    const parsedValue = value === '' ? null : parseInt(value) || null
    setRules(prev => ({ ...prev, [name]: parsedValue }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(rules)
    setHasChanges(false)
  }

  const handleReset = () => {
    // Reset to initial values - you might want to pass initial rules as prop
    setHasChanges(false)
  }

  // Settings configuration
  const settingsConfig = [
    {
      key: 'default_event_duration',
      title: 'Default Event Duration',
      description: 'How long each session lasts by default',
      icon: Clock,
      type: 'select',
      options: [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '60 minutes' },
        { value: 90, label: '90 minutes' },
        { value: 120, label: '120 minutes' },
      ]
    },
    {
      key: 'min_notice_hours',
      title: 'Minimum Scheduling Notice',
      description: 'Prevent last-minute bookings by requiring advance notice',
      icon: AlertCircle,
      type: 'input',
      suffix: 'hours',
      placeholder: 'e.g. 12',
      min: 0,
      max: 168 // 1 week
    },
    {
      key: 'buffer_minutes',
      title: 'Buffer Between Bookings',
      description: 'Break time before or after events to prepare or travel',
      icon: Calendar,
      type: 'input',
      suffix: 'minutes',
      placeholder: 'e.g. 15',
      min: 0,
      max: 120
    },
    {
      key: 'max_bookings_per_day',
      title: 'Max Bookings Per Day',
      description: 'Optional limit to prevent overbooking and maintain quality',
      icon: Users,
      type: 'input',
      suffix: 'bookings',
      placeholder: 'e.g. 3',
      min: 1,
      max: 20
    }
  ]

  const getCurrentSettingsDisplay = () => {
    return {
      duration: rules.default_event_duration ? `${rules.default_event_duration} min` : 'Not set',
      notice: rules.min_notice_hours ? `${rules.min_notice_hours}h` : 'Not set',
      buffer: rules.buffer_minutes ? `${rules.buffer_minutes} min` : 'Not set',
      daily_limit: rules.max_bookings_per_day || 'Unlimited'
    }
  }

  const currentSettings = getCurrentSettingsDisplay()

  return (
<div className="professional-workspace max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Availability Protocol</h1>
        </div>
        <p className="text-muted-foreground">
          Set your scheduling preferences and booking rules to optimize your appointment workflow.
        </p>
      </div>

      <div className="professional-workspace grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Booking Rules
              </CardTitle>
              <CardDescription>
                Configure how clients can schedule appointments with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsConfig.map((setting) => {
                const IconComponent = setting.icon
                return (
                  <div key={setting.key} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted/50 mt-1">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {setting.title}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {setting.type === 'select' ? (
                            <Select
                              value={rules[setting.key]?.toString() || undefined}
                              onValueChange={(value) => updateRule(setting.key, value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                {setting.options
                                  .filter(option => option.value !== '') // Remove empty option
                                  .map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <>
                              <Input
                                id={setting.key}
                                type="number"
                                min={setting.min}
                                max={setting.max}
                                value={rules[setting.key] || ''}
                                onChange={(e) => updateRule(setting.key, e.target.value)}
                                placeholder={setting.placeholder}
                                className="w-32"
                              />
                              <span className="text-sm text-muted-foreground">
                                {setting.suffix}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {setting.key !== 'max_bookings_per_day' && (
                      <Separator className="my-4" />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="min-w-32"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset Changes
              </Button>
            )}
            
            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Event Duration</h4>
                <p className="text-muted-foreground text-xs">
                  Sets the default length for new bookings. Clients can see this when scheduling.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Minimum Notice</h4>
                <p className="text-muted-foreground text-xs">
                  Prevents bookings too close to the current time. For example, 12 hours means no same-day bookings.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Buffer Time</h4>
                <p className="text-muted-foreground text-xs">
                  Automatically blocks time before/after bookings. Useful for travel time or preparation.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Daily Limit</h4>
                <p className="text-muted-foreground text-xs">
                  Caps the number of bookings per day to maintain service quality and prevent burnout.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration:</span>
                  <Badge variant="outline" className="font-medium">
                    {currentSettings.duration}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Notice:</span>
                  <Badge variant="outline" className="font-medium">
                    {currentSettings.notice}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Buffer:</span>
                  <Badge variant="outline" className="font-medium">
                    {currentSettings.buffer}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Daily limit:</span>
                  <Badge variant="outline" className="font-medium">
                    {currentSettings.daily_limit}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <AlertCircle className="h-4 w-4" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-blue-700">
              <p>• Set buffer time if you need travel time between locations</p>
              <p>• Use minimum notice to avoid rushed preparations</p>
              <p>• Daily limits help maintain work-life balance</p>
              <p>• Longer sessions often work better for complex services</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}