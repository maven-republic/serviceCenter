'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Building, User, FileText, Calendar as CalendarIcon } from "lucide-react"
import Calendar from '../professional-certification/Calendar'

export default function WorkExperience({ data, onChange, onRemove }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6 space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor={`company-${data.id || 'new'}`} className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            Company Name
          </Label>
          <Input
            id={`company-${data.id || 'new'}`}
            type="text"
            placeholder="Enter or select a company"
            value={data.freeform_company_name || ''}
            onChange={(e) => onChange('freeform_company_name', e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label htmlFor={`position-${data.id || 'new'}`} className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Position
          </Label>
          <Input
            id={`position-${data.id || 'new'}`}
            type="text"
            placeholder="e.g. Software Engineer, Project Manager"
            value={data.position || ''}
            onChange={(e) => onChange('position', e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`description-${data.id || 'new'}`} className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Description
          </Label>
          <Textarea
            id={`description-${data.id || 'new'}`}
            placeholder="Describe your responsibilities and achievements..."
            rows={3}
            value={data.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              Start Date
            </Label>
            <Calendar
              value={data.start_date}
              onChange={(value) => onChange('start_date', value)}
              placeholder="Select start date"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              End Date
            </Label>
            <Calendar
              value={data.end_date}
              onChange={(value) => onChange('end_date', value)}
              placeholder="Select end date (or leave empty if current)"
            />
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onRemove}
            className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}