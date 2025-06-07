'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function EducationTimelineArtifact({ educationId, start, end }) {
  const supabase = useSupabaseClient()

  const [editingStart, setEditingStart] = useState(false)
  const [editingEnd, setEditingEnd] = useState(false)

  const [startDate, setStartDate] = useState(start || '')
  const [endDate, setEndDate] = useState(end || '')

  const [savingStart, setSavingStart] = useState(false)
  const [savingEnd, setSavingEnd] = useState(false)

  const handleStartSave = async () => {
    if (!startDate) return
    setSavingStart(true)

    const { error } = await supabase
      .from('professional_education')
      .update({ start_date: startDate })
      .eq('education_id', educationId)

    if (error) console.error('❌ Failed to update start date:', error.message)
    setSavingStart(false)
    setEditingStart(false)
  }

  const handleEndSave = async () => {
    setSavingEnd(true)

    const { error } = await supabase
      .from('professional_education')
      .update({ end_date: endDate || null }) // allow null
      .eq('education_id', educationId)

    if (error) console.error('❌ Failed to update end date:', error.message)
    setSavingEnd(false)
    setEditingEnd(false)
  }

  return (
    <div className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
      {/* 📅 Start Date */}
      {editingStart ? (
        <input
          type="date"
          className="form-control d-inline w-auto me-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          onBlur={handleStartSave}
          autoFocus
        />
      ) : (
        <span
          className="me-2"
          onClick={() => setEditingStart(true)}
          style={{ cursor: 'pointer' }}
        >
          {startDate?.slice(0, 4) || 'Start'}
        </span>
      )}

      –

      {/* 📅 End Date */}
      {editingEnd ? (
        <input
          type="date"
          className="form-control d-inline w-auto ms-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          onBlur={handleEndSave}
        />
      ) : (
        <span
          className="ms-2"
          onClick={() => setEditingEnd(true)}
          style={{ cursor: 'pointer' }}
        >
          {endDate ? endDate.slice(0, 4) : 'Present'}
        </span>
      )}

      {/* Loaders */}
      {(savingStart || savingEnd) && (
        <span className="small text-info ms-2">
          <i className="fas fa-spinner fa-spin"></i> Saving...
        </span>
      )}
    </div>
  )
}
