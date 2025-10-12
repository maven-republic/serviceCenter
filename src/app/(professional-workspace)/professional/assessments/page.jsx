// src/app/(professional-workspace)/professional/assessments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import AllAssessmentsOverview from '@/components/professional-workspace/assessments/AllAssessmentsOverview'
import { Loader2 } from 'lucide-react'

export default function AssessmentsPage() {
  const router = useRouter()
  const { user } = useUserStore()  // ✅ Same as manage-appointments
  
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Get professionalId directly from user (same pattern as manage-appointments)
  const professionalId = user?.profile?.professional_id

// src/app/(professional-workspace)/professional/assessments/page.jsx
// Update your fetchAssessments function:

const fetchAssessments = useCallback(async () => {
  if (!professionalId) return

  try {
    setLoading(true)
    setError(null)

    console.log('🔍 Fetching assessments for professional:', professionalId)

    const response = await fetch(
      `/api/assessments?professional_id=${professionalId}&include_details=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }
    )
    
    // 🔍 Log the response status
    console.log('📡 Response status:', response.status, response.statusText)
    
    // 🔍 Get the raw response text first
    const responseText = await response.text()
    console.log('📄 Raw response:', responseText.substring(0, 500))
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError)
      throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`)
    }
    
    if (!response.ok) {
      console.error('❌ API Error:', data)
      throw new Error(data.error || data.message || 'Failed to fetch assessments')
    }

    console.log('✅ Assessments fetched:', data.assessments?.length || 0)
    setAssessments(data.assessments || [])
    
  } catch (err) {
    console.error('❌ Error fetching assessments:', err)
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [professionalId])

  // ✅ Fetch when component mounts or professionalId changes
  useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  // ✅ Show loading while checking user (same pattern as manage-appointments)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // ✅ Redirect ONLY if user exists but has no professional profile
  if (user && !professionalId) {
    router.push('/login')
    return null
  }

  return (
    <AllAssessmentsOverview
      assessments={assessments}
      loading={loading}
      error={error}
      onRefresh={fetchAssessments}
      professionalId={professionalId}
    />
  )
}