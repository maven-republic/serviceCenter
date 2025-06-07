// src/artifacts/EducationArtifact.jsx

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function EducationArtifact({ data }) {
  const initial = data.content
  const supabase = useSupabaseClient()

  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(initial.description || '')
  const [institutionName, setInstitutionName] = useState(initial.institution?.name || '')
  const [institutionId, setInstitutionId] = useState(initial.institution?.id || null)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const fetchInstitutions = async () => {
      if (institutionName.length < 2) {
        setSearchResults([])
        return
      }

      const { data: results, error } = await supabase
        .from('institution')
        .select('id, name')
        .ilike('name', `%${institutionName}%`)
        .limit(5)

      if (!error) {
        setSearchResults(results)
      }
    }

    fetchInstitutions()
  }, [institutionName])

  const handleSelectInstitution = (inst) => {
  setInstitutionName(inst.name)
  setInstitutionId(inst.id)
  setSearchResults([])
  handleSave() // Save immediately after selection
}

  const handleSave = async () => {
    const { error } = await supabase
      .from('professional_education')
      .update({
        description,
        institution_id: institutionId
      })
      .eq('education_id', initial.education_id)

    if (error) {
      console.error('❌ Failed to save:', error)
    } else {
      console.log('✅ Education artifact saved.')
    }

    setIsEditing(false)
  }

  return (
    <li className="position-relative mb-4 pb-4" style={{ paddingLeft: '1rem' }}>
      <div className="position-absolute border-bottom w-100" style={{
        bottom: '0',
        left: '1rem',
        right: '0',
        borderColor: '#e9ecef',
        opacity: 0.5
      }}></div>

      <div className="card border-0">
        <div className="card-body p-3">
          <div className="dropdown position-absolute" style={{ top: '1rem', right: '1rem' }}>
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ fontSize: '0.75rem' }}>
              <i className="fas fa-ellipsis-h"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item" onClick={() => setIsEditing(true)}><i className="fas fa-edit me-2 text-primary"></i>Edit</button></li>
              <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
            </ul>
          </div>

          {isEditing ? (
            <div className="position-relative mb-2">
              <input
                type="text"
                className="form-control form-control-sm fw-bold text-dark"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Search institution..."
                autoFocus
              />
              {searchResults.length > 0 && (
                <ul className="list-group position-absolute w-100 mt-1 zindex-dropdown">
                  {searchResults.map(inst => (
                    <li
                      key={inst.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectInstitution(inst)}
                      style={{ cursor: 'pointer' }}
                    >
                      {inst.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <h4
              className="card-title mb-1 fw-bold text-dark"
              onClick={() => setIsEditing(true)}
              style={{ cursor: 'pointer' }}
            >
              {institutionName || 'Institution Not Specified'}
            </h4>
          )}

          <h6 className="card-subtitle mb-2 text-muted fw-normal">
            {initial.degree?.name || 'Degree Not Specified'}
            {initial.field_of_study?.name && <span className="ms-1 text-secondary">, {initial.field_of_study.name}</span>}
          </h6>

          <p className="mb-3 text-muted" style={{ fontSize: '0.9rem' }}>
            {initial.start_date?.slice(0, 4)} - {initial.end_date ? initial.end_date.slice(0, 4) : 'Present'}
          </p>

          {isEditing ? (
            <textarea
              className="form-control mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              rows={3}
            />
          ) : (
            <p
              className="card-text text-muted mb-0"
              style={{ fontSize: '0.9rem', lineHeight: '1.5', cursor: 'pointer' }}
              onClick={() => setIsEditing(true)}
            >
              {description || 'Click to add description'}
            </p>
          )}

          {initial.education_level && (
            <div className="mt-3">
              <span className="badge rounded-pill px-3 py-2 fw-normal text-uppercase" style={{
                backgroundColor: 'rgba(91, 187, 123, 0.1)',
                color: 'var(--primary-color, #5bbb7b)',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                border: '1px solid rgba(91, 187, 123, 0.2)'
              }}>
                {initial.education_level.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
