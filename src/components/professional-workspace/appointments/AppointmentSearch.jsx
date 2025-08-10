// src/components/professional-workspace/appointments/AppointmentSearch.jsx
'use client'

import { useCallback } from 'react'
import { Search, X, Target, Heart, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function AppointmentSearch({ 
  searchQuery = '',
  appointments = [], 
  onSearch,
  mode = 'available', // 'available', 'interests', 'assigned'
  dataStats, // From useTableData hook
  className
}) {
  // ===== TAB-SPECIFIC CONFIGURATIONS =====
  const getTabConfig = (mode) => {
    switch (mode) {
      case 'available':
        return {
          icon: Target,
          placeholder: 'Search opportunities by customer, service, or location...',
          summaryLabel: 'opportunities',
          searchHint: 'Try: "kitchen", "urgent", "plumbing repair"'
        }
      case 'interests':
        return {
          icon: Heart,
          placeholder: 'Search your interests by project, customer, or status...',
          summaryLabel: 'interests',
          searchHint: 'Try: "bathroom", "selected", "John Smith"'
        }
      case 'assigned':
        return {
          icon: Users,
          placeholder: 'Search assignments by customer, service, or status...',
          summaryLabel: 'assignments',
          searchHint: 'Try: "pending", "quoted", "urgent priority"'
        }
      default:
        return {
          icon: Calendar,
          placeholder: 'Search appointments...',
          summaryLabel: 'appointments',
          searchHint: 'Enter search terms...'
        }
    }
  }

  // ===== COMPUTED VALUES =====
  const tabConfig = getTabConfig(mode)
  const IconComponent = tabConfig.icon
  const hasSearchQuery = searchQuery.length > 0

  // ===== HANDLERS =====
  const handleSearchChange = useCallback((e) => {
    onSearch?.(e.target.value)
  }, [onSearch])

  const handleClearSearch = useCallback(() => {
    onSearch?.('')
  }, [onSearch])

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="pt-4 pb-2 px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* Search Section */}
            <div className="flex-1 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              
              {/* Search Input */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tabConfig.placeholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={cn(
                    "pl-10 h-9 bg-background border-border",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "transition-all duration-200",
                    searchQuery && "ring-1 ring-primary/20 border-primary/30"
                  )}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center text-sm text-muted-foreground">
              {dataStats ? (
                <div className="flex items-center gap-4">
                  <span>
                    {dataStats.filtered} {tabConfig.summaryLabel}
                    {hasSearchQuery && dataStats.total !== dataStats.filtered && (
                      <span className="text-muted-foreground"> of {dataStats.total}</span>
                    )}
                  </span>
                  {hasSearchQuery && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {dataStats.filterEfficiency}% match
                    </Badge>
                  )}
                </div>
              ) : (
                <span>{appointments.length} total {tabConfig.summaryLabel}</span>
              )}
            </div>
          </div>
          
          {/* Active Search Display */}
          {hasSearchQuery && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">Searching for:</span>
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    "bg-primary/10 text-primary border-primary/20",
                    "hover:bg-primary/20 transition-colors duration-200",
                    "flex items-center gap-1 pr-1"
                  )}
                >
                  <span className="truncate max-w-[200px]">"{searchQuery}"</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 ml-1 hover:bg-transparent text-primary/70 hover:text-primary"
                    onClick={handleClearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 px-2 text-xs"
                >
                  Clear search
                </Button>
              </div>
              
              {/* Search Hint */}
              <div className="mt-2 text-xs text-muted-foreground">
                💡 {tabConfig.searchHint}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}