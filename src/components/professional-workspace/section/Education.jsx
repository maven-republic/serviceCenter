'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import ArtifactInterface from '@/artifacts/ArtifactInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, BrandButton, ResponsiveButton } from '@/components/ui/button'
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
  CheckCircle,
  Sparkles,
  TrendingUp,
  Building,
  Users
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
          console.log('🗃️ Artifacts returned from Supabase:', data)
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
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="h-3 w-3 animate-spin text-white" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Loading education records...</h3>
              <p className="text-muted-foreground">Fetching your qualifications and achievements</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-gradient-to-r from-red-50 to-pink-50 text-red-800 dark:from-red-950 dark:to-pink-950 dark:text-red-200">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <AlertDescription className="space-y-4">
          <div>
            <div className="font-semibold text-red-800 dark:text-red-200">Error loading education records</div>
            <p className="text-sm mt-1 text-red-700 dark:text-red-300">{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (artifacts.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Empty State - Mobile Responsive */}
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Showcase Your Education</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Build credibility and trust by highlighting your educational background, certifications, and professional training
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Updated Button with responsive prop */}
              <BrandButton 
                onClick={handleAddEducation} 
                size="lg"
                className="gap-2 sm:gap-3 px-6 sm:px-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Add Your First Education Record
              </BrandButton>
              
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Profiles with education get 60% more client inquiries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Education Categories - Mobile Responsive - REMOVED BORDERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 transition-colors duration-300 rounded-lg p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100">University Degrees</h4>
              </div>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                Bachelor's, Master's, PhD, and other academic qualifications from universities and colleges
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Building className="h-3 w-3" />
                <span>Formal Education</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 hover:bg-gradient-to-br hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900 dark:hover:to-violet-900 transition-colors duration-300 rounded-lg p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-purple-900 dark:text-purple-100">Certifications</h4>
              </div>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                Professional certifications, licenses, and industry-recognized credentials
              </p>
              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                <CheckCircle className="h-3 w-3" />
                <span>Professional Credentials</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:bg-gradient-to-br hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 transition-colors duration-300 rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-orange-900 dark:text-orange-100">Training & Workshops</h4>
              </div>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                Specialized training programs, workshops, bootcamps, and professional development courses
              </p>
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                <Calendar className="h-3 w-3" />
                <span>Continuous Learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips Section - Mobile Responsive - REMOVED BORDER */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-lg p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground">Pro Tips for Education Section</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">✨ What to Include</h5>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Relevant degrees and certifications</li>
                  <li>• Institution names and locations</li>
                  <li>• Graduation dates and achievements</li>
                  <li>• Specialized training programs</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">🎯 Best Practices</h5>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• List most recent education first</li>
                  <li>• Include relevant coursework details</li>
                  <li>• Mention honors and achievements</li>
                  <li>• Keep information current and accurate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Header with Statistics - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-gradient-to-r from-primary to-primary/90 text-white gap-1.5 px-3 py-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {artifacts.length} Education Record{artifacts.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Profile Boost
            </Badge>
          </div>
        </div>
        
        {/* Updated Button with responsive enhancement */}
        <ResponsiveButton 
          onClick={handleAddEducation} 
          variant="outline" 
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </ResponsiveButton>
      </div>

      {/* Education Records */}
      <div className="space-y-6">
        <ArtifactInterface artifacts={artifacts} />
      </div>

      {/* Enhanced Completion Encouragement - Mobile Responsive - REMOVED BORDER */}

      {/* Enhanced Completion Encouragement - Mobile Responsive */}
      {artifacts.length > 0 && artifacts.length < 3 && (
        <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 dark:border-green-700 dark:from-green-950 dark:to-emerald-950 dark:text-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <AlertDescription className="font-medium text-sm sm:text-base">
                Great progress! You're building a strong educational profile.
              </AlertDescription>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                Consider adding more education records to further strengthen your professional credibility and attract more clients.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Achievement Badge - Mobile Responsive */}
      {artifacts.length >= 3 && (
        <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 dark:border-purple-700 dark:from-purple-950 dark:to-violet-950 dark:text-purple-200">
          <div className="flex items-start gap-3">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <AlertDescription className="font-medium text-sm sm:text-base">
                🎉 Excellent! You have a comprehensive educational profile.
              </AlertDescription>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                Your detailed education background significantly boosts client confidence and sets you apart from competitors.
              </p>
            </div>
          </div>
        </Alert>
      )}
    </div>
  )
}