// src/components/professional-workspace/appointments/AppointmentSearch.jsx
'use client'

import { Search, Filter, X, ChevronDown, Heart, Users, Target, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

export default function AppointmentSearch({ 
  filters, 
  appointments = [], 
  onStatusFilter, 
  onSearch,
  mode = 'available' // 'available', 'interests', 'assigned'
}) {
  
  // Tab-specific filter configurations
  const getFilterOptions = (mode, appointments) => {
    switch (mode) {
      case 'available':
        return [
          { 
            key: 'all', 
            label: 'All Opportunities', 
            count: appointments.length,
            description: 'All available appointments',
            badgeVariant: 'secondary'
          },
          { 
            key: 'pending', 
            label: 'New Opportunities', 
            count: appointments.filter(a => a.status === 'pending').length,
            description: 'Fresh appointment requests',
            badgeVariant: 'default',
            isUrgent: true
          },
          { 
            key: 'competing', 
            label: 'Competitive', 
            count: appointments.filter(a => a.status === 'competing').length,
            description: 'Multiple professionals interested',
            badgeVariant: 'destructive'
          },
          { 
            key: 'urgent', 
            label: 'Urgent Priority', 
            count: appointments.filter(a => a.urgency === 'urgent').length,
            description: 'High priority requests',
            badgeVariant: 'destructive',
            isUrgent: true
          },
          { 
            key: 'high', 
            label: 'High Priority', 
            count: appointments.filter(a => a.urgency === 'high').length,
            description: 'Important requests',
            badgeVariant: 'outline'
          }
        ]
      
      case 'interests':
        return [
          { 
            key: 'all', 
            label: 'All My Interests', 
            count: appointments.length,
            description: 'View all expressed interests',
            badgeVariant: 'secondary'
          },
          { 
            key: 'pending', 
            label: 'Awaiting Response', 
            count: appointments.filter(a => a.status === 'pending' || a.status === 'interested').length,
            description: 'Customer hasn\'t responded yet',
            badgeVariant: 'outline'
          },
          { 
            key: 'quoted', 
            label: 'Quotes Sent', 
            count: appointments.filter(a => a.status === 'quoted').length,
            description: 'Waiting for customer decision',
            badgeVariant: 'default'
          },
          { 
            key: 'selected', 
            label: 'Selected!', 
            count: appointments.filter(a => a.status === 'selected').length,
            description: 'Customer chose you',
            badgeVariant: 'default',
            isUrgent: true
          },
          { 
            key: 'rejected', 
            label: 'Not Selected', 
            count: appointments.filter(a => a.status === 'rejected').length,
            description: 'Customer chose another professional',
            badgeVariant: 'secondary'
          }
        ]
      
      case 'assigned':
        return [
          { 
            key: 'all', 
            label: 'All Assignments', 
            count: appointments.length,
            description: 'View all assigned appointments',
            badgeVariant: 'secondary'
          },
          { 
            key: 'pending', 
            label: 'Pending Action', 
            count: appointments.filter(a => a.status === 'pending').length,
            description: 'Awaiting your response',
            badgeVariant: 'destructive',
            isUrgent: true
          },
          { 
            key: 'quoted', 
            label: 'Quotes Sent', 
            count: appointments.filter(a => a.status === 'quoted').length,
            description: 'Customer reviewing quotes',
            badgeVariant: 'outline'
          },
          { 
            key: 'accepted', 
            label: 'Confirmed', 
            count: appointments.filter(a => a.status === 'accepted').length,
            description: 'Ready to start work',
            badgeVariant: 'default'
          },
          { 
            key: 'converted', 
            label: 'Active Projects', 
            count: appointments.filter(a => a.status === 'converted').length,
            description: 'Work in progress',
            badgeVariant: 'default'
          },
          { 
            key: 'declined', 
            label: 'Declined', 
            count: appointments.filter(a => a.status === 'declined').length,
            description: 'Not proceeded with',
            badgeVariant: 'secondary'
          }
        ]
      
      default:
        return [
          { 
            key: 'all', 
            label: 'All Appointments', 
            count: appointments.length,
            description: 'View all appointments',
            badgeVariant: 'secondary'
          }
        ]
    }
  }

  // Tab-specific configurations
  const getTabConfig = (mode) => {
    switch (mode) {
      case 'available':
        return {
          icon: Search,
          placeholder: 'Search opportunities by customer, service, or location...',
          filterTitle: 'Filter Opportunities',
          summaryLabel: 'opportunities',
          urgentLabel: 'new'
        }
      case 'interests':
        return {
          icon: Heart,
          placeholder: 'Search your interests by project, customer, or status...',
          filterTitle: 'Filter My Interests',
          summaryLabel: 'interests',
          urgentLabel: 'selected'
        }
      case 'assigned':
        return {
          icon: Target,
          placeholder: 'Search assignments by customer, service, or status...',
          filterTitle: 'Filter Assignments',
          summaryLabel: 'assignments',
          urgentLabel: 'pending'
        }
      default:
        return {
          icon: Calendar,
          placeholder: 'Search appointments...',
          filterTitle: 'Filter Appointments',
          summaryLabel: 'appointments',
          urgentLabel: 'urgent'
        }
    }
  }

  const filterOptions = getFilterOptions(mode, appointments)
  const tabConfig = getTabConfig(mode)
  const IconComponent = tabConfig.icon

  // Get current filter configuration
  const currentFilter = filterOptions.find(f => f.key === filters.status) || filterOptions[0]
  
  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.search

  // Handle clear all filters
  const handleClearAllFilters = () => {
    onStatusFilter('all')
    onSearch('')
  }

  // Calculate filtered appointments count
  const getFilteredCount = () => {
    return appointments.filter(appointment => {
      // Get the data to search (different for interests vs appointments)
      const isInterestView = mode === 'interests'
      const searchData = isInterestView ? appointment.appointment : appointment
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const customerName = `${searchData.customer?.account?.first_name || ''} ${searchData.customer?.account?.last_name || ''}`.toLowerCase()
        const serviceName = searchData.service?.name?.toLowerCase() || ''
        const description = searchData.description?.toLowerCase() || ''
        const title = searchData.title?.toLowerCase() || ''
        
        if (!(customerName.includes(searchLower) || 
              serviceName.includes(searchLower) || 
              description.includes(searchLower) ||
              title.includes(searchLower))) {
          return false
        }
      }
      
      // Apply status filter (different logic for interests)
      if (filters.status !== 'all') {
        if (isInterestView) {
          // For interests, check the interest status or appointment status
          const interestStatus = appointment.status
          const appointmentStatus = appointment.appointment?.status
          
          if (filters.status === 'pending') {
            return interestStatus === 'pending' || interestStatus === 'interested'
          } else if (filters.status === 'urgent') {
            return searchData.urgency === 'urgent'
          } else if (filters.status === 'high') {
            return searchData.urgency === 'high'
          } else {
            return interestStatus === filters.status
          }
        } else {
          // For appointments, check appointment status or urgency
          if (filters.status === 'urgent' || filters.status === 'high') {
            return appointment.urgency === filters.status
          } else if (filters.status === 'competing') {
            return appointment.status === 'competing' || appointment.interest_count > 1
          } else {
            return appointment.status === filters.status
          }
        }
      }
      
      return true
    }).length
  }

  const filteredCount = getFilteredCount()
  
  // Get urgent count based on mode
  const getUrgentCount = () => {
    switch (mode) {
      case 'available':
        return appointments.filter(a => a.status === 'pending').length
      case 'interests':
        return appointments.filter(a => a.status === 'selected').length
      case 'assigned':
        return appointments.filter(a => a.status === 'pending').length
      default:
        return 0
    }
  }

  const urgentCount = getUrgentCount()

  return (
    <div className="professional-workspace">
      <Card className="bg-card border-0">
        <CardContent className="pt-4 pb-2 px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* Search Input Section */}
            <div className="flex-1 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              {/* Status Filter Dropdown - Tab-aware */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      data-professional="true"
                      className={cn(
                        "h-9 justify-between min-w-[180px] bg-background hover:bg-muted border-border",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        hasActiveFilters && filters.status !== 'all' && "ring-1 ring-primary/20 border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{currentFilter.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={currentFilter.badgeVariant}
                          className="text-xs"
                        >
                          {currentFilter.count}
                        </Badge>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    className="w-[280px] bg-popover border-border"
                    data-professional="true"
                    align="start"
                  >
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        {tabConfig.filterTitle}
                      </p>
                    </div>
                    
                    {filterOptions.map((filter, index) => (
                      <div key={filter.key}>
                        <DropdownMenuItem
                          data-professional="true"
                          onClick={() => onStatusFilter(filter.key)}
                          className={cn(
                            "flex items-center justify-between p-3 cursor-pointer",
                            "hover:bg-muted focus:bg-muted",
                            "transition-colors duration-200",
                            filters.status === filter.key && "bg-muted"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{filter.label}</span>
                              {filter.isUrgent && filter.count > 0 && (
                                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{filter.description}</p>
                          </div>
                          <Badge 
                            variant={filter.badgeVariant}
                            className="ml-2 text-xs"
                          >
                            {filter.count}
                          </Badge>
                        </DropdownMenuItem>
                        
                        {/* Separator placement */}
                        {(index === 0 || index === 2) && index < filterOptions.length - 1 && (
                          <DropdownMenuSeparator className="bg-border my-1" />
                        )}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search Input - Tab-aware placeholder */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tabConfig.placeholder}
                  value={filters.search}
                  onChange={(e) => onSearch(e.target.value)}
                  className={cn(
                    "pl-10 h-9 bg-background border-border",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "transition-all duration-200",
                    filters.search && "ring-1 ring-primary/20 border-primary/30"
                  )}
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSearch('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters & Actions */}
            {hasActiveFilters && (
              <>
                <Separator orientation="vertical" className="hidden lg:block h-8 bg-border" />
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Active Filter Tags */}
                  {filters.status !== 'all' && (
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "bg-primary/10 text-primary border-primary/20",
                          "hover:bg-primary/20 transition-colors duration-200",
                          "flex items-center gap-2"
                        )}
                      >
                        <span className="font-medium">Status:</span>
                        <span>{currentFilter.label}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 ml-1 hover:bg-transparent text-primary/70 hover:text-primary"
                          onClick={() => onStatusFilter('all')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  )}
                  
                  {filters.search && (
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "bg-primary/10 text-primary border-primary/20",
                          "hover:bg-primary/20 transition-colors duration-200",
                          "max-w-[200px] flex items-center gap-2"
                        )}
                      >
                        <span className="font-medium">Search:</span>
                        <span className="truncate">"{filters.search}"</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 ml-1 hover:bg-transparent text-primary/70 hover:text-primary"
                          onClick={() => onSearch('')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  )}
                  
                  {/* Clear All Button */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearAllFilters}
                    className={cn(
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      "h-8 px-3 transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    Clear all filters
                  </Button>
                </div>
              </>
            )}
            
            {/* Results Summary - Tab-aware */}
            {!hasActiveFilters && (
              <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                <span>
                  {appointments.length} total {tabConfig.summaryLabel}
                </span>
                {urgentCount > 0 && (
                  <span className="ml-2 text-destructive font-medium">
                    • {urgentCount} {tabConfig.urgentLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Filter Results Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Showing {filteredCount} of {appointments.length} {tabConfig.summaryLabel}
                </div>
                
                <div className="flex items-center gap-2">
                  {urgentCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      {urgentCount} {tabConfig.urgentLabel}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}