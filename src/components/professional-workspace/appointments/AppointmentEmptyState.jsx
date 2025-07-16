// src/components/professional-workspace/appointments/AppointmentEmptyState.jsx
'use client'

import { Calendar, Filter, Plus, Heart, Users, Target, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AppointmentEmptyState({ 
  filters, 
  onClearFilters, 
  emptyMessage,
  emptyDescription,
  mode = 'available' // 'available', 'interests', 'assigned'
}) {
  const hasActiveFilters = filters?.status !== 'all' || filters?.search

  // Tab-specific configurations
  const getTabConfig = (mode) => {
    switch (mode) {
      case 'available':
        return {
          icon: Search,
          title: hasActiveFilters ? 'No matching opportunities' : 'No opportunities available',
          description: hasActiveFilters 
            ? 'No appointments match your current filters. Try adjusting your search criteria.'
            : 'There are currently no appointment opportunities in your area that match your services.',
          action: {
            primary: hasActiveFilters ? 'Clear filters' : 'Update your services',
            secondary: hasActiveFilters ? 'View all opportunities' : 'Check profile completeness'
          },
          tip: 'New opportunities appear regularly. Check back frequently or enable notifications.',
          color: 'blue'
        }
      
      case 'interests':
        return {
          icon: Heart,
          title: hasActiveFilters ? 'No matching interests' : 'No interests expressed yet',
          description: hasActiveFilters 
            ? 'No interests match your current filters. Try adjusting your search criteria.'
            : 'You haven\'t expressed interest in any appointments yet. Browse available opportunities to get started.',
          action: {
            primary: hasActiveFilters ? 'Clear filters' : 'Browse opportunities',
            secondary: hasActiveFilters ? 'View all interests' : 'Learn about expressing interest'
          },
          tip: 'Express interest in multiple projects to increase your chances of being selected.',
          color: 'purple'
        }
      
      case 'assigned':
        return {
          icon: Target,
          title: hasActiveFilters ? 'No matching assignments' : 'No assignments yet',
          description: hasActiveFilters 
            ? 'No assignments match your current filters. Try adjusting your search criteria.'
            : 'You don\'t have any assigned appointments yet. Express interest in available appointments to get selected by customers.',
          action: {
            primary: hasActiveFilters ? 'Clear filters' : 'Express interest in opportunities',
            secondary: hasActiveFilters ? 'View all assignments' : 'Improve your profile'
          },
          tip: 'Customers select professionals based on profiles, reviews, and competitive quotes.',
          color: 'green'
        }
      
      default:
        return {
          icon: Calendar,
          title: 'No appointments',
          description: 'No appointments found.',
          action: {
            primary: 'Take action',
            secondary: 'Learn more'
          },
          tip: '',
          color: 'gray'
        }
    }
  }

  // Use custom messages if provided, otherwise use tab config
  const tabConfig = getTabConfig(mode)
  const displayTitle = emptyMessage || tabConfig.title
  const displayDescription = emptyDescription || tabConfig.description
  const IconComponent = tabConfig.icon

  // Color configurations
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-600',
      primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      tipBg: 'bg-blue-50',
      tipBorder: 'border-blue-200',
      tipText: 'text-blue-700'
    },
    purple: {
      iconBg: 'bg-purple-50',
      iconText: 'text-purple-600',
      primaryBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
      tipBg: 'bg-purple-50',
      tipBorder: 'border-purple-200',
      tipText: 'text-purple-700'
    },
    green: {
      iconBg: 'bg-green-50',
      iconText: 'text-green-600',
      primaryBtn: 'bg-green-600 hover:bg-green-700 text-white',
      tipBg: 'bg-green-50',
      tipBorder: 'border-green-200',
      tipText: 'text-green-700'
    },
    gray: {
      iconBg: 'bg-muted',
      iconText: 'text-muted-foreground',
      primaryBtn: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      tipBg: 'bg-muted/50',
      tipBorder: 'border-border',
      tipText: 'text-muted-foreground'
    }
  }

  const colors = colorClasses[tabConfig.color] || colorClasses.gray

  return (
    <Card className="bg-card border-border">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        {/* Icon */}
        <div className={`flex items-center justify-center w-16 h-16 ${colors.iconBg} rounded-full mb-6`}>
          <IconComponent className={`h-8 w-8 ${colors.iconText}`} />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 text-foreground text-center">
          {displayTitle}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
          {displayDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {hasActiveFilters ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClearFilters}
                className="flex items-center gap-2 bg-background hover:bg-muted border-border"
              >
                <Filter className="h-4 w-4" />
                {tabConfig.action.primary}
              </Button>
              <Button 
                variant="default"
                className={`flex items-center gap-2 ${colors.primaryBtn}`}
              >
                <Calendar className="h-4 w-4" />
                {tabConfig.action.secondary}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="default"
                className={`flex items-center gap-2 ${colors.primaryBtn}`}
              >
                <Plus className="h-4 w-4" />
                {tabConfig.action.primary}
              </Button>
              
              {/* Mode-specific secondary actions */}
              {mode === 'available' && (
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 bg-background hover:bg-muted border-border"
                >
                  <Users className="h-4 w-4" />
                  View my profile
                </Button>
              )}
              
              {mode === 'interests' && (
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 bg-background hover:bg-muted border-border"
                >
                  <Search className="h-4 w-4" />
                  Find opportunities
                </Button>
              )}
              
              {mode === 'assigned' && (
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 bg-background hover:bg-muted border-border"
                >
                  <Heart className="h-4 w-4" />
                  Browse & express interest
                </Button>
              )}
            </>
          )}
        </div>

        {/* Professional tip */}
        {!hasActiveFilters && tabConfig.tip && (
          <div className={`mt-8 p-4 ${colors.tipBg} rounded-lg border ${colors.tipBorder} max-w-md`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-4 w-4 mt-0.5 ${colors.iconText} flex-shrink-0`} />
              <p className={`text-sm ${colors.tipText}`}>
                <strong className="font-medium">Pro tip:</strong> {tabConfig.tip}
              </p>
            </div>
          </div>
        )}

        {/* Mode-specific additional tips */}
        {!hasActiveFilters && (
          <>
            {mode === 'available' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>New opportunities are added daily • Check your service coverage area</span>
              </div>
            )}
            
            {mode === 'interests' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>Express interest quickly • Customers often select the first few responses</span>
              </div>
            )}
            
            {mode === 'assigned' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Complete your profile • Upload portfolio • Get verified for better selection chances</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AppointmentEmptyState