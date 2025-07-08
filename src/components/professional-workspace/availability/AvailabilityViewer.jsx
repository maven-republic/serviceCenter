'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  AlertCircle, 
  RefreshCw,
  Loader2,
  CheckCircle2,
  Database,
  Clock,
  User
} from 'lucide-react'
import AvailabilityCalendar from './AvailabilityCalendar'

export default function AvailabilityViewer({ 
  availability: serverAvailability = [], 
  overrides: serverOverrides = [],
  availabilityJson,
  overridesJson 
}) {
  const supabase = createClientComponentClient()
  
  // Parse JSON props as fallback
  const fallbackAvailability = availabilityJson ? JSON.parse(availabilityJson) : []
  const fallbackOverrides = overridesJson ? JSON.parse(overridesJson) : []
  
  // Use server data or fallback
  const initialAvailability = serverAvailability?.length > 0 ? serverAvailability : fallbackAvailability
  const initialOverrides = serverOverrides?.length > 0 ? serverOverrides : fallbackOverrides
  
  const [availability, setAvailability] = useState(initialAvailability)
  const [overrides, setOverrides] = useState(initialOverrides)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('initial')
  const [lastFetch, setLastFetch] = useState(null)

  console.log('🎯 AvailabilityViewer initialized with:', {
    serverAvailability: serverAvailability?.length || 0,
    serverOverrides: serverOverrides?.length || 0,
    fallbackAvailability: fallbackAvailability?.length || 0,
    fallbackOverrides: fallbackOverrides?.length || 0,
    finalAvailability: availability?.length || 0,
    finalOverrides: overrides?.length || 0,
    hasAvailabilityJson: !!availabilityJson,
    hasOverridesJson: !!overridesJson
  })

  // Fetch data from Supabase
  const fetchAvailability = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.user) {
        console.warn('⏳ No session found, waiting for auth to initialize...')
        setDataSource('no-session')
        return
      }

      const userEmail = session.user.email
      console.log('🔍 Looking up availability for:', userEmail)

      // 1. Get account_id from email
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('account_id')
        .eq('email', userEmail)
        .single()

      if (accountError || !accountData) {
        throw new Error(`Failed to load account: ${accountError?.message || 'Account not found'}`)
      }

      console.log('✅ Account found:', accountData.account_id)

      // 2. Get professional_id from account_id
      const { data: profile, error: profileError } = await supabase
        .from('individual_professional')
        .select('professional_id')
        .eq('account_id', accountData.account_id)
        .single()

      if (profileError || !profile?.professional_id) {
        throw new Error(`Failed to load professional profile: ${profileError?.message || 'Profile not found'}`)
      }

      const professionalId = profile.professional_id
      console.log('✅ Professional ID found:', professionalId)

      // 3. Fetch availability data
      const { data: baseAvailability, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .eq('professional_id', professionalId)

      console.log('📊 Raw availability:', baseAvailability)

      // 4. Fetch override data
      const { data: overrideData, error: overrideError } = await supabase
        .from('availability_override')
        .select('*')
        .eq('professional_id', professionalId)

      if (availabilityError) {
        console.error('❌ Error fetching availability:', availabilityError)
        throw new Error(`Failed to fetch availability: ${availabilityError.message}`)
      }
      
      if (overrideError) {
        console.error('❌ Error fetching overrides:', overrideError)
        throw new Error(`Failed to fetch overrides: ${overrideError.message}`)
      }

      // 5. Format the data
      const formatted = (baseAvailability || []).map(entry => {
        console.log('🔍 Processing entry:', entry)
        return {
          ...entry,
          day_of_week: entry.day_of_week && typeof entry.day_of_week === 'string' 
            ? entry.day_of_week.toLowerCase() 
            : entry.day_of_week
        }
      })

      console.log('📆 Formatted availability:', formatted)
      console.log('📅 Override data:', overrideData)

      // 📊 Log time details for debugging
      formatted.forEach(entry => {
        console.log(`📅 ${entry.day_of_week}: ${entry.start_time} - ${entry.end_time}`)
      })

      setAvailability(formatted)
      setOverrides(overrideData || [])
      setDataSource('client-fetch')
      setLastFetch(new Date())

    } catch (error) {
      console.error('❌ Error in client fetchAvailability:', error)
      setError(error.message)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Only try client-side fetch if we have no data at all
  useEffect(() => {
    // If we have any data from server, don't fetch client-side
    if (availability?.length > 0) {
      console.log('✅ Using server/fallback data, skipping client fetch')
      setDataSource(serverAvailability?.length > 0 ? 'server' : 'fallback')
      return
    }

    console.log('🔄 No server data, attempting client fetch...')
    fetchAvailability()
  }, [availability?.length, supabase])

  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'server':
        return { label: 'Server Data', color: 'bg-green-100 text-green-700', icon: Database }
      case 'fallback':
        return { label: 'Fallback Data', color: 'bg-blue-100 text-blue-700', icon: Database }
      case 'client-fetch':
        return { label: 'Live Data', color: 'bg-purple-100 text-purple-700', icon: RefreshCw }
      case 'no-session':
        return { label: 'No Session', color: 'bg-amber-100 text-amber-700', icon: User }
      default:
        return { label: 'Initial', color: 'bg-gray-100 text-gray-700', icon: Database }
    }
  }

  const sourceInfo = getDataSourceInfo()
  const SourceIcon = sourceInfo.icon

  const getStats = () => {
    const totalBlocks = availability?.length || 0
    const totalOverrides = overrides?.length || 0
    const activeDays = new Set(availability?.map(a => a.day_of_week) || []).size
    
    return { totalBlocks, totalOverrides, activeDays }
  }

  const stats = getStats()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Data Source Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Availability Schedule</h2>
          </div>
          <p className="text-muted-foreground">
            View your current availability and scheduled hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Data Source Badge */}
          <Badge variant="outline" className={`${sourceInfo.color} border-current`}>
            <SourceIcon className="h-3 w-3 mr-1" />
            {sourceInfo.label}
          </Badge>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAvailability(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Hours</p>
                <p className="text-xl font-bold">{stats.totalBlocks}</p>
                <p className="text-xs text-muted-foreground">time blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Overrides</p>
                <p className="text-xl font-bold">{stats.totalOverrides}</p>
                <p className="text-xs text-muted-foreground">special dates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-xl font-bold">{stats.activeDays}/7</p>
                <p className="text-xs text-muted-foreground">days per week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Loading availability data...</span>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Failed to load availability:</strong> {error}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchAvailability(true)}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && stats.totalBlocks === 0 && stats.totalOverrides === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No availability configured
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven't set up your availability yet. Configure your working hours to start accepting appointments.
            </p>
            <Button onClick={() => fetchAvailability(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Display */}
      {!loading && !error && (stats.totalBlocks > 0 || stats.totalOverrides > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Calendar
                </CardTitle>
                <CardDescription>
                  Your current availability displayed in calendar format
                  {lastFetch && (
                    <span className="block mt-1 text-xs">
                      Last updated: {lastFetch.toLocaleTimeString()}
                    </span>
                  )}
                </CardDescription>
              </div>

              {overrides.length > 0 && (
                <Badge variant="secondary">
                  {overrides.length} override{overrides.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              availability={availability}
              overrides={overrides}
            />
          </CardContent>
        </Card>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed border-muted-foreground/30">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div>Data Source: {dataSource}</div>
            <div>Server Availability: {serverAvailability?.length || 0} items</div>
            <div>Server Overrides: {serverOverrides?.length || 0} items</div>
            <div>Current Availability: {availability?.length || 0} items</div>
            <div>Current Overrides: {overrides?.length || 0} items</div>
            {lastFetch && <div>Last Fetch: {lastFetch.toISOString()}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}