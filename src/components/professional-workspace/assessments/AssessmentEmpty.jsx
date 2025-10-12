// src/components/professional-workspace/assessments/AssessmentEmpty.jsx
'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  CheckCircle,
  Clock,
  Search,
  AlertCircle
} from 'lucide-react'

export default function AssessmentEmpty({ tab, hasSearch, onClearSearch }) {
  const emptyStates = {
    upcoming: {
      icon: Calendar,
      title: 'No Upcoming Assessments',
      description: 'You don\'t have any scheduled site visits at the moment.',
      tip: 'New assessments will appear here when customers select you and request an assessment.'
    },
    inProgress: {
      icon: Clock,
      title: 'No Active Assessments',
      description: 'No site visits are currently in progress.',
      tip: 'Assessments move here when it\'s time to conduct the site visit.'
    },
    needsQuote: {
      icon: AlertCircle,
      title: 'No Assessments Awaiting Quotes',
      description: 'All completed assessments have final quotes provided.',
      tip: 'Great job staying on top of your quotes!'
    },
    completed: {
      icon: CheckCircle,
      title: 'No Completed Assessments',
      description: 'You haven\'t completed any assessments yet.',
      tip: 'Completed assessments with final quotes will appear here.'
    },
    all: {
      icon: Calendar,
      title: 'No Assessments Found',
      description: 'You don\'t have any assessments yet.',
      tip: 'Assessments are created when customers select you for projects that require site visits.'
    }
  }

  const state = emptyStates[tab] || emptyStates.all
  const Icon = state.icon

  if (hasSearch) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              No assessments match your search criteria.
            </p>
            <Button onClick={onClearSearch} variant="outline">
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{state.title}</h3>
          <p className="text-muted-foreground mb-4">{state.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            💡 <strong>Tip:</strong> {state.tip}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}