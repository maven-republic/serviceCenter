'use client'

import Certification from './Certification'
import CertificationServiceSelector from './CertificationServiceSelector'
import CertificationMediaUploader from './CertificationMediaUploader'

export default function CertificationCollection({
  certifications,
  updateCertification,
  removeCertification,
  toggleService
}) {
  return (
    <div>
      {certifications.map((cert, index) => (
        <div key={cert.certificationId} className="border rounded p-3 mb-4">
          <Certification
            data={cert}
            onChange={(field, value) => updateCertification(index, field, value)}
          />

          <CertificationServiceSelector
            selected={cert.serviceIds || []}
            onSelect={(id) => toggleService(index, id)}
            onRemove={(id) => toggleService(index, id)}
          />

          <CertificationMediaUploader
            media={cert.media || []}
            onAdd={(mediaItem) => {
              const updatedMedia = [...(cert.media || []), mediaItem]
              updateCertification(index, 'media', updatedMedia)
            }}
            onDelete={(mediaIndex) => {
              const updatedMedia = [...(cert.media || [])]
              updatedMedia.splice(mediaIndex, 1)
              updateCertification(index, 'media', updatedMedia)
            }}
          />

          <div className="text-end mt-3">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeCertification(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

