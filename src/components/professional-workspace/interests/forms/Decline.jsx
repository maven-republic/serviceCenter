// src/components/professional-workspace/interests/forms/Decline.jsx
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
import { AlertTriangle } from 'lucide-react'

const DECLINE_REASONS = [
  { value: 'scheduling_conflict', label: 'Scheduling conflict' },
  { value: 'overbooked', label: 'Currently overbooked' },
  { value: 'outside_service_area', label: 'Outside my service area' },
  { value: 'scope_mismatch', label: "Project scope doesn't match my expertise" },
  { value: 'scope_too_large', label: 'Project scope too large' },
  { value: 'scope_too_small', label: 'Project scope too small' },
  { value: 'pricing_issue', label: 'Pricing concerns' },
  { value: 'licensing_requirements', label: 'Licensing/permit requirements' },
  { value: 'equipment_unavailable', label: 'Required equipment unavailable' },
  { value: 'seasonal_restrictions', label: 'Seasonal work restrictions' },
  { value: 'personal_emergency', label: 'Personal/family emergency' },
  { value: 'other', label: 'Other reason' }
]

// Smart placeholder text based on selected reason
const getPlaceholderText = (reason) => {
  const placeholders = {
    'scheduling_conflict': "Thank you for considering me for your project. Unfortunately, I have a scheduling conflict and won't be able to take on this work at this time. I recommend posting your project again to connect with other available professionals.",
    'overbooked': "I appreciate you selecting me for this project. However, I'm currently overbooked and won't be able to provide the quality service you deserve. I suggest reposting to find another qualified professional who can give your project the attention it needs.",
    'outside_service_area': "Thank you for your interest in my services. Unfortunately, your project location is outside my current service area. I recommend finding a local professional who can better serve your needs and provide ongoing support if needed.",
    'scope_mismatch': "I appreciate you selecting me, but after reviewing the project details, I believe this work falls outside my area of expertise. For the best results, I recommend finding a professional who specializes in this specific type of work.",
    'scope_too_large': "Thank you for considering me for this project. After reviewing the scope, I believe this project is larger than what I can properly handle at this time. I recommend finding a professional or team with the capacity for a project of this size.",
    'scope_too_small': "I appreciate your interest in my services. However, this project appears to be smaller than my typical minimum project size. You might find better value working with a professional who specializes in smaller jobs.",
    'pricing_issue': "Thank you for selecting me. After further consideration, I don't believe I can complete this project within your budget while maintaining my quality standards. I recommend seeking quotes from other professionals who may be a better fit for your budget.",
    'licensing_requirements': "I appreciate you choosing me for this project. However, after reviewing the requirements, I realize this work requires specific licenses or permits that I don't currently hold. I recommend finding a professional with the proper licensing for this type of work.",
    'equipment_unavailable': "Thank you for your interest in my services. Unfortunately, I don't currently have access to the specialized equipment needed for this project. I suggest finding a professional who has the required tools and equipment readily available.",
    'seasonal_restrictions': "I appreciate you selecting me, but due to seasonal restrictions or weather conditions, I won't be able to complete this work in your desired timeframe. I recommend finding a professional who can work within your timeline.",
    'personal_emergency': "Thank you for choosing me for your project. Unfortunately, due to an unexpected personal situation, I won't be able to take on new work at this time. I apologize for any inconvenience and recommend reposting to find another qualified professional.",
    'other': "I apologize, but I'm unable to take on this project at this time. Thank you for considering me, and I recommend reposting to connect with other qualified professionals who can assist you."
  }
  
  return placeholders[reason] || "I apologize, but I'm unable to take on this project at this time due to..."
}

export default function DeclineForm({
  responseMessage,
  setResponseMessage,
  declineReason,
  setDeclineReason,
  referralSuggestion,
  setReferralSuggestion,
  loading = false
}) {
  const selectedReason = DECLINE_REASONS.find(r => r.value === declineReason)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">Decline Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for Declining <span className="text-red-500">*</span>
            </label>
            <Select value={declineReason} onValueChange={setDeclineReason} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message to Customer <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder={getPlaceholderText(declineReason)}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Be professional and courteous. This message will be sent to the customer.
              </p>
              <span className="text-xs text-muted-foreground">
                {responseMessage.length}/500
              </span>
            </div>
          </div>

          {/* Optional Referral Suggestion */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Suggest Another Professional (Optional)
            </label>
            <Textarea
              placeholder="I recommend contacting [Professional Name] at [Contact Info] - they specialize in this type of work and may be available to help you..."
              value={referralSuggestion}
              onChange={(e) => setReferralSuggestion(e.target.value)}
              className="min-h-[80px]"
              disabled={loading}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Help the customer by suggesting someone who might be available for their project.
            </p>
          </div>

          {/* Warning Alert */}
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> Declining will permanently remove you from this project. 
              The customer will be notified and can select another professional from their responses.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}