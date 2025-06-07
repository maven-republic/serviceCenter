'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function DescriptionArtifact({ educationId, description }) {
  const supabase = useSupabaseClient()

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(description || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('professional_education')
      .update({ description: text })
      .eq('education_id', educationId)

    if (error) {
      console.error('❌ Failed to update description:', error.message)
    }

    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mb-2">
      {editing ? (
        <textarea
          className="form-control"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <p 
          className="card-text text-muted mb-0"
          onClick={() => setEditing(true)}
          style={{ fontSize: '0.9rem', lineHeight: '1.5', cursor: 'pointer' }}
        >
          {text || <span className="text-muted">Click to add description</span>}
        </p>
      )}

      {saving && (
        <div className="small text-info mt-1">
          <i className="fas fa-spinner fa-spin me-2"></i> Saving...
        </div>
      )}
    </div>
  )
}
