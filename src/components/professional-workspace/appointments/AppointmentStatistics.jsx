// src/components/professional-workspace/appointments/AppointmentStatistics.jsx
'use client'

import { Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

export default function AppointmentStatistics({ appointments = [] }) {
  // Calculate stats with proper error handling and fallbacks
  const calculateStats = () => {
    const safeAppointments = Array.isArray(appointments) ? appointments : []
    
    const stats = {
      pending: safeAppointments.filter(a => a?.status === 'pending').length,
      accepted: safeAppointments.filter(a => a?.status === 'accepted' || a?.status === 'converted').length,
      quoted: safeAppointments.filter(a => a?.status === 'quoted').length,
      declined: safeAppointments.filter(a => a?.status === 'declined').length,
      total: safeAppointments.length
    }

    // Calculate conversion rate
    stats.conversionRate = stats.total > 0 
      ? Math.round(((stats.accepted + stats.quoted) / stats.total) * 100) 
      : 0

    return stats
  }

  const stats = calculateStats()

  // Professional statistics configuration using semantic tokens
  const statsConfig = [
    {
      id: 'pending',
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting your response',
      cardClass: 'bg-card border-border hover:bg-muted/50',
      iconClass: 'text-muted-foreground',
      valueClass: 'text-foreground',
      badgeClass: 'bg-muted text-muted-foreground',
      isHighlight: stats.pending > 0,
      priority: 'high'
    },
    {
      id: 'quoted',
      title: 'Quotes Sent',
      value: stats.quoted,
      icon: DollarSign,
      description: 'Awaiting customer decision',
      cardClass: 'bg-card border-border hover:bg-muted/50',
      iconClass: 'text-muted-foreground',
      valueClass: 'text-foreground',
      badgeClass: 'bg-primary/10 text-primary',
      isHighlight: stats.quoted > 0,
      priority: 'medium'
    },
    {
      id: 'accepted',
      title: 'Confirmed',
      value: stats.accepted,
      icon: CheckCircle,
      description: 'Active appointments',
      cardClass: 'bg-card border-border hover:bg-muted/50',
      iconClass: 'text-muted-foreground',
      valueClass: 'text-foreground',
      badgeClass: 'bg-primary text-primary-foreground',
      isHighlight: stats.accepted > 0,
      priority: 'low'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      description: 'Success rate',
      cardClass: 'bg-card border-border hover:bg-muted/50',
      iconClass: 'text-muted-foreground',
      valueClass: 'text-foreground',
      badgeClass: stats.conversionRate >= 70 
        ? 'bg-primary text-primary-foreground' 
        : stats.conversionRate >= 50 
        ? 'bg-secondary text-secondary-foreground'
        : 'bg-muted text-muted-foreground',
      isHighlight: stats.conversionRate >= 50,
      priority: 'info'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
        const IconComponent = stat.icon
        
        return (
          <Card 
            key={stat.id}
            className={cn(
              "transition-all duration-200 cursor-default",
              stat.cardClass,
              stat.isHighlight && "ring-1 ring-primary/20"
            )}
          >
            <CardContent className="p-6">
              {/* Header with Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center",
                    stat.isHighlight && "bg-primary/10"
                  )}>
                    <IconComponent className={cn("h-5 w-5", stat.iconClass)} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </CardTitle>
                  </div>
                </div>
                
                {/* Status Badge */}
                {stat.isHighlight && (
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              
              {/* Value Display */}
              <div className="mb-3">
                <div className={cn(
                  "text-3xl font-bold tracking-tight",
                  stat.valueClass
                )}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {(() => {
                      // Handle conversion rate (percentage string)
                      if (stat.id === 'conversion') {
                        return stats.total > 0 ? `${stats.conversionRate}% success rate` : 'No data yet'
                      }
                      // Handle count values (numbers)
                      else {
                        const percentage = stats.total > 0 ? Math.round((stat.value / stats.total) * 100) : 0
                        return `${percentage}% of total`
                      }
                    })()}
                  </span>
                  <Badge className={stat.badgeClass}>
                    {stat.id === 'conversion' ? 'Rate' : 'Count'}
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 ease-out rounded-full",
                      stat.isHighlight ? "bg-primary" : "bg-muted-foreground/50"
                    )}
                    style={{
                      width: (() => {
                        if (stat.id === 'conversion') {
                          return `${Math.min(Math.max(stats.conversionRate, 0), 100)}%`
                        } else {
                          const percentage = stats.total > 0 ? (stat.value / stats.total) * 100 : 0
                          return `${Math.min(Math.max(percentage, 0), 100)}%`
                        }
                      })()
                    }}
                  />
                </div>
              </div>
              
              {/* Additional Context */}
              {stat.id === 'pending' && stats.pending > 0 && (
                <div className="mt-3 p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {stats.pending} {stats.pending === 1 ? 'appointment needs' : 'appointments need'} your attention
                  </p>
                </div>
              )}
              
              {stat.id === 'conversion' && (
                <div className="mt-3 p-2 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {stats.conversionRate >= 70 ? 'Excellent performance' :
                     stats.conversionRate >= 50 ? 'Good performance' :
                     stats.conversionRate > 0 ? 'Room for improvement' : 'No data yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}