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
  Info,
  Eye,
  EyeOff 
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
    setHasChanges(false)
  }

  // Mobile-optimized settings configuration
  const settingsConfig = [
    {
      key: 'default_event_duration',
      title: 'Event Duration',
      description: 'Default session length',
      icon: Clock,
      type: 'select',
      options: [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
      ]
    },
    {
      key: 'min_notice_hours',
      title: 'Minimum Notice',
      description: 'Required advance booking time',
      icon: AlertCircle,
      type: 'input',
      suffix: 'hours',
      placeholder: '12',
      min: 0,
      max: 168
    },
    {
      key: 'buffer_minutes',
      title: 'Buffer Time',
      description: 'Break between appointments',
      icon: Calendar,
      type: 'input',
      suffix: 'minutes',
      placeholder: '15',
      min: 0,
      max: 120
    },
    {
      key: 'max_bookings_per_day',
      title: 'Daily Limit',
      description: 'Max appointments per day',
      icon: Users,
      type: 'input',
      suffix: 'bookings',
      placeholder: '3',
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
    <div className="space-y-4">
      {/* Mobile Current Settings Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Current Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <Badge variant="outline" className="text-xs">
                  {currentSettings.duration}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notice:</span>
                <Badge variant="outline" className="text-xs">
                  {currentSettings.notice}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buffer:</span>
                <Badge variant="outline" className="text-xs">
                  {currentSettings.buffer}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily limit:</span>
                <Badge variant="outline" className="text-xs">
                  {currentSettings.daily_limit}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Settings Cards */}
      <div className="space-y-4">
        {settingsConfig.map((setting) => {
          const IconComponent = setting.icon
          return (
            <Card key={setting.key}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Setting Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted/50 mt-1">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={setting.key} className="text-sm font-medium">
                        {setting.title}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Setting Input */}
                  <div className="pl-11">
                    {setting.type === 'select' ? (
                      <Select
                        value={rules[setting.key]?.toString() || undefined}
                        onValueChange={(value) => updateRule(setting.key, value)}
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          id={setting.key}
                          type="number"
                          min={setting.min}
                          max={setting.max}
                          value={rules[setting.key] || ''}
                          onChange={(e) => updateRule(setting.key, e.target.value)}
                          placeholder={setting.placeholder}
                          className="flex-1 h-12"
                        />
                        <span className="text-sm text-muted-foreground min-w-fit">
                          {setting.suffix}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mobile How It Works */}
      <Card className="border-blue-200 ">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-700">
            <Info className="h-4 w-4" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-700">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-sm">Event Duration</h4>
              <p className="text-xs text-blue-600">
                Sets default length for new bookings that clients will see when scheduling.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Minimum Notice</h4>
              <p className="text-xs text-blue-600">
                Prevents last-minute bookings. 12 hours = no same-day bookings allowed.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Buffer Time</h4>
              <p className="text-xs text-blue-600">
                Automatically blocks time before/after bookings for travel or preparation.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Daily Limit</h4>
              <p className="text-xs text-blue-600">
                Caps daily bookings to maintain service quality and prevent burnout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Pro Tips */}
      <Card className="border-green-200 ">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p>• Set buffer time if you travel between locations</p>
            <p>• Use minimum notice to avoid rushed preparations</p>
            <p>• Daily limits help maintain work-life balance</p>
            <p>• Longer sessions work better for complex services</p>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Action Buttons */}
      <div className="space-y-3 pt-4">
        {hasChanges && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isSaving}
              className="flex-1"
            >
              Reset
            </Button>
          )}
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={hasChanges ? "flex-1" : "w-full"}
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
        </div>
      </div>
    </div>
  )
}