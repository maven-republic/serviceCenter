'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  List, 
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  CalendarDays
} from 'lucide-react'
import AvailabilityFramework from './AvailabilityFramework'
import AvailabilityCalendarView from './AvailabilityCalendarView'

export default function AvailabilityInterface({ 
  availability = [], 
  overrides = [], 
  onUpdateAvailability, 
  onUpdateOverrides,
  onSave 
}) {
  const [viewMode, setViewMode] = useState('list')
  const [localAvailability, setLocalAvailability] = useState(availability)
  const [localOverrides, setLocalOverrides] = useState(overrides)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalAvailability(availability)
    setHasChanges(false)
  }, [availability])

  useEffect(() => {
    setLocalOverrides(overrides)
    setHasChanges(false)
  }, [overrides])

  const handleUpdateAvailability = (newAvailability) => {
    setLocalAvailability(newAvailability)
    setHasChanges(true)
    onUpdateAvailability?.(newAvailability)
  }

  const handleUpdateOverride = (dateKey, blocks) => {
    const updated = [
      ...localOverrides.filter(o => o.override_date !== dateKey),
      ...blocks
    ]
    setLocalOverrides(updated)
    setHasChanges(true)
    onUpdateOverrides?.(updated)
  }

  const handleDeleteOverride = (dateKey) => {
    const updated = localOverrides.filter(o => o.override_date !== dateKey)
    setLocalOverrides(updated)
    setHasChanges(true)
    onUpdateOverrides?.(updated)
  }

  const getStats = () => {
    const totalBlocks = localAvailability.length
    const totalOverrides = localOverrides.length
    const activeDays = new Set(localAvailability.map(a => a.day_of_week)).size
    
    let totalHours = 0
    localAvailability.forEach(block => {
      const start = new Date(`2000-01-01 ${block.start_time}`)
      const end = new Date(`2000-01-01 ${block.end_time}`)
      totalHours += (end - start) / (1000 * 60 * 60)
    })

    return {
      totalBlocks,
      totalOverrides,
      activeDays,
      totalHours: Math.round(totalHours * 10) / 10
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="flex-1 h-10"
        >
          <List className="h-4 w-4 mr-2" />
          Weekly Pattern
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className="flex-1 h-10"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar View
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Weekly Hours</div>
                <div className="text-lg font-bold">{stats.totalHours}h</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100">
                <CalendarDays className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Active Days</div>
                <div className="text-lg font-bold">{stats.activeDays}/7</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Override Alert */}
      {localOverrides.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                <strong>{localOverrides.length}</strong> date override{localOverrides.length !== 1 ? 's' : ''} active
              </span>
              {viewMode === 'list' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-7 text-xs ml-2"
                >
                  View Calendar
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="space-y-3">
        {viewMode === 'list' ? (
          <>
            <div className="flex items-center gap-2 pb-2">
              <List className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Weekly Schedule</h3>
            </div>
            <p className="text-sm text-muted-foreground pb-2">
              Set your regular availability that repeats every week
            </p>
            <AvailabilityFramework
              availability={localAvailability}
              setAvailability={handleUpdateAvailability}
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 pb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Calendar View</h3>
            </div>
            <p className="text-sm text-muted-foreground pb-2">
              View your schedule and create date-specific overrides
            </p>
            <AvailabilityCalendarView
              availability={localAvailability}
              overrides={localOverrides}
              onUpdateOverride={handleUpdateOverride}
              onDeleteOverride={handleDeleteOverride}
              onUpdateRecurring={handleUpdateAvailability}
            />
          </>
        )}
      </div>

      {/* Summary Footer */}
      <Card className="bg-muted/20 border-muted">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-sm">Schedule Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Time blocks: <span className="font-medium text-foreground">{stats.totalBlocks}</span></div>
                <div>Active days: <span className="font-medium text-foreground">{stats.activeDays}</span></div>
                <div>Weekly hours: <span className="font-medium text-foreground">{stats.totalHours}h</span></div>
                <div>Overrides: <span className="font-medium text-foreground">{stats.totalOverrides}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}