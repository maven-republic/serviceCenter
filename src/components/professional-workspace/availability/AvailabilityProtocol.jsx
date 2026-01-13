'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Calendar, 
  Users, 
  AlertCircle, 
  Info,
  CheckCircle2
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

  const settingsConfig = [
    {
      key: 'default_event_duration',
      title: 'Session Duration',
      description: 'Default appointment length',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      type: 'select',
      options: [
        { value: 15, label: '15 min' },
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
      ]
    },
    {
      key: 'min_notice_hours',
      title: 'Advance Notice',
      description: 'Minimum booking time ahead',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
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
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      type: 'input',
      suffix: 'min',
      placeholder: '15',
      min: 0,
      max: 120
    },
    {
      key: 'max_bookings_per_day',
      title: 'Daily Limit',
      description: 'Max appointments per day',
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      type: 'input',
      suffix: 'bookings',
      placeholder: '5',
      min: 1,
      max: 20
    }
  ]

  const getCurrentValue = (key) => {
    const value = rules[key]
    if (!value) return 'Not set'
    
    const config = settingsConfig.find(s => s.key === key)
    if (config.type === 'select') {
      return config.options.find(o => o.value === value)?.label || value
    }
    return `${value} ${config.suffix}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Booking Rules</h2>
        <p className="text-sm text-muted-foreground">
          Control how and when clients can book with you
        </p>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsConfig.map((setting) => {
          const IconComponent = setting.icon
          const currentValue = getCurrentValue(setting.key)
          
          return (
            <Card key={setting.key} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header with Icon and Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${setting.iconBg} shrink-0`}>
                        <IconComponent className={`h-4 w-4 ${setting.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <Label htmlFor={setting.key} className="text-sm font-semibold leading-tight">
                          {setting.title}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {currentValue}
                    </Badge>
                  </div>
                  
                  {/* Input */}
                  <div>
                    {setting.type === 'select' ? (
                      <Select
                        value={rules[setting.key]?.toString() || ''}
                        onValueChange={(value) => updateRule(setting.key, value)}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select..." />
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
                          className="flex-1 h-10"
                        />
                        <span className="text-xs text-muted-foreground min-w-[50px] text-right">
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

      {/* Tips Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 shrink-0">
              <Info className="h-4 w-4 text-blue-700" />
            </div>
            <div className="space-y-2 text-sm text-blue-800 min-w-0">
              <h4 className="font-semibold">Quick Tips</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 shrink-0">•</span>
                  <span>30-60 min sessions work well for most services</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 shrink-0">•</span>
                  <span>12-24 hours notice prevents rushed work</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 shrink-0">•</span>
                  <span>15-30 min buffer allows for travel</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 shrink-0">•</span>
                  <span>3-5 daily bookings maintain quality</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-amber-700">You have unsaved changes</span>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="h-8 shrink-0"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}