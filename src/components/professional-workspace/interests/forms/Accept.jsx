// src/components/professional-workspace/interests/forms/Accept.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

export default function AcceptForm({
  responseMessage,
  setResponseMessage,
  loading = false
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Confirm Your Acceptance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Confirmation Message to Customer <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Thank you for selecting me! I confirm my availability and am excited to work on your project. Here are my next steps..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to the customer to confirm your acceptance.
            </p>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              By accepting, you commit to proceeding with this project as discussed. 
              The customer will be notified immediately.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}