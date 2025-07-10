'use client'

import { Button } from "@/components/ui/button"
import { Plus, Briefcase } from "lucide-react"
import WorkExperience from './WorkExperience'

export default function WorkExperienceCollection({ experienceList, onUpdate }) {
  const handleChange = (index, field, value) => {
    const updated = [...experienceList]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate(updated)
  }

  const handleRemove = (index) => {
    const updated = [...experienceList]
    updated.splice(index, 1)
    onUpdate(updated)
  }

  const addExperience = () => {
    const newEntry = {
      id: Date.now(), // Add unique ID for better key management
      company_id: null,
      freeform_company_name: '',
      position: '',
      description: '',
      start_date: '',
      end_date: ''
    }
    onUpdate([...experienceList, newEntry])
  }

  return (
    <div className="space-y-6">
      {/* Experience List */}
      {experienceList && experienceList.length > 0 ? (
        <div className="space-y-4">
          {experienceList.map((exp, index) => (
            <WorkExperience
              key={exp.id || index}
              data={exp}
              onChange={(field, value) => handleChange(index, field, value)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No work experience added yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add your professional experience to showcase your background and expertise to potential clients.
          </p>
        </div>
      )}

      {/* Add Experience Button */}
      <div className="flex justify-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={addExperience}
          className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      </div>
    </div>
  )
}