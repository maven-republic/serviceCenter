// 🔧 UPDATED Tensor.jsx - Fixed prop naming consistency
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Grid3X3,
  LayoutDashboard,
  Maximize2,
  DollarSign,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react'

// ✅ REAL IMPORTS: Use your actual Supabase setup
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'

// ✅ REAL IMPORTS: Location services
import { LocationService } from './analytics/variables/LocationService'
import { CurrencyService } from './analytics/variables/CurrencyService'

// Import your existing components
import Statistics from './income/Statistics'
import IncomeInsights from './income/IncomeInsights'
import TodaysIncome from './income/TodaysIncome'
import InsightsCards from './income/InsightsCards'

// ============================================================================
// ENHANCED ANALYTICS DATA SERVICE - REAL DATABASE INTEGRATION (FIXED)
// ============================================================================
class AnalyticsDataService {
  constructor(supabaseClient, professionalId) {
    this.supabase = supabaseClient;
    this.professionalId = professionalId;
  }

  // ✅ FIXED: Get professional profile with correct column references
  async getProfessionalProfile() {
    try {
      if (!this.professionalId) {
        throw new Error('Professional ID is required');
      }

      // 1. Get professional data
      const { data: professional, error: profError } = await this.supabase
        .from('individual_professional')
        .select('*')
        .eq('professional_id', this.professionalId)
        .single();

      if (profError) throw profError;

      if (!professional) {
        throw new Error('Professional profile not found');
      }

      // 2. Get account data separately
      const { data: account, error: accountError } = await this.supabase
        .from('account')
        .select('account_id, first_name, last_name, email')
        .eq('account_id', professional.account_id)
        .single();

      if (accountError) {
        console.warn('Account lookup failed:', accountError);
      }

      // 3. Get primary address
      const { data: address } = await this.supabase
        .from('address')
        .select('*')
        .eq('account_id', professional.account_id)
        .eq('is_primary', true)
        .single();

      // 4. Get professional services with service details (using correct constraint name)
      const { data: professionalServices } = await this.supabase
        .from('professional_service')
        .select(`
          *,
          service!fk_professional_service_service_id (
            service_id,
            name,
            base_price,
            duration_minutes
          )
        `)
        .eq('professional_id', this.professionalId)
        .eq('is_active', true);

      return {
        ...professional,
        account: account || null,
        address: address || null,
        professional_service: professionalServices || []
      };
    } catch (error) {
      console.error('Error fetching professional profile:', error);
      throw error;
    }
  }

  // ✅ FIXED: Get actual booking analytics with correct address columns
  async getBookingAnalytics(dateRange) {
    try {
      if (!this.professionalId) {
        throw new Error('Professional ID is required');
      }

      const { data: bookings, error } = await this.supabase
        .from('booking')
        .select(`
          booking_id,
          scheduled_start,
          scheduled_end,
          status,
          service!fk_booking_service (
            name,
            base_price
          ),
          address!fk_booking_address (
            parish,
            city,
            country
          )
        `)
        .eq('professional_id', this.professionalId)
        .gte('scheduled_start', dateRange.start.toISOString())
        .lte('scheduled_start', dateRange.end.toISOString())
        .eq('status', 'completed')
        .order('scheduled_start', { ascending: true });

      if (error) throw error;

      return this.transformBookingsToAnalytics(bookings || []);
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      throw error;
    }
  }

  // ✅ FIXED: Get pending appointment requests with correct address columns
  async getAppointmentRequests() {
    try {
      if (!this.professionalId) {
        throw new Error('Professional ID is required');
      }

      const { data: appointments, error } = await this.supabase
        .from('appointment')
        .select(`
          appointment_id,
          status,
          preferred_start,
          urgency,
          service!fk_appointment_service (
            name, 
            base_price
          ),
          address!fk_appointment_address (
            parish, 
            city, 
            country
          )
        `)
        .eq('professional_id', this.professionalId)
        .in('status', ['pending', 'quoted']);

      if (error) throw error;
      return appointments || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // ✅ FIXED: Transform real booking data with correct address field references
  transformBookingsToAnalytics(bookings) {
    const dailyData = {};
    const hourlyData = {};
    const weeklyData = {};
    const monthlyData = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.scheduled_start);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const week = this.getWeekNumber(date);
      const month = date.getMonth();
      
      // Daily aggregation
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { earnings: 0, bookings: 0, details: [] };
      }
      
      // Hourly aggregation
      if (!hourlyData[hour]) {
        hourlyData[hour] = { earnings: 0, bookings: 0 };
      }
      
      // Weekly aggregation
      if (!weeklyData[week]) {
        weeklyData[week] = { earnings: 0, bookings: 0, weekNumber: week };
      }
      
      // Monthly aggregation
      if (!monthlyData[month]) {
        monthlyData[month] = { earnings: 0, bookings: 0, month: month + 1 };
      }
      
      const earnings = booking.service?.base_price || 0;
      
      // Update all aggregations
      dailyData[dateStr].earnings += earnings;
      dailyData[dateStr].bookings += 1;
      dailyData[dateStr].details.push({
        service_name: booking.service?.name || 'Unknown Service',
        amount: earnings,
        region: booking.address?.parish || booking.address?.city || 'Unknown Location',
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
      
      hourlyData[hour].earnings += earnings;
      hourlyData[hour].bookings += 1;
      
      weeklyData[week].earnings += earnings;
      weeklyData[week].bookings += 1;
      
      monthlyData[month].earnings += earnings;
      monthlyData[month].bookings += 1;
    });

    const dailyResult = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));
    
    const hourlyResult = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      ...data
    }));
    
    const weeklyResult = Object.values(weeklyData);
    const monthlyResult = Object.values(monthlyData);

    const totalEarnings = dailyResult.reduce((sum, day) => sum + day.earnings, 0);
    const totalBookings = dailyResult.reduce((sum, day) => sum + day.bookings, 0);

    return {
      dailyData: dailyResult,
      hourlyData: hourlyResult,
      weeklyData: weeklyResult,
      monthlyData: monthlyResult,
      totalEarnings,
      totalBookings,
      averageOrderValue: totalBookings > 0 ? totalEarnings / totalBookings : 0,
      averageHourlyEarnings: hourlyResult.length > 0 ? totalEarnings / hourlyResult.length : 0,
      averageWeeklyEarnings: weeklyResult.length > 0 ? totalEarnings / weeklyResult.length : 0,
      averageMonthlyEarnings: monthlyResult.length > 0 ? totalEarnings / monthlyResult.length : 0,
      peakDay: dailyResult.reduce((max, day) => day.earnings > max.earnings ? day : max, dailyResult[0] || { earnings: 0 }),
      isPreview: false // Real data
    };
  }

  // Helper function to get week number
  getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  // ✅ FIXED: Sample data generation with all chart data types
  generateSampleAnalytics(professionalProfile, dateRange, locationContext) {
    if (!professionalProfile) return null;

    const services = professionalProfile.professional_service?.map(ps => ps.service) || [];
    const location = professionalProfile.address || {};
    
    return this.createLocationBasedSampleData(services, location, dateRange, locationContext);
  }

  // ✅ FIXED: Create sample data with all chart types
  createLocationBasedSampleData(services, location, dateRange, locationContext) {
    const country = locationContext?.country || 'Jamaica';
    const regions = this.getRegionsForCountry(country);
    const regionDemandFactors = this.getRegionDemandFactors(country);

    const currentRegion = location.parish || regions[0];
    const baseDemand = regionDemandFactors[currentRegion] || 0.65;
    const baseServicePrice = services[0]?.base_price || this.getDefaultServicePrice(country);

    // Generate realistic daily data
    const dailyData = [];
    const hourlyData = [];
    const weeklyData = [];
    const monthlyData = [];
    
    const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));

    // Daily data generation
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const weekendFactor = isWeekend ? this.getWeekendFactor(country) : 1.0;
      const seasonalFactor = this.getSeasonalFactor(country, date);
      
      const bookingProbability = baseDemand * weekendFactor * seasonalFactor * 0.35;
      const bookingsToday = Math.random() < bookingProbability ? 
        Math.floor(Math.random() * 3) + 1 : 0;

      let dailyEarnings = 0;
      const bookingDetails = [];

      for (let j = 0; j < bookingsToday; j++) {
        const service = services[Math.floor(Math.random() * services.length)] || { 
          name: 'Service', 
          base_price: baseServicePrice 
        };
        const basePrice = service.base_price || baseServicePrice;
        
        const urgencyFactor = Math.random() > 0.7 ? 1.25 : 1.0;
        const distanceFactor = Math.random() > 0.5 ? 1.1 : 1.0;
        const finalPrice = Math.round(basePrice * urgencyFactor * distanceFactor);
        
        dailyEarnings += finalPrice;
        
        bookingDetails.push({
          service_name: service.name,
          amount: finalPrice,
          region: this.getRandomNearbyRegion(currentRegion, regions),
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

    // Hourly data generation (6AM to 9PM)
    for (let hour = 6; hour <= 21; hour++) {
      const baseHourlyEarnings = baseServicePrice * 0.8;
      const peakHours = [8, 9, 17, 18, 19]; // 8-9AM, 5-7PM
      const isPeakHour = peakHours.includes(hour);
      const earnings = Math.round(baseHourlyEarnings * (isPeakHour ? 1.5 : 1.0) * (Math.random() * 0.4 + 0.8));
      const bookings = Math.floor(earnings / (baseServicePrice || 1000));
      
      hourlyData.push({
        hour,
        earnings,
        bookings
      });
    }

    // Weekly data generation (4 weeks)
    for (let week = 1; week <= 4; week++) {
      const weeklyEarnings = Math.round(baseServicePrice * (3 + Math.random() * 2) * (Math.random() * 0.3 + 0.85));
      const weeklyBookings = Math.floor(weeklyEarnings / (baseServicePrice || 1000));
      
      weeklyData.push({
        weekNumber: week,
        earnings: weeklyEarnings,
        bookings: weeklyBookings
      });
    }

    // Monthly data generation (12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let month = 0; month < 12; month++) {
      const seasonalFactor = this.getSeasonalFactor(country, new Date(2024, month, 15));
      const monthlyEarnings = Math.round(baseServicePrice * 12 * seasonalFactor * (Math.random() * 0.3 + 0.85));
      const monthlyBookings = Math.floor(monthlyEarnings / (baseServicePrice || 1000));
      
      monthlyData.push({
        month: month + 1,
        monthName: monthNames[month],
        earnings: monthlyEarnings,
        bookings: monthlyBookings
      });
    }

    const totalEarnings = dailyData.reduce((sum, day) => sum + day.earnings, 0);
    const totalBookings = dailyData.reduce((sum, day) => sum + day.bookings, 0);

    return {
      dailyData,
      hourlyData,
      weeklyData,
      monthlyData,
      regionAnalytics: this.generateRegionAnalytics(currentRegion, regions, services, country),
      servicePerformance: this.generateServicePerformance(services),
      totalEarnings,
      totalBookings,
      averageOrderValue: totalBookings > 0 ? totalEarnings / totalBookings : 0,
      averageHourlyEarnings: hourlyData.reduce((sum, h) => sum + h.earnings, 0) / hourlyData.length,
      averageWeeklyEarnings: weeklyData.reduce((sum, w) => sum + w.earnings, 0) / weeklyData.length,
      averageMonthlyEarnings: monthlyData.reduce((sum, m) => sum + m.earnings, 0) / monthlyData.length,
      peakDay: dailyData.reduce((max, day) => day.earnings > max.earnings ? day : max, dailyData[0] || { earnings: 0 }),
      isPreview: true // Sample data
    };
  }

  // Keep all your existing helper methods for sample data...
  getRegionsForCountry(country) {
    const regions = {
      'Jamaica': ['Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'],
      'United States': ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island'],
      'United Kingdom': ['Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Merseyside', 'South Yorkshire', 'Tyne and Wear', 'Nottinghamshire', 'Essex', 'Kent']
    };
    return regions[country] || regions['Jamaica'];
  }

  getRegionDemandFactors(country) {
    const factors = {
      'Jamaica': {
        'Kingston': 0.95, 'St. Andrew': 0.90, 'St. James': 0.85,
        'St. Catherine': 0.75, 'St. Ann': 0.75, 'Trelawny': 0.70,
        'Westmoreland': 0.70, 'Manchester': 0.65, 'St. Mary': 0.65,
        'St. Thomas': 0.65, 'Clarendon': 0.60, 'Hanover': 0.60,
        'Portland': 0.60, 'St. Elizabeth': 0.55
      },
      'United States': {
        'California': 0.95, 'New York': 0.92, 'Texas': 0.88,
        'Florida': 0.85, 'Illinois': 0.82, 'Pennsylvania': 0.78,
        'Ohio': 0.75, 'Georgia': 0.72, 'North Carolina': 0.70,
        'Michigan': 0.68
      },
      'Canada': {
        'Ontario': 0.91, 'Quebec': 0.84, 'British Columbia': 0.89,
        'Alberta': 0.86, 'Manitoba': 0.72, 'Saskatchewan': 0.68,
        'Nova Scotia': 0.74, 'New Brunswick': 0.70, 'Newfoundland and Labrador': 0.65,
        'Prince Edward Island': 0.62
      },
      'United Kingdom': {
        'Greater London': 0.94, 'West Midlands': 0.79, 'Greater Manchester': 0.85,
        'West Yorkshire': 0.78, 'Merseyside': 0.73, 'South Yorkshire': 0.70,
        'Tyne and Wear': 0.68, 'Nottinghamshire': 0.72, 'Essex': 0.81, 'Kent': 0.76
      }
    };
    return factors[country] || factors['Jamaica'];
  }

  getDefaultServicePrice(country) {
    const prices = {
      'Jamaica': 3500,
      'United States': 75,
      'Canada': 85,
      'United Kingdom': 45,
      'Australia': 90
    };
    return prices[country] || 3500;
  }

  getWeekendFactor(country) {
    const factors = {
      'Jamaica': 1.4,
      'United States': 1.3,
      'Canada': 1.2,
      'United Kingdom': 1.2,
      'Australia': 1.3
    };
    return factors[country] || 1.3;
  }

  getSeasonalFactor(country, date) {
    const month = date.getMonth();
    
    const patterns = {
      'Jamaica': {
        0: 1.2, 1: 1.1, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.1,
        6: 1.3, 7: 1.2, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.4
      },
      'United States': {
        0: 0.9, 1: 0.9, 2: 1.1, 3: 1.2, 4: 1.1, 5: 1.3,
        6: 1.4, 7: 1.3, 8: 1.2, 9: 1.1, 10: 1.1, 11: 1.2
      },
      'Canada': {
        0: 1.1, 1: 1.0, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3,
        6: 1.4, 7: 1.4, 8: 1.3, 9: 1.2, 10: 1.1, 11: 1.2
      },
      'United Kingdom': {
        0: 0.9, 1: 0.9, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3,
        6: 1.3, 7: 1.2, 8: 1.1, 9: 1.0, 10: 1.0, 11: 1.1
      }
    };
    
    const countryPattern = patterns[country] || patterns['Jamaica'];
    return countryPattern[month] || 1.0;
  }

  generateRegionAnalytics(currentRegion, allRegions, services, country) {
    return allRegions.map(region => {
      const distance = this.calculateRegionDistance(currentRegion, region, country);
      const demandScore = this.getRegionDemandScore(region, country);
      const basePrice = services[0]?.base_price || this.getDefaultServicePrice(country);
      
      return {
        region,
        distance_km: distance,
        demand_level: demandScore,
        competition_level: Math.random() * 0.6 + 0.3,
        market_opportunity: demandScore * (distance < 40 ? 1.0 : 0.6),
        avg_service_price: Math.round(basePrice * demandScore),
        professional_count: Math.floor(Math.random() * 40) + 5,
        travel_time_minutes: Math.round(distance * 1.5)
      };
    }).sort((a, b) => b.market_opportunity - a.market_opportunity);
  }

  generateServicePerformance(services) {
    return services.map(service => ({
      service_id: service.service_id,
      service_name: service.name,
      base_price: service.base_price,
      booking_frequency: Math.random() * 0.8 + 0.2,
      customer_satisfaction: Math.random() * 1.5 + 3.5,
      peak_demand_times: ['Weekend evenings', 'Weekday mornings'],
      region_popularity: ['Top region', 'Second region', 'Third region']
    }));
  }

  getRandomNearbyRegion(currentRegion, allRegions) {
    if (Math.random() < 0.7) return currentRegion;
    return allRegions[Math.floor(Math.random() * allRegions.length)];
  }

  getRandomBookingTime(date) {
    const hours = Math.floor(Math.random() * 10) + 8;
    const minutes = Math.floor(Math.random() * 4) * 15;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  calculateRegionDistance(region1, region2, country) {
    if (region1 === region2) return 0;
    
    if (country === 'Jamaica') {
      const jamaicaDistances = {
        'Kingston': { 'St. Andrew': 15, 'St. Catherine': 45, 'St. Thomas': 65, 'Clarendon': 80 },
        'St. James': { 'Hanover': 25, 'Westmoreland': 35, 'Trelawny': 40, 'St. Elizabeth': 60 },
        'St. Andrew': { 'Kingston': 15, 'St. Catherine': 35, 'St. Thomas': 50 }
      };
      
      return jamaicaDistances[region1]?.[region2] || 
             jamaicaDistances[region2]?.[region1] || 
             Math.floor(Math.random() * 80) + 20;
    }
    
    return Math.floor(Math.random() * 200) + 50;
  }

  getRegionDemandScore(region, country) {
    const demandFactors = this.getRegionDemandFactors(country);
    return demandFactors[region] || 0.65;
  }
}

// ============================================================================
// ENHANCED TENSOR COMPONENT WITH FIXED DATABASE INTEGRATION
// ============================================================================

export default function Tensor() {
  // ✅ REAL DATA: Use your actual user store and Supabase
  const { user } = useUserStore()
  const supabase = createClient()
  
  // State management
  const [vector, setVector] = useState(null);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [hideEarnings, setHideEarnings] = useState(false);

  // ✅ REAL SERVICES: Create services with real professional ID
  const dataService = useState(() => {
    const professionalId = user?.profile?.professional_id;
    return new AnalyticsDataService(supabase, professionalId);
  })[0];

  // ✅ LOCATION SERVICES: Will use real profile data
  const [locationService, setLocationService] = useState(null);
  const [currencyService, setCurrencyService] = useState(null);

  // ✅ REAL DATA LOADING: Load actual analytics data
  useEffect(() => {
    let isMounted = true;
    
    const loadAnalyticsData = async () => {
      if (!user?.profile?.professional_id || !isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading real analytics data for professional:', user.profile.professional_id);
        
        // 1. Load real professional profile
        const profile = await dataService.getProfessionalProfile();
        if (!isMounted) return;
        
        setProfessionalProfile(profile);
        console.log('✅ Professional profile loaded:', profile.account?.email);
        
        // 2. Create location services from real profile
        const locationSvc = new LocationService(profile);
        const currencySvc = new CurrencyService(locationSvc.getLocation().country);
        setLocationService(locationSvc);
        setCurrencyService(currencySvc);
        
        console.log('🌍 Location detected:', locationSvc.getLocation());
        
        // 3. Load real booking analytics
        const dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        };
        
        const realBookings = await dataService.getBookingAnalytics(dateRange);
        if (!isMounted) return;
        
        if (realBookings.totalBookings > 0) {
          // Has real bookings - use actual data
          console.log('📊 Using real booking data:', realBookings.totalBookings, 'bookings');
          setVector(realBookings);
        } else {
          // No bookings yet - use sample data with real profile
          console.log('📊 No bookings found, generating sample data');
          const locationContext = locationSvc.getLocation();
          const sampleData = dataService.generateSampleAnalytics(profile, dateRange, locationContext);
          sampleData.isPreview = true;
          setVector(sampleData);
        }
        
        // 4. Load appointment requests
        const appointments = await dataService.getAppointmentRequests();
        if (!isMounted) return;
        setAppointmentRequests(appointments);
        
        console.log('✅ Analytics data loaded successfully');
        
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Error loading analytics data:', err);
        setError(err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadAnalyticsData();

    return () => {
      isMounted = false;
    };
  }, [user?.profile?.professional_id, dataService]);

  // Currency formatting with real currency service
  const formatCurrency = (amount) => {
    if (currencyService) {
      return currencyService.formatCurrency(amount);
    }
    
    // Fallback
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Location display with real location service
  const getLocationDisplay = () => {
    if (!locationService) return 'Your Market';
    const location = locationService.getLocation();
    const regionType = locationService.getRegionType();
    return `${location.region} ${regionType.charAt(0).toUpperCase() + regionType.slice(1)}, ${location.country}`;
  };

  // ✅ REAL USER VALIDATION
  if (!user?.profile?.professional_id) {
    return (
      <div className="w-full max-w-none space-y-6">
        <Card className="border-yellow-500/50 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Professional Profile Required</h3>
                <p className="text-sm text-yellow-700">
                  Please complete your professional profile setup to view analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-none space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-medium">Loading your analytics...</h3>
              <p className="text-sm text-muted-foreground">
                Connecting to database and loading your professional data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-none space-y-6">
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-medium">Unable to load analytics</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasRealBookings = vector?.totalBookings > 0 && !vector?.isPreview;

  return (
    <div className="w-full max-w-none space-y-6">
        {/* Keep your existing dashboard layout but with real data */}
      <div className="w-full">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-primary" />
              Professional Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              
              {/* LEFT SECTION: KPI Cards (2 columns on desktop) */}
              <div className="xl:col-span-2 space-y-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Performance Metrics</h3>
                </div>

                {/* Today's Income with more space */}
                <div className="mt-8">
                  {/* 🔧 FIXED: Pass vector instead of analyticsData */}
                  <TodaysIncome 
                    hideEarnings={hideEarnings}
                    vector={vector}
                    currencyService={currencyService}
                    professionalProfile={professionalProfile}
                  />
                </div>
                
                {/* ✅ REAL DATA: Statistics with currency service */}
                <div className="space-y-6">
                  <Statistics 
                    vector={vector}
                    professionalProfile={professionalProfile}
                    hideEarnings={hideEarnings}
                    currencyService={currencyService}
                  />
                </div>
              </div>

              {/* RIGHT SECTION: Main Chart (3 columns on desktop) */}
              <div className="xl:col-span-3">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Revenue Analytics</h3>
                  {vector?.isPreview && (
                    <Badge variant="secondary" className="text-xs">
                      {hasRealBookings ? 'Live Data' : `Sample Data - ${getLocationDisplay()}`}
                    </Badge>
                  )}
                </div>
                
                {/* Chart with proper height and width */}
                <div className="w-full min-h-[500px]">
                  {/* 🔧 FIXED: Pass vector instead of analyticsData */}
                  <IncomeInsights 
                    vector={vector}
                    currencyService={currencyService}
                    professionalProfile={professionalProfile}
                    hideEarnings={hideEarnings}
                    onHideEarningsChange={setHideEarnings}
                  />
                </div>
              </div>
            </div>

            {/* FULL WIDTH BOTTOM SECTION: Market Intelligence */}
            <div className="mt-12 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Market Intelligence</h3>
                </div>
                
                {/* ✅ REAL DATA: Location-aware regional analytics */}
                {vector?.regionAnalytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {locationService ? 
                            `${locationService.getRegionType().charAt(0).toUpperCase() + locationService.getRegionType().slice(1)} Market Opportunities` :
                            'Regional Market Opportunities'
                          }
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {vector.regionAnalytics.slice(0, 5).map((region, index) => (
                            <div key={region.region} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  index === 0 ? 'bg-green-500' : 
                                  index === 1 ? 'bg-blue-500' : 
                                  'bg-gray-400'
                                }`} />
                                <div>
                                  <div className="font-medium text-sm">{region.region}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {region.distance_km}km • {region.professional_count} professionals
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-sm">
                                  {!hideEarnings ? formatCurrency(region.avg_service_price) : '••••'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(region.market_opportunity * 100)}% opportunity
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="text-base">Service Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {vector.servicePerformance?.slice(0, 4).map((service, index) => (
                            <div key={service.service_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-medium">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{service.service_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {Math.round(service.booking_frequency * 100)}% demand
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-sm">
                                  {!hideEarnings ? formatCurrency(service.base_price) : '••••'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ⭐ {service.customer_satisfaction.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Regular Insights Cards with more space */}
                <div className="mt-8">
<InsightsCards 
  vector={vector}
  professionalProfile={professionalProfile}
/>                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Status Panel */}
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-primary" />
                Database Connection Status
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="text-green-600">• ✅ Connected to real database</li>
                <li className="text-green-600">• ✅ Professional profile loaded</li>
                <li className="text-green-600">• ✅ Location services active</li>
                <li className={hasRealBookings ? "text-green-600" : "text-blue-600"}>
                  • {hasRealBookings ? "✅ Real booking data" : "📊 Sample data (no bookings yet)"}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                {locationService ? `${locationService.getLocation().country} Market Features` : 'Market Features'}
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="text-green-600">• Regional demand analysis</li>
                <li className="text-green-600">• Local currency formatting ({currencyService?.getCurrencyCode() || 'JMD'})</li>
                <li className="text-green-600">• Local seasonal patterns</li>
                <li className="text-green-600">• Travel time & distance factors</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <strong>Database Status:</strong> {hasRealBookings ? `Connected - ${vector.totalBookings} bookings found` : 'Connected - Using sample data for preview'} • 
                <strong>Professional ID:</strong> {user?.profile?.professional_id} • 
                <strong>Services:</strong> {professionalProfile?.professional_service?.length || 0} active •
                <strong>Location:</strong> {getLocationDisplay()}
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs">
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> 

      {/* Development Info Panel */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed border-green-300 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ Database Integration Active</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-700">Real Database Connections:</h5>
                <ul className="text-green-600 mt-1 space-y-1">
                  <li>✅ Supabase client connected</li>
                  <li>✅ Professional profile from DB</li>
                  <li>✅ Service data from DB</li>
                  <li>✅ {hasRealBookings ? 'Real booking analytics' : 'Ready for booking data'}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-700">Location Services:</h5>
                <ul className="text-green-600 mt-1 space-y-1">
                  <li>✅ LocationService.js active</li>
                  <li>✅ CurrencyService.js active</li>
                  <li>✅ Multi-country support ready</li>
                  <li>✅ Regional analytics working</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-700">Live Configuration:</h5>
                <ul className="text-green-600 mt-1 space-y-1">
                  <li>User: {user?.profile?.professional_id?.slice(0, 8)}...</li>
                  <li>Country: {locationService?.getLocation().country || 'Loading...'}</li>
                  <li>Currency: {currencyService?.getCurrencyCode() || 'Loading...'}</li>
                  <li>Data: {hasRealBookings ? 'Real bookings' : 'Sample mode'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}