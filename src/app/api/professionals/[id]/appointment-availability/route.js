// src/app/api/professionals/[id]/appointment-availability/route.js
// FIXED: Simplified timezone handling, better day-of-week matching

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getDateDaysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function generateTimeSlots(startTime, endTime, durationMinutes, bufferMinutes = 0) {
  const slots = []
  
  // Parse start time (HH:MM:SS format)
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotHour = Math.floor(currentMinutes / 60)
    const slotMinute = currentMinutes % 60
    
    slots.push({
      time: `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}:00`,
      hour: slotHour,
      minute: slotMinute
    })
    
    currentMinutes += durationMinutes + bufferMinutes
  }
  
  return slots
}

export async function GET(request, { params }) {
  console.log('🔥 Availability API called!')
  
  try {
    const resolvedParams = await params
    const { id: professionalId } = resolvedParams
    
    console.log('🎯 Professional ID:', professionalId)
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || getDateDaysFromNow(30)
    const slotDuration = parseInt(searchParams.get('slot_duration')) || 60
    
    console.log('📋 Parameters:', { startDate, endDate, slotDuration })
    
    // Validate professional exists and get settings
    const { data: professional, error: professionalError } = await supabase
      .from('individual_professional')
      .select('professional_id, min_notice_hours, buffer_minutes, default_event_duration')
      .eq('professional_id', professionalId)
      .single()

    if (professionalError || !professional) {
      console.error('❌ Professional not found:', professionalError)
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    console.log('✅ Professional found')
    
    const minNoticeHours = professional.min_notice_hours || 1
    const bufferMinutes = professional.buffer_minutes || 0
    const effectiveDuration = slotDuration || professional.default_event_duration || 60
    
    // Get base weekly availability
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

    console.log('📅 Base availability count:', baseAvailability?.length || 0)

    if (!baseAvailability || baseAvailability.length === 0) {
      return NextResponse.json({
        professional_id: professionalId,
        available_slots: [],
        message: 'No availability set'
      })
    }

    // Get availability overrides for date range
    const { data: overrides } = await supabase
      .from('availability_override')
      .select('override_date, start_time, end_time, is_available')
      .eq('professional_id', professionalId)
      .gte('override_date', startDate)
      .lte('override_date', endDate)

    console.log('📅 Overrides count:', overrides?.length || 0)

    // Create override map for quick lookup
    const overrideMap = new Map()
    if (overrides) {
      overrides.forEach(override => {
        overrideMap.set(override.override_date, override)
      })
    }

    // Get existing appointments
    const { data: existingAppointments } = await supabase
      .from('appointment')
      .select('session, duration')
      .eq('professional_id', professionalId)
      .gte('session', `${startDate}T00:00:00`)
      .lte('session', `${endDate}T23:59:59`)
      .in('status', ['pending', 'quoted', 'approved', 'converting', 'converted'])

    console.log('📅 Existing appointments:', existingAppointments?.length || 0)

    // Get existing bookings
    const { data: existingBookings } = await supabase
      .from('booking')
      .select('scheduled_start, scheduled_end, duration_minutes')
      .eq('professional_id', professionalId)
      .gte('scheduled_start', `${startDate}T00:00:00`)
      .lte('scheduled_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'accepted', 'confirmed', 'progressing'])

    console.log('📅 Existing bookings:', existingBookings?.length || 0)

    // Combine all busy periods
    const busyPeriods = []
    
    if (existingAppointments) {
      existingAppointments.forEach(appt => {
        const start = new Date(appt.session)
        const end = new Date(start.getTime() + ((appt.duration || 60) * 60 * 1000))
        busyPeriods.push({ start, end })
      })
    }

    if (existingBookings) {
      existingBookings.forEach(booking => {
        const start = new Date(booking.scheduled_start)
        const end = booking.scheduled_end 
          ? new Date(booking.scheduled_end)
          : new Date(start.getTime() + ((booking.duration_minutes || 60) * 60 * 1000))
        busyPeriods.push({ start, end })
      })
    }

    // Calculate minimum booking time (respects min_notice_hours)
    const now = new Date()
    const minBookingTime = new Date(now.getTime() + (minNoticeHours * 60 * 60 * 1000))

    console.log('⏰ Min booking time:', minBookingTime.toISOString())

    // Generate available slots
    const availableSlots = []
    let currentDate = new Date(startDate + 'T00:00:00Z')
    const finalDate = new Date(endDate + 'T23:59:59Z')

    while (currentDate <= finalDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getUTCDay()

      console.log(`📅 Processing ${dateString} (day ${dayOfWeek})`)

      // Check for override first
      const override = overrideMap.get(dateString)
      
      let dayAvailability = null
      
      if (override) {
        console.log('  📌 Override found')
        // Override exists
        if (override.is_available) {
          dayAvailability = [{
            start_time: override.start_time,
            end_time: override.end_time
          }]
        }
        // else: is_available = false, so no slots for this day
      } else {
        // Use regular weekly availability
        dayAvailability = baseAvailability.filter(a => a.day_of_week === dayOfWeek)
        console.log(`  📆 Using regular schedule: ${dayAvailability.length} time blocks`)
      }

      // Generate slots for this day
      if (dayAvailability && dayAvailability.length > 0) {
        dayAvailability.forEach(avail => {
          const timeSlots = generateTimeSlots(
            avail.start_time,
            avail.end_time,
            effectiveDuration,
            bufferMinutes
          )

          console.log(`    ⏰ Generated ${timeSlots.length} potential slots for ${avail.start_time}-${avail.end_time}`)

          timeSlots.forEach(slot => {
            // Construct datetime for this slot
            const slotDateTime = new Date(`${dateString}T${slot.time}Z`)
            
            // Check if slot is in the future with minimum notice
            if (slotDateTime < minBookingTime) {
              return // Skip this slot - too soon
            }

            // Check if slot conflicts with busy periods
            const slotEnd = new Date(slotDateTime.getTime() + (effectiveDuration * 60 * 1000))
            
            const hasConflict = busyPeriods.some(busy => {
              return slotDateTime < busy.end && slotEnd > busy.start
            })

            if (!hasConflict) {
              availableSlots.push({
                date: dateString,
                time: slot.time.substring(0, 5), // HH:MM format
                datetime: slotDateTime.toISOString(),
                day_of_week: dayOfWeek,
                duration_minutes: effectiveDuration,
                is_override: !!override
              })
            }
          })
        })
      } else {
        console.log(`  ❌ No availability for this day`)
      }

      // Move to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    console.log(`✅ Generated ${availableSlots.length} available slots`)

    return NextResponse.json({
      professional_id: professionalId,
      available_slots: availableSlots,
      settings: {
        min_notice_hours: minNoticeHours,
        buffer_minutes: bufferMinutes,
        slot_duration: effectiveDuration
      },
      date_range: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('💥 Error in availability API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}