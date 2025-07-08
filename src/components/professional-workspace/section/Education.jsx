'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import ArtifactInterface from '@/artifacts/ArtifactInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2 } from 'lucide-react'

export default function Education() {
  const { user } = useUserStore()
  const supabase = useSupabaseClient()

  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('🎯 Education component loaded')
  console.log('👤 User object in Education:', user)

  useEffect(() => {
    const fetchEducationArtifacts = async () => {
      try {
        const { data, error } = await supabase
          .from('artifact')
          .select('*')
          .eq('type', 'education')
          .eq('account_id', user.id)

        if (error) {
          console.error('❌ Failed to fetch education artifacts:', error)
        } else {
          console.log('🧾 Artifacts returned from Supabase:', data)
          setArtifacts(data || [])
        }
      } catch (err) {
        console.error('❌ Error fetching education artifacts:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchEducationArtifacts()
    } else {
      setLoading(false)
    }
  }, [supabase, user])

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading education records...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" />
          Education
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ArtifactInterface artifacts={artifacts} />
      </CardContent>
    </Card>
  )
}