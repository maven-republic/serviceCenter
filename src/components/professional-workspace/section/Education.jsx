'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import ArtifactInterface from '@/artifacts/ArtifactInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  Loader2, 
  Plus, 
  BookOpen,
  Calendar,
  MapPin,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function Education() {
  const { user } = useUserStore()
  const supabase = useSupabaseClient()

  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log('🎯 Education component loaded')
  console.log('👤 User object in Education:', user)

  useEffect(() => {
    const fetchEducationArtifacts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('artifact')
          .select('*')
          .eq('type', 'education')
          .eq('account_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Failed to fetch education artifacts:', error)
          setError(error.message)
        } else {
          console.log('🧾 Artifacts returned from Supabase:', data)
          setArtifacts(data || [])
        }
      } catch (err) {
        console.error('❌ Error fetching education artifacts:', err)
        setError(err.message)
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

  const handleAddEducation = () => {
    // This would open the education form/modal
    console.log('Opening education form...')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">Loading education records...</p>
              <p className="text-sm text-muted-foreground">Fetching your qualifications</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <div>
            <strong>Error loading education records</strong>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (artifacts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Add Your Education</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Showcase your educational background to build credibility with potential clients
              </p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={handleAddEducation} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Education
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Include degrees, certifications, and training programs
              </div>
            </div>
          </div>
        </div>

        {/* Education Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Degrees</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Add your university degrees and academic qualifications
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Certifications</h4>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Include professional certifications and licenses
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">Training</h4>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  List workshops, courses, and training programs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {artifacts.length} Record{artifacts.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <Button onClick={handleAddEducation} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>

      {/* Education Records */}
      <div className="space-y-4">
        <ArtifactInterface artifacts={artifacts} />
      </div>

      {/* Completion Encouragement */}
      {artifacts.length > 0 && artifacts.length < 3 && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Great start! Consider adding more education records to strengthen your professional profile.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}