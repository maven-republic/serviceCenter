'use client'

import WorkExperience from './WorkExperience'

export default function WorkExperienceCollection({ experienceList, onUpdate }) {
  const handleChange = (index, field, value) => {
    const updated = [...experienceList]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate(updated)
  }

  const handleRemove = (index) => {
    const updated = [...experienceList]
    updated.splice(index, 1)
    onUpdate(updated)
  }

  const addExperience = () => {
    const newEntry = {
      company_id: null,
      freeform_company_name: '',
      position: '',
      description: '',
      start_date: '',
      end_date: ''
    }
    onUpdate([...experienceList, newEntry])
  }

  return (
    <div>
      {experienceList.map((exp, index) => (
        <div key={index} className="border rounded p-3 mb-4">
          <WorkExperience
            data={exp}
            onChange={(field, value) => handleChange(index, field, value)}
            onRemove={() => handleRemove(index)}
          />
        </div>
      ))}

      <button type="button" className="btn btn-outline-primary" onClick={addExperience}>
        + Add Experience
      </button>
    </div>
  )
} 
