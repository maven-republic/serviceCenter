// src/app/api/services/[id]/marketplace-availability/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
    
    // Step 2: Find all professionals who offer this service
    const { data: professionalServices, error: profServiceError } = await supabase
      .from('professional_service')
      .select(`
        professional_id,
        is_active,
        individual_professional (
          professional_id,
          min_notice_hours,
          buffer_minutes,
          default_event_duration,
          account (
            first_name,
            last_name
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
      .select('professional_id, preferred_start, preferred_end')
      .in('professional_id', professionalIds)
      .gte('preferred_start', `${startDate}T00:00:00`)
      .lte('preferred_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'quoted', 'converted'])

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError)
    }

    console.log(`🔥 Existing appointments: ${existingAppointments?.length || 0}`)

    // Step 6: Get existing bookings for all professionals
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('booking')
      .select('professional_id, scheduled_start, scheduled_end')
      .in('professional_id', professionalIds)
      .gte('scheduled_start', `${startDate}T00:00:00`)
      .lte('scheduled_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'in_progress'])

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError)
    }

    console.log(`🔥 Existing bookings: ${existingBookings?.length || 0}`)

    // Step 7: Calculate marketplace availability by aggregating all professionals
    const marketplaceSlots = calculateMarketplaceAvailability({
      professionalServices,
      baseAvailability: baseAvailability || [],
      overrides: overrides || [],
      existingAppointments: existingAppointments || [],
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
        bookingsCount: existingBookings?.length || 0
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
  // Get current time in Jamaica timezone (UTC-5)
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' }))
}

// ✅ TIMEZONE FIXED: Helper function to create Jamaica timezone date
function createJamaicaDate(dateString, timeString) {
  // Create date in Jamaica timezone by adding the offset
  const jamaicaOffset = -5 * 60 // Jamaica is UTC-5, convert to minutes
  const localDate = new Date(`${dateString}T${timeString}`)
  
  // Adjust for Jamaica timezone
  const jamaicaDate = new Date(localDate.getTime() - (jamaicaOffset * 60 * 1000))
  return jamaicaDate
}

// 🌟 NEW: Calculate marketplace availability by aggregating all professionals
function calculateMarketplaceAvailability({
  professionalServices,
  baseAvailability,
  overrides,
  existingAppointments,
  existingBookings,
  startDate,
  endDate,
  slotDuration
}) {
  console.log('🔥🔥 calculateMarketplaceAvailability called')
  
  const aggregatedSlots = new Map() // Map<datetime, {slot, availableProfessionals[]}>
  
  // ✅ TIMEZONE FIXED: Use Jamaica time for all calculations
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
    
    // Get this professional's availability
    const profBaseAvailability = baseAvailability.filter(a => a.professional_id === professionalId)
    const profOverrides = overrides.filter(o => o.professional_id === professionalId)
    const profAppointments = existingAppointments.filter(a => a.professional_id === professionalId)
    const profBookings = existingBookings.filter(b => b.professional_id === professionalId)
    
    // Calculate this professional's available slots
    const professionalSlots = calculateAvailableSlots({
      baseAvailability: profBaseAvailability,
      overrides: profOverrides,
      existingAppointments: profAppointments,
      existingBookings: profBookings,
      startDate,
      endDate,
      slotDuration,
      minNoticeHours,
      bufferMinutes,
      professionalId
    })
    
    console.log(`🔥🔥 Professional ${professionalId} has ${professionalSlots.length} available slots`)
    
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
      
      // Add this professional to the available list for this slot
      const aggregatedSlot = aggregatedSlots.get(slotKey)
      aggregatedSlot.professionals_available.push({
        professional_id: professionalId,
        name: `${professional?.account?.first_name || ''} ${professional?.account?.last_name || ''}`.trim() || 'Professional',
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

// ✅ Reuse the same calculateAvailableSlots function from the professional endpoint
function calculateAvailableSlots({
  baseAvailability,
  overrides,
  existingAppointments,
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
  
  // ✅ TIMEZONE FIXED: Use Jamaica time for all calculations
  const jamaicaNow = getJamaicaTime()
  const minBookingTime = new Date(jamaicaNow.getTime() + ((minNoticeHours || 1) * 60 * 60 * 1000))

  let dayCount = 0
  // Generate slots for each day in the range
  while (currentDate <= endDateTime && dayCount < 50) {
    const dateString = currentDate.toISOString().split('T')[0]
    
    // ✅ CRITICAL FIX: Use timezone-safe day calculation
    const dayOfWeek = new Date(dateString + 'T12:00:00Z').getDay()
    
    // Check if there's an override for this specific date
    const dayOverrides = overrides.filter(override => override.override_date === dateString)
    
    let dayAvailability = []
    
    if (dayOverrides.length > 0) {
      dayAvailability = dayOverrides.map(override => ({
        start_time: override.start_time,
        end_time: override.end_time,
        is_available: override.is_available
      })).filter(slot => slot.is_available)
    } else {
      // Use base weekly availability for this day of week
      dayAvailability = baseAvailability.filter(avail => avail.day_of_week === dayOfWeek)
    }

    // ✅ FIX: Only generate slots if day has availability
    if (dayAvailability.length > 0) {
      // Generate time slots for this day
      for (const availability of dayAvailability) {
        const daySlots = generateTimeSlotsForDay(
          dateString,
          availability.start_time,
          availability.end_time,
          slotDuration,
          minBookingTime,
          bufferMinutes
        )
        
        // Filter out conflicting slots
        const availableSlots = daySlots.filter(slot => {
          const hasConflictResult = hasConflict(slot, existingAppointments, existingBookings, slotDuration, bufferMinutes)
          return !hasConflictResult
        })
        
        slots.push(...availableSlots)
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
    dayCount++
  }

  return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
}

// ✅ TIMEZONE FIXED: Generate time slots for a specific day with proper timezone handling
function generateTimeSlotsForDay(dateString, startTime, endTime, slotDuration, minBookingTime, bufferMinutes) {
  const slots = []
  
  // ✅ TIMEZONE FIXED: Create dates in Jamaica timezone
  const dayStart = createJamaicaDate(dateString, startTime)
  const dayEnd = createJamaicaDate(dateString, endTime)
  
  // ✅ FIX: Calculate day_of_week once from the requested date
  const requestedDate = new Date(dateString)
  const fixedDayOfWeek = requestedDate.getDay()  // Always use original day
  
  let currentSlot = new Date(dayStart)
  let slotCount = 0
  
  while (currentSlot < dayEnd && slotCount < 50) { // Safety limit
    const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60 * 1000))
    
    const isInFuture = currentSlot >= minBookingTime
    const fitsInDay = slotEnd <= dayEnd
    
    // Only include slots that are:
    // 1. In the future with minimum notice
    // 2. Slot end time doesn't exceed day end time
    if (isInFuture && fitsInDay) {
      const slot = {
        datetime: currentSlot.toISOString(),
        date: dateString,
        time: formatTimeInJamaica(currentSlot),
        duration_minutes: slotDuration,
        day_of_week: fixedDayOfWeek,  // ✅ FIX: Use fixed day_of_week
        available: true
      }
      slots.push(slot)
    }
    
    // Move to next slot (30-minute intervals for flexibility)
    currentSlot = new Date(currentSlot.getTime() + (30 * 60 * 1000))
    slotCount++
  }
  
  return slots
}

// Check if a slot conflicts with existing appointments/bookings
function hasConflict(slot, existingAppointments, existingBookings, slotDuration, bufferMinutes) {
  const slotStart = new Date(slot.datetime)
  const slotEnd = new Date(slotStart.getTime() + (slotDuration * 60 * 1000))
  const bufferMs = (bufferMinutes || 0) * 60 * 1000
  
  // Check against existing appointments (assume 1 hour duration if no end time)
  for (const appointment of existingAppointments) {
    const apptStart = new Date(appointment.preferred_start)
    const apptEnd = appointment.preferred_end 
      ? new Date(appointment.preferred_end)
      : new Date(apptStart.getTime() + (60 * 60 * 1000)) // Default 1 hour
    
    // Add buffer time around existing appointments
    const bufferedApptStart = new Date(apptStart.getTime() - bufferMs)
    const bufferedApptEnd = new Date(apptEnd.getTime() + bufferMs)
    
    // Check for overlap
    if (slotStart < bufferedApptEnd && slotEnd > bufferedApptStart) {
      return true
    }
  }
  
  // Check against existing bookings
  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.scheduled_start)
    const bookingEnd = booking.scheduled_end 
      ? new Date(booking.scheduled_end)
      : new Date(bookingStart.getTime() + (4 * 60 * 60 * 1000)) // Default 4 hours
    
    // Add buffer time around existing bookings
    const bufferedBookingStart = new Date(bookingStart.getTime() - bufferMs)
    const bufferedBookingEnd = new Date(bookingEnd.getTime() + bufferMs)
    
    // Check for overlap
    if (slotStart < bufferedBookingEnd && slotEnd > bufferedBookingStart) {
      return true
    }
  }
  
  return false
}

// Helper functions
function getDateDaysFromNow(days) {
  const jamaicaTime = getJamaicaTime()
  jamaicaTime.setDate(jamaicaTime.getDate() + days)
  return jamaicaTime.toISOString().split('T')[0]
}

// ✅ TIMEZONE FIXED: Format time in Jamaica timezone
function formatTimeInJamaica(date) {
  return date.toLocaleString('en-US', {
    timeZone: 'America/Jamaica',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}