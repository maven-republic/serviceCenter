import { Clock, CheckCircle, XCircle, DollarSign, TrendingUp, Heart, Target, Users, AlertTriangle, Zap, Award, Calendar } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'

export default function AppointmentStatistics({ 
  appointments = [], 
  interests = [],
  activeTab = 'available',
  onStatClick 
}) {
  // Calculate comprehensive stats
  const calculateStats = () => {
    const safeAppointments = Array.isArray(appointments) ? appointments : []
    const safeInterests = Array.isArray(interests) ? interests : []
    
    const stats = {
      // Basic counts
      pending: safeAppointments.filter(a => a?.status === 'pending').length,
      accepted: safeAppointments.filter(a => ['accepted', 'converted', 'confirmed'].includes(a?.status)).length,
      quoted: safeAppointments.filter(a => a?.status === 'quoted').length,
      declined: safeAppointments.filter(a => a?.status === 'declined').length,
      total: safeAppointments.length,
      
      // Interest stats
      interested: safeInterests.filter(i => i?.status === 'interested').length,
      selected: safeInterests.filter(i => i?.status === 'selected').length,
      rejected: safeInterests.filter(i => i?.status === 'rejected').length,
      totalInterests: safeInterests.length,
      
      // Advanced metrics
      invitations: safeAppointments.filter(a => a?.is_invited).length,
      urgent: safeAppointments.filter(a => a?.urgency === 'urgent').length,
      highPriority: safeAppointments.filter(a => a?.urgency === 'high').length
    }

    // Calculate rates
    stats.conversionRate = stats.total > 0 ? Math.round(((stats.accepted + stats.quoted) / stats.total) * 100) : 0
    stats.selectionRate = stats.totalInterests > 0 ? Math.round((stats.selected / stats.totalInterests) * 100) : 0
    stats.responseRate = stats.total > 0 ? Math.round(((stats.total - stats.pending) / stats.total) * 100) : 0

    return stats
  }

  const stats = calculateStats()

  // Tab-specific stat configurations
  const getStatsForTab = (activeTab) => {
    const baseConfig = {
      available: [
        {
          id: 'total-opportunities',
          title: 'Available Now',
          value: stats.total,
          subtitle: 'opportunities',
          icon: Target,
          trend: stats.total > 0 ? '+12% this week' : 'No new opportunities',
          color: 'blue',
          priority: 'high',
          interactive: true,
          details: stats.invitations > 0 ? `${stats.invitations} invitations` : 'Open marketplace'
        },
        {
          id: 'invitations',
          title: 'VIP Invitations',
          value: stats.invitations,
          subtitle: 'exclusive',
          icon: Award,
          trend: stats.invitations > 0 ? 'Respond quickly!' : 'Keep building reputation',
          color: 'gold',
          priority: stats.invitations > 0 ? 'urgent' : 'low',
          interactive: true,
          details: stats.invitations > 0 ? 'Premium opportunities' : 'Invitation eligibility'
        },
        {
          id: 'urgent',
          title: 'High Priority',
          value: stats.urgent + stats.highPriority,
          subtitle: 'urgent requests',
          icon: Zap,
          trend: stats.urgent > 0 ? 'Act fast!' : 'Standard priority only',
          color: 'orange',
          priority: stats.urgent > 0 ? 'urgent' : 'medium',
          interactive: true,
          details: stats.urgent > 0 ? 'Time sensitive' : 'No rush jobs'
        },
        {
          id: 'success-rate',
          title: 'Success Rate',
          value: `${stats.selectionRate}%`,
          subtitle: 'selection rate',
          icon: TrendingUp,
          trend: stats.selectionRate >= 60 ? 'Excellent!' : stats.selectionRate >= 40 ? 'Good' : 'Improve profile',
          color: stats.selectionRate >= 60 ? 'green' : stats.selectionRate >= 40 ? 'blue' : 'gray',
          priority: 'info',
          interactive: false,
          details: `${stats.selected} of ${stats.totalInterests} interests`
        }
      ],
      interests: [
        {
          id: 'total-interests',
          title: 'Active Interests',
          value: stats.totalInterests,
          subtitle: 'expressed',
          icon: Heart,
          trend: stats.totalInterests > 0 ? `${stats.interested} pending` : 'Start exploring',
          color: 'purple',
          priority: 'high',
          interactive: true,
          details: stats.totalInterests > 0 ? 'Tracking responses' : 'No interests yet'
        },
        {
          id: 'selected',
          title: 'Selected!',
          value: stats.selected,
          subtitle: 'chosen by customers',
          icon: CheckCircle,
          trend: stats.selected > 0 ? 'Respond now!' : 'Keep trying',
          color: 'green',
          priority: stats.selected > 0 ? 'urgent' : 'medium',
          interactive: true,
          details: stats.selected > 0 ? 'Action required' : 'Selection pending'
        },
        {
          id: 'quoted',
          title: 'Quotes Sent',
          value: stats.quoted,
          subtitle: 'awaiting decision',
          icon: DollarSign,
          trend: stats.quoted > 0 ? 'Follow up soon' : 'No quotes pending',
          color: 'blue',
          priority: 'medium',
          interactive: true,
          details: stats.quoted > 0 ? 'Customer reviewing' : 'Send more quotes'
        },
        {
          id: 'selection-rate',
          title: 'Selection Rate',
          value: `${stats.selectionRate}%`,
          subtitle: 'success rate',
          icon: TrendingUp,
          trend: stats.selectionRate >= 50 ? 'Great performance!' : 'Room to improve',
          color: stats.selectionRate >= 50 ? 'green' : 'orange',
          priority: 'info',
          interactive: false,
          details: 'Your competitive edge'
        }
      ],
      assigned: [
        {
          id: 'pending-action',
          title: 'Need Response',
          value: stats.pending,
          subtitle: 'awaiting action',
          icon: AlertTriangle,
          trend: stats.pending > 0 ? 'Action required!' : 'All up to date',
          color: 'red',
          priority: stats.pending > 0 ? 'urgent' : 'low',
          interactive: true,
          details: stats.pending > 0 ? 'Respond quickly' : 'No pending actions'
        },
        {
          id: 'confirmed',
          title: 'Active Jobs',
          value: stats.accepted,
          subtitle: 'confirmed work',
          icon: CheckCircle,
          trend: stats.accepted > 0 ? 'Keep up the quality!' : 'Win more projects',
          color: 'green',
          priority: 'high',
          interactive: true,
          details: stats.accepted > 0 ? 'Revenue generating' : 'No active projects'
        },
        {
          id: 'quoted-assigned',
          title: 'Quotes Sent',
          value: stats.quoted,
          subtitle: 'under review',
          icon: DollarSign,
          trend: stats.quoted > 0 ? 'Customers deciding' : 'Send more quotes',
          color: 'blue',
          priority: 'medium',
          interactive: true,
          details: stats.quoted > 0 ? 'Decision pending' : 'Quote to win work'
        },
        {
          id: 'response-rate',
          title: 'Response Rate',
          value: `${stats.responseRate}%`,
          subtitle: 'professionalism',
          icon: Users,
          trend: stats.responseRate >= 90 ? 'Excellent!' : stats.responseRate >= 75 ? 'Good' : 'Improve speed',
          color: stats.responseRate >= 90 ? 'green' : stats.responseRate >= 75 ? 'blue' : 'orange',
          priority: 'info',
          interactive: false,
          details: 'Customer satisfaction metric'
        }
      ]
    }

    return baseConfig[activeTab] || baseConfig.available
  }

  const currentStats = getStatsForTab(activeTab)

  // Color configurations with enhanced gradients
  const colorConfigs = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:from-blue-100 hover:to-blue-150',
      icon: 'bg-blue-500 text-white',
      value: 'text-blue-700',
      trend: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      progress: 'bg-blue-500'
    },
    green: {
      card: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:from-green-100 hover:to-green-150',
      icon: 'bg-green-500 text-white',
      value: 'text-green-700',
      trend: 'text-green-600',
      badge: 'bg-green-100 text-green-700 border-green-200',
      progress: 'bg-green-500'
    },
    orange: {
      card: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 hover:from-orange-100 hover:to-orange-150',
      icon: 'bg-orange-500 text-white',
      value: 'text-orange-700',
      trend: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-700 border-orange-200',
      progress: 'bg-orange-500'
    },
    red: {
      card: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:from-red-100 hover:to-red-150',
      icon: 'bg-red-500 text-white',
      value: 'text-red-700',
      trend: 'text-red-600',
      badge: 'bg-red-100 text-red-700 border-red-200',
      progress: 'bg-red-500'
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:from-purple-100 hover:to-purple-150',
      icon: 'bg-purple-500 text-white',
      value: 'text-purple-700',
      trend: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      progress: 'bg-purple-500'
    },
    gold: {
      card: 'bg-gradient-to-br from-yellow-50 to-amber-100/50 border-yellow-200 hover:from-yellow-100 hover:to-amber-150',
      icon: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
      value: 'text-amber-700',
      trend: 'text-yellow-600',
      badge: 'bg-yellow-100 text-amber-700 border-yellow-200',
      progress: 'bg-gradient-to-r from-yellow-400 to-amber-500'
    },
    gray: {
      card: 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 hover:from-gray-100 hover:to-gray-150',
      icon: 'bg-gray-500 text-white',
      value: 'text-gray-700',
      trend: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      progress: 'bg-gray-500'
    }
  }

  const handleStatClick = (stat) => {
    if (stat.interactive && onStatClick) {
      onStatClick(stat.id, stat)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {currentStats.map((stat) => {
        const colors = colorConfigs[stat.color] || colorConfigs.gray
        const IconComponent = stat.icon
        const isClickable = stat.interactive && onStatClick
        const isUrgent = stat.priority === 'urgent'
        const isHigh = stat.priority === 'high'
        
        return (
          <Card 
            key={stat.id}
            className={cn(
              "transition-all duration-300 cursor-default relative overflow-hidden group",
              colors.card,
              isClickable && "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
              isUrgent && "ring-2 ring-red-400 ring-opacity-50 animate-pulse",
              isHigh && "ring-1 ring-blue-400 ring-opacity-30"
            )}
            onClick={() => handleStatClick(stat)}
          >
            {/* Urgent indicator */}
            {isUrgent && (
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500">
                <div className="absolute -top-[18px] -right-[8px] text-white text-xs font-bold">!</div>
              </div>
            )}

            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                    colors.icon
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-600 mb-1">
                      {stat.title}
                    </h3>
                    {stat.priority !== 'info' && (
                      <Badge 
                        variant="outline"
                        className={cn("text-xs h-5", colors.badge)}
                      >
                        {isUrgent ? 'Urgent' : isHigh ? 'High' : 'Active'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isClickable && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Main Value */}
              <div className="space-y-3">
                <div>
                  <div className={cn("text-3xl font-bold tracking-tight", colors.value)}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stat.subtitle}
                  </div>
                </div>
                
                {/* Trend and Details */}
                <div className="space-y-2">
                  <div className={cn("text-sm font-medium", colors.trend)}>
                    {stat.trend}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {stat.details}
                  </div>
                  
                  {/* Progress bar for percentage stats */}
                  {stat.value.toString().includes('%') && (
                    <div className="space-y-1">
                      <Progress 
                        value={parseInt(stat.value)} 
                        className="h-2 bg-gray-100"
                        style={{
                          background: `linear-gradient(to right, ${colors.progress} ${parseInt(stat.value)}%, #f3f4f6 ${parseInt(stat.value)}%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Interactive indicator */}
              {isClickable && (
                <div className="absolute bottom-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Demo component
const AppointmentStatisticsDemo = () => {
  // Sample data
  const sampleAppointments = [
    { status: 'pending', urgency: 'urgent', is_invited: true },
    { status: 'pending', urgency: 'high' },
    { status: 'accepted' },
    { status: 'quoted' },
    { status: 'declined' }
  ]
  
  const sampleInterests = [
    { status: 'interested' },
    { status: 'selected' },
    { status: 'quoted' },
    { status: 'rejected' }
  ]

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Appointment Statistics</h1>
          <p className="text-muted-foreground">Redesigned stats dashboard with enhanced visual design and interactivity</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Opportunities View</h2>
            <AppointmentStatistics 
              appointments={sampleAppointments}
              interests={sampleInterests}
              activeTab="available"
              onStatClick={(id, stat) => console.log('Clicked:', id, stat)}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">My Interests View</h2>
            <AppointmentStatistics 
              appointments={sampleAppointments}
              interests={sampleInterests}
              activeTab="interests"
              onStatClick={(id, stat) => console.log('Clicked:', id, stat)}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Assigned Appointments View</h2>
            <AppointmentStatistics 
              appointments={sampleAppointments}
              interests={sampleInterests}
              activeTab="assigned"
              onStatClick={(id, stat) => console.log('Clicked:', id, stat)}
            />
          </div>
        </div>

        {/* Features Showcase */}
        <div className="space-y-4 mt-12">
          <h2 className="text-2xl font-semibold">✨ Enhanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Smart Context
              </h3>
              <p className="text-sm text-muted-foreground">
                Different stats for each tab (Available, Interests, Assigned) with relevant metrics and actions
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Priority Indicators
              </h3>
              <p className="text-sm text-muted-foreground">
                Visual urgency indicators with rings, pulses, and corner badges for high-priority items
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                VIP Treatment
              </h3>
              <p className="text-sm text-muted-foreground">
                Special styling for invitations and premium opportunities with gold gradients
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Interactive Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Clickable cards with hover effects and action buttons that appear on interaction
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Progress Tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                Visual progress bars for rates and percentages with smooth animations
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Emotional Design
              </h3>
              <p className="text-sm text-muted-foreground">
                Color psychology and micro-interactions that encourage positive professional behavior
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}