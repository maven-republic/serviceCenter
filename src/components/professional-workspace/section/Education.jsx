'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import ArtifactInterface from '@/artifacts/ArtifactInterface'

export default function Education() {
  const { user } = useUserStore()
  const supabase = useSupabaseClient()

  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('🎯 Education component loaded')
  console.log('👤 User object in Education:', user)

  useEffect(() => {
    const fetchEducationArtifacts = async () => {
      const { data, error } = await supabase
        .from('artifact')
        .select('*')
        .eq('type', 'education')
        .eq('account_id', user.id)

      if (error) {
        console.error('❌ Failed to fetch education artifacts:', error)
      } else {
        console.log('🧾 Artifacts returned from Supabase:', data)
        setArtifacts(data)
      }

      setLoading(false)
    }

    if (user?.id) {
      fetchEducationArtifacts()
    }
  }, [supabase, user])

  if (loading) {
    return <p className="text-muted">Loading education records...</p>
  }

  return (
    <div className="p-4">
      <h5 className="mb-3 fw-bold">Education</h5>
      <ArtifactInterface artifacts={artifacts} />
    </div>
  )
}
