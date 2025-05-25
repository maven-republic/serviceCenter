'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Select from 'react-select'
import styles from './Education.module.css'
import EducationCompetenceSelector from './EducationCompetenceSelector'
import EducationMediaUploader from './EducationMediaUploader'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import AcademicExperienceOverview from '@/components/professional-workspace/input/AcademicExperienceOverview'

export default function Education({ formData, updateFormData }) {
  const [institutions, setInstitutions] = useState([])
  const [degrees, setDegrees] = useState([])
  const [fieldsOfStudy, setFieldsOfStudy] = useState([])
  const [competences, setCompetences] = useState([])

  const supabase = useSupabaseClient()
  const [editModal, setEditModal] = useState({ show: false, index: null, mediaIndex: null, title: '', description: '' })
  const education = formData.education || []

  const educationLevelOptions = [
    { value: 'high_school', label: "High School" },
    { value: 'vocational_training', label: "Vocational Training" },
    { value: 'professional_certification', label: "Professional Certification" },
    { value: 'associate_degree', label: "Associate Degree" },
    { value: 'bachelor_degree', label: "Bachelor's Degree" },
    { value: 'master_degree', label: "Master's Degree" },
    { value: 'doctorate_degree', label: "Doctorate Degree" }
  ]

  useEffect(() => {
    const fetchInstitutions = async () => {
      const { data } = await supabase.from('institution').select('institution_id, name').order('name')
      if (data) setInstitutions(data)
    }
    const fetchDegrees = async () => {
      const { data } = await supabase.from('degree').select('degree_id, name').order('name')
      if (data) setDegrees(data)
    }
    const fetchFields = async () => {
      const { data } = await supabase.from('field_of_study').select('field_of_study_id, name, category').order('category, name')
      if (data) setFieldsOfStudy(data)
    }
    const fetchCompetences = async () => {
      const { data } = await supabase.from('competence').select('competence_id, name, category').order('category, name')
      if (data) setCompetences(data)
    }

    fetchInstitutions()
    fetchDegrees()
    fetchFields()
    fetchCompetences()
  }, [])

  const buildDegreeOptions = () => degrees.map(degree => ({ value: degree.degree_id, label: degree.name }))
  const buildGroupedFieldOptions = () => {
    const groups = {}
    for (const field of fieldsOfStudy) {
      if (!groups[field.category]) groups[field.category] = []
      groups[field.category].push({ value: field.field_of_study_id, label: field.name })
    }
    return Object.entries(groups).map(([category, options]) => ({ label: category, options }))
  }
  const buildInstitutionOptions = () => [
    ...institutions.map(inst => ({ value: inst.institution_id, label: `🎓 ${inst.name}` })),
    { value: '__new', label: '+ Add a new institution' }
  ]

  const handleChange = (index, field, value) => {
    const updated = [...education]
    updated[index][field] = value
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const toggleEducationCompetence = (index, competenceId) => {
    const updated = [...education]
    const current = updated[index].competenceIds || []
    updated[index].competenceIds = current.includes(competenceId)
      ? current.filter(id => id !== competenceId)
      : [...current, competenceId]
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleAddMediaDraft = (index, media) => {
    const updated = [...education]
    updated[index].media = [...(updated[index].media || []), media]
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleDeleteMedia = (index, mediaIndex) => {
    const updated = [...education]
    updated[index].media.splice(mediaIndex, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleEditMedia = () => {
    const updated = [...education]
    updated[editModal.index].media[editModal.mediaIndex].title = editModal.title
    updated[editModal.index].media[editModal.mediaIndex].description = editModal.description
    updateFormData({ target: { name: 'education', value: updated } })
    setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })
  }

  const addEntry = () => {
    const newEntry = {
      institutionId: '',
      institutionName: '',
      degreeId: '',
      fieldOfStudyId: '',
      educationLevel: '',
      startDate: '',
      endDate: '',
      competenceIds: [],
      media: [],
      description: '',
      educationId: crypto.randomUUID()
    }
    updateFormData({ target: { name: 'education', value: [...education, newEntry] } })
  }

  const removeEntry = (index) => {
    const updated = [...education]
    updated.splice(index, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  return (
    <div className="container py-3">
      <h4 className="fw-bold mb-4">Formal Education</h4>

      {education.map((entry, index) => (
        <div className="border rounded p-3 mb-4" key={index}>
          {/* Institution */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Institution</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={buildInstitutionOptions()}
              value={buildInstitutionOptions().find(opt => opt.value === entry.institutionId) || null}
              onChange={selected => handleChange(index, 'institutionId', selected.value)}
              placeholder="Search or select institution"
              isSearchable
            />
          </div>

          {entry.institutionId === '__new' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>New Institution Name</label>
              <input
                type="text"
                className={styles.input}
                value={entry.institutionName}
                onChange={e => handleChange(index, 'institutionName', e.target.value)}
              />
            </div>
          )}

          {/* Degree */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Degree</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={buildDegreeOptions()}
              value={buildDegreeOptions().find(opt => opt.value === entry.degreeId) || null}
              onChange={selected => handleChange(index, 'degreeId', selected.value)}
              placeholder="Select degree"
              isSearchable
            />
          </div>

          {/* Field of Study */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Field of Study</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={buildGroupedFieldOptions()}
              value={buildGroupedFieldOptions().flatMap(group => group.options).find(opt => opt.value === entry.fieldOfStudyId) || null}
              onChange={selected => handleChange(index, 'fieldOfStudyId', selected.value)}
              placeholder="Select field of study"
              isSearchable
            />
          </div>

          {/* Education Level */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Education Level</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={educationLevelOptions}
              value={educationLevelOptions.find(opt => opt.value === entry.educationLevel) || null}
              onChange={selected => handleChange(index, 'educationLevel', selected.value)}
              placeholder="Select education level"
              isSearchable
            />
          </div>

          {/* Dates */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                className={styles.input}
                value={entry.startDate}
                onChange={e => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                className={styles.input}
                value={entry.endDate}
                onChange={e => handleChange(index, 'endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id={`current-${index}`}
              checked={!entry.endDate}
              onChange={e => handleChange(index, 'endDate', e.target.checked ? '' : new Date().toISOString().split('T')[0])}
            />
            <label className="form-check-label" htmlFor={`current-${index}`}>I'm currently attending</label>
          </div>

          <EducationCompetenceSelector
            selected={entry.competenceIds || []}
            allCompetences={competences}
            onSelect={id => toggleEducationCompetence(index, id)}
            onRemove={id => toggleEducationCompetence(index, id)}
          />

          <EducationMediaUploader onUploadDraft={media => handleAddMediaDraft(index, media)} />

          {/* Uploaded Media */}
          {entry.media?.length > 0 && (
            <div className="mt-3">
              <label className={styles.label}>Uploaded Media</label>
              <div className="d-flex flex-wrap gap-3">
                {entry.media.map((item, i) => (
                  <div
                    key={i}
                    className="border rounded p-2 shadow-sm d-flex flex-column align-items-center"
                    style={{ width: '150px' }}
                  >
                    {item.media_type === 'image' ? (
                      <img src={item.previewUrl} alt={item.title} className="img-fluid rounded mb-2" />
                    ) : (
                      <div className="text-center mb-2 w-100 text-truncate" title={item.title}>
                        <i className="fas fa-file-alt fa-2x text-muted" />
                        <div className="small mt-1 mb-0">{item.title}</div>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditModal({ show: true, index, mediaIndex: i, title: item.title, description: item.description || '' })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteMedia(index, i)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 mb-4">
            <AcademicExperienceOverview
              value={entry.description}
              onChange={value => handleChange(index, 'description', value)}
            />
          </div>

          <div className="text-end mt-3">
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeEntry(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-outline-primary" onClick={addEntry}>+ Add Education</button>

      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={editModal.title}
              onChange={e => setEditModal(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.input}
              rows={3}
              value={editModal.description}
              onChange={e => setEditModal(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditMedia}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

