'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Settings, CheckCircle } from "lucide-react"

import AvailabilityFramework from './AvailabilityFramework'
import AvailabilityCalendarView from './AvailabilityCalendarView'
import AvailabilityProtocol from './AvailabilityProtocol'

export default function AvailabilityInterface({ formData, updateFormData }) {
  // Initialize state from formData only once
  const [availability, setAvailability] = useState(() => formData.availability || [])
  const [overrides, setOverrides] = useState(() => formData.availabilityOverrides || [])
  const [protocol, setProtocol] = useState(() => formData.availabilityProtocol || {
    default_event_duration: null,
    min_notice_hours: null,
    buffer_minutes: null,
    max_bookings_per_day: null
  })

  // Memoized handlers to prevent infinite re-renders
  const handleAvailabilityChange = useCallback((newAvailability) => {
    setAvailability(newAvailability)
    updateFormData({ 
      target: { 
        name: 'availability', 
        value: newAvailability 
      } 
    })
  }, [updateFormData])

  const handleOverridesChange = useCallback((newOverrides) => {
    setOverrides(newOverrides)
    updateFormData({ 
      target: { 
        name: 'availabilityOverrides', 
        value: newOverrides 
      } 
    })
  }, [updateFormData])

  const handleProtocolChange = useCallback((newProtocol) => {
    setProtocol(newProtocol)
    updateFormData({ 
      target: { 
        name: 'availabilityProtocol', 
        value: newProtocol 
      } 
    })
  }, [updateFormData])

  // Handlers for calendar interactions
  const handleUpdateOverride = useCallback((dateString, blocks) => {
    const newOverrides = overrides.filter(o => o.override_date !== dateString).concat(blocks)
    handleOverridesChange(newOverrides)
  }, [overrides, handleOverridesChange])

  const handleDeleteOverride = useCallback((dateString) => {
    const newOverrides = overrides.filter(o => o.override_date !== dateString)
    handleOverridesChange(newOverrides)
  }, [overrides, handleOverridesChange])

  const handleUpdateRecurring = useCallback((newAvailability) => {
    handleAvailabilityChange(newAvailability)
  }, [handleAvailabilityChange])

  // Memoized calculations
  const stats = useMemo(() => {
    const hasAvailability = availability.length > 0
    const hasProtocolSettings = Object.values(protocol).some(value => value !== null && value !== '')
    const totalSlots = availability.length
    const protocolCount = Object.values(protocol).filter(v => v !== null && v !== '').length
    const uniqueDays = new Set(availability.map(a => a.day_of_week)).size
    const uniqueOverrideDates = new Set(overrides.map(o => o.override_date)).size

    return {
      hasAvailability,
      hasProtocolSettings,
      totalSlots,
      protocolCount,
      uniqueDays,
      uniqueOverrideDates
    }
  }, [availability, protocol, overrides])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Availability Setup</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Set your weekly hours and scheduling preferences for client bookings
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {stats.hasAvailability && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.totalSlots} Time {stats.totalSlots === 1 ? 'Slot' : 'Slots'}
                </Badge>
              )}
              {stats.hasProtocolSettings && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Settings className="h-3 w-3 mr-1" />
                  {stats.protocolCount} Rule{stats.protocolCount === 1 ? '' : 's'} Set
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🕒 How this works:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>1. Set Weekly Hours:</strong> Define your regular availability for each day
              </div>
              <div>
                <strong>2. View Calendar:</strong> See how your hours appear to clients
              </div>
              <div>
                <strong>3. Set Rules:</strong> Configure booking preferences and limits
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Panel - Hour Setting */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Weekly Hours</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Set your default available hours for each day of the week
              </p>
            </CardHeader>
            <CardContent>
              <AvailabilityFramework 
                availability={availability}
                setAvailability={handleAvailabilityChange}
              />
            </CardContent>
          </Card>

          {/* Protocol Settings */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Booking Rules</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure scheduling preferences and limitations
              </p>
            </CardHeader>
            <CardContent>
              <AvailabilityProtocol 
                rules={protocol}
                setRules={handleProtocolChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Calendar View */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Calendar Preview</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                See how your availability appears to clients. Click dates to override specific days.
              </p>
            </CardHeader>
            <CardContent>
              <AvailabilityCalendarView
                availability={availability}
                overrides={overrides}
                onUpdateOverride={handleUpdateOverride}
                onDeleteOverride={handleDeleteOverride}
                onUpdateRecurring={handleUpdateRecurring}
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {stats.hasAvailability && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">📊 Availability Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">Total Time Slots</div>
                    <div className="text-muted-foreground">{stats.totalSlots} configured</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Days Available</div>
                    <div className="text-muted-foreground">
                      {stats.uniqueDays} of 7 days
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Override Dates</div>
                    <div className="text-muted-foreground">
                      {stats.uniqueOverrideDates} date{stats.uniqueOverrideDates !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Rules Set</div>
                    <div className="text-muted-foreground">{stats.protocolCount} of 4 rules</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className={stats.hasAvailability ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {stats.hasAvailability ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Availability configured!</div>
                  <div className="text-sm text-green-700">
                    You've set up {stats.totalSlots} time {stats.totalSlots === 1 ? 'slot' : 'slots'} across {stats.uniqueDays} days. 
                    {stats.protocolCount > 0 && ` Plus ${stats.protocolCount} booking rule${stats.protocolCount === 1 ? '' : 's'}.`}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">Set your availability</div>
                  <div className="text-sm text-orange-700">
                    Add your available hours for at least one day to continue with registration.
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}