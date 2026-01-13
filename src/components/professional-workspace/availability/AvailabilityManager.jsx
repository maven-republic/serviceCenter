'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Card,
  CardContent,
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
  const supabase = useSupabaseClient()
  const [availability, setAvailability] = useState(initialAvailability)
  const [overrides, setOverrides] = useState(initialOverrides)
  const [protocolRules, setProtocolRules] = useState(profileSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('schedule')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSaveAvailability = async ({ availability: newAvailability, overrides: newOverrides }) => {
    setIsSaving(true)
    setSaveStatus(null)

    try {
      // Delete existing availability
      const { error: deleteError } = await supabase
        .from('availability')
        .delete()
        .eq('professional_id', professionalId)

      if (deleteError) throw deleteError

      // Insert new availability
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

      // Delete existing overrides
      const { error: deleteOverridesError } = await supabase
        .from('availability_override')
        .delete()
        .eq('professional_id', professionalId)

      if (deleteOverridesError) throw deleteOverridesError

      // Insert new overrides
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

      setAvailability(newAvailability)
      setOverrides(newOverrides)
      setSaveStatus('success')
      setHasUnsavedChanges(false)

    } catch (error) {
      console.error('Error saving availability:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
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

    } catch (error) {
      console.error('Error saving protocol rules:', error)
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header - CHANGED z-40 to z-20 */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Availability</h1>
                <p className="text-xs text-muted-foreground">Manage your schedule</p>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="animate-pulse">
                Unsaved
              </Badge>
            )}
          </div>

          {/* Status Alert */}
          {saveStatus && (
            <Alert 
              variant={saveStatus === 'success' ? 'default' : 'destructive'}
              className="mb-0"
            >
              {saveStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">
                {saveStatus === 'success' 
                  ? 'Changes saved successfully!' 
                  : 'Failed to save. Please try again.'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6 mx-4 max-w-sm">
            <CardContent className="flex items-center gap-4 p-0">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <p className="font-medium">Saving changes...</p>
                <p className="text-sm text-muted-foreground">Please wait</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
              {tabCounts.schedule > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {tabCounts.schedule}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="protocol" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
              {tabCounts.protocol > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {tabCounts.protocol}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4 mt-0">
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
          </TabsContent>

          <TabsContent value="protocol" className="space-y-4 mt-0">
            <AvailabilityProtocol
              rules={protocolRules}
              setRules={(newRules) => {
                setProtocolRules(newRules)
                handleDataChange()
              }}
              onSave={handleSaveProtocol}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background border-t shadow-lg">
          <div className="flex gap-3">
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
              onClick={() => {
                if (activeTab === 'schedule') {
                  handleSaveAvailability({ availability, overrides })
                } else {
                  handleSaveProtocol(protocolRules)
                }
              }}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}