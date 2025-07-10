// src/components/professional-workspace/appointments/AppointmentSearch.jsx
'use client'

import { Search, Filter, X, ChevronDown } from 'lucide-react'
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
  onSearch 
}) {
  // Filter options aligned with professional.css semantic tokens
  const filterOptions = [
    { 
      key: 'all', 
      label: 'All Appointments', 
      count: appointments.length,
      description: 'View all appointment requests',
      badgeVariant: 'secondary'
    },
    { 
      key: 'pending', 
      label: 'Pending Review', 
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
      description: 'Active appointments',
      badgeVariant: 'default'
    },
    { 
      key: 'converted', 
      label: 'Completed', 
      count: appointments.filter(a => a.status === 'converted').length,
      description: 'Successfully completed',
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
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const customerName = `${appointment.customer?.account?.first_name || ''} ${appointment.customer?.account?.last_name || ''}`.toLowerCase()
        const serviceName = appointment.service?.name?.toLowerCase() || ''
        const description = appointment.description?.toLowerCase() || ''
        
        if (!(customerName.includes(searchLower) || serviceName.includes(searchLower) || description.includes(searchLower))) {
          return false
        }
      }
      
      // Apply status filter
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false
      }
      
      return true
    }).length
  }

  const filteredCount = getFilteredCount()
  const pendingCount = appointments.filter(a => a.status === 'pending').length

  return (
    <div className="professional-workspace">
      <Card className="bg-card border-border">
<CardContent className="pt-4 pb-2 px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            
            {/* Search Input Section */}
            <div className="flex-1 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              {/* Status Filter Dropdown - Professional aligned */}
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
                        <Filter className="h-4 w-4 text-muted-foreground" />
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
                        Filter by Status
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
                        
                        {/* Professional separator spacing */}
                        {(index === 0 || index === 2) && index < filterOptions.length - 1 && (
                          <DropdownMenuSeparator className="bg-border my-1" />
                        )}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search Input - Professional aligned */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, service, or description..."
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

            {/* Active Filters & Actions - Professional spacing */}
            {hasActiveFilters && (
              <>
                <Separator orientation="vertical" className="hidden lg:block h-8 bg-border" />
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Active Filter Tags - Using professional semantic tokens */}
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
                  
                  {/* Clear All Button - Professional styling */}
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
            
            {/* Results Summary - Professional typography */}
            {!hasActiveFilters && (
              <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                <span>
                  {appointments.length} total {appointments.length === 1 ? 'appointment' : 'appointments'}
                </span>
                {pendingCount > 0 && (
                  <span className="ml-2 text-destructive font-medium">
                    • {pendingCount} pending review
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Filter Results Summary - Professional spacing and colors */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Showing {filteredCount} of {appointments.length} appointments
                </div>
                
                <div className="flex items-center gap-2">
                  {pendingCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      {pendingCount} urgent
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