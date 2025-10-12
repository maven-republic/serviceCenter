// src/components/professional-workspace/assessments/AllAssessmentsOverview.jsx
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  Clock,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Timer,
  MapPin
} from 'lucide-react'
import AssessmentItem from './AssessmentItem'
import AssessmentSpecifics from './AssessmentSpecifics'
import AssessmentEmpty from './AssessmentEmpty'

export default function AllAssessmentsOverview({ 
  assessments = [],
  loading,
  error,
  onRefresh,
  professionalId
}) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [showSpecifics, setShowSpecifics] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Categorize assessments by status
  const categorizedAssessments = useMemo(() => {
    const now = new Date()
    
    return {
      upcoming: assessments.filter(a => {
        const isUpcoming = ['proposed', 'accepted', 'scheduled'].includes(a.status)
        const isFuture = !a.confirmed_date || new Date(a.confirmed_date) > now
        return isUpcoming && isFuture
      }),
      inProgress: assessments.filter(a => 
        a.status === 'active' ||
        (a.status === 'scheduled' && a.confirmed_date && new Date(a.confirmed_date) <= now && !a.final_quote_provided)
      ),
      needsQuote: assessments.filter(a => 
        a.status === 'completed' && !a.final_quote_provided
      ),
      completed: assessments.filter(a => 
        a.status === 'completed' && a.final_quote_provided
      ),
      all: assessments
    }
  }, [assessments])

  // Filter by search query
  const filteredAssessments = useMemo(() => {
    const current = categorizedAssessments[activeTab] || []
    
    if (!searchQuery.trim()) return current

    return current.filter(assessment => {
      const searchLower = searchQuery.toLowerCase()
      const customerName = `${assessment.appointment?.customer?.account?.first_name || ''} ${assessment.appointment?.customer?.account?.last_name || ''}`.toLowerCase()
      const projectTitle = (assessment.appointment?.title || '').toLowerCase()
      
      return customerName.includes(searchLower) || projectTitle.includes(searchLower)
    })
  }, [categorizedAssessments, activeTab, searchQuery])

  const handleViewAssessment = (assessment) => {
    setSelectedAssessment(assessment)
    setShowSpecifics(true)
  }

  const handleCloseSpecifics = () => {
    setShowSpecifics(false)
    setSelectedAssessment(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Assessments</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Site Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your site visits and provide final quotes
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedAssessments.upcoming.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled assessments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedAssessments.inProgress.length}</div>
            <p className="text-xs text-muted-foreground">Active site visits</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Quote</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedAssessments.needsQuote.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting final quote</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedAssessments.completed.length}</div>
            <p className="text-xs text-muted-foreground">Quotes provided</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by customer name or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upcoming">
            Upcoming
            {categorizedAssessments.upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {categorizedAssessments.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress
            {categorizedAssessments.inProgress.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {categorizedAssessments.inProgress.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="needsQuote">
            Needs Quote
            {categorizedAssessments.needsQuote.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {categorizedAssessments.needsQuote.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
          <TabsTrigger value="all">
            All
          </TabsTrigger>
        </TabsList>

        {['upcoming', 'inProgress', 'needsQuote', 'completed', 'all'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filteredAssessments.length === 0 ? (
              <AssessmentEmpty 
                tab={tab}
                hasSearch={!!searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssessments.map(assessment => (
                  <AssessmentItem
                    key={assessment.assessment_id}
                    assessment={assessment}
                    onView={() => handleViewAssessment(assessment)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Assessment Details Sheet */}
      <AssessmentSpecifics
        open={showSpecifics}
        onOpenChange={setShowSpecifics}
        assessment={selectedAssessment}
        professionalId={professionalId}
        onRefresh={onRefresh}
        onClose={handleCloseSpecifics}
      />
    </div>
  )
}