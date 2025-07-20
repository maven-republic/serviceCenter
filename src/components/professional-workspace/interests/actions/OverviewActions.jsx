// src/components/professional-workspace/interests/actions/OverviewActions.jsx
'use client'

import { Button } from '@/components/ui/button'
import { X, Calendar, Edit, CheckCircle } from 'lucide-react'

// src/components/professional-workspace/interests/actions/OverviewActions.jsx
export default function OverviewActions({
  interest,
  setCurrentView,
  loading = false
}) {
  return (
    <div className="w-full space-y-3">
      {/* Primary actions - always visible */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          onClick={() => setCurrentView('accept')}
          disabled={loading}
          className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white order-last sm:order-none"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept as Quoted
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setCurrentView('update_quote')}
          disabled={loading}
          className="w-full sm:flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Accept with Updates
        </Button>
      </div>
      
      {/* Secondary actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {interest.assessment && (
          <Button
            variant="outline"
            onClick={() => setCurrentView('accept_assessment')}
            disabled={loading}
            className="w-full sm:flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Assessment
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={() => setCurrentView('decline')}
          disabled={loading}
          className="w-full sm:flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Unable to Accept
        </Button>
      </div>
    </div>
  )
}