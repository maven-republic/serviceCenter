// src/components/professional-workspace/interests/forms/Assessment.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from 'lucide-react'
import { AssessmentDetails } from '../render'

export default function AssessmentForm({
  interest,
  responseMessage,
  setResponseMessage,
  assessmentSchedule,
  setAssessmentSchedule,
  loading = false
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700">Schedule Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Existing Assessment Details */}
          <AssessmentDetails interest={interest} />

          {/* Proposed Assessment Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Proposed Assessment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={assessmentSchedule.proposed_date}
              onChange={(e) => setAssessmentSchedule(prev => ({ ...prev, proposed_date: e.target.value }))}
              min={interest.earliest_available ? new Date(interest.earliest_available).toISOString().split('T')[0] : undefined}
              max={interest.latest_available ? new Date(interest.latest_available).toISOString().split('T')[0] : undefined}
              className="w-full p-2 border border-border rounded-md bg-background"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Select a date within your available window
            </p>
          </div>

          {/* Proposed Assessment Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Proposed Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={assessmentSchedule.proposed_time}
              onChange={(e) => setAssessmentSchedule(prev => ({ ...prev, proposed_time: e.target.value }))}
              className="w-full p-2 border border-border rounded-md bg-background"
              disabled={loading}
            />
          </div>

          {/* Assessment Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Estimated Duration
            </label>
            <Select 
              value={assessmentSchedule.duration_minutes.toString()} 
              onValueChange={(value) => setAssessmentSchedule(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="300">5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What Happens After Assessment
            </label>
            <Textarea
              placeholder="e.g., I'll provide a detailed final quote within 24 hours of completing the assessment..."
              value={assessmentSchedule.next_steps}
              onChange={(e) => setAssessmentSchedule(prev => ({ ...prev, next_steps: e.target.value }))}
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          {/* Message to Customer */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message to Customer <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Thank you for selecting me! I'd like to schedule the on-site assessment as discussed. I'm proposing..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent with your assessment scheduling proposal.
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Assessment Process:</strong> Customer can accept your proposed time or suggest alternatives. 
              You'll conduct the assessment and provide a final detailed quote afterward.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}