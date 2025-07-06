// src/app/api/professionals/[id]/appointment-availability/route.js

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request, { params }) {
  console.log('🔥 API Route called!')
  console.log('🔥 Params:', params)
  console.log('🔥 Request URL:', request.url)
  
  try {
    console.log('🔥 Creating Supabase client...')
    
    const supabase = await createClient()
    console.log('🔥 Supabase client created successfully')
    
    const { id: professionalId } = params
    console.log('🔥 Professional ID:', professionalId)
    
    const { searchParams } = new URL(request.url)
    console.log('🔥 Search params:', Object.fromEntries(searchParams))
    
    // Get query parameters
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || getDateDaysFromNow(30)
    const slotDuration = parseInt(searchParams.get('slot_duration')) || 60
    
    console.log('🔥 Parsed params:', { startDate, endDate, slotDuration })
    
    console.log('🔥 About to query professional...')
    
    // Validate professional exists
    const { data: professional, error: professionalError } = await supabase
      .from('individual_professional')
      .select('professional_id, min_notice_hours, buffer_minutes, default_event_duration')
      .eq('professional_id', professionalId)
      .single()

    console.log('🔥 Professional query result:', { professional, professionalError })

    if (professionalError || !professional) {
      console.error('❌ Professional not found:', professionalError)
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    console.log('🔥 Professional found, querying availability...')
    
    // Get professional's base availability (weekly schedule)
    const { data: baseAvailability, error: availabilityError } = await supabase
      .from('availability')
      .select('day_of_week, start_time, end_time')
      .eq('professional_id', professionalId)
      .order('day_of_week')

    if (availabilityError) {
      console.error('❌ Error fetching availability:', availabilityError)
      return NextResponse.json(
        { error: 'Error fetching availability' },
        { status: 500 }
      )
    }

    console.log('🔥 Base availability:', baseAvailability)

    // Get availability overrides for the date range
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_override')
      .select('override_date, start_time, end_time, is_available')
      .eq('professional_id', professionalId)
      .gte('override_date', startDate)
      .lte('override_date', endDate)

    if (overridesError) {
      console.error('❌ Error fetching overrides:', overridesError)
    }

    console.log('🔥 Availability overrides:', overrides)

    // Get existing appointments in the date range
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointment')
      .select('preferred_start, preferred_end')
      .eq('professional_id', professionalId)
      .gte('preferred_start', `${startDate}T00:00:00`)
      .lte('preferred_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'quoted', 'converted'])

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError)
    }

    console.log('🔥 Existing appointments:', existingAppointments)

    // Get existing bookings in the date range  
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('booking')
      .select('scheduled_start, scheduled_end')
      .eq('professional_id', professionalId)
      .gte('scheduled_start', `${startDate}T00:00:00`)
      .lte('scheduled_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'in_progress'])

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError)
    }

    console.log('🔥 Existing bookings:', existingBookings)

    // ✅ FIXED: Use safe defaults for null values
    const safeMinNoticeHours = professional.min_notice_hours ?? 1  // 1 hour default
    const safeBufferMinutes = professional.buffer_minutes ?? 15    // 15 minutes default

    console.log('🔥 Safe values:', { safeMinNoticeHours, safeBufferMinutes })

    // Calculate available slots
    const availableSlots = calculateAvailableSlots({
      baseAvailability: baseAvailability || [],
      overrides: overrides || [],
      existingAppointments: existingAppointments || [],
      existingBookings: existingBookings || [],
      startDate,
      endDate,
      slotDuration,
      minNoticeHours: safeMinNoticeHours,
      bufferMinutes: safeBufferMinutes
    })

    console.log('🔥 Available slots calculated:', availableSlots.length)
    
    return NextResponse.json({
      professional_id: professionalId,
      start_date: startDate,
      end_date: endDate,
      slot_duration: slotDuration,
      available_slots: availableSlots,
      total_slots: availableSlots.length,
      debug: {
        baseAvailability: baseAvailability || [],
        overrides: overrides || [],
        existingAppointments: existingAppointments || [],
        existingBookings: existingBookings || [],
        safeMinNoticeHours,
        safeBufferMinutes,
        professionalSettings: professional
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

// ✅ FIXED: Helper function to calculate available slots with debugging
function calculateAvailableSlots({
  baseAvailability,
  overrides,
  existingAppointments,
  existingBookings,
  startDate,
  endDate,
  slotDuration,
  minNoticeHours,
  bufferMinutes
}) {
  console.log('🔥🔥 calculateAvailableSlots called with:')
  console.log('  - startDate:', startDate)
  console.log('  - endDate:', endDate)
  console.log('  - minNoticeHours:', minNoticeHours)
  console.log('  - bufferMinutes:', bufferMinutes)
  console.log('  - baseAvailability count:', baseAvailability.length)

  const slots = []
  const currentDate = new Date(startDate)
  const endDateTime = new Date(endDate)
  const now = new Date()
  
  // ✅ FIXED: Handle NaN values properly
  const minBookingTime = new Date(now.getTime() + ((minNoticeHours || 1) * 60 * 60 * 1000))

  console.log('🔥🔥 Calculated times:')
  console.log('  - now:', now.toISOString())
  console.log('  - minBookingTime:', minBookingTime.toISOString())

  let dayCount = 0
  // Generate slots for each day in the range
  while (currentDate <= endDateTime && dayCount < 10) { // Safety limit
    const dateString = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    console.log(`🔥🔥 Processing day ${dayCount + 1}: ${dateString} (dayOfWeek: ${dayOfWeek})`)
    
    // Check if there's an override for this specific date
    const dayOverrides = overrides.filter(override => override.override_date === dateString)
    
    let dayAvailability = []
    
    if (dayOverrides.length > 0) {
      console.log(`🔥🔥 Found ${dayOverrides.length} overrides for ${dateString}`)
      dayAvailability = dayOverrides.map(override => ({
        start_time: override.start_time,
        end_time: override.end_time,
        is_available: override.is_available
      })).filter(slot => slot.is_available)
    } else {
      // Use base weekly availability for this day of week
      console.log(`🔥🔥 Using base availability for dayOfWeek ${dayOfWeek}`)
      dayAvailability = baseAvailability.filter(avail => {
        const matches = avail.day_of_week === dayOfWeek
        console.log(`    - Checking slot: day_of_week=${avail.day_of_week}, matches=${matches}`)
        return matches
      })
    }

    console.log(`🔥🔥 Day availability for ${dateString}:`, dayAvailability)

    // Generate time slots for this day
    for (const availability of dayAvailability) {
      console.log(`🔥🔥 Generating slots for: ${availability.start_time} - ${availability.end_time}`)
      
      const daySlots = generateTimeSlotsForDay(
        dateString,
        availability.start_time,
        availability.end_time,
        slotDuration,
        minBookingTime,
        bufferMinutes
      )
      
      console.log(`🔥🔥 Generated ${daySlots.length} slots for time block`)
      
      // Filter out conflicting slots
      const availableSlots = daySlots.filter(slot => {
        const hasConflictResult = hasConflict(slot, existingAppointments, existingBookings, slotDuration, bufferMinutes)
        if (hasConflictResult) {
          console.log(`🔥🔥 Slot ${slot.time} has conflict, removing`)
        }
        return !hasConflictResult
      })
      
      console.log(`🔥🔥 After conflict filtering: ${availableSlots.length} slots remain`)
      slots.push(...availableSlots)
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
    dayCount++
  }

  console.log(`🔥🔥 FINAL RESULT: Generated ${slots.length} total available slots`)
  return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
}

// ✅ FIXED: Generate time slots for a specific day with debugging
function generateTimeSlotsForDay(dateString, startTime, endTime, slotDuration, minBookingTime, bufferMinutes) {
  console.log(`🔥🔥🔥 generateTimeSlotsForDay called:`)
  console.log(`    - dateString: ${dateString}`)
  console.log(`    - startTime: ${startTime}`)
  console.log(`    - endTime: ${endTime}`)
  console.log(`    - minBookingTime: ${minBookingTime.toISOString()}`)

  const slots = []
  
  // ✅ FIXED: Ensure proper time parsing
  const dayStart = new Date(`${dateString}T${startTime}`)
  const dayEnd = new Date(`${dateString}T${endTime}`)
  
  console.log(`🔥🔥🔥 Parsed times:`)
  console.log(`    - dayStart: ${dayStart.toISOString()}`)
  console.log(`    - dayEnd: ${dayEnd.toISOString()}`)
  
  let currentSlot = new Date(dayStart)
  let slotCount = 0
  
  while (currentSlot < dayEnd && slotCount < 50) { // Safety limit
    const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60 * 1000))
    
    const isInFuture = currentSlot >= minBookingTime
    const fitsInDay = slotEnd <= dayEnd
    
    console.log(`🔥🔥🔥 Slot ${slotCount + 1}:`)
    console.log(`    - slotTime: ${currentSlot.toISOString()}`)
    console.log(`    - slotEnd: ${slotEnd.toISOString()}`)
    console.log(`    - isInFuture: ${isInFuture}`)
    console.log(`    - fitsInDay: ${fitsInDay}`)
    
    // Only include slots that are:
    // 1. In the future with minimum notice
    // 2. Slot end time doesn't exceed day end time
    if (isInFuture && fitsInDay) {
      const slot = {
        datetime: currentSlot.toISOString(),
        date: dateString,
        time: formatTime(currentSlot),
        duration_minutes: slotDuration,
        day_of_week: currentSlot.getDay(),
        available: true
      }
      slots.push(slot)
      console.log(`🔥🔥🔥 ✅ SLOT ADDED: ${slot.time}`)
    } else {
      console.log(`🔥🔥🔥 ❌ SLOT REJECTED`)
      if (!isInFuture) {
        console.log(`        Reason: Too soon (${currentSlot.toISOString()} < ${minBookingTime.toISOString()})`)
      }
      if (!fitsInDay) {
        console.log(`        Reason: Exceeds day (${slotEnd.toISOString()} > ${dayEnd.toISOString()})`)
      }
    }
    
    // Move to next slot (30-minute intervals for flexibility)
    currentSlot = new Date(currentSlot.getTime() + (30 * 60 * 1000))
    slotCount++
  }
  
  console.log(`🔥🔥🔥 Generated ${slots.length} slots for ${dateString}`)
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
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}