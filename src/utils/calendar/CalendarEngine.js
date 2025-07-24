// /src/utils/calendar/CalendarEngine.js
// Scalable Calendar Engine for handling all appointment modes

export class CalendarEngine {
  static MODE_TYPES = {
    DIRECT: 'direct',           // Direct booking with specific professional
    TARGETED: 'targeted',       // Targeted to selected professionals
    MARKETPLACE: 'marketplace', // Open marketplace request
    RECURRING: 'recurring',     // For subscription-based services
    FLEXIBLE: 'flexible'        // Future: AI-optimized scheduling
  }

  static SLOT_TYPES = {
    AVAILABLE: 'available',     // Professional confirmed availability
    PREFERRED: 'preferred',     // Customer time preference (marketplace)
    SUGGESTED: 'suggested',     // AI/system suggested times
    BLOCKED: 'blocked',         // Unavailable
    BOOKED: 'booked'           // Already taken
  }

  /**
   * Universal availability fetcher - handles all modes
   */
  static async getAvailability(options = {}) {
    const {
      mode = this.MODE_TYPES.MARKETPLACE,
      professionalId = null,
      selectedProfessionals = [],
      serviceId = null,
      startDate,
      endDate,
      duration = 60,
      customerPreferences = {},
      includePreferredTimes = true
    } = options

    console.log('🔄 CalendarEngine.getAvailability called with:', {
      mode,
      professionalId,
      selectedProfessionalsCount: selectedProfessionals.length,
      dateRange: `${startDate} to ${endDate}`
    })

    switch (mode) {
      case this.MODE_TYPES.DIRECT:
        return await this._getDirectAvailability(professionalId, startDate, endDate, duration)
      
      case this.MODE_TYPES.TARGETED:
        return await this._getTargetedAvailability(selectedProfessionals, startDate, endDate, duration)
      
      case this.MODE_TYPES.MARKETPLACE:
        return await this._getMarketplaceAvailability(serviceId, startDate, endDate, duration, customerPreferences)
      
      case this.MODE_TYPES.RECURRING:
        return await this._getRecurringAvailability(options)
      
      case this.MODE_TYPES.FLEXIBLE:
        return await this._getFlexibleAvailability(options)
      
      default:
        throw new Error(`Unsupported calendar mode: ${mode}`)
    }
  }

  /**
   * Direct Mode: Get specific professional's real availability
   */
  static async _getDirectAvailability(professionalId, startDate, endDate, duration) {
    try {
      const response = await fetch(
        `/api/professionals/${professionalId}/appointment-availability?` +
        `start_date=${startDate}&end_date=${endDate}&slot_duration=${duration}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch professional availability: ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        mode: this.MODE_TYPES.DIRECT,
        slots: data.available_slots?.map(slot => ({
          ...slot,
          type: this.SLOT_TYPES.AVAILABLE,
          professionalId,
          confidence: 1.0
        })) || [],
        metadata: {
          professionalId,
          totalSlots: data.available_slots?.length || 0,
          source: 'professional_calendar'
        }
      }
    } catch (error) {
      console.error('❌ Direct availability fetch error:', error)
      return {
        mode: this.MODE_TYPES.DIRECT,
        slots: [],
        error: error.message,
        metadata: { professionalId, source: 'error' }
      }
    }
  }

  /**
   * Targeted Mode: Aggregate availability from selected professionals
   */
  static async _getTargetedAvailability(selectedProfessionals, startDate, endDate, duration) {
    try {
      // Fetch availability from all selected professionals in parallel
      const availabilityPromises = selectedProfessionals.map(async (prof) => {
        try {
          const response = await fetch(
            `/api/professionals/${prof.professional_id}/appointment-availability?` +
            `start_date=${startDate}&end_date=${endDate}&slot_duration=${duration}`
          )
          
          if (!response.ok) return { professionalId: prof.professional_id, slots: [] }
          
          const data = await response.json()
          return {
            professionalId: prof.professional_id,
            professionalName: `${prof.first_name} ${prof.last_name}`,
            slots: data.available_slots || []
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch availability for professional ${prof.professional_id}:`, error)
          return { professionalId: prof.professional_id, slots: [] }
        }
      })

      const results = await Promise.all(availabilityPromises)
      
      // Aggregate and merge overlapping time slots
      const aggregatedSlots = this._aggregateAvailabilitySlots(results)
      
      return {
        mode: this.MODE_TYPES.TARGETED,
        slots: aggregatedSlots,
        metadata: {
          selectedProfessionals: selectedProfessionals.length,
          availableProfessionals: results.filter(r => r.slots.length > 0).length,
          source: 'targeted_aggregate'
        }
      }
    } catch (error) {
      console.error('❌ Targeted availability fetch error:', error)
      return {
        mode: this.MODE_TYPES.TARGETED,
        slots: [],
        error: error.message,
        metadata: { selectedProfessionals: selectedProfessionals.length, source: 'error' }
      }
    }
  }

  /**
   * Marketplace Mode: Generate optimal time preferences based on service patterns
   */
  static async _getMarketplaceAvailability(serviceId, startDate, endDate, duration, customerPreferences) {
    try {
      // Fetch popular booking patterns for this service type
      const response = await fetch(
        `/api/services/${serviceId}/booking-patterns?` +
        `start_date=${startDate}&end_date=${endDate}&duration=${duration}`
      )
      
      let popularTimes = []
      if (response.ok) {
        const data = await response.json()
        popularTimes = data.popular_times || []
      }
      
      // Generate intelligent time preferences
      const preferredSlots = this._generateIntelligentTimeSlots(
        startDate, 
        endDate, 
        duration, 
        popularTimes, 
        customerPreferences
      )
      
      return {
        mode: this.MODE_TYPES.MARKETPLACE,
        slots: preferredSlots,
        metadata: {
          serviceId,
          totalSlots: preferredSlots.length,
          source: 'market_intelligence',
          popularTimes: popularTimes.length
        }
      }
    } catch (error) {
      console.error('❌ Marketplace availability generation error:', error)
      
      // Fallback to basic business hours pattern
      const fallbackSlots = this._generateBusinessHoursSlots(startDate, endDate, duration)
      
      return {
        mode: this.MODE_TYPES.MARKETPLACE,
        slots: fallbackSlots,
        error: error.message,
        metadata: { serviceId, source: 'fallback_business_hours' }
      }
    }
  }

  /**
   * Future: Recurring availability for subscription services
   */
  static async _getRecurringAvailability(options) {
    // Implementation for recurring appointment patterns
    // e.g., weekly cleaning, monthly maintenance
    return {
      mode: this.MODE_TYPES.RECURRING,
      slots: [],
      metadata: { source: 'recurring_pattern' }
    }
  }

  /**
   * Future: AI-optimized flexible scheduling
   */
  static async _getFlexibleAvailability(options) {
    // Implementation for AI-suggested optimal times
    // Based on professional performance, customer history, etc.
    return {
      mode: this.MODE_TYPES.FLEXIBLE,
      slots: [],
      metadata: { source: 'ai_optimization' }
    }
  }

  /**
   * Aggregate multiple professional availabilities into unified slots
   */
  static _aggregateAvailabilitySlots(professionalResults) {
    const slotMap = new Map()
    
    professionalResults.forEach(({ professionalId, professionalName, slots }) => {
      slots.forEach(slot => {
        const key = `${slot.date}-${slot.time}`
        
        if (!slotMap.has(key)) {
          slotMap.set(key, {
            ...slot,
            type: this.SLOT_TYPES.AVAILABLE,
            availableProfessionals: [],
            confidence: 0
          })
        }
        
        const aggregatedSlot = slotMap.get(key)
        aggregatedSlot.availableProfessionals.push({
          professionalId,
          professionalName
        })
        aggregatedSlot.confidence = Math.min(aggregatedSlot.confidence + 0.2, 1.0)
      })
    })
    
    return Array.from(slotMap.values()).sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    )
  }

  /**
   * Generate intelligent time slots based on service patterns and preferences
   */
  static _generateIntelligentTimeSlots(startDate, endDate, duration, popularTimes, preferences) {
    const slots = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Default business hours if no popular times
    const defaultHours = popularTimes.length > 0 ? popularTimes : [
      { hour: 8, popularity: 0.6 },
      { hour: 9, popularity: 0.8 },
      { hour: 10, popularity: 0.9 },
      { hour: 11, popularity: 0.7 },
      { hour: 13, popularity: 0.6 }, // 1 PM
      { hour: 14, popularity: 0.8 },
      { hour: 15, popularity: 0.9 },
      { hour: 16, popularity: 0.7 }
    ]
    
    let currentDate = new Date(start)
    
    while (currentDate <= end) {
      // Skip weekends for business services (configurable)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }
      
      // Generate slots for popular hours
      defaultHours.forEach(({ hour, popularity }) => {
        const slotTime = new Date(currentDate)
        slotTime.setHours(hour, 0, 0, 0)
        
        // Apply customer preferences (e.g., morning vs afternoon preference)
        let adjustedPopularity = popularity
        if (preferences.preferredTimeOfDay) {
          if (preferences.preferredTimeOfDay === 'morning' && hour < 12) {
            adjustedPopularity += 0.2
          } else if (preferences.preferredTimeOfDay === 'afternoon' && hour >= 12) {
            adjustedPopularity += 0.2
          }
        }
        
        slots.push({
          date: this._formatDate(slotTime),
          time: slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          datetime: slotTime.toISOString(),
          type: this.SLOT_TYPES.PREFERRED,
          confidence: Math.min(adjustedPopularity, 1.0),
          popularity: adjustedPopularity,
          metadata: {
            isWeekend: false,
            timeOfDay: hour < 12 ? 'morning' : 'afternoon'
          }
        })
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  }

  /**
   * Fallback: Generate basic business hours slots
   */
  static _generateBusinessHoursSlots(startDate, endDate, duration) {
    const slots = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    let currentDate = new Date(start)
    
    while (currentDate <= end) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
        for (let hour = 8; hour <= 17; hour++) {
          const slotTime = new Date(currentDate)
          slotTime.setHours(hour, 0, 0, 0)
          
          slots.push({
            date: this._formatDate(slotTime),
            time: slotTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            datetime: slotTime.toISOString(),
            type: this.SLOT_TYPES.PREFERRED,
            confidence: 0.7,
            metadata: { source: 'business_hours_fallback' }
          })
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return slots
  }

  /**
   * Book a slot across all calendar systems
   */
  static async bookSlot(options = {}) {
    const {
      mode,
      slot,
      customerId,
      professionalId = null,
      serviceId,
      appointmentData
    } = options

    console.log('📅 CalendarEngine.bookSlot called:', { mode, customerId, professionalId, serviceId })

    try {
      // Create the appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentData,
          session: slot.datetime,
          mode
        })
      })

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.status}`)
      }

      const result = await response.json()

      // Update calendar systems based on mode
      await this._updateCalendarSystems(mode, slot, result.appointment)

      return {
        success: true,
        appointment: result.appointment,
        mode
      }
    } catch (error) {
      console.error('❌ Booking error:', error)
      throw error
    }
  }

  /**
   * Update various calendar systems after booking
   */
  static async _updateCalendarSystems(mode, slot, appointment) {
    // Update professional calendars, send notifications, etc.
    console.log('🔄 Updating calendar systems for mode:', mode)
    
    switch (mode) {
      case this.MODE_TYPES.DIRECT:
        // Update professional's calendar immediately
        break
      case this.MODE_TYPES.TARGETED:
        // Notify selected professionals
        break
      case this.MODE_TYPES.MARKETPLACE:
        // Broadcast to marketplace
        break
    }
  }

  /**
   * Utility: Format date consistently
   */
  static _formatDate(date) {
    return date.toISOString().split('T')[0]
  }

  /**
   * Get next available slot for any mode
   */
  static async getNextAvailableSlot(mode, options = {}) {
    const today = new Date()
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const availability = await this.getAvailability({
      mode,
      startDate: this._formatDate(today),
      endDate: this._formatDate(oneWeekLater),
      ...options
    })
    
    return availability.slots.length > 0 ? availability.slots[0] : null
  }

  /**
   * Analytics: Get booking patterns for optimization
   */
  static async getBookingAnalytics(serviceId, timeframe = '30d') {
    try {
      const response = await fetch(`/api/analytics/booking-patterns?service_id=${serviceId}&timeframe=${timeframe}`)
      return await response.json()
    } catch (error) {
      console.error('❌ Analytics fetch error:', error)
      return { patterns: [], error: error.message }
    }
  }
}