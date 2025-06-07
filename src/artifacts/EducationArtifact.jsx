'use client'

import { useState } from 'react'
import InstitutionArtifact from './education/InstitutionArtifact'
import CredentialArtifact from './education/CredentialArtifact'
import FieldOfStudyArtifact from './education/FieldOfStudyArtifact'
import EducationTimelineArtifact from './education/EducationTimelineArtifact'
import DescriptionArtifact from './education/DescriptionArtifact'

export default function EducationArtifact({ data, onUpdate }) {
  const edu = data?.content
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="artifact-block relative fade-in-fast"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* On-hover toolbar */}
      {hovered && (
        <div className="on-hover-menu absolute top-3 right-3 flex gap-2">
          <button className="btn-outline text-xs px-2">✏️</button>
          <button className="btn-danger text-xs px-2">🗑️</button>
        </div>
      )}

      {/* Institution */}
      <InstitutionArtifact
        institution={edu?.institution}
        educationId={edu?.education_id}
        onUpdate={onUpdate}
      />

      {/* Credential & Field of Study */}
      <div className="typography-label mb-1">
        <CredentialArtifact
          credential={edu?.degree}
          educationId={edu?.education_id}
          onUpdate={onUpdate}
        />
        {' · '}
        <FieldOfStudyArtifact
          fieldOfStudy={edu?.field_of_study}
          educationId={edu?.education_id}
          onUpdate={onUpdate}
        />
      </div>

      {/* Timeline & Description */}
      {expanded && (
        <div className="mt-2 fade-in-fast space-y-1">
          <EducationTimelineArtifact
            startDate={edu?.start_date}
            endDate={edu?.end_date}
            educationId={edu?.education_id}
            onUpdate={onUpdate}
          />
          <DescriptionArtifact
            description={edu?.additional_notes}
            educationId={edu?.education_id}
            onUpdate={onUpdate}
          />
        </div>
      )}

      {/* Toggle disclosure */}
      <div className="text-right mt-3">
        <button
          className="text-sm text-gray-500 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide details' : 'Show more'}
        </button>
      </div>
    </div>
  )
}
