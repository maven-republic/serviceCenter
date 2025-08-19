// ===== MOBILE RESPONSIVE WorkExperience.jsx =====

"use client";

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  ArrowRight,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle,
  Building,
  Clock
} from 'lucide-react'

export default function WorkExperience() {
  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      period: "2012 - 2014",
      startDate: "2012-01-01",
      endDate: "2014-12-31",
      position: "UX Designer",
      company: "Dropbox",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Led user experience design for core product features, improving user engagement by 40%. Collaborated with cross-functional teams to deliver intuitive design solutions.",
      skills: ["UI/UX Design", "Figma", "User Research", "Prototyping"],
      achievements: ["Increased user retention by 25%", "Led design system implementation"],
      logo: "/images/companies/dropbox.png",
      color: "blue"
    },
    {
      id: 2,
      period: "2008 - 2012", 
      startDate: "2008-06-01",
      endDate: "2012-01-31",
      position: "Art Director",
      company: "Amazon",
      location: "Seattle, WA",
      type: "Full-time",
      description: "Directed creative vision for marketing campaigns across multiple product lines. Managed a team of 8 designers and collaborated with product managers to enhance brand consistency.",
      skills: ["Creative Direction", "Team Leadership", "Brand Strategy", "Adobe Creative Suite"],
      achievements: ["Launched 50+ successful campaigns", "Managed $2M creative budget"],
      logo: "/images/companies/amazon.png",
      color: "orange"
    }
  ]);

  const [isEditing, setIsEditing] = useState(null)

  const getCompanyInitial = (company) => company?.charAt(0) || 'C'
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
      green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
    }
    return colors[color] || colors.blue
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  }

  const handleAddExperience = () => {
    console.log('Opening work experience form...')
  }

  if (workExperiences.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State - Mobile Responsive */}
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Add Your Work Experience</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Showcase your professional background to demonstrate your expertise to potential clients
              </p>
            </div>
            
            <Button onClick={handleAddExperience} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Work Experience
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            {workExperiences.length} Position{workExperiences.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {calculateDuration(workExperiences[workExperiences.length - 1]?.startDate, workExperiences[0]?.endDate)} total
          </Badge>
        </div>
        
        <Button onClick={handleAddExperience} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {/* Timeline - Mobile Responsive */}
      <div className="relative">
        {/* Timeline line - Hidden on mobile, visible on sm+ */}
        <div className="hidden sm:block absolute left-6 lg:left-8 top-0 bottom-16 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>
        
        {workExperiences.map((experience, index) => (
          <div key={experience.id} className="relative flex gap-3 sm:gap-4 lg:gap-6 pb-6 sm:pb-8 last:pb-0">
            {/* Timeline node - Responsive */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-lg ${getColorClasses(experience.color)}`}>
                {getCompanyInitial(experience.company)}
              </div>
              {/* Connection line - Hidden on mobile */}
              {index < workExperiences.length - 1 && (
                <div className="hidden sm:block absolute top-14 lg:top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-6 sm:h-8 bg-border"></div>
              )}
            </div>

            {/* Experience content - Mobile Responsive */}
            <div className="flex-1 min-w-0">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header - Mobile Responsive */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {experience.period}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Building className="h-3 w-3" />
                            {experience.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({calculateDuration(experience.startDate, experience.endDate)})
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
                            {experience.position}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <h4 className="text-base sm:text-lg font-medium text-primary">
                              {experience.company}
                            </h4>
                            {experience.location && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="hidden sm:inline">•</span>
                                <MapPin className="h-3 w-3 sm:hidden" />
                                <span className="text-sm">{experience.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons - Mobile Responsive */}
                      <div className="flex gap-1 self-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Edit"
                          onClick={() => setIsEditing(experience.id)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {experience.description}
                    </p>

                    {/* Skills - Mobile Responsive */}
                    {experience.skills && experience.skills.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Key Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {experience.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements - Mobile Responsive */}
                    {experience.achievements && experience.achievements.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Key Achievements</h5>
                        <ul className="space-y-1">
                          {experience.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Completion encouragement - Mobile Responsive */}
      {workExperiences.length > 0 && workExperiences.length < 3 && (
        <Alert className="border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200">
          <Briefcase className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Consider adding more work experience to showcase your full professional journey.
          </AlertDescription>
        </Alert>
      )}

      {/* Save button - Mobile Responsive */}
      <div className="flex justify-start pt-4 border-t">
        <Button className="gap-2 w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Save Changes
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}