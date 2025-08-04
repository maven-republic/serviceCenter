'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Settings, CheckCircle, ArrowRight } from "lucide-react"

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
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      {/* Compact Header Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Availability Setup</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Set weekly hours <ArrowRight className="inline h-3 w-3 mx-1" /> view calendar <ArrowRight className="inline h-3 w-3 mx-1" /> configure rules
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {stats.hasAvailability && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.totalSlots} Slot{stats.totalSlots === 1 ? '' : 's'}
                </Badge>
              )}
              {stats.hasProtocolSettings && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Settings className="h-3 w-3 mr-1" />
                  {stats.protocolCount} Rule{stats.protocolCount === 1 ? '' : 's'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Asymmetric Layout - Compact Hours + Spacious Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Compact Weekly Hours (33% width) */}
        <div className="lg:col-span-4">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Weekly Hours</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Set available hours
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <AvailabilityFramework 
                availability={availability}
                setAvailability={handleAvailabilityChange}
              />
              
              {/* Compact Summary */}
              {stats.hasAvailability && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-900">Hours Set!</span>
                  </div>
                  <div className="text-xs text-green-700">
                    {stats.totalSlots} slot{stats.totalSlots === 1 ? '' : 's'} • {stats.uniqueDays} day{stats.uniqueDays === 1 ? '' : 's'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Spacious Calendar (67% width) */}
        <div className="lg:col-span-8">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Calendar Preview</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    How clients see your availability
                  </p>
                </div>
                
                {/* Override Stats */}
                {stats.uniqueOverrideDates > 0 && (
                  <div className="text-center">
                    <div className="font-semibold text-primary text-sm">{stats.uniqueOverrideDates}</div>
                    <div className="text-xs text-muted-foreground">Custom Dates</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AvailabilityCalendarView
                availability={availability}
                overrides={overrides}
                onUpdateOverride={handleUpdateOverride}
                onDeleteOverride={handleDeleteOverride}
                onUpdateRecurring={handleUpdateRecurring}
              />
              
              {/* Calendar Help Text */}
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="font-medium text-blue-900 mb-1">💡 Tips:</div>
                <div className="text-blue-800">
                  Click dates for custom hours • Blue = weekly schedule • Green = overrides
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compact Progress Indicator */}
      <div className={`p-3 rounded-lg border ${stats.hasAvailability ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex items-center gap-2">
          {stats.hasAvailability ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <span className="font-medium text-green-900">Availability configured!</span>
                <span className="text-green-700 ml-1">
                  {stats.totalSlots} slot{stats.totalSlots === 1 ? '' : 's'} across {stats.uniqueDays} day{stats.uniqueDays === 1 ? '' : 's'}.
                  {stats.protocolCount > 0 && ` ${stats.protocolCount} rule${stats.protocolCount === 1 ? '' : 's'} set.`}
                </span>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <span className="font-medium text-orange-900">Set your availability</span>
                <span className="text-orange-700 ml-1">
                  Add available hours for at least one day to continue.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}