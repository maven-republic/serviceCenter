// src/app/api/services/[id]/marketplace-availability/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { hasConflict, RELEVANT_STATUSES } from '@/utils/services/conflictDetection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request, { params }) {
  console.log('🔥 Marketplace Availability API called!')
  
  try {
    // ✅ Fix: Await params for Next.js 15+
    const resolvedParams = await params
    const { id: serviceId } = resolvedParams
    
    console.log('🔥 Params:', resolvedParams)
    console.log('🔥 Request URL:', request.url)
    console.log('🔥 Service ID:', serviceId)
    
    console.log('🔥 Creating Supabase client...')
    
    const supabase = await createClient()
    console.log('🔥 Supabase client created successfully')
    
    const { searchParams } = new URL(request.url)
    console.log('🔥 Search params:', Object.fromEntries(searchParams))
    
    // Get query parameters
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || getDateDaysFromNow(30)
    const slotDuration = parseInt(searchParams.get('slot_duration')) || 60
    
    console.log('🔥 Parsed params:', { startDate, endDate, slotDuration })
    
    // Step 1: Validate service exists
    const { data: service, error: serviceError } = await supabase
      .from('service')
      .select('service_id, name')
      .eq('service_id', serviceId)
      .single()

    console.log('🔥 Service query result:', { service, serviceError })

    if (serviceError || !service) {
      console.error('❌ Service not found:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    console.log('🔥 Service found, finding professionals who offer this service...')
    
    // Step 2: Find all professionals who offer this service WITH FULL DETAILS
    const { data: professionalServices, error: profServiceError } = await supabase
      .from('professional_service')
      .select(`
        professional_id,
        is_active,
        custom_price,
        service_level_id,
        individual_professional (
          professional_id,
          min_notice_hours,
          buffer_minutes,
          default_event_duration,
          verification_status,
          account (
            first_name,
            last_name,
            profile_picture_url
          )
        )
      `)
      .eq('service_id', serviceId)
      .eq('is_active', true)

    if (profServiceError) {
      console.error('❌ Error fetching professional services:', profServiceError)
      return NextResponse.json(
        { error: 'Error fetching professionals for this service' },
        { status: 500 }
      )
    }

    console.log(`🔥 Found ${professionalServices?.length || 0} professionals offering this service`)

    if (!professionalServices || professionalServices.length === 0) {
      console.log('🔥 No professionals found for this service')
      return NextResponse.json({
        service_id: serviceId,
        service_name: service.name,
        start_date: startDate,
        end_date: endDate,
        slot_duration: slotDuration,
        available_slots: [],
        total_slots: 0,
        professionals_count: 0,
        debug: {
          message: 'No professionals offer this service'
        }
      })
    }

    const professionalIds = professionalServices.map(ps => ps.professional_id)
    console.log('🔥 Professional IDs:', professionalIds)

    // Step 2.5: 🆕 Get average ratings for all professionals
    const { data: ratings, error: ratingsError } = await supabase
      .from('review')
      .select('professional_id, rating')
      .in('professional_id', professionalIds)

    if (ratingsError) {
      console.error('⚠️ Error fetching ratings:', ratingsError)
    }

    // Calculate average ratings
    const ratingMap = new Map()
    if (ratings && ratings.length > 0) {
      const grouped = ratings.reduce((acc, review) => {
        if (!acc[review.professional_id]) {
          acc[review.professional_id] = []
        }
        acc[review.professional_id].push(review.rating)
        return acc
      }, {})
      
      Object.entries(grouped).forEach(([profId, profRatings]) => {
        const avg = profRatings.reduce((sum, r) => sum + r, 0) / profRatings.length
        ratingMap.set(profId, {
          average: Number(avg.toFixed(1)),
          count: profRatings.length
        })
      })
    }

    console.log(`🔥 Ratings calculated for ${ratingMap.size} professionals`)

    // Step 3: Get base availability for all professionals
    const { data: baseAvailability, error: availabilityError } = await supabase
      .from('availability')
      .select('professional_id, day_of_week, start_time, end_time')
      .in('professional_id', professionalIds)
      .order('professional_id, day_of_week')

    if (availabilityError) {
      console.error('❌ Error fetching base availability:', availabilityError)
      return NextResponse.json(
        { error: 'Error fetching availability' },
        { status: 500 }
      )
    }

    console.log(`🔥 Base availability slots: ${baseAvailability?.length || 0}`)

    // Step 4: Get availability overrides for all professionals
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_override')
      .select('professional_id, override_date, start_time, end_time, is_available')
      .in('professional_id', professionalIds)
      .gte('override_date', startDate)
      .lte('override_date', endDate)

    if (overridesError) {
      console.error('❌ Error fetching overrides:', overridesError)
    }

    console.log(`🔥 Availability overrides: ${overrides?.length || 0}`)

    // Step 5: Get existing appointments for all professionals
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointment')
      .select('professional_id, appointment_id, session, duration, status')
      .in('professional_id', professionalIds)
      .gte('session', `${startDate}T00:00:00`)
      .lte('session', `${endDate}T23:59:59`)
      .in('status', RELEVANT_STATUSES.appointments)

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError)
    }

    console.log(`🔥 Existing appointments: ${existingAppointments?.length || 0}`)

    // Step 5.5: 🆕 Get existing assessments for all professionals
    const { data: existingAssessments, error: assessmentsError } = await supabase
      .from('assessment')
      .select(`
        professional_id,
        assessment_id,
        proposed_date,
        confirmed_date,
        proposed_duration_minutes,
        confirmed_duration_minutes,
        status
      `)
      .in('professional_id', professionalIds)
      .in('status', RELEVANT_STATUSES.assessments)
      .or(`confirmed_date.gte.${startDate},proposed_date.gte.${startDate}`)
      .or(`confirmed_date.lte.${endDate},proposed_date.lte.${endDate}`)

    if (assessmentsError) {
      console.error('❌ Error fetching assessments:', assessmentsError)
    }

    console.log(`🔥 Existing assessments: ${existingAssessments?.length || 0}`)

    // Step 6: Get existing bookings for all professionals
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('booking')
      .select('professional_id, booking_id, scheduled_start, scheduled_end, duration_minutes, status')
      .in('professional_id', professionalIds)
      .gte('scheduled_start', `${startDate}T00:00:00`)
      .lte('scheduled_start', `${endDate}T23:59:59`)
      .in('status', RELEVANT_STATUSES.bookings)

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError)
    }

    console.log(`🔥 Existing bookings: ${existingBookings?.length || 0}`)

    // Step 7: Calculate marketplace availability by aggregating all professionals
    const marketplaceSlots = calculateMarketplaceAvailability({
      professionalServices,
      ratingMap,
      baseAvailability: baseAvailability || [],
      overrides: overrides || [],
      existingAppointments: existingAppointments || [],
      existingAssessments: existingAssessments || [],
      existingBookings: existingBookings || [],
      startDate,
      endDate,
      slotDuration
    })

    console.log(`🔥 Marketplace slots calculated: ${marketplaceSlots.length}`)
    
    return NextResponse.json({
      service_id: serviceId,
      service_name: service.name,
      start_date: startDate,
      end_date: endDate,
      slot_duration: slotDuration,
      available_slots: marketplaceSlots,
      total_slots: marketplaceSlots.length,
      professionals_count: professionalServices.length,
      debug: {
        professionalIds,
        baseAvailabilityCount: baseAvailability?.length || 0,
        overridesCount: overrides?.length || 0,
        appointmentsCount: existingAppointments?.length || 0,
        assessmentsCount: existingAssessments?.length || 0,
        bookingsCount: existingBookings?.length || 0,
        ratingsCount: ratingMap.size
      }
    })

  } catch (error) {
    console.error('🔥💥 API Route Error:', error)
    console.error('🔥💥 Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ✅ TIMEZONE FIXED: Helper function to get Jamaica time
function getJamaicaTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' }))
}

// ✅ TIMEZONE FIXED: Helper function to create Jamaica timezone date
function createJamaicaDate(dateString, timeString) {
  const jamaicaOffset = -5 * 60 // Jamaica is UTC-5, convert to minutes
  const localDate = new Date(`${dateString}T${timeString}`)
  
  const jamaicaDate = new Date(localDate.getTime() - (jamaicaOffset * 60 * 1000))
  return jamaicaDate
}

// 🌟 UPDATED: Calculate marketplace availability with FULL PROFESSIONAL DATA
function calculateMarketplaceAvailability({
  professionalServices,
  ratingMap,
  baseAvailability,
  overrides,
  existingAppointments,
  existingAssessments,
  existingBookings,
  startDate,
  endDate,
  slotDuration
}) {
  console.log('🔥🔥 calculateMarketplaceAvailability called')
  
  const aggregatedSlots = new Map()
  const jamaicaNow = getJamaicaTime()
  
  // Process each professional's availability
  professionalServices.forEach(profService => {
    const professionalId = profService.professional_id
    const professional = profService.individual_professional
    
    console.log(`🔥🔥 Processing professional: ${professionalId}`)
    
    // Get professional-specific settings with safe defaults
    const minNoticeHours = professional?.min_notice_hours ?? 1
    const bufferMinutes = professional?.buffer_minutes ?? 15
    
    const minBookingTime = new Date(jamaicaNow.getTime() + (minNoticeHours * 60 * 60 * 1000))
    
    // Get this professional's existing entities
    const profAppointments = existingAppointments.filter(a => a.professional_id === professionalId)
    const profAssessments = existingAssessments.filter(a => a.professional_id === professionalId)
    const profBookings = existingBookings.filter(b => b.professional_id === professionalId)
    
    // Get this professional's availability
    const profBaseAvailability = baseAvailability.filter(a => a.professional_id === professionalId)
    const profOverrides = overrides.filter(o => o.professional_id === professionalId)
    
    // Calculate this professional's available slots
    const professionalSlots = calculateAvailableSlots({
      baseAvailability: profBaseAvailability,
      overrides: profOverrides,
      existingAppointments: profAppointments,
      existingAssessments: profAssessments,
      existingBookings: profBookings,
      startDate,
      endDate,
      slotDuration,
      minNoticeHours,
      bufferMinutes,
      professionalId
    })
    
    console.log(`🔥🔥 Professional ${professionalId} has ${professionalSlots.length} available slots`)
    
    // Get rating data
    const ratingData = ratingMap.get(professionalId) || { average: 4.8, count: 0 }
    
    // Add this professional's slots to the aggregated map
    professionalSlots.forEach(slot => {
      const slotKey = slot.datetime
      
      if (!aggregatedSlots.has(slotKey)) {
        aggregatedSlots.set(slotKey, {
          datetime: slot.datetime,
          date: slot.date,
          time: slot.time,
          duration_minutes: slot.duration_minutes,
          day_of_week: slot.day_of_week,
          available: true,
          professionals_available: [],
          professionals_count: 0
        })
      }
      
      // Add this professional with FULL DATA to the available list for this slot
      const aggregatedSlot = aggregatedSlots.get(slotKey)
      
      aggregatedSlot.professionals_available.push({
        professional_id: professionalId,
        
        // Name fields (multiple formats for compatibility)
        first_name: professional?.account?.first_name || 'Professional',
        last_name: professional?.account?.last_name || '',
        name: `${professional?.account?.first_name || ''} ${professional?.account?.last_name || ''}`.trim() || 'Professional',
        
        // Profile info
        profile_picture_url: professional?.account?.profile_picture_url || null,
        verification_status: professional?.verification_status || 'pending',
        
        // Pricing - custom_price takes priority
        hourly_rate: profService.custom_price || null,
        custom_price: profService.custom_price || null,
        service_level: profService.service_level || null,
        
        // Rating data
        rating: ratingData.average,
        average_rating: ratingData.average,
        total_reviews: ratingData.count,
        
        // Availability settings
        min_notice_hours: minNoticeHours,
        buffer_minutes: bufferMinutes
      })
      
      aggregatedSlot.professionals_count = aggregatedSlot.professionals_available.length
    })
  })
  
  // Convert map to array and sort by datetime
  const marketplaceSlots = Array.from(aggregatedSlots.values())
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  
  console.log(`🔥🔥 Final marketplace slots: ${marketplaceSlots.length}`)
  
  return marketplaceSlots
}

// ✅ UPDATED: Calculate available slots with comprehensive conflict detection
function calculateAvailableSlots({
  baseAvailability,
  overrides,
  existingAppointments,
  existingAssessments,
  existingBookings,
  startDate,
  endDate,
  slotDuration,
  minNoticeHours,
  bufferMinutes,
  professionalId
}) {
  const slots = []
  const currentDate = new Date(startDate)
  const endDateTime = new Date(endDate)
  
  const jamaicaNow = getJamaicaTime()
  const minBookingTime = new Date(jamaicaNow.getTime() + ((minNoticeHours || 1) * 60 * 60 * 1000))

  let dayCount = 0
  while (currentDate <= endDateTime && dayCount < 50) {
    const dateString = currentDate.toISOString().split('T')[0]
    const dayOfWeek = new Date(dateString + 'T12:00:00Z').getDay()
    
    const dayOverrides = overrides.filter(override => override.override_date === dateString)
    
    let dayAvailability = []
    
    if (dayOverrides.length > 0) {
      dayAvailability = dayOverrides.map(override => ({
        start_time: override.start_time,
        end_time: override.end_time,
        is_available: override.is_available
      })).filter(slot => slot.is_available)
    } else {
      dayAvailability = baseAvailability.filter(avail => avail.day_of_week === dayOfWeek)
    }

    if (dayAvailability.length > 0) {
      for (const availability of dayAvailability) {
        const daySlots = generateTimeSlotsForDay(
          dateString,
          availability.start_time,
          availability.end_time,
          slotDuration,
          minBookingTime,
          bufferMinutes
        )
        
        const availableSlots = daySlots.filter(slot => {
          const conflictResult = hasConflict({
            slotStart: slot.datetime,
            slotDuration: slotDuration,
            existingEntities: {
              appointments: existingAppointments,
              assessments: existingAssessments,
              bookings: existingBookings
            },
            bufferMinutes: bufferMinutes
          })
          
          if (conflictResult.hasConflict) {
            console.log(`🔥 Slot ${slot.datetime} conflicts with ${conflictResult.conflictingEntity.type}`)
          }
          
          return !conflictResult.hasConflict
        })
        
        slots.push(...availableSlots)
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
    dayCount++
  }

  return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
}

// ✅ TIMEZONE FIXED: Generate time slots for a specific day
function generateTimeSlotsForDay(dateString, startTime, endTime, slotDuration, minBookingTime, bufferMinutes) {
  const slots = []
  
  const dayStart = createJamaicaDate(dateString, startTime)
  const dayEnd = createJamaicaDate(dateString, endTime)
  
  const requestedDate = new Date(dateString)
  const fixedDayOfWeek = requestedDate.getDay()
  
  let currentSlot = new Date(dayStart)
  let slotCount = 0
  
  while (currentSlot < dayEnd && slotCount < 50) {
    const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60 * 1000))
    
    const isInFuture = currentSlot >= minBookingTime
    const fitsInDay = slotEnd <= dayEnd
    
    if (isInFuture && fitsInDay) {
      const slot = {
        datetime: currentSlot.toISOString(),
        date: dateString,
        time: formatTimeInJamaica(currentSlot),
        duration_minutes: slotDuration,
        day_of_week: fixedDayOfWeek,
        available: true
      }
      slots.push(slot)
    }
    
    currentSlot = new Date(currentSlot.getTime() + (30 * 60 * 1000))
    slotCount++
  }
  
  return slots
}

// Helper functions
function getDateDaysFromNow(days) {
  const jamaicaTime = getJamaicaTime()
  jamaicaTime.setDate(jamaicaTime.getDate() + days)
  return jamaicaTime.toISOString().split('T')[0]
}

function formatTimeInJamaica(date) {
  return date.toLocaleString('en-US', {
    timeZone: 'America/Jamaica',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}