'use client'

import { useState } from 'react'
import CertificationCollection from './CertificationCollection'
// import { v4 as uuidv4 } from 'uuid'

export default function CertificationInterface({ formData, updateFormData }) {
  const certifications = formData.certifications || []

  const addCertification = () => {
    const newCert = {
      certificationId: crypto.randomUUID(),
      certificationName: '',
      issuingOrganization: '',
      issueDate: '',
      expirationDate: '',
      certificationType: 'certification', // or 'license'
      isAccredited: false,
      verificationUrl: '',
      serviceIds: [],
      media: []
    }
    updateFormData({
      target: { name: 'certifications', value: [...certifications, newCert] }
    })
  }

  const updateCertification = (index, field, value) => {
    const updated = [...certifications]
    updated[index][field] = value
    updateFormData({ target: { name: 'certifications', value: updated } })
  }

  const removeCertification = (index) => {
    const updated = [...certifications]
    updated.splice(index, 1)
    updateFormData({ target: { name: 'certifications', value: updated } })
  }

  const toggleService = (index, serviceId) => {
    const updated = [...certifications]
    const current = updated[index].serviceIds || []
    updated[index].serviceIds = current.includes(serviceId)
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId]
    updateFormData({ target: { name: 'certifications', value: updated } })
  }

  return (
    <div className="container py-3">
      <h4 className="fw-bold mb-4">Certifications & Licenses</h4>

      <CertificationCollection
        certifications={certifications}
        updateCertification={updateCertification}
        removeCertification={removeCertification}
        toggleService={toggleService}
      />

      <button type="button" className="btn btn-outline-primary mt-3" onClick={addCertification}>
        + Add Certification
      </button>
    </div>
  )
}
