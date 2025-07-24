// /src/utils/calendar/CalendarSynchronization.js
// Real-time calendar synchronization system

import { createClient } from '@/utils/supabase/client'
import { CalendarEngine } from './CalendarEngine'

export class CalendarSynchronization {
  static instance = null
  static subscribers = new Map()
  static supabaseClient = null

  constructor() {
    if (CalendarSynchronization.instance) {
      return CalendarSynchronization.instance
    }
    
    this.initializeSupabase()
    CalendarSynchronization.instance = this
  }

  static getInstance() {
    if (!CalendarSynchronization.instance) {
      CalendarSynchronization.instance = new CalendarSynchronization()
    }
    return CalendarSynchronization.instance
  }

  async initializeSupabase() {
    if (!CalendarSynchronization.supabaseClient) {
      CalendarSynchronization.supabaseClient = createClient()
      await this.setupRealtimeSubscriptions()
    }
  }

  /**
   * Setup real-time subscriptions for calendar-related changes
   */
  async setupRealtimeSubscriptions() {
    const supabase = CalendarSynchronization.supabaseClient

    // Subscribe to appointment changes
    supabase
      .channel('appointments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointment'
      }, (payload) => {
        this.handleAppointmentChange(payload)
      })
      .subscribe()

    // Subscribe to professional availability changes
    supabase
      .channel('availability_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'professional_availability'
      }, (payload) => {
        this.handleAvailabilityChange(payload)
      })
      .subscribe()

    // Subscribe to interest changes (affects calendar visibility)
    supabase
      .channel('interest_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interest'
      }, (payload) => {
        this.handleInterestChange(payload)
      })
      .subscribe()

    console.log('📡 Calendar synchronization subscriptions active')
  }

  /**
   * Subscribe to calendar updates for a specific context
   */
  subscribe(contextId, callback, options = {}) {
    const {
      mode = CalendarEngine.MODE_TYPES.MARKETPLACE,
      professionalId = null,
      customerId = null,
      serviceId = null
    } = options

    const subscription = {
      contextId,
      callback,
      mode,
      professionalId,
      customerId,
      serviceId,
      createdAt: Date.now()
    }

    CalendarSynchronization.subscribers.set(contextId, subscription)
    
    console.log('📅 Calendar subscription added:', {
      contextId,
      mode,
      totalSubscribers: CalendarSynchronization.subscribers.size
    })

    // Return unsubscribe function
    return () => this.unsubscribe(contextId)
  }

  /**
   * Unsubscribe from calendar updates
   */
  unsubscribe(contextId) {
    const removed = CalendarSynchronization.subscribers.delete(contextId)
    console.log('📅 Calendar subscription removed:', { contextId, removed })
    return removed
  }

  /**
   * Handle appointment changes and notify relevant subscribers
   */
  handleAppointmentChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    console.log('🔄 Appointment change detected:', {
      eventType,
      appointmentId: newRecord?.appointment_id || oldRecord?.appointment_id,
      status: newRecord?.status,
      professionalId: newRecord?.professional_id
    })

    // Determine which calendars need updates
    const affectedContexts = this.getAffectedContexts({
      professionalId: newRecord?.professional_id || oldRecord?.professional_id,
      customerId: newRecord?.customer_id || oldRecord?.customer_id,
      serviceId: newRecord?.service_id || oldRecord?.service_id,
      changeType: 'appointment',
      eventType
    })

    // Notify affected calendars
    affectedContexts.forEach(contextId => {
      const subscription = CalendarSynchronization.subscribers.get(contextId)
      if (subscription) {
        subscription.callback({
          type: 'appointment_change',
          eventType,
          data: newRecord || oldRecord,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Handle professional availability changes
   */
  handleAvailabilityChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    console.log('🔄 Availability change detected:', {
      eventType,
      professionalId: newRecord?.professional_id || oldRecord?.professional_id,
      date: newRecord?.date || oldRecord?.date
    })

    const affectedContexts = this.getAffectedContexts({
      professionalId: newRecord?.professional_id || oldRecord?.professional_id,
      changeType: 'availability',
      eventType
    })

    affectedContexts.forEach(contextId => {
      const subscription = CalendarSynchronization.subscribers.get(contextId)
      if (subscription) {
        subscription.callback({
          type: 'availability_change',
          eventType,
          data: newRecord || oldRecord,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Handle interest changes (affects targeted marketplace)
   */
  handleInterestChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    console.log('🔄 Interest change detected:', {
      eventType,
      appointmentId: newRecord?.appointment_id || oldRecord?.appointment_id,
      professionalId: newRecord?.professional_id || oldRecord?.professional_id,
      status: newRecord?.status
    })

    // Interest changes can affect targeted marketplace availability
    const affectedContexts = this.getAffectedContexts({
      professionalId: newRecord?.professional_id || oldRecord?.professional_id,
      appointmentId: newRecord?.appointment_id || oldRecord?.appointment_id,
      changeType: 'interest',
      eventType
    })

    affectedContexts.forEach(contextId => {
      const subscription = CalendarSynchronization.subscribers.get(contextId)
      if (subscription) {
        subscription.callback({
          type: 'interest_change',
          eventType,
          data: newRecord || oldRecord,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Determine which calendar contexts are affected by a change
   */
  getAffectedContexts({ professionalId, customerId, serviceId, appointmentId, changeType, eventType }) {
    const affected = []

    CalendarSynchronization.subscribers.forEach((subscription, contextId) => {
      let shouldNotify = false

      switch (subscription.mode) {
        case CalendarEngine.MODE_TYPES.DIRECT:
          // Direct mode: notify if it's the same professional
          if (professionalId && subscription.professionalId === professionalId) {
            shouldNotify = true
          }
          break

        case CalendarEngine.MODE_TYPES.TARGETED:
          // Targeted mode: notify if professional is in selected list
          // This would require additional logic to check if professional is selected
          if (professionalId && changeType === 'availability') {
            shouldNotify = true // Simplified - could be more specific
          }
          break

        case CalendarEngine.MODE_TYPES.MARKETPLACE:
          // Marketplace mode: notify for service-related changes
          if (serviceId && subscription.serviceId === serviceId) {
            shouldNotify = true
          }
          // Also notify for general availability pattern changes
          if (changeType === 'appointment' && eventType === 'INSERT') {
            shouldNotify = true
          }
          break
      }

      // Customer-specific notifications
      if (customerId && subscription.customerId === customerId) {
        shouldNotify = true
      }

      if (shouldNotify) {
        affected.push(contextId)
      }
    })

    return affected
  }

  /**
   * Manually trigger calendar refresh for specific contexts
   */
  async refreshCalendar(contextId, options = {}) {
    const subscription = CalendarSynchronization.subscribers.get(contextId)
    
    if (!subscription) {
      console.warn('⚠️ No subscription found for context:', contextId)
      return
    }

    try {
      // Fetch fresh availability data
      const availabilityData = await CalendarEngine.getAvailability({
        mode: subscription.mode,
        professionalId: subscription.professionalId,
        serviceId: subscription.serviceId,
        ...options
      })

      // Notify the calendar component
      subscription.callback({
        type: 'manual_refresh',
        data: availabilityData,
        timestamp: Date.now()
      })

      console.log('🔄 Manual calendar refresh completed for:', contextId)
    } catch (error) {
      console.error('❌ Manual calendar refresh failed:', error)
      
      subscription.callback({
        type: 'refresh_error',
        error: error.message,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Batch update multiple calendars efficiently
   */
  async batchRefreshCalendars(contextIds, options = {}) {
    const refreshPromises = contextIds.map(contextId => 
      this.refreshCalendar(contextId, options)
    )

    const results = await Promise.allSettled(refreshPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log('🔄 Batch calendar refresh completed:', { successful, failed, total: contextIds.length })
    
    return { successful, failed, total: contextIds.length }
  }

  /**
   * Get synchronization statistics
   */
  getStats() {
    const now = Date.now()
    const subscriptions = Array.from(CalendarSynchronization.subscribers.values())
    
    return {
      totalSubscribers: subscriptions.length,
      modeBreakdown: subscriptions.reduce((acc, sub) => {
        acc[sub.mode] = (acc[sub.mode] || 0) + 1
        return acc
      }, {}),
      averageAge: subscriptions.length > 0 
        ? subscriptions.reduce((sum, sub) => sum + (now - sub.createdAt), 0) / subscriptions.length
        : 0,
      oldestSubscription: Math.max(...subscriptions.map(sub => now - sub.createdAt)),
      recentActivity: this.getRecentActivity()
    }
  }

  /**
   * Track recent synchronization activity
   */
  getRecentActivity() {
    // This could be enhanced to track actual sync events
    return {
      lastSync: Date.now(),
      syncCount: 0,
      errorCount: 0
    }
  }

  /**
   * Cleanup old or inactive subscriptions
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now()
    let cleaned = 0

    CalendarSynchronization.subscribers.forEach((subscription, contextId) => {
      if (now - subscription.createdAt > maxAge) {
        CalendarSynchronization.subscribers.delete(contextId)
        cleaned++
      }
    })

    console.log('🧹 Calendar subscription cleanup completed:', { cleaned })
    return cleaned
  }
}

// Export singleton instance
export const calendarSync = CalendarSynchronization.getInstance()

// React hook for easy calendar synchronization
export function useCalendarSync(mode, options = {}) {
  const [syncData, setSyncData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const contextId = `${mode}-${Date.now()}-${Math.random()}`
    
    const unsubscribe = calendarSync.subscribe(contextId, (data) => {
      setSyncData(data)
    }, { mode, ...options })

    setIsConnected(true)

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [mode, options.professionalId, options.serviceId])

  const refreshCalendar = useCallback((refreshOptions = {}) => {
    if (isConnected) {
      calendarSync.refreshCalendar(contextId, refreshOptions)
    }
  }, [isConnected])

  return {
    syncData,
    isConnected,
    refreshCalendar,
    stats: calendarSync.getStats()
  }
}