'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function FieldOfStudyArtifact({ educationId, field }) {
  const supabase = useSupabaseClient()

  const [fields, setFields] = useState([])
  const [selectedFieldId, setSelectedFieldId] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load field of study options
  useEffect(() => {
    const fetchFields = async () => {
      const { data, error } = await supabase
        .from('field_of_study')
        .select('field_of_study_id, name')
        .order('name', { ascending: true })

      if (!error) setFields(data)
      else console.error('❌ Failed to fetch field of study options:', error)
    }

    fetchFields()
  }, [supabase])

  // Prefill current selection
  useEffect(() => {
    if (field?.field_of_study_id) {
      setSelectedFieldId(field.field_of_study_id)
    }
  }, [field])

  const handleSave = async () => {
    if (!selectedFieldId) {
      setEditing(false)
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('professional_education')
      .update({ field_of_study_id: selectedFieldId })
      .eq('education_id', educationId)

    if (error) {
      console.error('❌ Failed to update field of study:', error.message)
    }

    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mb-2">
      {editing ? (
        <select
          className="form-select"
          value={selectedFieldId}
          onChange={(e) => setSelectedFieldId(e.target.value)}
          onBlur={handleSave}
          autoFocus
        >
          <option disabled value="">Select a field of study</option>
          {fields.map(f => (
            <option key={f.field_of_study_id} value={f.field_of_study_id}>
              {f.name}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="text-secondary"
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          {field?.name ? `, ${field.name}` : ', [Click to add field]'}
        </span>
      )}

      {saving && (
        <div className="small text-info mt-1">
          <i className="fas fa-spinner fa-spin me-2"></i> Saving...
        </div>
      )}
    </div>
  )
}
