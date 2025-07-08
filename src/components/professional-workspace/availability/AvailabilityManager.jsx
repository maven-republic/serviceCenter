'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react'
import AvailabilityInterface from './AvailabilityInterface'
import AvailabilityProtocol from './AvailabilityProtocol'

export default function AvailabilityManager({ 
  initialAvailability = [], 
  initialOverrides = [],
  professionalId,
  profileSettings = {}
}) {
  const supabase = createClientComponentClient()
  const [availability, setAvailability] = useState(initialAvailability)
  const [overrides, setOverrides] = useState(initialOverrides)
  const [protocolRules, setProtocolRules] = useState(profileSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success', 'error', null
  const [activeTab, setActiveTab] = useState('schedule')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSaveAvailability = async ({ availability: newAvailability, overrides: newOverrides }) => {
    setIsSaving(true)
    setSaveStatus(null)

    try {
      console.log('💾 Saving availability:', {
        professionalId,
        availabilityCount: newAvailability.length,
        overridesCount: newOverrides.length
      })

      // 1. Delete existing availability
      const { error: deleteError } = await supabase
        .from('availability')
        .delete()
        .eq('professional_id', professionalId)

      if (deleteError) throw deleteError

      // 2. Insert new availability
      if (newAvailability.length > 0) {
        const availabilityToInsert = newAvailability.map(slot => ({
          professional_id: professionalId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time
        }))

        const { error: insertError } = await supabase
          .from('availability')
          .insert(availabilityToInsert)

        if (insertError) throw insertError
      }

      // 3. Delete existing overrides
      const { error: deleteOverridesError } = await supabase
        .from('availability_override')
        .delete()
        .eq('professional_id', professionalId)

      if (deleteOverridesError) throw deleteOverridesError

      // 4. Insert new overrides
      if (newOverrides.length > 0) {
        const overridesToInsert = newOverrides.map(override => ({
          professional_id: professionalId,
          override_date: override.override_date,
          start_time: override.start_time,
          end_time: override.end_time,
          is_available: override.is_available ?? true
        }))

        const { error: insertOverridesError } = await supabase
          .from('availability_override')
          .insert(overridesToInsert)

        if (insertOverridesError) throw insertOverridesError
      }

      // Update local state
      setAvailability(newAvailability)
      setOverrides(newOverrides)
      setSaveStatus('success')
      setHasUnsavedChanges(false)

      console.log('✅ Availability saved successfully')

    } catch (error) {
      console.error('❌ Error saving availability:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)

      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleSaveProtocol = async (newRules) => {
    setIsSaving(true)
    setSaveStatus(null)

    try {
      const updateData = {}
      
      if (newRules.min_notice_hours !== undefined) {
        updateData.min_notice_hours = newRules.min_notice_hours
      }
      if (newRules.buffer_minutes !== undefined) {
        updateData.buffer_minutes = newRules.buffer_minutes
      }
      if (newRules.default_event_duration !== undefined) {
        updateData.default_event_duration = newRules.default_event_duration
      }
      if (newRules.max_bookings_per_day !== undefined) {
        updateData.max_bookings_per_day = newRules.max_bookings_per_day
      }

      const { error } = await supabase
        .from('individual_professional')
        .update(updateData)
        .eq('professional_id', professionalId)

      if (error) throw error

      setProtocolRules(newRules)
      setSaveStatus('success')
      setHasUnsavedChanges(false)

      console.log('✅ Protocol rules saved successfully')

    } catch (error) {
      console.error('❌ Error saving protocol rules:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleDataChange = () => {
    setHasUnsavedChanges(true)
    setSaveStatus(null)
  }

  const handleReset = () => {
    setAvailability(initialAvailability)
    setOverrides(initialOverrides)
    setProtocolRules(profileSettings)
    setHasUnsavedChanges(false)
    setSaveStatus(null)
  }

  const getTabCounts = () => {
    const scheduleBlocks = availability.length + overrides.length
    const protocolRulesSet = Object.values(protocolRules).filter(val => val !== null && val !== undefined).length
    
    return {
      schedule: scheduleBlocks,
      protocol: protocolRulesSet
    }
  }

  const tabCounts = getTabCounts()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Availability Management</h1>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="animate-pulse">
                Unsaved changes
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-lg">
          Configure your working hours and booking preferences to optimize your schedule.
        </p>
      </div>

      {/* Status Alerts */}
      {saveStatus && (
        <Alert variant={saveStatus === 'success' ? 'default' : 'destructive'}>
          {saveStatus === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span>
              {saveStatus === 'success' 
                ? 'Changes saved successfully!' 
                : 'Failed to save changes. Please try again.'
              }
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSaveStatus(null)}
              className="h-auto p-1 text-xs"
            >
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <CardContent className="flex items-center gap-4 p-0">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <p className="font-medium">Saving changes...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Hours</p>
                <p className="text-xl font-bold">{availability.length}</p>
                <p className="text-xs text-muted-foreground">time blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Overrides</p>
                <p className="text-xl font-bold">{overrides.length}</p>
                <p className="text-xs text-muted-foreground">special dates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Protocol Rules</p>
                <p className="text-xl font-bold">{tabCounts.protocol}/4</p>
                <p className="text-xs text-muted-foreground">configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
              {tabCounts.schedule > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {tabCounts.schedule}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="protocol" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
              {tabCounts.protocol > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {tabCounts.protocol}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Global Save Button */}
          {hasUnsavedChanges && (
            <Button
              onClick={() => {
                if (activeTab === 'schedule') {
                  handleSaveAvailability({ availability, overrides })
                } else {
                  handleSaveProtocol(protocolRules)
                }
              }}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Working Hours & Schedule
              </CardTitle>
              <CardDescription>
                Set your regular availability and manage date-specific overrides.
                {overrides.length > 0 && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    You have {overrides.length} date override{overrides.length !== 1 ? 's' : ''} configured.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityInterface
                availability={availability}
                overrides={overrides}
                onUpdateAvailability={(newAvailability) => {
                  setAvailability(newAvailability)
                  handleDataChange()
                }}
                onUpdateOverrides={(newOverrides) => {
                  setOverrides(newOverrides)
                  handleDataChange()
                }}
                onSave={handleSaveAvailability}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocol Tab */}
        <TabsContent value="protocol" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Booking Protocol & Rules
              </CardTitle>
              <CardDescription>
                Configure advance notice requirements, buffer times, and booking limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityProtocol
                rules={protocolRules}
                setRules={(newRules) => {
                  setProtocolRules(newRules)
                  handleDataChange()
                }}
                onSave={handleSaveProtocol}
                isSaving={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-4 w-4" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">📅 Schedule Setup</h4>
              <ul className="space-y-1 text-xs">
                <li>• Set your regular weekly hours</li>
                <li>• Use calendar view for date-specific changes</li>
                <li>• Override specific dates when needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Protocol Settings</h4>
              <ul className="space-y-1 text-xs">
                <li>• Set minimum booking notice time</li>
                <li>• Add buffer time between appointments</li>
                <li>• Limit daily bookings to prevent overload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}