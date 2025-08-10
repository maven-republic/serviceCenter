// src/components/professional-workspace/appointments/AppointmentEmptyState.jsx
'use client'

import { Calendar, Search, Plus, Heart, Users, Target, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AppointmentEmptyState({ 
  searchQuery = '',
  onClearSearch, 
  emptyMessage,
  emptyDescription,
  mode = 'available' // 'available', 'interests', 'assigned'
}) {
  const hasActiveSearch = searchQuery && searchQuery.length > 0

  // Tab-specific configurations
  const getTabConfig = (mode) => {
    switch (mode) {
      case 'available':
        return {
          icon: Search,
          title: hasActiveSearch ? 'No matching opportunities' : 'No opportunities available',
          description: hasActiveSearch 
            ? `No appointments match your search for "${searchQuery}". Try different keywords or check spelling.`
            : 'There are currently no appointment opportunities in your area that match your services.',
          action: {
            primary: hasActiveSearch ? 'Clear search' : 'Update your services',
            secondary: hasActiveSearch ? 'View all opportunities' : 'Check profile completeness'
          },
          tip: 'New opportunities appear regularly. Check back frequently or enable notifications.',
          color: 'blue'
        }
      
      case 'interests':
        return {
          icon: Heart,
          title: hasActiveSearch ? 'No matching interests' : 'No interests expressed yet',
          description: hasActiveSearch 
            ? `No interests match your search for "${searchQuery}". Try different keywords.`
            : 'You haven\'t expressed interest in any appointments yet. Browse available opportunities to get started.',
          action: {
            primary: hasActiveSearch ? 'Clear search' : 'Browse opportunities',
            secondary: hasActiveSearch ? 'View all interests' : 'Learn about expressing interest'
          },
          tip: 'Express interest in multiple projects to increase your chances of being selected.',
          color: 'purple'
        }
      
      case 'assigned':
        return {
          icon: Target,
          title: hasActiveSearch ? 'No matching assignments' : 'No assignments yet',
          description: hasActiveSearch 
            ? `No assignments match your search for "${searchQuery}". Try different keywords.`
            : 'You don\'t have any assigned appointments yet. Express interest in available appointments to get selected by customers.',
          action: {
            primary: hasActiveSearch ? 'Clear search' : 'Express interest in opportunities',
            secondary: hasActiveSearch ? 'View all assignments' : 'Improve your profile'
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
          {hasActiveSearch ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClearSearch}
                className="flex items-center gap-2 bg-background hover:bg-muted border-border"
              >
                <Search className="h-4 w-4" />
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
        {!hasActiveSearch && tabConfig.tip && (
          <div className={`mt-8 p-4 ${colors.tipBg} rounded-lg border ${colors.tipBorder} max-w-md`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-4 w-4 mt-0.5 ${colors.iconText} flex-shrink-0`} />
              <p className={`text-sm ${colors.tipText}`}>
                <strong className="font-medium">Pro tip:</strong> {tabConfig.tip}
              </p>
            </div>
          </div>
        )}

        {/* Search suggestions for when search returns no results */}
        {hasActiveSearch && (
          <div className={`mt-6 p-4 ${colors.tipBg} rounded-lg border ${colors.tipBorder} max-w-md`}>
            <div className="flex items-start gap-3">
              <Search className={`h-4 w-4 mt-0.5 ${colors.iconText} flex-shrink-0`} />
              <div className={`text-sm ${colors.tipText}`}>
                <strong className="font-medium">Search suggestions:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Try broader terms: "plumbing" instead of "toilet repair"</li>
                  <li>• Check spelling and try different keywords</li>
                  <li>• Search by customer name, service type, or location</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mode-specific additional tips */}
        {!hasActiveSearch && (
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