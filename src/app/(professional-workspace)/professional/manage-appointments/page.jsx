'use client'

// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
// ✅ FIXED: Prevent duplicate interest submission by detecting existing interests

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/utils/supabase/client'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Bell,
  MapPin,
  MessageSquare,
  Eye,
  Filter,
  Users,
  CheckCircle,
  X,
  Crown
} from 'lucide-react'
import { DirectBookingActions } from '@/components/professional-workspace/appointments/DirectBookingActions'
import AppointmentInformationView from '@/components/sheet/AppointmentInformationView'
import { cn } from '@/lib/utils'

export default function ManageAppointmentsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()
  
  // ============================================
  // STATE: Direct Booking Requests (PATH A)
  // ============================================
  const [directBookingRequests, setDirectBookingRequests] = useState([])
  const [directBookingsLoading, setDirectBookingsLoading] = useState(false)
  const [directBookingsError, setDirectBookingsError] = useState(null)
  
  // ============================================
  // STATE: Marketplace Appointments (PATH B)
  // ============================================
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState(null)
  
  // ============================================
  // STATE: Interests (PATH B)
  // ============================================
  const [interests, setInterests] = useState([])
  const [interestsLoading, setInterestsLoading] = useState(false)
  const [interestsError, setInterestsError] = useState(null)
  
  // ============================================
  // STATE: UI Controls
  // ============================================
  const [activeTab, setActiveTab] = useState('direct-requests')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // ============================================
  // 🆕 STATE: Sheet Modal
  // ============================================
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  // ============================================
  // FETCH: Direct Booking Requests (PATH A)
  // ============================================
  const fetchDirectBookingRequests = useCallback(async () => {
    const professionalId = user?.profile?.professional_id;
    
    if (!professionalId) {
      console.log('❌ No professional_id found, returning early');
      return;
    }
    
    setDirectBookingsLoading(true);
    setDirectBookingsError(null);
    
    try {
      const { data, error } = await supabase
        .from('appointment')
        .select(`
          *,
          service:service_id (
            service_id,
            name,
            description,
            base_price,
            duration_minutes
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
        .eq('status', 'pending')
        .eq('interest_count', 0)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const now = new Date();
      const validRequests = (data || []).filter(apt => {
        const createdAt = new Date(apt.created_at);
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      });
      
      console.log('✅ Fetched', validRequests.length, 'direct booking requests');
      setDirectBookingRequests(validRequests);
    } catch (error) {
      console.error('❌ Error fetching direct booking requests:', error);
      setDirectBookingsError(error.message);
    } finally {
      setDirectBookingsLoading(false);
    }
  }, [user?.profile?.professional_id, supabase]);
  
  // ============================================
  // FETCH: Marketplace Appointments (PATH B)
  // ============================================
  const fetchAppointments = useCallback(async () => {
    const professionalId = user?.profile?.professional_id;
    
    if (!professionalId) {
      console.log('❌ No professional_id found, returning early');
      return;
    }
    
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    
    try {
      console.log('🔍 Fetching marketplace appointments for professional:', professionalId);
      
      const { data, error } = await supabase
        .from('appointment')
        .select(`
          *,
          service:service_id (
            service_id,
            name,
            description
          ),
          customer:customer_id (
            customer_id,
            account!inner (
              account_id,
              first_name,
              last_name,
              email
            )
          ),
          address:address_id (
            formatted_address,
            city,
            parish
          )
        `)
        .contains('recipients', [professionalId])
        .is('professional_id', null)
        .in('status', ['pending', 'interested', 'competing', 'evaluating'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      console.log('✅ Fetched', (data || []).length, 'marketplace appointments');
      
      if (data && data.length > 0) {
        console.log('📋 Sample appointment:', {
          id: data[0].appointment_id,
          title: data[0].title,
          interest_count: data[0].interest_count,
          recipients: data[0].recipients,
          status: data[0].status
        });
      }
      
      setAppointments(data || []);
    } catch (error) {
      console.error('❌ Error fetching marketplace appointments:', error);
      setAppointmentsError(error.message);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [user?.profile?.professional_id, supabase]);
  
  // ============================================
  // FETCH: Professional's Interests (PATH B)
  // ============================================
  const fetchInterests = useCallback(async () => {
    const professionalId = user?.profile?.professional_id;
    
    if (!professionalId) return;
    
    setInterestsLoading(true);
    setInterestsError(null);
    
    try {
      const { data, error } = await supabase
        .from('interest')
        .select(`
          *,
          appointment:appointment_id (
            appointment_id,
            session,
            status,
            recipients,
            service:service_id (
              name
            ),
            customer:customer_id (
              customer_id,
              account!inner (
                first_name,
                last_name,
                email
              )
            ),
            address:address_id (
              formatted_address,
              city,
              parish
            )
          )
        `)
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      console.log('✅ Fetched', (data || []).length, 'interests');
      console.log('📋 Interest details:', data?.map(i => ({
        interest_id: i.interest_id,
        appointment_id: i.appointment_id,
        professional_id: i.professional_id,
        status: i.status
      })));
      
      setInterests(data || []);
    } catch (error) {
      console.error('❌ Error fetching interests:', error);
      setInterestsError(error.message);
    } finally {
      setInterestsLoading(false);
    }
  }, [user?.profile?.professional_id, supabase]);
  
  // ============================================
  // EFFECTS: Load Data on Mount
  // ============================================
  useEffect(() => {
    fetchDirectBookingRequests();
    fetchAppointments();
    fetchInterests();
  }, [fetchDirectBookingRequests, fetchAppointments, fetchInterests]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDirectBookingRequests();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDirectBookingRequests]);
  
  // ============================================
  // 🆕 HANDLERS: Sheet Modal - ✅ FIXED WITH REALTIME DB CHECK
  // ============================================
  const handleViewAppointment = async (appointment) => {
    console.log('📄 Opening appointment sheet:', appointment.appointment_id);
    
    const professionalId = user?.profile?.professional_id;
    
    // ✅ CRITICAL FIX: Check database directly for existing interest
    console.log('🔍 Checking database for existing interest...');
    
    try {
      const { data: existingInterests, error } = await supabase
        .from('interest')
        .select('*')
        .eq('appointment_id', appointment.appointment_id)
        .eq('professional_id', professionalId)
        .neq('status', 'withdrawn')
        .limit(1);
      
      if (error) {
        console.error('❌ Error checking for existing interest:', error);
      }
      
      const existingInterest = existingInterests?.[0];
      
      console.log('🔎 Database check result:', {
        found: !!existingInterest,
        interest_id: existingInterest?.interest_id,
        status: existingInterest?.status
      });
      
      if (existingInterest) {
        console.log('✅ Found existing interest in database, opening in interest view mode');
        setSelectedAppointment({
          ...appointment,
          myInterest: existingInterest
        });
      } else {
        console.log('✅ No existing interest in database, opening in available mode');
        setSelectedAppointment(appointment);
      }
    } catch (error) {
      console.error('❌ Error in handleViewAppointment:', error);
      setSelectedAppointment(appointment);
    }
    
    setIsSheetOpen(true);
  };
  
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };
  
  const handleExpressInterest = async (appointmentId, interestData) => {
    try {
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...interestData,
          appointment_id: appointmentId,
          professional_id: user?.profile?.professional_id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to express interest');
      }
      
      // Refresh data
      fetchAppointments();
      fetchInterests();
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error expressing interest:', error);
      throw error;
    }
  };
  
  // ============================================
  // HANDLERS: Other
  // ============================================
  const handleRefreshAll = () => {
    fetchDirectBookingRequests();
    fetchAppointments();
    fetchInterests();
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // ============================================
  // HELPER: Check if professional is invited
  // ============================================
  const isInvited = (appointment) => {
    const professionalId = user?.profile?.professional_id;
    return appointment.recipients && 
           appointment.recipients.includes(professionalId);
  };
  
  // ============================================
  // COMPONENTS: Direct Booking Request Card
  // ============================================
  const DirectBookingRequestCard = ({ appointment }) => {
    const customerName = appointment.customer?.account 
      ? `${appointment.customer.account.first_name} ${appointment.customer.account.last_name}`
      : 'Customer';
    
    const sessionDate = new Date(appointment.session);
    const createdAt = new Date(appointment.created_at);
    const hoursAgo = Math.floor((new Date() - createdAt) / (1000 * 60 * 60));
    const hoursLeft = 24 - hoursAgo;
    
    return (
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg flex-1 leading-tight">
              {appointment.service?.name}
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-700 border-blue-300 shrink-0 text-xs"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Direct</span>
            </Badge>
          </div>
          
          <CardDescription className="text-xs sm:text-sm">
            {customerName} • {hoursAgo}h ago
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {sessionDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs">
                  {sessionDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })} • {appointment.duration || 60} min
                </div>
              </div>
            </div>
            
            {appointment.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="flex-1 min-w-0 break-words">
                  {appointment.address.city}, {appointment.address.parish}
                </span>
              </div>
            )}
            
            {appointment.customer_message && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="flex-1 min-w-0 line-clamp-2 text-xs italic">
                  "{appointment.customer_message}"
                </span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-center gap-1.5 py-2 px-3 rounded-md",
            "bg-amber-50 border border-amber-200",
            hoursLeft <= 6 && "bg-red-50 border-red-200 animate-pulse"
          )}>
            <Clock className={cn(
              "h-4 w-4",
              hoursLeft <= 6 ? "text-red-600" : "text-amber-600"
            )} />
            <span className={cn(
              "text-xs sm:text-sm font-medium",
              hoursLeft <= 6 ? "text-red-700" : "text-amber-700"
            )}>
              {hoursLeft}h left to respond
            </span>
          </div>
          
          <div className="pt-2">
            <DirectBookingActions 
              appointment={appointment}
              onSuccess={() => {
                fetchDirectBookingRequests();
                fetchAppointments();
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // ============================================
  // COMPONENTS: Appointment Card (PATH B) - ✅ UPDATED WITH VISUAL FEEDBACK
  // ============================================
  const AppointmentCard = ({ appointment }) => {
    const customerName = appointment.customer?.account 
      ? `${appointment.customer.account.first_name} ${appointment.customer.account.last_name}`
      : 'Customer';
    
    const invited = isInvited(appointment);
    
    // ✅ Check if professional already expressed interest
    const professionalId = user?.profile?.professional_id;
    const hasExpressedInterest = interests.some(
      interest => interest.appointment_id === appointment.appointment_id &&
                  interest.professional_id === professionalId
    );
    
    return (
      <Card 
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer touch-manipulation",
          invited && "border-l-4 border-l-blue-500",
          hasExpressedInterest && "border-l-4 border-l-green-500"
        )}
        onClick={() => handleViewAppointment(appointment)}
      >
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg leading-tight truncate">
                {appointment.service?.name || appointment.title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 truncate">
                {customerName}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              {hasExpressedInterest && (
                <Badge className="bg-green-600 text-white text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Responded
                </Badge>
              )}
              {invited && !hasExpressedInterest && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Invited
                </Badge>
              )}
              <Badge className="text-xs">
                {appointment.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-xs sm:text-sm">
            {appointment.session && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {new Date(appointment.session).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            
            {appointment.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {appointment.address.city}, {appointment.address.parish}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {appointment.interest_count || 0} response{appointment.interest_count !== 1 ? 's' : ''}
              </span>
            </div>
            
            {invited && !hasExpressedInterest && appointment.interest_count === 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 font-medium">
                  🎯 You're the first to see this! Respond quickly to win this project.
                </p>
              </div>
            )}
            
            {hasExpressedInterest && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-700 font-medium">
                  ✅ You've responded to this appointment
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // ============================================
  // COMPONENTS: Interest Card
  // ============================================
  const InterestCard = ({ interest }) => {
    if (!interest.appointment) return null;
    
    const customerName = interest.appointment.customer?.account 
      ? `${interest.appointment.customer.account.first_name} ${interest.appointment.customer.account.last_name}`
      : 'Customer';
    
    const getStatusColor = (status) => {
      const colors = {
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'quoted': 'bg-blue-100 text-blue-700 border-blue-300',
        'confirmed': 'bg-green-100 text-green-700 border-green-300',
        'selected': 'bg-purple-100 text-purple-700 border-purple-300',
        'rejected': 'bg-red-100 text-red-700 border-red-300',
        'withdrawn': 'bg-gray-100 text-gray-700 border-gray-300'
      };
      return colors[status] || 'bg-gray-100 text-gray-700';
    };
    
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleViewAppointment(interest.appointment)}
      >
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg leading-tight truncate">
                {interest.appointment.service?.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 truncate">
                {customerName}
              </CardDescription>
            </div>
            <Badge className={cn(getStatusColor(interest.status), "shrink-0 text-xs")}>
              {interest.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-xs sm:text-sm">
            {interest.amount && (
              <div className="text-lg sm:text-xl font-bold text-foreground">
                JMD ${parseFloat(interest.amount).toLocaleString()}
              </div>
            )}
            
            {interest.appointment.session && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {new Date(interest.appointment.session).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            {interest.selected_by_customer && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs font-medium text-green-700">
                  Selected by customer
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // ============================================
  // COMPONENTS: Empty States
  // ============================================
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
  );
  
  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              Manage Appointments
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
              View and manage your bookings and marketplace appointments
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshAll}
            disabled={directBookingsLoading || appointmentsLoading || interestsLoading}
            className="w-full sm:w-auto h-10 touch-manipulation"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              (directBookingsLoading || appointmentsLoading || interestsLoading) && "animate-spin"
            )} />
            <span className="sm:inline">Refresh All</span>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 w-10 shrink-0 touch-manipulation hidden sm:flex"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1">
            <TabsTrigger 
              value="direct-requests" 
              className="flex flex-col items-center justify-center py-2 sm:py-3 gap-1 data-[state=active]:bg-background min-h-[60px] sm:min-h-[70px]"
            >
              <Bell className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                Direct
              </span>
              {directBookingRequests.length > 0 && (
                <Badge variant="secondary" className="mt-0.5 text-xs h-5 min-w-[20px]">
                  {directBookingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="marketplace" 
              className="flex flex-col items-center justify-center py-2 sm:py-3 gap-1 data-[state=active]:bg-background min-h-[60px] sm:min-h-[70px]"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                Market
              </span>
              {appointments.length > 0 && (
                <Badge variant="secondary" className="mt-0.5 text-xs h-5 min-w-[20px]">
                  {appointments.length}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="my-interests" 
              className="flex flex-col items-center justify-center py-2 sm:py-3 gap-1 data-[state=active]:bg-background min-h-[60px] sm:min-h-[70px]"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                <span className="hidden sm:inline">My Interests</span>
                <span className="sm:hidden">Interests</span>
              </span>
              {interests.length > 0 && (
                <Badge variant="secondary" className="mt-0.5 text-xs h-5 min-w-[20px]">
                  {interests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct-requests" className="space-y-4 mt-4">
            {directBookingsLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading requests...</p>
                </CardContent>
              </Card>
            ) : directBookingsError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">
                        Failed to load: {directBookingsError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : directBookingRequests.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Direct Requests"
                description="You don't have any pending direct booking requests at the moment."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {directBookingRequests.map(appointment => (
                  <DirectBookingRequestCard 
                    key={appointment.appointment_id} 
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="marketplace" className="space-y-4 mt-4">
            {appointmentsLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading appointments...</p>
                </CardContent>
              </Card>
            ) : appointmentsError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">
                        Failed to load: {appointmentsError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Marketplace Appointments"
                description="No appointments available. Check back soon for new opportunities!"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {appointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.appointment_id} 
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-interests" className="space-y-4 mt-4">
            {interestsLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading interests...</p>
                </CardContent>
              </Card>
            ) : interestsError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">
                        Failed to load: {interestsError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : interests.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No Interests Yet"
                description="Express interest in marketplace appointments to see them here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {interests.map(interest => (
                  <InterestCard 
                    key={interest.interest_id} 
                    interest={interest}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 🆕 APPOINTMENT DETAILS SHEET - ✅ FIXED: Pass interests array + Auto-detect mode */}
      {selectedAppointment && (
        <AppointmentInformationView
          open={isSheetOpen}
          onOpenChange={handleCloseSheet}
          appointment={selectedAppointment}
          interests={interests}
          professionalId={user?.profile?.professional_id}
          mode={selectedAppointment.myInterest ? "interest" : "available"}
          onExpressInterest={handleExpressInterest}
          onRefresh={handleRefreshAll}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  )
}