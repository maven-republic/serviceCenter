'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function CredentialArtifact({ educationId, degree }) {
  const supabase = useSupabaseClient()

  const [degrees, setDegrees] = useState([])
  const [selectedDegreeId, setSelectedDegreeId] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load degrees list
  useEffect(() => {
    const fetchDegrees = async () => {
      const { data, error } = await supabase
        .from('degree')
        .select('degree_id, name')
        .order('name', { ascending: true })

      if (!error) setDegrees(data)
      else console.error('❌ Failed to fetch degrees:', error)
    }

    fetchDegrees()
  }, [supabase])

  // Set current degree prefill
  useEffect(() => {
    if (degree?.degree_id) {
      setSelectedDegreeId(degree.degree_id)
    }
  }, [degree])

  const handleSave = async () => {
    if (!selectedDegreeId) {
      setEditing(false)
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('professional_education')
      .update({ degree_id: selectedDegreeId })
      .eq('education_id', educationId)

    if (error) {
      console.error('❌ Failed to update degree:', error.message)
    }

    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mb-1">
      {editing ? (
        <select
          className="form-select"
          value={selectedDegreeId}
          onChange={(e) => setSelectedDegreeId(e.target.value)}
          onBlur={handleSave}
          autoFocus
        >
          <option disabled value="">Select a degree</option>
          {degrees.map(d => (
            <option key={d.degree_id} value={d.degree_id}>
              {d.name}
            </option>
          ))}
        </select>
      ) : (
        <h6
          className="card-subtitle text-muted fw-normal"
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          {degree?.name || 'Degree Not Specified'}
        </h6>
      )}

      {saving && (
        <div className="small text-info mt-1">
          <i className="fas fa-spinner fa-spin me-2"></i> Saving...
        </div>
      )}
    </div>
  )
}
