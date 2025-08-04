// src/components/professional-workspace/interests/actions/FormActions.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function FormActions({
  currentView,
  loading = false,
  disabled = false,
  onCancel,
  onSubmit,
  responseMessage,
  assessmentSchedule,
  updatedQuote
}) {
  
  // Get submit button text and style based on current view
  const getSubmitConfig = () => {
    switch (currentView) {
      case 'accept':
        return {
          text: loading ? 'Confirming...' : 'Confirm Acceptance',
          className: 'bg-green-600 hover:bg-green-700 text-white',
          disabled: loading || !responseMessage.trim()
        }
      
      case 'decline':
        return {
          text: loading ? 'Declining...' : 'Decline Selection',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          disabled: loading || !responseMessage.trim()
        }
      
      case 'accept_assessment':
        return {
          text: loading ? 'Scheduling...' : 'Propose Assessment Time',
          className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          disabled: loading || !responseMessage.trim() || !assessmentSchedule?.proposed_date || !assessmentSchedule?.proposed_time
        }
      
      case 'update_quote':
        return {
          text: loading ? 'Updating Quote...' : 'Send Updated Quote',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          disabled: loading || !responseMessage.trim() || !updatedQuote?.amount || !updatedQuote?.reason_for_update
        }
      
      default:
        return {
          text: 'Submit',
          className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          disabled: loading || disabled
        }
    }
  }

  const submitConfig = getSubmitConfig()

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      
      <Button
        onClick={onSubmit}
        disabled={submitConfig.disabled}
        className={submitConfig.className}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {submitConfig.text}
          </>
        ) : (
          submitConfig.text
        )}
      </Button>
    </div>
  )
}