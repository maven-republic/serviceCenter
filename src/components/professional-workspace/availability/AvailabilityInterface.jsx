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
  Edit3,
  TrendingUp
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
    <div className="space-y-4">
      {/* Mobile Header with View Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Working Hours</h2>
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse text-xs px-2 py-0.5">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="w-full">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-full h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="List">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <div>
                    <p className="font-medium">List View</p>
                    <p className="text-xs text-muted-foreground">Set weekly patterns</p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="Calendar">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Calendar View</p>
                    <p className="text-xs text-muted-foreground">Date-specific changes</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div className="text-xl font-bold text-foreground">{stats.totalHours}h</div>
              </div>
              <div className="text-xs text-muted-foreground">Weekly Hours</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="text-xl font-bold text-foreground">{stats.activeDays}/7</div>
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Override Alert - Mobile Optimized */}
      {localOverrides.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-amber-700">
                <strong>{localOverrides.length}</strong> date override{localOverrides.length !== 1 ? 's' : ''} configured.
              </span>
              {viewMode === 'List' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode('Calendar')}
                  className="w-fit self-start h-8"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  View Calendar
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content - Remove Card wrapper */}
      <div>
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            {viewMode === 'List' ? (
              <List className="h-5 w-5" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            <CardTitle className="text-lg">
              {viewMode === 'List' ? 'Weekly Schedule' : 'Calendar View'}
            </CardTitle>
          </div>
          
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            {viewMode === 'List' ? (
              <>
                <Edit3 className="h-3 w-3" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                Interactive
              </>
            )}
          </Badge>
        </div>
        
        <CardDescription className="text-sm pb-4">
          {viewMode === 'List' 
            ? 'Set your regular weekly availability for each day'
            : 'View schedule in calendar format and create date overrides'
          }
        </CardDescription>
        
        <div>
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
      </div>

      {/* Mobile Summary Card */}
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Info className="h-4 w-4" />
            Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <h4 className="font-medium mb-2 text-foreground">📊 Current Setup</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Time blocks:</span>
                <span className="font-medium text-foreground">{stats.totalBlocks}</span>
              </div>
              <div className="flex justify-between">
                <span>Active days:</span>
                <span className="font-medium text-foreground">{stats.activeDays} of 7</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly hours:</span>
                <span className="font-medium text-foreground">{stats.totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Date overrides:</span>
                <span className="font-medium text-foreground">{stats.totalOverrides}</span>
              </div>
            </div>
          </div>
          
          <Separator className="bg-border" />
          
          <div>
            <h4 className="font-medium mb-2 text-foreground">💡 Quick Tips</h4>
            <div className="space-y-1 text-xs">
              <p>• Use List view for weekly patterns</p>
              <p>• Use Calendar view for specific dates</p>
              <p>• Date overrides take precedence</p>
            </div>
          </div>
          
          <Separator className="bg-border" />
          
          <div className="text-xs">
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

      {/* Mobile Action Buttons - Only show if there are changes and we're not in a parent save context */}
      {hasChanges && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}