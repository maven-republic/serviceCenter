'use client'

export default function FieldOfStudyArtifact({ field }) {
  return (
    <div className="mb-2">
      <span className="text-secondary">
        {field?.name?.trim() ? `· ${field.name}` : '· [Click to add field]'}
      </span>
    </div>
  )
}
