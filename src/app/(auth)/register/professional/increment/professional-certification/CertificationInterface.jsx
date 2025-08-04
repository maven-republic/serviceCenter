'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Plus, ShieldCheck } from "lucide-react"
import CertificationCollection from './CertificationCollection'

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
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Certifications & Licenses</h2>
        </div>
        <p className="text-muted-foreground">
          Add your professional certifications, licenses, and credentials to showcase your qualifications to potential clients.
        </p>
      </div>

      {certifications.length > 0 ? (
        <CertificationCollection
          certifications={certifications}
          updateCertification={updateCertification}
          removeCertification={removeCertification}
          toggleService={toggleService}
        />
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No certifications added yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Professional certifications and licenses help build trust with clients and demonstrate your expertise in specific areas.
            </p>
            <Button onClick={addCertification} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Certification
            </Button>
          </CardContent>
        </Card>
      )}

      {certifications.length > 0 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={addCertification}
          className="w-full border-dashed border-2 h-12"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Certification
        </Button>
      )}
    </div>
  )
}