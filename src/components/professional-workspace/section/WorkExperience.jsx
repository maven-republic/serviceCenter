"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  ArrowRight,
  Briefcase
} from 'lucide-react'

export default function WorkExperience() {
  const workExperiences = [
    {
      id: 1,
      period: "2012 - 2014",
      position: "UX Designer",
      company: "Dropbox",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.",
      initial: "D"
    },
    {
      id: 2,
      period: "2008 - 2012", 
      position: "Art Director",
      company: "Amazon",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus.",
      initial: "A"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Briefcase className="h-5 w-5 text-primary" />
            Work & Experience
          </CardTitle>
          <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2">
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-16 w-0.5 bg-border"></div>
          
          {workExperiences.map((experience, index) => (
            <div key={experience.id} className="relative flex gap-6 pb-8 last:pb-0">
              {/* Timeline circle with company initial */}
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-semibold text-sm">
                  {experience.initial}
                </div>
              </div>

              {/* Experience content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {experience.period}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {experience.position}
                    </h3>
                    <h4 className="text-base font-medium text-primary mb-3">
                      {experience.company}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {experience.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Edit"
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
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-start pt-4 border-t">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}