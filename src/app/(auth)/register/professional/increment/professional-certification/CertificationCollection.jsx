'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Trash2 } from "lucide-react"
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
    <div className="space-y-6">
      {certifications.map((cert, index) => (
        <Card key={cert.certificationId} className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certification {index + 1}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCertification(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Certification Details */}
            <Certification
              data={cert}
              onChange={(field, value) => updateCertification(index, field, value)}
            />

            {/* Service Selector */}
            <CertificationServiceSelector
              selected={cert.serviceIds || []}
              onSelect={(id) => toggleService(index, id)}
              onRemove={(id) => toggleService(index, id)}
            />

            {/* Media Uploader */}
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}