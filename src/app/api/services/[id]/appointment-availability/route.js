// src/app/api/professionals/[id]/appointment-availability/route.js
// =====================================================
// PROFESSIONAL APPOINTMENT AVAILABILITY API
// Returns real available time slots for a specific professional
// Includes conflict detection with appointments, assessments, and bookings
// =====================================================

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { hasConflict, getAllConflicts, validateEntities, RELEVANT_STATUSES } from '@/utils/services/conflictDetection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/professionals/[id]/appointment-availability
 * 
 * Query Parameters:
 * - start_date: ISO date string (default: today)
 * - end_date: ISO date string (default: 30 days from start)
 * - duration: slot duration in minutes (default: 60)
 * - type: 'appointment' | 'assessment' | 'booking' (default: 'appointment')
 */
export async function GET(request, { params }) {
  try {
    const { id: professionalId } = params
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')
    const durationParam = parseInt(searchParams.get('duration')) || 60
    const typeParam = searchParams.get('type') || 'appointment'
    
    // Set date range defaults
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date()
    
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    console.log('🔍 Fetching availability:', {
      professionalId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: durationParam,
      type: typeParam
    })

    const supabase = createClient()

    // ============================================
    // 1. GET PROFESSIONAL SETTINGS
    // ============================================
    const { data: professional, error: professionalError } = await supabase
      .from('individual_professional')
      .select('min_notice_hours, buffer_minutes, default_event_duration, max_bookings_per_day')
      .eq('professional_id', professionalId)
      .single()

    if (professionalError) {
      console.error('❌ Error fetching professional:', professionalError)
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    const {
      min_notice_hours = 24,
      buffer_minutes = 15,
      default_event_duration = 60,
      max_bookings_per_day = 8
    } = professional

    // Use professional's default duration if not specified
    const slotDuration = durationParam || default_event_duration

    // ============================================
    // 2. GET BASE WEEKLY AVAILABILITY
    // ============================================
    const { data: weeklyAvailability, error: availabilityError } = await supabase
      .from('availability')
      .select('availability_id, day_of_week, start_time, end_time')
      .eq('professional_id', professionalId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (availabilityError) {
      console.error('❌ Error fetching availability:', availabilityError)
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      )
    }

    // ============================================
    // 3. GET DATE-SPECIFIC OVERRIDES
    // ============================================
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_override')
      .select('override_id, override_date, start_time, end_time, is_available')
      .eq('professional_id', professionalId)
      .gte('override_date', startDate.toISOString().split('T')[0])
      .lte('override_date', endDate.toISOString().split('T')[0])

    if (overridesError) {
      console.error('⚠️ Error fetching overrides:', overridesError)
      // Continue without overrides
    }

    // ============================================
    // 4. GET EXISTING TIME COMMITMENTS
    // ============================================
    
    // 4a. Get appointments
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointment')
      .select('appointment_id, session, duration, status, title')
      .eq('professional_id', professionalId)
      .gte('session', startDate.toISOString())
      .lte('session', endDate.toISOString())
      .in('status', RELEVANT_STATUSES.appointments)

    if (appointmentsError) {
      console.error('⚠️ Error fetching appointments:', appointmentsError)
    }

    // 4b. Get assessments
    const { data: existingAssessments, error: assessmentsError } = await supabase
      .from('assessment')
      .select(`
        assessment_id,
        proposed_date,
        confirmed_date,
        proposed_duration_minutes,
        confirmed_duration_minutes,
        status,
        assessment_type
      `)
      .eq('professional_id', professionalId)
      .or(`proposed_date.gte.${startDate.toISOString()},confirmed_date.gte.${startDate.toISOString()}`)
      .or(`proposed_date.lte.${endDate.toISOString()},confirmed_date.lte.${endDate.toISOString()}`)
      .in('status', RELEVANT_STATUSES.assessments)

    if (assessmentsError) {
      console.error('⚠️ Error fetching assessments:', assessmentsError)
    }

    // 4c. Get bookings
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('booking')
      .select('booking_id, scheduled_start, scheduled_end, status, duration_minutes')
      .eq('professional_id', professionalId)
      .gte('scheduled_start', startDate.toISOString())
      .lte('scheduled_start', endDate.toISOString())
      .in('status', RELEVANT_STATUSES.bookings)

    if (bookingsError) {
      console.error('⚠️ Error fetching bookings:', bookingsError)
    }

    // Optional: Validate entity data for debugging
    if (process.env.NODE_ENV === 'development') {
      const validation = validateEntities({
        appointments: existingAppointments || [],
        assessments: existingAssessments || [],
        bookings: existingBookings || []
      })
      if (!validation.isValid) {
        console.warn('⚠️ Entity validation warnings:', validation.warnings)
      }
    }

    // ============================================
    // 5. GENERATE AVAILABLE SLOTS
    // ============================================
    const availableSlots = []
    const currentDate = new Date(startDate)
    const minNoticeTime = new Date(Date.now() + min_notice_hours * 60 * 60 * 1000)

    // Create override lookup map
    const overrideMap = new Map()
    if (overrides) {
      overrides.forEach(override => {
        overrideMap.set(override.override_date, override)
      })
    }

    // Iterate through each day in the date range
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday

      // Check for date-specific override first
      const override = overrideMap.get(dateStr)
      let daySchedule = []

      if (override) {
        // Use override schedule
        if (override.is_available) {
          daySchedule = [{
            start_time: override.start_time,
            end_time: override.end_time
          }]
        }
        // If override.is_available = false, daySchedule stays empty (day blocked)
      } else {
        // Use weekly recurring schedule
        daySchedule = weeklyAvailability.filter(slot => slot.day_of_week === dayOfWeek)
      }

      // Generate time slots for this day
      for (const schedule of daySchedule) {
        const [startHour, startMinute] = schedule.start_time.split(':').map(Number)
        const [endHour, endMinute] = schedule.end_time.split(':').map(Number)

        // Create start and end times for the day
        const dayStart = new Date(currentDate)
        dayStart.setHours(startHour, startMinute, 0, 0)

        const dayEnd = new Date(currentDate)
        dayEnd.setHours(endHour, endMinute, 0, 0)

        // Generate slots within this time block
        let slotStart = new Date(dayStart)
        while (slotStart.getTime() + slotDuration * 60 * 1000 <= dayEnd.getTime()) {
          // Skip if slot is in the past or within minimum notice period
          if (slotStart < minNoticeTime) {
            slotStart = new Date(slotStart.getTime() + slotDuration * 60 * 1000)
            continue
          }

          // Check for conflicts
          const conflictResult = hasConflict({
            slotStart: slotStart.toISOString(),
            slotDuration,
            existingEntities: {
              appointments: existingAppointments || [],
              assessments: existingAssessments || [],
              bookings: existingBookings || []
            },
            bufferMinutes: buffer_minutes
          })

          // Only include slot if no conflict
          if (!conflictResult.hasConflict) {
            availableSlots.push({
              datetime: slotStart.toISOString(),
              date: dateStr,
              time: slotStart.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              duration: slotDuration,
              type: typeParam
            })
          }

          // Move to next slot
          slotStart = new Date(slotStart.getTime() + slotDuration * 60 * 1000)
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // ============================================
    // 6. CREATE CONFLICT SUMMARY
    // ============================================
    const conflictSummary = {
      appointments: existingAppointments?.length || 0,
      assessments: existingAssessments?.length || 0,
      bookings: existingBookings?.length || 0,
      total_busy_periods: (existingAppointments?.length || 0) + 
                         (existingAssessments?.length || 0) + 
                         (existingBookings?.length || 0),
      details: {
        appointment_statuses: [...new Set((existingAppointments || []).map(a => a.status))],
        assessment_statuses: [...new Set((existingAssessments || []).map(a => a.status))],
        booking_statuses: [...new Set((existingBookings || []).map(b => b.status))]
      }
    }

    // ============================================
    // 7. RETURN RESPONSE
    // ============================================
    console.log('✅ Available slots generated:', {
      total_slots: availableSlots.length,
      date_range: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      conflict_summary: conflictSummary
    })

    return NextResponse.json({
      success: true,
      professional_id: professionalId,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      slot_config: {
        duration: slotDuration,
        type: typeParam,
        buffer_minutes,
        min_notice_hours
      },
      available_slots: availableSlots,
      conflict_summary: conflictSummary,
      metadata: {
        weekly_schedule_blocks: weeklyAvailability?.length || 0,
        overrides_applied: overrides?.length || 0,
        max_bookings_per_day
      }
    })

  } catch (error) {
    console.error('❌ Appointment availability error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch availability',
        details: error.message 
      },
      { status: 500 }
    )
  }
}