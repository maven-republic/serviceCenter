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
        session,
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