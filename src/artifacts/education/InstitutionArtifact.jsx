'use client'

export default function InstitutionArtifact({ institution }) {
  return (
    <div className="mb-2">
      <h4 className="card-title mb-1 fw-bold text-dark">
        {institution?.name?.trim() || 'Institution Not Specified'}
      </h4>
    </div>
  )
}
