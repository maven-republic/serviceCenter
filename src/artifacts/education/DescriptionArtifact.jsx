'use client'

export default function DescriptionArtifact({ description }) {
  const cleanText = description?.trim()

  return (
    <div className="mb-2">
      <p className="card-text text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
        {cleanText ? cleanText : <span className="text-muted">Click to add description</span>}
      </p>
    </div>
  )
}
