// src/components/professional-workspace/interests/render/AssessmentDetails.jsx
'use client'

export default function AssessmentDetails({ interest }) {
  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Only show if assessment is required
  if (!interest?.assessment) return null

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
      <div className="font-medium text-indigo-800 mb-3">Assessment Details (As Quoted)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-indigo-600">Assessment Fee:</span>
          <span className="font-semibold text-indigo-900">
            {interest.fee ? `JMD $${parseFloat(interest.fee).toLocaleString()}` : 'No additional fee'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-600">Your Availability:</span>
          <span className="font-semibold text-indigo-900">
            {interest.earliest_available && interest.latest_available 
              ? `${formatDateTime(interest.earliest_available)} to ${formatDateTime(interest.latest_available)}`
              : 'Flexible timing'
            }
          </span>
        </div>
      </div>
      
      {interest.assessment_justification && (
        <div className="mt-3 p-3 bg-white rounded border">
          <div className="font-medium text-indigo-800 text-xs mb-1">Assessment Reason:</div>
          <p className="text-indigo-700 text-sm italic">
            "{interest.assessment_justification}"
          </p>
        </div>
      )}
    </div>
  )
}