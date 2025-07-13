// ============================================================================
// 1. DATA SERVICE - Real DB Integration with Empty State Handling
// ============================================================================

// services/AnalyticsDataService.js
export class AnalyticsDataService {
  constructor(supabaseClient, professionalId) {
    this.supabase = supabaseClient;
    this.professionalId = professionalId;
  }

  // Get professional profile with services and location
  async getProfessionalProfile() {
    const { data: professional, error } = await this.supabase
      .from('individual_professional')
      .select(`
        *,
        account:account_id (
          first_name,
          last_name,
          email
        ),
        address:account_id (
          parish,
          city,
          latitude,
          longitude
        ),
        professional_service (
          *,
          service:service_id (
            service_id,
            name,
            base_price,
            duration_minutes,
            portfolio:portfolio_id (
              name,
              vertical:vertical_id (
                name,
                industry:industry_id (name)
              )
            )
          )
        )
      `)
      .eq('professional_id', this.professionalId)
      .single();

    if (error) throw error;
    return professional;
  }

  // Get booking analytics (will be empty initially)
  async getBookingAnalytics(dateRange) {
    const { data: bookings, error } = await this.supabase
      .from('booking')
      .select(`
        booking_id,
        scheduled_start,
        scheduled_end,
        status,
        service:service_id (
          name,
          base_price
        ),
        address:address_id (
          parish,
          city
        )
      `)
      .eq('professional_id', this.professionalId)
      .gte('scheduled_start', dateRange.start.toISOString())
      .lte('scheduled_start', dateRange.end.toISOString())
      .order('scheduled_start', { ascending: true });

    if (error) throw error;

    // Transform bookings into analytics format
    return this.transformBookingsToAnalytics(bookings || []);
  }

  // Get appointment requests (potential bookings)
  async getAppointmentRequests() {
    const { data: appointments, error } = await this.supabase
      .from('appointment')
      .select(`
        appointment_id,
        status,
        preferred_start,
        urgency,
        service:service_id (name),
        address:address_id (parish)
      `)
      .eq('professional_id', this.professionalId)
      .eq('status', 'pending');

    if (error) throw error;
    return appointments || [];
  }

  // Generate realistic analytics when no real data exists
  generateSampleAnalytics(professionalProfile, dateRange) {
    if (!professionalProfile) return null;

    const { professional_service, address } = professionalProfile;
    const services = professional_service?.map(ps => ps.service) || [];
    const location = address?.[0] || {};

    // Generate realistic Jamaica-based sample data
    return this.createSampleEarningsData(services, location, dateRange);
  }

  createSampleEarningsData(services, location, dateRange) {
    const jamaicaParishes = [
      'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon',
      'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover',
      'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'
    ];

    const parishDemandFactors = {
      'Kingston': 0.95, 'St. Andrew': 0.90, 'St. James': 0.85,
      'St. Catherine': 0.75, 'St. Ann': 0.75, 'Trelawny': 0.70,
      'Westmoreland': 0.70, 'Manchester': 0.65, 'St. Mary': 0.65,
      'St. Thomas': 0.65, 'Clarendon': 0.60, 'Hanover': 0.60,
      'Portland': 0.60, 'St. Elizabeth': 0.55
    };

    const currentParish = location.parish || 'Kingston';
    const baseDemand = parishDemandFactors[currentParish] || 0.65;

    // Generate daily earnings based on services
    const dailyData = [];
    const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Weekend factor for Jamaica (higher demand)
      const weekendFactor = isWeekend ? 1.3 : 1.0;
      
      // Service demand simulation
      const bookingProbability = baseDemand * weekendFactor * 0.4; // 40% max booking rate
      const bookingsToday = Math.random() < bookingProbability ? 
        Math.floor(Math.random() * 3) + 1 : 0;

      let dailyEarnings = 0;
      const bookingDetails = [];

      for (let j = 0; j < bookingsToday; j++) {
        const service = services[Math.floor(Math.random() * services.length)];
        const basePrice = service?.base_price || 3500; // JMD default
        
        // Add market factors
        const urgencyFactor = Math.random() > 0.7 ? 1.2 : 1.0; // 30% urgent
        const finalPrice = Math.round(basePrice * urgencyFactor);
        
        dailyEarnings += finalPrice;
        
        bookingDetails.push({
          service_name: service?.name || 'Service',
          amount: finalPrice,
          parish: this.getRandomNearbyParish(currentParish, jamaicaParishes),
          time: this.getRandomBookingTime(date)
        });
      }

      dailyData.push({
        date: date.toISOString().split('T')[0],
        earnings: dailyEarnings,
        bookings: bookingsToday,
        details: bookingDetails
      });
    }

    return {
      dailyData,
      parishAnalytics: this.generateParishAnalytics(currentParish, jamaicaParishes, services),
      servicePerformance: this.generateServicePerformance(services),
      totalEarnings: dailyData.reduce((sum, day) => sum + day.earnings, 0),
      totalBookings: dailyData.reduce((sum, day) => sum + day.bookings, 0)
    };
  }

  generateParishAnalytics(currentParish, allParishes, services) {
    return allParishes.map(parish => {
      const distance = this.calculateParishDistance(currentParish, parish);
      const demandScore = this.getParishDemandScore(parish);
      
      return {
        parish,
        distance_km: distance,
        demand_level: demandScore,
        competition_level: Math.random() * 0.8 + 0.2, // 20-100%
        market_opportunity: demandScore * (distance < 30 ? 1.0 : 0.7),
        avg_service_price: (services[0]?.base_price || 3500) * demandScore,
        professional_count: Math.floor(Math.random() * 50) + 5
      };
    }).sort((a, b) => b.market_opportunity - a.market_opportunity);
  }

  // Helper methods
  getRandomNearbyParish(currentParish, allParishes) {
    // 70% chance same parish, 30% nearby
    if (Math.random() < 0.7) return currentParish;
    return allParishes[Math.floor(Math.random() * allParishes.length)];
  }

  getRandomBookingTime(date) {
    const hours = Math.floor(Math.random() * 12) + 8; // 8AM-8PM
    const minutes = Math.floor(Math.random() * 4) * 15; // 15min intervals
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  calculateParishDistance(parish1, parish2) {
    // Simplified distance calculation for Jamaica parishes
    const distances = {
      'Kingston': { 'St. Andrew': 15, 'St. Catherine': 45, 'St. Thomas': 65 },
      'St. James': { 'Hanover': 25, 'Westmoreland': 35, 'Trelawny': 40 }
      // Add more distance mappings as needed
    };
    
    return distances[parish1]?.[parish2] || 
           distances[parish2]?.[parish1] || 
           Math.floor(Math.random() * 100) + 20;
  }

  getParishDemandScore(parish) {
    const scores = {
      'Kingston': 0.95, 'St. Andrew': 0.90, 'St. James': 0.85,
      'St. Catherine': 0.75, 'St. Ann': 0.75, 'Trelawny': 0.70,
      'Westmoreland': 0.70, 'Manchester': 0.65, 'St. Mary': 0.65,
      'St. Thomas': 0.65, 'Clarendon': 0.60, 'Hanover': 0.60,
      'Portland': 0.60, 'St. Elizabeth': 0.55
    };
    return scores[parish] || 0.65;
  }

  transformBookingsToAnalytics(bookings) {
    // Transform real booking data into analytics format
    const dailyData = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.scheduled_start).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = { earnings: 0, bookings: 0, details: [] };
      }
      
      const earnings = booking.service?.base_price || 0;
      dailyData[date].earnings += earnings;
      dailyData[date].bookings += 1;
      dailyData[date].details.push({
        service_name: booking.service?.name,
        amount: earnings,
        parish: booking.address?.parish,
        time: new Date(booking.scheduled_start).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));
  }
}

// ============================================================================
// 2. ENHANCED STATISTICS COMPONENT - DB Connected
// ============================================================================

// components/Statistics.jsx - Updated for DB
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3, Award } from 'lucide-react';

export default function Statistics({ vector, professionalProfile }) {
  const [stats, setStats] = useState(null);
  const hasRealBookings = vector?.totalBookings > 0;

  useEffect(() => {
    if (vector && professionalProfile) {
      updateStatsFromData();
    }
  }, [vector, professionalProfile]);

  const updateStatsFromData = () => {
    if (hasRealBookings) {
      // Real data statistics
      setStats([
        {
          title: "Total Earnings",
          value: formatJMD(vector.totalEarnings),
          change: "+15%", // Calculate from previous period
          changeType: "positive",
          subtitle: "This Month",
          icon: DollarSign
        },
        {
          title: "Total Bookings",
          value: vector.totalBookings,
          change: "+8%",
          changeType: "positive", 
          subtitle: "Completed",
          icon: TrendingUp
        },
        {
          title: "Average Order Value",
          value: formatJMD(vector.totalEarnings / vector.totalBookings),
          change: "+12%",
          changeType: "positive",
          subtitle: "Per booking",
          icon: BarChart3
        },
        {
          title: "Active Services",
          value: professionalProfile.professional_service?.length || 0,
          subtitle: "Offered",
          icon: Award
        }
      ]);
    } else {
      // Beta preview statistics with sample data
      setStats([
        {
          title: "Total Earnings",
          value: hasRealBookings ? formatJMD(vector.totalEarnings) : "",
          subtitle: "Your first booking",
          icon: DollarSign,
          isEmpty: true
        },
        {
          title: "Market Potential",
          value: "", 
          subtitle: `${professionalProfile.address?.[0]?.parish || 'Your'} area`,
          icon: TrendingUp,
          isEmpty: true
        },
        {
          title: "Service Rate",
          value: professionalProfile.professional_service?.[0]?.service?.base_price ? 
            formatJMD(professionalProfile.professional_service[0].service.base_price) : "",
          subtitle: "Starting price",
          icon: BarChart3,
          isEmpty: !professionalProfile.professional_service?.[0]?.service?.base_price
        },
        {
          title: "Services Ready",
          value: professionalProfile.professional_service?.length || 0,
          subtitle: "Active offerings",
          icon: Award,
          isEmpty: false
        }
      ]);
    }
  };

  const formatJMD = (amount) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!stats) return <div>Loading statistics...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        if (stat.isEmpty) {
          // Empty state card
          return (
            <Card key={index} className="border-2 border-dashed border-muted bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="h-6 w-16 bg-muted-foreground/20 rounded animate-pulse" />
                    <p className="text-xs text-muted-foreground/80">{stat.subtitle}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 opacity-60">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        // Populated card
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.change && (
                      <Badge variant="default" className="text-xs">
                        {stat.change}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// 3. ENHANCED TENSOR COMPONENT - DB Integration
// ============================================================================

// Updated Tensor.jsx with DB connection
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser'; // Your user hook
import { supabase } from '@/lib/supabase'; // Your Supabase client
import { AnalyticsDataService } from '@/services/AnalyticsDataService';

export default function Tensor() {
  const { user } = useUser();
  const [vector, setAnalyticsData] = useState(null);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideEarnings, setHideEarnings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [showPreview, setShowPreview] = useState(false);

  const dataService = new AnalyticsDataService(supabase, user?.professionalId);

  useEffect(() => {
    if (user?.professionalId) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load professional profile first
      const profile = await dataService.getProfessionalProfile();
      setProfessionalProfile(profile);
      
      // Try to load real booking data
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      };
      
      const bookingAnalytics = await dataService.getBookingAnalytics(dateRange);
      
      if (bookingAnalytics.length === 0) {
        // No real data, generate sample analytics
        const sampleData = dataService.generateSampleAnalytics(profile, dateRange);
        setAnalyticsData(sampleData);
        setShowPreview(true); // Enable preview mode for beta users
      } else {
        // Use real booking data
        setAnalyticsData({
          dailyData: bookingAnalytics,
          totalEarnings: bookingAnalytics.reduce((sum, day) => sum + day.earnings, 0),
          totalBookings: bookingAnalytics.reduce((sum, day) => sum + day.bookings, 0)
        });
      }
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  const hasRealBookings = vector?.totalBookings > 0;

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header with real data indicators */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {professionalProfile?.account?.first_name}'s Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasRealBookings ? 'Live Data' : 'Preview Mode'} • 
              {professionalProfile?.address?.[0]?.parish || 'Jamaica'} Market • 
              {professionalProfile?.professional_service?.length || 0} Services
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant={layoutMode === 'stack' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('stack')}
            >
              <LayoutDashboard className="h-3 w-3" />
            </Button>
            <Button
              variant={layoutMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('grid')}
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
          </div>

          {/* Earnings Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHideEarnings(!hideEarnings)}
            className="gap-2"
          >
            {hideEarnings ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {hideEarnings ? 'Show' : 'Hide'}
          </Button>
          
          <Badge variant={hasRealBookings ? "default" : "secondary"}>
            {hasRealBookings ? 'Live Data' : 'Preview Mode'}
          </Badge>
        </div>
      </div>

      {/* Enhanced Components with real/sample data */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Statistics with real professional data */}
          <div className="lg:col-span-4 space-y-6">
            <Statistics 
              vector={vector}
              professionalProfile={professionalProfile}
            />
          </div>

          {/* Main Chart with parish analytics */}
          <div className="lg:col-span-8">
            <EnhancedIncomeInsights 
              vector={vector}
              professionalProfile={professionalProfile}
              hideEarnings={hideEarnings}
              showPreview={showPreview}
              hasRealBookings={hasRealBookings}
            />
          </div>

          {/* Parish Analytics - Jamaica specific */}
          <div className="lg:col-span-12">
            <JamaicaParishAnalytics 
              parishData={vector?.parishAnalytics}
              currentParish={professionalProfile?.address?.[0]?.parish}
              hideEarnings={hideEarnings}
            />
          </div>
        </div>
      ) : (
        // Original stack layout
        <div className="space-y-6">
          <Statistics vector={vector} professionalProfile={professionalProfile} />
          <EnhancedIncomeInsights {...props} />
          <JamaicaParishAnalytics {...props} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. SUPABASE REAL-TIME SUBSCRIPTIONS (Future)
// ============================================================================

// hooks/useRealtimeAnalytics.js
export function useRealtimeAnalytics(professionalId) {
  const [vector, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (!professionalId) return;

    // Subscribe to booking changes
    const bookingSubscription = supabase
      .channel('booking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking',
          filter: `professional_id=eq.${professionalId}`
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          // Refresh analytics data
          refreshAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingSubscription);
    };
  }, [professionalId]);

  const refreshAnalytics = () => {
    // Reload analytics data when bookings change
    // This ensures real-time updates to earnings
  };

  return vector;
}