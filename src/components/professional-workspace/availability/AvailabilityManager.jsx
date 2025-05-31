'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

      console.log('✅ Protocol rules saved successfully')

    } catch (error) {
      console.error('❌ Error saving protocol rules:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  return (
    <div className="container-fluid py-4">
      {/* Save Status Alert */}
      {saveStatus && (
        <div className={`alert ${saveStatus === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          <div className="d-flex align-items-center">
            <i className={`fas ${saveStatus === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
            <span>
              {saveStatus === 'success' 
                ? 'Changes saved successfully!' 
                : 'Failed to save changes. Please try again.'
              }
            </span>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSaveStatus(null)}
          ></button>
        </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 9999 }}>
          <div className="bg-white rounded p-4 shadow">
            <div className="d-flex align-items-center gap-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Saving...</span>
              </div>
              <span>Saving changes...</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4" id="availabilityTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className="nav-link active" 
            id="schedule-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#schedule" 
            type="button" 
            role="tab"
          >
            <i className="fas fa-calendar-alt me-2"></i>
            Schedule
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className="nav-link" 
            id="protocol-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#protocol" 
            type="button" 
            role="tab"
          >
            <i className="fas fa-cog me-2"></i>
            Settings
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content" id="availabilityTabsContent">
        {/* Schedule Tab */}
        <div className="tab-pane fade show active" id="schedule" role="tabpanel">
          <AvailabilityInterface
            availability={availability}
            overrides={overrides}
            onUpdateAvailability={setAvailability}
            onUpdateOverrides={setOverrides}
            onSave={handleSaveAvailability}
          />
        </div>

        {/* Protocol Tab */}
        <div className="tab-pane fade" id="protocol" role="tabpanel">
          <AvailabilityProtocol
            rules={protocolRules}
            setRules={setProtocolRules}
            onSave={handleSaveProtocol}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  )
}