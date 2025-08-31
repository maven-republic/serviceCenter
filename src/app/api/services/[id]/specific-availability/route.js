// src/app/api/services/[id]/specific-availability/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request, { params }) {
  console.log('🔥 Specific Availability API called!')
  
  try {
    // Fix: Await params for Next.js 15+
    const resolvedParams = await params
    const { id: serviceId } = resolvedParams
    
    console.log('🔥 Params:', resolvedParams)
    console.log('🔥 Service ID:', serviceId)
    
    // Parse request body
    const body = await request.json()
    const { 
      professional_ids = [],
      start_date,
      end_date,
      slot_duration = 60
    } = body
    
    console.log('🔥 Request body:', { professional_ids, start_date, end_date, slot_duration })
    
    // Validate required parameters
    if (!professional_ids || professional_ids.length === 0) {
      return NextResponse.json(
        { error: 'professional_ids array is required and cannot be empty' },
        { status: 400 }
      )
    }
    
    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    console.log('🔥 Supabase client created successfully')
    
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

    console.log('🔥 Service found, validating professionals...')
    
    // Step 2: Validate that all specified professionals offer this service
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
      .in('professional_id', professional_ids)
      .eq('is_active', true)

    if (profServiceError) {
      console.error('❌ Error fetching professional services:', profServiceError)
      return NextResponse.json(
        { error: 'Error validating professionals for this service' },
        { status: 500 }
      )
    }

    console.log(`🔥 Found ${professionalServices?.length || 0} valid professionals`)

    if (!professionalServices || professionalServices.length === 0) {
      console.log('🔥 No valid professionals found for this service')
      return NextResponse.json({
        service_id: serviceId,
        service_name: service.name,
        start_date,
        end_date,
        slot_duration,
        available_slots: [],
        aggregated_slots: [],
        total_slots: 0,
        professionals_found: 0,
        professionals_requested: professional_ids.length,
        debug: {
          message: 'None of the specified professionals offer this service or are inactive'
        }
      })
    }

    // Check if all requested professionals were found
    const foundProfessionalIds = professionalServices.map(ps => ps.professional_id)
    const missingProfessionalIds = professional_ids.filter(id => !foundProfessionalIds.includes(id))
    
    if (missingProfessionalIds.length > 0) {
      console.log('🔥 Some professionals not found:', missingProfessionalIds)
    }

    console.log('🔥 Valid professional IDs:', foundProfessionalIds)

    // Step 3: Get base availability for specified professionals only
    const { data: baseAvailability, error: availabilityError } = await supabase
      .from('availability')
      .select('professional_id, day_of_week, start_time, end_time')
      .in('professional_id', foundProfessionalIds)
      .order('professional_id, day_of_week')

    if (availabilityError) {
      console.error('❌ Error fetching base availability:', availabilityError)
      return NextResponse.json(
        { error: 'Error fetching availability' },
        { status: 500 }
      )
    }

    console.log(`🔥 Base availability slots: ${baseAvailability?.length || 0}`)

    // Step 4: Get availability overrides for specified professionals only
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_override')
      .select('professional_id, override_date, start_time, end_time, is_available')
      .in('professional_id', foundProfessionalIds)
      .gte('override_date', start_date)
      .lte('override_date', end_date)

    if (overridesError) {
      console.error('❌ Error fetching overrides:', overridesError)
    }

    console.log(`🔥 Availability overrides: ${overrides?.length || 0}`)

    // Step 5: Get existing appointments for specified professionals only
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointment')
      .select('professional_id, session, duration')
      .in('professional_id', foundProfessionalIds)
      .gte('session', `${start_date}T00:00:00`)
      .lte('session', `${end_date}T23:59:59`)
      .in('status', ['pending', 'approved'])

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError)
    }

    console.log(`🔥 Existing appointments: ${existingAppointments?.length || 0}`)

    // Step 6: Get existing bookings for specified professionals only
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('booking')
      .select('professional_id, scheduled_start, scheduled_end')
      .in('professional_id', foundProfessionalIds)
      .gte('scheduled_start', `${start_date}T00:00:00`)
      .lte('scheduled_start', `${end_date}T23:59:59`)
      .in('status', ['pending', 'approved']) // Update these to match your actual enum values

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError)
    }

    console.log(`🔥 Existing bookings: ${existingBookings?.length || 0}`)

    // Step 7: Calculate specific professionals availability
    const specificSlots = calculateSpecificAvailability({
      professionalServices,
      baseAvailability: baseAvailability || [],
      overrides: overrides || [],
      existingAppointments: existingAppointments || [],
      existingBookings: existingBookings || [],
      start_date,
      end_date,
      slot_duration
    })

    console.log(`🔥 Specific slots calculated: ${specificSlots.length}`)
    
    return NextResponse.json({
      service_id: serviceId,
      service_name: service.name,
      start_date,
      end_date,
      slot_duration,
      available_slots: specificSlots, // For backward compatibility
      aggregated_slots: specificSlots, // New format
      total_slots: specificSlots.length,
      professionals_found: foundProfessionalIds.length,
      professionals_requested: professional_ids.length,
      missing_professionals: missingProfessionalIds,
      debug: {
        foundProfessionalIds,
        missingProfessionalIds,
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

// Helper function to get Jamaica time
function getJamaicaTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' }))
}

// Helper function to create Jamaica timezone date
function createJamaicaDate(dateString, timeString) {
  const jamaicaOffset = -5 * 60 // Jamaica is UTC-5, convert to minutes
  const localDate = new Date(`${dateString}T${timeString}`)
  
  // Adjust for Jamaica timezone
  const jamaicaDate = new Date(localDate.getTime() - (jamaicaOffset * 60 * 1000))
  return jamaicaDate
}

// Calculate availability for specific professionals only
function calculateSpecificAvailability({
  professionalServices,
  baseAvailability,
  overrides,
  existingAppointments,
  existingBookings,
  start_date,
  end_date,
  slot_duration
}) {
  console.log('🔥🔥 calculateSpecificAvailability called')
  
  const aggregatedSlots = new Map() // Map<datetime, {slot, availableProfessionals[]}>
  
  // Use Jamaica time for all calculations
  const jamaicaNow = getJamaicaTime()
  
  // Process each specified professional's availability
  professionalServices.forEach(profService => {
    const professionalId = profService.professional_id
    const professional = profService.individual_professional
    
    console.log(`🔥🔥 Processing professional: ${professionalId}`)
    
    // Get professional-specific settings with safe defaults
    const minNoticeHours = professional?.min_notice_hours ?? 1
    const bufferMinutes = professional?.buffer_minutes ?? 15
    
    const minBookingTime = new Date(jamaicaNow.getTime() + (minNoticeHours * 60 * 60 * 1000))
    
    // Get this professional's availability data
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
      start_date,
      end_date,
      slot_duration,
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
  const specificSlots = Array.from(aggregatedSlots.values())
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  
  console.log(`🔥🔥 Final specific slots: ${specificSlots.length}`)
  
  return specificSlots
}

// Calculate available slots for a single professional (reused from marketplace endpoint)
function calculateAvailableSlots({
  baseAvailability,
  overrides,
  existingAppointments,
  existingBookings,
  start_date,
  end_date,
  slot_duration,
  minNoticeHours,
  bufferMinutes,
  professionalId
}) {
  const slots = []
  const currentDate = new Date(start_date)
  const endDateTime = new Date(end_date)
  
  const jamaicaNow = getJamaicaTime()
  const minBookingTime = new Date(jamaicaNow.getTime() + ((minNoticeHours || 1) * 60 * 60 * 1000))

  let dayCount = 0
  // Generate slots for each day in the range
  while (currentDate <= endDateTime && dayCount < 50) {
    const dateString = currentDate.toISOString().split('T')[0]
    
    // Use timezone-safe day calculation
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

    // Only generate slots if day has availability
    if (dayAvailability.length > 0) {
      // Generate time slots for this day
      for (const availability of dayAvailability) {
        const daySlots = generateTimeSlotsForDay(
          dateString,
          availability.start_time,
          availability.end_time,
          slot_duration,
          minBookingTime,
          bufferMinutes
        )
        
        // Filter out conflicting slots
        const availableSlots = daySlots.filter(slot => {
          const hasConflictResult = hasConflict(slot, existingAppointments, existingBookings, slot_duration, bufferMinutes)
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

// Generate time slots for a specific day with proper timezone handling
function generateTimeSlotsForDay(dateString, startTime, endTime, slotDuration, minBookingTime, bufferMinutes) {
  const slots = []
  
  // Create dates in Jamaica timezone
  const dayStart = createJamaicaDate(dateString, startTime)
  const dayEnd = createJamaicaDate(dateString, endTime)
  
  // Calculate day_of_week once from the requested date
  const requestedDate = new Date(dateString)
  const fixedDayOfWeek = requestedDate.getDay()  // Always use original day
  
  let currentSlot = new Date(dayStart)
  let slotCount = 0
  
  while (currentSlot < dayEnd && slotCount < 50) { // Safety limit
    const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60 * 1000))
    
    const isInFuture = currentSlot >= minBookingTime
    const fitsInDay = slotEnd <= dayEnd
    
    // Only include slots that are in the future and fit within the day
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
  
  // Check against existing appointments
  for (const appointment of existingAppointments) {
    const apptStart = new Date(appointment.session)
    // Use duration if available, otherwise default to 1 hour
    const durationMinutes = appointment.duration || 60
    const apptEnd = new Date(apptStart.getTime() + (durationMinutes * 60 * 1000))
    
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

// Format time in Jamaica timezone
function formatTimeInJamaica(date) {
  return date.toLocaleString('en-US', {
    timeZone: 'America/Jamaica',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}