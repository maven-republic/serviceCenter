// src/components/calendar/primitives/useAvailabilityData.js
import { useState, useEffect, useCallback } from 'react'

/**
 * Fetches and manages professional availability data
 * 
 * Uses existing API routes (not Supabase Functions)
 * Handles all three modes: direct, targeted, marketplace
 * 
 * @param {Object} params
 * @param {string} params.serviceId - Service ID (required)
 * @param {string} params.mode - Booking mode: 'direct', 'targeted', 'marketplace'
 * @param {Array<string>} params.professionalIds - Professional IDs (for direct/targeted)
 * @param {Date} params.startDate - Start date for availability window
 * @param {Date} params.endDate - End date for availability window
 * @param {number} params.durationMinutes - Appointment duration
 * @returns {Object} { data, loading, error, refetch }
 */
export function useAvailabilityData({
  serviceId,
  mode,
  professionalIds = [],
  startDate,
  endDate,
  durationMinutes = 60
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAvailability = useCallback(async () => {
    if (!serviceId) {
      setError('Service ID is required')
      return
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let url
      let requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Build API URL based on mode
      switch (mode) {
        case 'direct':
          if (professionalIds.length === 0) {
            throw new Error('Professional ID required for direct mode')
          }
          url = `/api/professionals/${professionalIds[0]}/appointment-availability?start_date=${startDateStr}&end_date=${endDateStr}&slot_duration=${durationMinutes}`
          break
          
        case 'targeted':
          url = `/api/services/${serviceId}/specific-availability`
          requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              professional_ids: professionalIds,
              start_date: startDateStr,
              end_date: endDateStr,
              slot_duration: durationMinutes
            })
          }
          break
          
        case 'marketplace':
          url = `/api/services/${serviceId}/marketplace-availability?start_date=${startDateStr}&end_date=${endDateStr}&slot_duration=${durationMinutes}`
          break
          
        default:
          throw new Error('Invalid appointment mode')
      }

      console.log(`Fetching ${mode} availability from:`, url)
      
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const apiData = await response.json()
      console.log('API response:', apiData)

      // Transform response into calendar-friendly format
      const transformed = transformAvailabilityData(apiData, mode)
      setData(transformed)
    } catch (err) {
      console.error('Error fetching availability:', err)
      setError(err.message || 'Failed to fetch availability')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [serviceId, mode, professionalIds.join(','), startDate?.toISOString(), endDate?.toISOString(), durationMinutes])

  // Auto-fetch on parameter changes
  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  return {
    data,
    loading,
    error,
    refetch: fetchAvailability
  }
}

/**
 * Transform API response into calendar-friendly format
 * 
 * Input format (from existing API):
 * {
 *   available_slots: [{
 *     date: '2024-01-15',
 *     time: '09:00',
 *     datetime: '2024-01-15T09:00:00',
 *     professional_id: 'uuid',           // (marketplace mode only)
 *     professional_first_name: 'John',   // (marketplace mode only)
 *     professional_last_name: 'Doe',     // (marketplace mode only)
 *     ...
 *   }]
 * }
 * OR for targeted:
 * {
 *   aggregated_slots: [...]
 * }
 * 
 * Output format (for calendar):
 * {
 *   byDate: {
 *     '2024-01-15': [{
 *       time: '09:00',
 *       available: true,
 *       professionals: ['uuid1', 'uuid2'],
 *       slots: [{ professionalId, available, conflicts }]
 *     }]
 *   },
 *   byProfessional: {
 *     'uuid1': [{ date, time, datetime, available }]
 *   },
 *   professionals: { 'uuid1': { id, name, ... } }
 * }
 */

/**
 * Transform API response into calendar-friendly format
 */
/**
 * Transform API response into calendar-friendly format
 * Handles both marketplace mode (multiple professionals) and direct mode (single professional)
 */
function transformAvailabilityData(apiResponse, mode) {
  // Handle both available_slots and aggregated_slots
  const slots = apiResponse.aggregated_slots || apiResponse.available_slots || []
  
  if (!slots || slots.length === 0) {
    return { byDate: {}, byProfessional: {}, professionals: {} }
  }

  const byDate = {}
  const byProfessional = {}
  const professionals = {}

  // 🆕 FIXED: Handle direct mode (single professional)
  if (mode === 'direct' && apiResponse.professional_id) {
    const profId = apiResponse.professional_id
    
    // Store professional metadata
    professionals[profId] = {
      id: profId,
      professional_id: profId,
      name: 'Professional',
      first_name: '',
      last_name: '',
      profile_picture_url: null,
      rating: 4.8,
      average_rating: 4.8,
      total_reviews: 0,
      verification_status: 'verified',
      hourly_rate: null,
      daily_rate: null,
      min_notice_hours: apiResponse.settings?.min_notice_hours || 1,
      buffer_minutes: apiResponse.settings?.buffer_minutes || 15
    }
    
    console.log(`✅ Direct mode: Professional stored: ${profId}`, professionals[profId])

    // Initialize byProfessional
    byProfessional[profId] = []

    // Process each slot for this professional
    slots.forEach(slot => {
      const dateKey = slot.date
      const timeKey = slot.time

      // Add to byProfessional index
      byProfessional[profId].push({
        date: dateKey,
        time: timeKey,
        datetime: slot.datetime,
        available: true,
        conflicts: []
      })

      // Initialize byDate structure
      if (!byDate[dateKey]) {
        byDate[dateKey] = {}
      }
      if (!byDate[dateKey][timeKey]) {
        byDate[dateKey][timeKey] = {
          time: timeKey,
          start: slot.datetime,
          available: false,
          professionals: [],
          slots: []
        }
      }

      // Add this professional/slot to the time slot
      byDate[dateKey][timeKey].professionals.push(profId)
      byDate[dateKey][timeKey].slots.push({
        professionalId: profId,
        available: true,
        conflicts: []
      })

      // Mark slot as available
      byDate[dateKey][timeKey].available = true
    })
  } 
  // Marketplace/Targeted mode (multiple professionals)
  else {
    slots.forEach(slot => {
      const dateKey = slot.date
      const timeKey = slot.time
      
      // Extract professionals from professionals_available array
      const availableProfessionals = slot.professionals_available || []
      
      availableProfessionals.forEach(prof => {
        const profId = prof.professional_id
        
        // Store professional metadata if not already stored
        if (!professionals[profId]) {
          professionals[profId] = {
            id: profId,
            professional_id: profId,
            
            // Name fields - use the data directly from API
            name: prof.name || `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || 'Professional',
            first_name: prof.first_name || '',
            last_name: prof.last_name || '',
            
            // Profile info
            profile_picture_url: prof.profile_picture_url || null,
            
            // Rating - try multiple field variations
            rating: prof.rating || prof.average_rating || 4.8,
            average_rating: prof.rating || prof.average_rating || 4.8,
            total_reviews: prof.total_reviews || 0,
            
            // Verification
            verification_status: prof.verification_status || 'pending',
            
            // Pricing - try multiple field name variations
            hourly_rate: prof.hourly_rate || prof.custom_price || null,
            daily_rate: prof.daily_rate || null,
            custom_price: prof.custom_price || null,
            
            // Availability settings
            min_notice_hours: prof.min_notice_hours || 1,
            buffer_minutes: prof.buffer_minutes || 15
          }
          
          console.log(`✅ Marketplace mode: Professional stored: ${profId}`, professionals[profId])
        }

        // Initialize byProfessional if needed
        if (!byProfessional[profId]) {
          byProfessional[profId] = []
        }

        // Add to byProfessional index
        byProfessional[profId].push({
          date: dateKey,
          time: timeKey,
          datetime: slot.datetime,
          available: true,
          conflicts: []
        })

        // Initialize byDate structure
        if (!byDate[dateKey]) {
          byDate[dateKey] = {}
        }
        if (!byDate[dateKey][timeKey]) {
          byDate[dateKey][timeKey] = {
            time: timeKey,
            start: slot.datetime,
            available: false,
            professionals: [],
            slots: []
          }
        }

        // Add this professional/slot to the time slot
        byDate[dateKey][timeKey].professionals.push(profId)
        byDate[dateKey][timeKey].slots.push({
          professionalId: profId,
          available: true,
          conflicts: []
        })

        // Mark slot as available
        byDate[dateKey][timeKey].available = true
      })
    })
  }

  // Convert byDate time objects to sorted arrays
  Object.keys(byDate).forEach(dateKey => {
    byDate[dateKey] = Object.values(byDate[dateKey]).sort((a, b) => 
      a.time.localeCompare(b.time)
    )
  })

  console.log('=== TRANSFORMATION COMPLETE ===')
  console.log('Mode:', mode)
  console.log('Total professionals:', Object.keys(professionals).length)
  console.log('Professionals data:', professionals)
  console.log('Dates with availability:', Object.keys(byDate).length)
  console.log('Total slots transformed:', Object.keys(byProfessional).reduce((sum, profId) => sum + byProfessional[profId].length, 0))

  return {
    byDate,
    byProfessional,
    professionals,
    raw: apiResponse
  }
}