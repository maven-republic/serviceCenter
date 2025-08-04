'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Select from 'react-select'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Plus, X, Edit2, Trash2, Upload, Calendar, Building, BookOpen } from "lucide-react"
import EducationCompetenceSelector from './EducationCompetenceSelector'
import EducationMediaUploader from './EducationMediaUploader'
import AcademicExperienceOverview from '@/components/professional-workspace/input/AcademicExperienceOverview'

export default function Education({ formData, updateFormData }) {
  const [institutions, setInstitutions] = useState([])
  const [degrees, setDegrees] = useState([])
  const [fieldsOfStudy, setFieldsOfStudy] = useState([])
  const [competences, setCompetences] = useState([])

  const supabase = useSupabaseClient()
  const [editModal, setEditModal] = useState({ show: false, index: null, mediaIndex: null, title: '', description: '' })
  const education = formData.education || []

  const educationLevelOptions = [
    { value: 'high_school', label: "High School" },
    { value: 'vocational_training', label: "Vocational Training" },
    { value: 'professional_certification', label: "Professional Certification" },
    { value: 'associate_degree', label: "Associate Degree" },
    { value: 'bachelor_degree', label: "Bachelor's Degree" },
    { value: 'master_degree', label: "Master's Degree" },
    { value: 'doctorate_degree', label: "Doctorate Degree" }
  ]

  useEffect(() => {
    const fetchInstitutions = async () => {
      const { data } = await supabase.from('institution').select('institution_id, name').order('name')
      if (data) setInstitutions(data)
    }
    const fetchDegrees = async () => {
      const { data } = await supabase.from('degree').select('degree_id, name').order('name')
      if (data) setDegrees(data)
    }
    const fetchFields = async () => {
      const { data } = await supabase.from('field_of_study').select('field_of_study_id, name, category').order('category, name')
      if (data) setFieldsOfStudy(data)
    }
    const fetchCompetences = async () => {
      const { data } = await supabase.from('competence').select('competence_id, name, category').order('category, name')
      if (data) setCompetences(data)
    }

    fetchInstitutions()
    fetchDegrees()
    fetchFields()
    fetchCompetences()
  }, [supabase])

  const buildDegreeOptions = () => degrees.map(degree => ({ value: degree.degree_id, label: degree.name }))
  
  const buildGroupedFieldOptions = () => {
    const groups = {}
    for (const field of fieldsOfStudy) {
      if (!groups[field.category]) groups[field.category] = []
      groups[field.category].push({ value: field.field_of_study_id, label: field.name })
    }
    return Object.entries(groups).map(([category, options]) => ({ label: category, options }))
  }
  
  const buildInstitutionOptions = () => [
    ...institutions.map(inst => ({ value: inst.institution_id, label: `🎓 ${inst.name}` })),
    { value: '__new', label: '+ Add a new institution' }
  ]

  const handleChange = (index, field, value) => {
    const updated = [...education]
    updated[index][field] = value
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const toggleEducationCompetence = (index, competenceId) => {
    const updated = [...education]
    const current = updated[index].competenceIds || []
    updated[index].competenceIds = current.includes(competenceId)
      ? current.filter(id => id !== competenceId)
      : [...current, competenceId]
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleAddMediaDraft = (index, media) => {
    const updated = [...education]
    updated[index].media = [...(updated[index].media || []), media]
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleDeleteMedia = (index, mediaIndex) => {
    const updated = [...education]
    updated[index].media.splice(mediaIndex, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  const handleEditMedia = () => {
    const updated = [...education]
    updated[editModal.index].media[editModal.mediaIndex].title = editModal.title
    updated[editModal.index].media[editModal.mediaIndex].description = editModal.description
    updateFormData({ target: { name: 'education', value: updated } })
    setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })
  }

  const addEntry = () => {
    const newEntry = {
      institutionId: '',
      institutionName: '',
      degreeId: '',
      fieldOfStudyId: '',
      educationLevel: '',
      startDate: '',
      endDate: '',
      competenceIds: [],
      media: [],
      description: '',
      educationId: crypto.randomUUID()
    }
    updateFormData({ target: { name: 'education', value: [...education, newEntry] } })
  }

  const removeEntry = (index) => {
    const updated = [...education]
    updated.splice(index, 1)
    updateFormData({ target: { name: 'education', value: updated } })
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Formal Education</h2>
        </div>
        <p className="text-muted-foreground">
          Add your educational background to showcase your qualifications to potential clients.
        </p>
      </div>

      <div className="space-y-6">
        {education.map((entry, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Education Entry {index + 1}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Institution Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Institution</Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={buildInstitutionOptions()}
                  value={buildInstitutionOptions().find(opt => opt.value === entry.institutionId) || null}
                  onChange={selected => handleChange(index, 'institutionId', selected.value)}
                  placeholder="Search or select institution"
                  isSearchable
                />
              </div>

              {/* New Institution Name */}
              {entry.institutionId === '__new' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">New Institution Name</Label>
                  <Input
                    type="text"
                    value={entry.institutionName}
                    onChange={e => handleChange(index, 'institutionName', e.target.value)}
                    placeholder="Enter institution name"
                  />
                </div>
              )}

              {/* Degree and Field Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Degree</Label>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={buildDegreeOptions()}
                    value={buildDegreeOptions().find(opt => opt.value === entry.degreeId) || null}
                    onChange={selected => handleChange(index, 'degreeId', selected.value)}
                    placeholder="Select degree"
                    isSearchable
                  />
                </div>

                {/* Field of Study */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Field of Study</Label>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={buildGroupedFieldOptions()}
                    value={buildGroupedFieldOptions().flatMap(group => group.options).find(opt => opt.value === entry.fieldOfStudyId) || null}
                    onChange={selected => handleChange(index, 'fieldOfStudyId', selected.value)}
                    placeholder="Select field of study"
                    isSearchable
                  />
                </div>
              </div>

              {/* Education Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Education Level</Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={educationLevelOptions}
                  value={educationLevelOptions.find(opt => opt.value === entry.educationLevel) || null}
                  onChange={selected => handleChange(index, 'educationLevel', selected.value)}
                  placeholder="Select education level"
                  isSearchable
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={entry.startDate}
                    onChange={e => handleChange(index, 'startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={entry.endDate}
                    onChange={e => handleChange(index, 'endDate', e.target.value)}
                    disabled={!entry.endDate && entry.startDate}
                  />
                </div>
              </div>

              {/* Currently Attending Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${index}`}
                  checked={!entry.endDate}
                  onCheckedChange={(checked) => 
                    handleChange(index, 'endDate', checked ? '' : new Date().toISOString().split('T')[0])
                  }
                />
                <Label htmlFor={`current-${index}`} className="text-sm cursor-pointer">
                  I'm currently attending this program
                </Label>
              </div>

              {/* Competence Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skills & Competences</Label>
                <EducationCompetenceSelector
                  selected={entry.competenceIds || []}
                  allCompetences={competences}
                  onSelect={id => toggleEducationCompetence(index, id)}
                  onRemove={id => toggleEducationCompetence(index, id)}
                />
              </div>

              {/* Media Uploader */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Supporting Documents
                </Label>
                <EducationMediaUploader onUploadDraft={media => handleAddMediaDraft(index, media)} />
              </div>

              {/* Uploaded Media Display */}
              {entry.media?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Uploaded Media</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {entry.media.map((item, i) => (
                      <Card key={i} className="relative group">
                        <CardContent className="p-3">
                          {item.media_type === 'image' ? (
                            <img 
                              src={item.previewUrl} 
                              alt={item.title} 
                              className="w-full h-20 object-cover rounded mb-2" 
                            />
                          ) : (
                            <div className="w-full h-20 bg-muted rounded mb-2 flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <p className="text-xs font-medium truncate mb-1">{item.title}</p>
                          
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditModal({ 
                                show: true, 
                                index, 
                                mediaIndex: i, 
                                title: item.title, 
                                description: item.description || '' 
                              })}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMedia(index, i)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Experience Overview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <AcademicExperienceOverview
                  value={entry.description}
                  onChange={value => handleChange(index, 'description', value)}
                />
              </div>

            </CardContent>
          </Card>
        ))}

        {/* Add Education Button */}
        <Button 
          type="button" 
          variant="outline" 
          onClick={addEntry}
          className="w-full border-dashed border-2 h-12"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education Entry
        </Button>
      </div>

      {/* Edit Media Modal */}
      <Dialog open={editModal.show} onOpenChange={(open) => !open && setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                type="text"
                value={editModal.title}
                onChange={e => setEditModal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter media title"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                rows={3}
                value={editModal.description}
                onChange={e => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter media description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditModal({ show: false, index: null, mediaIndex: null, title: '', description: '' })}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleEditMedia}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}