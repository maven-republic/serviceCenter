'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  List, 
  Clock,
  AlertCircle,
  Info,
  Save,
  RotateCcw,
  CheckCircle2,
  Eye,
  Edit3
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
  const [viewMode, setViewMode] = useState('List') // 'List' or 'Calendar'
  const [localAvailability, setLocalAvailability] = useState(availability)
  const [localOverrides, setLocalOverrides] = useState(overrides)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave?.({
        availability: localAvailability,
        overrides: localOverrides
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save availability:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLocalAvailability(availability)
    setLocalOverrides(overrides)
    setHasChanges(false)
    onUpdateAvailability?.(availability)
    onUpdateOverrides?.(overrides)
  }

  const getStats = () => {
    const totalBlocks = localAvailability.length
    const totalOverrides = localOverrides.length
    const activeDays = new Set(localAvailability.map(a => a.day_of_week)).size
    
    // Calculate total weekly hours
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Working Hours</h2>
            {hasChanges && (
              <Badge variant="secondary" className="animate-pulse">
                Unsaved changes
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Set when you're typically available for meetings and appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle - Desktop */}
          <div className="hidden md:flex border rounded-lg p-1 bg-muted/50">
            {[
              { key: 'List', label: 'List View', icon: List },
              { key: 'Calendar', label: 'Calendar View', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={key === viewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(key)}
                className="h-8 px-4 text-sm flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle - Mobile */}
          <div className="md:hidden">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="List">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List View
                  </div>
                </SelectItem>
                <SelectItem value="Calendar">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Weekly Hours</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.activeDays}/7</div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalBlocks}</div>
              <div className="text-sm text-muted-foreground">Time Blocks</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalOverrides}</div>
              <div className="text-sm text-muted-foreground">Date Overrides</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Override Alert */}
      {localOverrides.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have <strong>{localOverrides.length}</strong> date-specific override{localOverrides.length !== 1 ? 's' : ''} configured.
              {viewMode === 'List' && ' Switch to Calendar view to manage them.'}
            </span>
            {viewMode === 'List' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('Calendar')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                View Calendar
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {viewMode === 'List' ? (
                <List className="h-5 w-5" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
              <CardTitle>
                {viewMode === 'List' ? 'Weekly Schedule' : 'Calendar View'}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {viewMode === 'List' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Edit3 className="h-3 w-3" />
                  Edit Mode
                </Badge>
              )}
              {viewMode === 'Calendar' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Interactive
                </Badge>
              )}
            </div>
          </div>
          
          <CardDescription>
            {viewMode === 'List' 
              ? 'Set your regular weekly availability for each day of the week'
              : 'View your schedule in calendar format and create date-specific overrides'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-6">
            {viewMode === 'List' ? (
              <AvailabilityFramework
                availability={localAvailability}
                setAvailability={handleUpdateAvailability}
              />
            ) : (
              <AvailabilityCalendarView
                availability={localAvailability}
                overrides={localOverrides}
                onUpdateOverride={handleUpdateOverride}
                onDeleteOverride={handleDeleteOverride}
                onUpdateRecurring={handleUpdateAvailability}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="border-muted bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Info className="h-4 w-4" />
            Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-foreground">📊 Current Setup</h4>
              <ul className="space-y-1 text-xs">
                <li>• <strong className="text-foreground">{stats.totalBlocks}</strong> time blocks across <strong className="text-foreground">{stats.activeDays}</strong> days</li>
                <li>• <strong className="text-foreground">{stats.totalHours}</strong> hours per week</li>
                <li>• <strong className="text-foreground">{stats.totalOverrides}</strong> date-specific override{stats.totalOverrides !== 1 ? 's' : ''}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-foreground">💡 Tips</h4>
              <ul className="space-y-1 text-xs">
                <li>• Use List view for setting weekly patterns</li>
                <li>• Use Calendar view for specific date changes</li>
                <li>• Date overrides take precedence over weekly hours</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-4 bg-border" />
          
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Next steps:</strong> 
            {stats.totalBlocks === 0 ? (
              " Start by setting your regular weekly hours in List view."
            ) : stats.totalOverrides === 0 ? (
              " Your weekly schedule is set! Use Calendar view to add date-specific changes."
            ) : (
              " Your schedule is configured with both weekly hours and date overrides."
            )}
            {hasChanges && <span className="text-foreground"> Don't forget to save your changes!</span>}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Action Bar */}
      {hasChanges && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <Card className="border-amber-200 bg-amber-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    Unsaved changes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}