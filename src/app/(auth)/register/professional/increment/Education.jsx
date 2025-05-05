import { useState, useEffect } from 'react'
import { createClient } from '../../../../../../utils/supabase/client'
import Select from 'react-select'
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

  const [editModal, setEditModal] = useState({ show: false, index: null, mediaIndex: null, title: '', description: '' })
  const education = formData.education || []

  useEffect(() => {
    const supabase = createClient()

    const fetchInstitutions = async () => {
      const { data, error } = await supabase
        .from('education_institution')
        .select('institution_id, name')
        .order('name')
      if (!error) setInstitutions(data)
    }

    const fetchDegrees = async () => {
      const { data, error } = await supabase
        .from('degree')
        .select('degree_id, name')
        .order('name')
      if (!error) setDegrees(data)
    }

    const fetchFields = async () => {
      const { data, error } = await supabase
        .from('field_of_study')
        .select('field_of_study_id, name, category')
        .order('category, name')
      if (!error) setFieldsOfStudy(data)
    }

    const fetchCompetences = async () => {
      const { data, error } = await supabase
        .from('competence')
        .select('competence_id, name, category')
        .order('category, name')
      if (!error) setCompetences(data)
    }

    fetchInstitutions()
    fetchDegrees()
    fetchFields()
    fetchCompetences()
  }, [])

  const buildDegreeOptions = () =>
    degrees.map(degree => ({ value: degree.degree_id, label: degree.name }))

  const buildGroupedFieldOptions = () => {
    const groups = {}
    for (const field of fieldsOfStudy) {
      if (!groups[field.category]) groups[field.category] = []
      groups[field.category].push({ value: field.field_of_study_id, label: field.name })
    }
    return Object.entries(groups).map(([category, options]) => ({ label: category, options }))
  }

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
    const mediaList = updated[index].media || []
    updated[index].media = [...mediaList, media]
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
      startDate: '',
      endDate: '',
      competenceIds: [],
      media: [],
      educationId: crypto.randomUUID()
    }
    updateFormData({ target: { name: 'education', value: [...education, newEntry] } })
  }

  const removeEntry = (index) => {
    const updated = [...education]
    updated.splice(index, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const buildInstitutionOptions = () => [
    ...institutions.map(inst => ({ value: inst.institution_id, label: `🎓 ${inst.name}` })),
    { value: '__new', label: '+ Add a new institution' }
  ]

  return (
    <div className="container py-3">
      <h4 className="fw-bold mb-4">Formal Education</h4>

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

          <div className="mb-3">
            <label className="form-label">Field of Study</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={buildGroupedFieldOptions()}
              value={buildGroupedFieldOptions()
                .flatMap(group => group.options)
                .find(opt => opt.value === entry.fieldOfStudyId) || null}
              onChange={selected => handleChange(index, 'fieldOfStudyId', selected.value)}
              placeholder="Select field of study"
              isSearchable
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={entry.startDate}
                onChange={e => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
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
            onSelect={(id) => toggleEducationCompetence(index, id)}
            onRemove={(id) => toggleEducationCompetence(index, id)}
          />

          <EducationMediaUploader
            onUploadDraft={(media) => handleAddMediaDraft(index, media)}
          />
<div className="mt-4 mb-4">

<AcademicExperienceOverview
  value={entry.description}
  onChange={(value) => handleChange(index, 'description', value)}
/>
</div>


          {entry.media?.length > 0 && (
            <div className="mt-3">
              <label className="form-label">Uploaded Media</label>
              <div className="d-flex flex-wrap gap-3">
                {entry.media.map((item, i) => (
                  <div key={i} className="border rounded p-2 shadow-sm d-flex flex-column align-items-center" style={{ width: '150px' }}>
                    {item.media_type === 'image' ? (
                      <img src={item.previewUrl} alt={item.title} className="img-fluid rounded mb-2" />
                    ) : (
                      <div className="text-center mb-2 w-100" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={item.title}>
                        <i className="fas fa-file-alt fa-2x text-muted" />
                        <div className="small mt-1 mb-0">{item.title}</div>
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditModal({ show: true, index, mediaIndex: i, title: item.title, description: item.description || '' })}
                      >Edit</button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteMedia(index, i)}
                      >Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-end mt-3">
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeEntry(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-outline-primary" onClick={addEntry}>+ Add</button>

      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={editModal.title}
              onChange={e => setEditModal(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
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
