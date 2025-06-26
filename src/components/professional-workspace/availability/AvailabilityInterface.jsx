'use client'

import { useState, useEffect } from 'react'
import AvailabilityBuilder from './AvailabilityBuilder'
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

  useEffect(() => {
    setLocalAvailability(availability)
  }, [availability])

  useEffect(() => {
    setLocalOverrides(overrides)
  }, [overrides])

  const handleUpdateAvailability = (newAvailability) => {
    setLocalAvailability(newAvailability)
    onUpdateAvailability?.(newAvailability)
  }

  const handleUpdateOverride = (dateKey, blocks) => {
    const updated = [
      ...localOverrides.filter(o => o.override_date !== dateKey),
      ...blocks
    ]
    setLocalOverrides(updated)
    onUpdateOverrides?.(updated)
  }

  const handleDeleteOverride = (dateKey) => {
    const updated = localOverrides.filter(o => o.override_date !== dateKey)
    setLocalOverrides(updated)
    onUpdateOverrides?.(updated)
  }

  const handleSave = async () => {
    try {
      await onSave?.({
        availability: localAvailability,
        overrides: localOverrides
      })
    } catch (error) {
      console.error('Failed to save availability:', error)
    }
  }

  return (
    <div className="container py-4">
      {/* Header with View Toggle */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Working hours (default)</h4>
          <p className="text-muted mb-0">Set when you're typically available for meetings</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="d-none d-md-flex bg-light rounded-pill p-1 gap-1">
            {['List', 'Calendar'].map((label) => (
              <button
                key={label}
                className={`btn btn-sm rounded-pill px-3 fw-medium ${
                  label === viewMode ? 'bg-white text-dark shadow-sm' : 'text-muted'
                }`}
                style={{ minWidth: '80px' }}
                onClick={() => setViewMode(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="d-md-none">
            <select
              className="form-select form-select-sm"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="List">List View</option>
              <option value="Calendar">Calendar View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert for Date-specific Hours */}
      {localOverrides.length > 0 && (
        <div className="alert alert-info d-flex align-items-center mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <span>
            You have {localOverrides.length} date-specific override{localOverrides.length !== 1 ? 's' : ''} set. 
            Use Calendar view to manage them.
          </span>
        </div>
      )}

      {/* Content */}
      {viewMode === 'List' ? (
        <div>
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">Weekly Hours</h6>
            <p className="text-muted small">Set when you're typically available for meetings</p>
          </div>
          <AvailabilityBuilder
            availability={localAvailability}
            setAvailability={handleUpdateAvailability}
          />
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <h6 className="fw-semibold mb-2">Calendar View</h6>
            <p className="text-muted small">Adjust hours for specific days and create date-specific overrides</p>
          </div>
          <AvailabilityCalendarView
            availability={localAvailability}
            overrides={localOverrides}
            onUpdateOverride={handleUpdateOverride}
            onDeleteOverride={handleDeleteOverride}
            onUpdateRecurring={handleUpdateAvailability}
          />
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 p-3 bg-light rounded">
        <div className="small text-muted">
          <strong>Current Schedule:</strong> {localAvailability.length} time block{localAvailability.length !== 1 ? 's' : ''} set across{' '}
          {new Set(localAvailability.map(a => a.day_of_week)).size} day{new Set(localAvailability.map(a => a.day_of_week)).size !== 1 ? 's' : ''}
          {localOverrides.length > 0 && (
            <span> • {localOverrides.length} date-specific override{localOverrides.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-4">
        <button 
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save Changes
        </button>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => {
            setLocalAvailability(availability)
            setLocalOverrides(overrides)
          }}
        >
          Reset Changes
        </button>
      </div>
    </div>
  )
}