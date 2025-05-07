'use client'

import WorkExperienceCollection from './WorkExperienceCollection'

export default function WorkExperienceInterface({ formData, updateFormData }) {
  const handleUpdate = (updatedList) => {
    updateFormData({ target: { name: 'workExperience', value: updatedList } })
  }

  return (
    <div className="container py-3">
      <h4 className="fw-bold mb-4">Work Experience</h4>
      <WorkExperienceCollection
        experienceList={formData.workExperience || []}
        onUpdate={handleUpdate}
      />
    </div>
  )
} 