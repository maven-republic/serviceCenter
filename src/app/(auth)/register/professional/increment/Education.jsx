'use client'

import { useState, useEffect } from 'react'
import styles from './Education.module.css'
import { createClient } from '../../../../../../utils/supabase/client'
import Select from 'react-select'

export default function Education({ formData, updateFormData }) {
  const [institutions, setInstitutions] = useState([])
  const education = formData.education || []

  useEffect(() => {
    const fetchInstitutions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('education_institution')
        .select('institution_id, name')
        .order('name')

      if (!error) setInstitutions(data)
    }

    fetchInstitutions()
  }, [])

  const handleChange = (index, field, value) => {
    const updated = [...education]
    updated[index][field] = value
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const addEntry = () => {
    const newEntry = {
      institutionId: '',
      institutionName: '',
      degree: '',
      fieldOfStudy: '',
      graduationDate: ''
    }
    updateFormData({
      target: {
        name: 'education',
        value: [...education, newEntry]
      }
    })
  }

  const removeEntry = (index) => {
    const updated = [...education]
    updated.splice(index, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const buildInstitutionOptions = () => {
    return [
      ...institutions.map(inst => ({
        value: inst.institution_id,
        label: `🎓 ${inst.name}`
      })),
      { value: '__new', label: '+ Add a new institution' }
    ]
  }

  return (
    <div className="container py-3">
      <h4 className="fw-bold mb-4">Education History</h4>

      {education.map((entry, index) => (
        <div className="border rounded p-3 mb-4" key={index}>
          <div className="mb-3">
            <label htmlFor={`institution-${index}`} className="form-label fw-medium">Institution</label>
            <Select
              inputId={`institution-${index}`}
              className="react-select-container"
              classNamePrefix="react-select"
              options={buildInstitutionOptions()}
              value={buildInstitutionOptions().find(opt => opt.value === entry.institutionId) || null}
              onChange={selected => handleChange(index, 'institutionId', selected.value)}
              placeholder="Search or select institution"
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: '2px 6px',
                  borderRadius: '0.375rem',
                  borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
                  boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13,110,253,.25)' : null,
                  '&:hover': {
                    borderColor: '#86b7fe'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#f8f9fa' : 'white',
                  color: '#212529',
                  padding: '10px 12px',
                  cursor: 'pointer'
                }),
                menu: base => ({
                  ...base,
                  zIndex: 100
                })
              }}
            />
          </div>

          {entry.institutionId === '__new' && (
            <div className="mb-3">
              <label className="form-label">New Institution Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter institution name"
                value={entry.institutionName}
                onChange={e => handleChange(index, 'institutionName', e.target.value)}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Degree</label>
            <input
              type="text"
              className="form-control"
              value={entry.degree}
              onChange={e => handleChange(index, 'degree', e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Field of Study</label>
            <input
              type="text"
              className="form-control"
              value={entry.fieldOfStudy}
              onChange={e => handleChange(index, 'fieldOfStudy', e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Graduation Date</label>
            <input
              type="date"
              className="form-control"
              value={entry.graduationDate}
              onChange={e => handleChange(index, 'graduationDate', e.target.value)}
            />
          </div>

          <div className="text-end">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeEntry(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={addEntry}
      >
        + Add Another
      </button>
    </div>
  )
}
