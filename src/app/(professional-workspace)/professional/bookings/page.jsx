'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/utils/supabase/client'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar as CalendarIcon,
  Clock,
  RefreshCw,
  AlertCircle,
  MapPin,
  MessageSquare,
  Eye,
  CheckCircle2,
  Play,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()
  
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  const fetchBookings = useCallback(async () => {
    const professionalId = user?.profile?.professional_id
    if (!professionalId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('booking')
        .select(`
          *,
          service:service_id (
            service_id,
            name,
            description,
            base_price,
            duration_minutes
          ),
          appointment:appointment_id (
            appointment_id,
            customer_message,
            urgency
          ),
          customer:customer_id (
            customer_id,
            account!inner (
              account_id,
              first_name,
              last_name,
              email,
              profile_picture_url
            )
          ),
          address:address_id (
            address_id,
            street_address,
            city,
            parish,
            formatted_address,
            latitude,
            longitude
          )
        `)
        .eq('professional_id', professionalId)
        .order('scheduled_start', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, supabase])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Filter bookings by status
  const upcomingBookings = bookings.filter(b => 
    ['accepted', 'pending'].includes(b.status) && 
    new Date(b.scheduled_start) >= new Date()
  )
  
  const inProgressBookings = bookings.filter(b => 
    b.status === 'progressing'
  )
  
  const completedBookings = bookings.filter(b => 
    b.status === 'completed'
  )
  
  const cancelledBookings = bookings.filter(b => 
    ['cancelled', 'rejected', 'failed'].includes(b.status)
  )

  const BookingCard = ({ booking }) => {
    const customerName = booking.customer?.account 
      ? `${booking.customer.account.first_name} ${booking.customer.account.last_name}`
      : 'Customer'
    
    const scheduledDate = new Date(booking.scheduled_start)
    const now = new Date()
    const isToday = scheduledDate.toDateString() === now.toDateString()
    const isPast = scheduledDate < now

    const getStatusColor = (status) => {
      const colors = {
        'accepted': 'bg-green-100 text-green-700 border-green-300',
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'progressing': 'bg-blue-100 text-blue-700 border-blue-300',
        'completed': 'bg-purple-100 text-purple-700 border-purple-300',
        'cancelled': 'bg-red-100 text-red-700 border-red-300',
        'rejected': 'bg-red-100 text-red-700 border-red-300',
        'failed': 'bg-red-100 text-red-700 border-red-300'
      }
      return colors[status] || 'bg-gray-100 text-gray-700'
    }

    const getStatusIcon = (status) => {
      switch(status) {
        case 'accepted': return CheckCircle2
        case 'progressing': return Play
        case 'completed': return CheckCircle2
        case 'cancelled':
        case 'rejected':
        case 'failed': return XCircle
        default: return Clock
      }
    }

    const StatusIcon = getStatusIcon(booking.status)

    return (
      <Card className={cn(
        "border-l-4 hover:shadow-md transition-shadow",
        isToday && !isPast && "border-l-blue-500 bg-blue-50/20",
        !isToday && !isPast && "border-l-green-500",
        isPast && "border-l-gray-300 opacity-75"
      )}>
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg flex-1 leading-tight">
              {booking.service?.name}
            </CardTitle>
            <Badge className={cn(getStatusColor(booking.status), "shrink-0 text-xs")}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {booking.status}
            </Badge>
          </div>
          
          <div className="text-xs sm:text-sm text-muted-foreground">
            {customerName}
            {isToday && !isPast && <span className="ml-2 text-blue-600 font-semibold">• Today</span>}
            {isPast && <span className="ml-2 text-gray-600">• Past</span>}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-xs sm:text-sm space-y-2">
            {/* Date & Time */}
            <div className="flex items-start gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs">
                  {scheduledDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })} • {booking.duration_minutes || 60} min
                </div>
              </div>
            </div>
            
            {/* Location */}
            {booking.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="flex-1 min-w-0 break-words">
                  {booking.address.city}, {booking.address.parish}
                </span>
              </div>
            )}
            
            {/* Customer Notes */}
            {booking.appointment?.customer_message && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="flex-1 min-w-0 line-clamp-2 text-xs italic">
                  "{booking.appointment.customer_message}"
                </span>
              </div>
            )}
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2 h-10"
            onClick={() => router.push(`/professional/bookings/${booking.booking_id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ icon: Icon, title, description }) => (
    <Card>
      <CardContent className="py-12 px-4 text-center">
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Page Header */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              My Bookings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your confirmed appointments and schedule
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            className="w-full sm:w-auto h-10"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1">
            <TabsTrigger value="upcoming" className="py-2">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Up</span>
              {upcomingBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {upcomingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="in-progress" className="py-2">
              <Play className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
              {inProgressBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {inProgressBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="completed" className="py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            
            <TabsTrigger value="cancelled" className="py-2">
              <XCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cancelled</span>
              <span className="sm:hidden">Cancel</span>
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No Upcoming Bookings"
                description="Your confirmed bookings will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.booking_id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* In Progress */}
          <TabsContent value="in-progress">
            {inProgressBookings.length === 0 ? (
              <EmptyState
                icon={Play}
                title="No Active Bookings"
                description="Bookings you're currently working on will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inProgressBookings.map(booking => (
                  <BookingCard key={booking.booking_id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed">
            {completedBookings.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No Completed Bookings"
                description="Your completed work history will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedBookings.map(booking => (
                  <BookingCard key={booking.booking_id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cancelled */}
          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <EmptyState
                icon={XCircle}
                title="No Cancelled Bookings"
                description="Cancelled or rejected bookings will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cancelledBookings.map(booking => (
                  <BookingCard key={booking.booking_id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}