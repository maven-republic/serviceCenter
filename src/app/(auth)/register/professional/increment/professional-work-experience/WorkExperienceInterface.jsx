'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CheckCircle } from "lucide-react"
import WorkExperienceCollection from './WorkExperienceCollection'

export default function WorkExperienceInterface({ formData, updateFormData }) {
  const handleUpdate = (updatedList) => {
    updateFormData({ target: { name: 'workExperience', value: updatedList } })
  }

  const experienceCount = formData.workExperience?.length || 0
  const hasValidExperience = formData.workExperience?.some(exp => 
    exp.freeform_company_name?.trim() && exp.position?.trim()
  )

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Compact Header Section */}
      {/* <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Work Experience</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showcase your professional background and expertise
                </p>
              </div>
            </div>
            
            {hasValidExperience && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {experienceCount} {experienceCount === 1 ? 'Experience' : 'Experiences'}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1 text-sm">💡 Tips for adding work experience:</h4>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• Include relevant positions that showcase skills related to your services</li>
              <li>• Highlight achievements and responsibilities that build client trust</li>
              <li>• Use specific details and metrics when possible</li>
              <li>• Start with your most recent or relevant experience first</li>
            </ul>
          </div>
        </CardContent>
      </Card> */}

      {/* Experience Collection */}
      <Card>
        <CardContent className="p-4">
          <WorkExperienceCollection
            experienceList={formData.workExperience || []}
            onUpdate={handleUpdate}
          />
        </CardContent>
      </Card>

      {/* Compact Progress Indicator */}
      {experienceCount > 0 && (
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {hasValidExperience ? (
              <>
                <CheckCircle className="inline h-4 w-4 text-green-600 mr-1" />
                Work experience section completed with {experienceCount} {experienceCount === 1 ? 'entry' : 'entries'}
              </>
            ) : (
              <>
                Please complete the required fields for your work experience entries
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}