'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function InstitutionArtifact({ educationId, institution }) {
  const supabase = useSupabaseClient()

  const [institutions, setInstitutions] = useState([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load all institutions
  useEffect(() => {
    const fetchInstitutions = async () => {
      const { data, error } = await supabase
        .from('institution')
        .select('institution_id, name')
        .order('name', { ascending: true })

      if (!error) setInstitutions(data)
      else console.error('❌ Failed to fetch institutions:', error)
    }

    fetchInstitutions()
  }, [supabase])

  // Prefill selected institution
  useEffect(() => {
    if (institution?.institution_id) {
      setSelectedInstitutionId(institution.institution_id)
    }
  }, [institution])

  const handleSave = async () => {
    if (!selectedInstitutionId) {
      setEditing(false)
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('professional_education')
      .update({ institution_id: selectedInstitutionId })
      .eq('education_id', educationId)

    if (error) {
      console.error('❌ Failed to update institution:', error.message)
    }

    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mb-2">
      {editing ? (
        <select
          className="form-select"
          value={selectedInstitutionId}
          onChange={(e) => setSelectedInstitutionId(e.target.value)}
          onBlur={handleSave}
          autoFocus
        >
          <option disabled value="">Select an institution</option>
          {institutions.map(inst => (
            <option key={inst.institution_id} value={inst.institution_id}>
              {inst.name}
            </option>
          ))}
        </select>
      ) : (
        <h4
          className="card-title mb-1 fw-bold text-dark"
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          {institution?.name || 'Institution Not Specified'}
        </h4>
      )}

      {saving && (
        <div className="small text-info mt-1">
          <i className="fas fa-spinner fa-spin me-2"></i> Saving...
        </div>
      )}
    </div>
  )
}
