'use client'

export default function CredentialArtifact({ degree }) {
  return (
    <div className="mb-1">
      <h6 className="card-subtitle text-muted fw-normal">
        {degree?.name?.trim() || 'Degree Not Specified'}
      </h6>
    </div>
  )
}
