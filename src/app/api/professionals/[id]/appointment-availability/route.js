// src/app/api/professionals/[id]/appointment-availability/route.js
// ENHANCED: Type support, multi-day, complete conflict detection

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

// ✅ NEW: Get type-specific configuration
function getTypeConfig(type, professional) {
  const configs = {
    assessment: {
      defaultDuration: 90, // 1.5 hours for assessment
      defaultDateRange: 14, // Look 2 weeks ahead
      priority: 'near_term', // Prioritize sooner dates
      description: 'Site Assessment Visit'
    },
    appointment: {
      defaultDuration: professional.default_event_duration || 60,
      defaultDateRange: 30, // Standard 30 days
      priority: 'standard',
      description: 'Customer Appointment'
    },
    booking: {
      defaultDuration: 240, // 4 hours minimum for work
      defaultDateRange: 90, // Look 3 months ahead
      priority: 'flexible', // More flexible timing
      description: 'Project Work Booking'
    }
  }
  
  return configs[type] || configs.appointment
}

// ✅ NEW: Check if consecutive days are available (for multi-day projects)
function checkConsecutiveDays(availableSlots, startDate, numDays, hoursPerDay) {
  const consecutiveAvailable = []
  
  for (let i = 0; i <= availableSlots.length - numDays; i++) {
    const potentialStart = availableSlots[i]
    let isConsecutive = true
    let totalHours = 0
    
    // Check if we have numDays consecutive days with enough hours
    for (let day = 0; day < numDays; day++) {
      const checkDate = new Date(potentialStart.date)
      checkDate.setDate(checkDate.getDate() + day)
      const checkDateStr = checkDate.toISOString().split('T')[0]
      
      const daySlots = availableSlots.filter(s => s.date === checkDateStr)
      const dayHours = daySlots.length * (daySlots[0]?.duration_minutes || 60) / 60
      
      if (dayHours < hoursPerDay) {
        isConsecutive = false
        break
      }
      totalHours += dayHours
    }
    
    if (isConsecutive) {
      consecutiveAvailable.push({
        start_date: potentialStart.date,
        num_days: numDays,
        total_hours: totalHours,
        slots: availableSlots.slice(i, i + numDays)
      })
    }
  }
  
  return consecutiveAvailable
}

export async function GET(request, { params }) {
  console.log('🔥 Enhanced Availability API called!')
  
  try {
    const resolvedParams = await params
    const { id: professionalId } = resolvedParams
    
    console.log('🎯 Professional ID:', professionalId)
    
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // ✅ NEW: Get query parameters with type support
    const type = searchParams.get('type') || 'appointment' // assessment | appointment | booking
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0]
    const slotDuration = searchParams.get('duration') ? parseInt(searchParams.get('duration')) : null
    const multiDay = searchParams.get('multi_day') ? parseInt(searchParams.get('multi_day')) : null
    const preferredDate = searchParams.get('preferred_date') || null
    
    console.log('📋 Parameters:', { type, startDate, slotDuration, multiDay, preferredDate })
    
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
    
    // ✅ NEW: Get type-specific configuration
    const typeConfig = getTypeConfig(type, professional)
    const endDate = searchParams.get('end_date') || getDateDaysFromNow(typeConfig.defaultDateRange)
    
    const minNoticeHours = professional.min_notice_hours || 1
    const bufferMinutes = professional.buffer_minutes || 0
    const effectiveDuration = slotDuration || typeConfig.defaultDuration
    
    console.log('⚙️ Type Config:', typeConfig)
    console.log('⏱️ Effective Duration:', effectiveDuration, 'minutes')
    
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
        type: type,
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

    // ✅ ENHANCED: Get ALL existing conflicts
    console.log('🔍 Checking conflicts...')
    
    // Get existing appointments
    const { data: existingAppointments } = await supabase
      .from('appointment')
      .select('session, duration')
      .eq('professional_id', professionalId)
      .gte('session', `${startDate}T00:00:00`)
      .lte('session', `${endDate}T23:59:59`)
      .in('status', ['pending', 'quoted', 'approved', 'converting', 'converted'])

    console.log('📅 Existing appointments:', existingAppointments?.length || 0)

    // ✅ NEW: Get existing assessments
    const { data: existingAssessments } = await supabase
      .from('assessment')
      .select('proposed_date, duration_minutes')
      .eq('professional_id', professionalId)
      .gte('proposed_date', `${startDate}T00:00:00`)
      .lte('proposed_date', `${endDate}T23:59:59`)
      .in('status', ['proposed', 'accepted', 'scheduled', 'confirmed', 'in_progress'])

    console.log('📅 Existing assessments:', existingAssessments?.length || 0)

    // Get existing bookings
    const { data: existingBookings } = await supabase
      .from('booking')
      .select('scheduled_start, scheduled_end, duration_minutes')
      .eq('professional_id', professionalId)
      .gte('scheduled_start', `${startDate}T00:00:00`)
      .lte('scheduled_start', `${endDate}T23:59:59`)
      .in('status', ['pending', 'accepted', 'confirmed', 'progressing'])

    console.log('📅 Existing bookings:', existingBookings?.length || 0)

    // ✅ NEW: Get existing projects
    const { data: existingProjects } = await supabase
      .from('project')
      .select('start_date, end_date, estimated_duration_hours')
      .eq('professional_id', professionalId)
      .in('status', ['active', 'in_progress', 'paused'])

    console.log('📅 Existing projects:', existingProjects?.length || 0)

    // ✅ ENHANCED: Combine ALL busy periods
    const busyPeriods = []
    
    // Add appointments to busy periods
    if (existingAppointments) {
      existingAppointments.forEach(appt => {
        const start = new Date(appt.session)
        const end = new Date(start.getTime() + ((appt.duration || 60) * 60 * 1000))
        busyPeriods.push({ 
          start, 
          end, 
          type: 'appointment',
          source: 'appointment'
        })
      })
    }

    // ✅ NEW: Add assessments to busy periods
    if (existingAssessments) {
      existingAssessments.forEach(assessment => {
        const start = new Date(assessment.proposed_date)
        const end = new Date(start.getTime() + ((assessment.duration_minutes || 90) * 60 * 1000))
        busyPeriods.push({ 
          start, 
          end, 
          type: 'assessment',
          source: 'assessment'
        })
      })
    }

    // Add bookings to busy periods
    if (existingBookings) {
      existingBookings.forEach(booking => {
        const start = new Date(booking.scheduled_start)
        const end = booking.scheduled_end 
          ? new Date(booking.scheduled_end)
          : new Date(start.getTime() + ((booking.duration_minutes || 60) * 60 * 1000))
        busyPeriods.push({ 
          start, 
          end, 
          type: 'booking',
          source: 'booking'
        })
      })
    }

    // ✅ NEW: Add projects to busy periods (block entire date ranges)
    if (existingProjects) {
      existingProjects.forEach(project => {
        if (project.start_date && project.end_date) {
          const start = new Date(project.start_date + 'T00:00:00Z')
          const end = new Date(project.end_date + 'T23:59:59Z')
          busyPeriods.push({ 
            start, 
            end, 
            type: 'project',
            source: 'project',
            blocks_entire_day: true
          })
        }
      })
    }

    console.log('🚫 Total busy periods:', busyPeriods.length)

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

      // ✅ NEW: Check if entire day is blocked by project
      const dayBlockedByProject = busyPeriods.some(busy => {
        if (!busy.blocks_entire_day) return false
        const checkDate = new Date(dateString + 'T12:00:00Z')
        return checkDate >= busy.start && checkDate <= busy.end
      })

      if (dayBlockedByProject) {
        console.log('  🚫 Day blocked by project')
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
        continue
      }

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
            
            const conflict = busyPeriods.find(busy => {
              return slotDateTime < busy.end && slotEnd > busy.start
            })

            if (!conflict) {
              availableSlots.push({
                date: dateString,
                time: slot.time.substring(0, 5), // HH:MM format
                datetime: slotDateTime.toISOString(),
                day_of_week: dayOfWeek,
                duration_minutes: effectiveDuration,
                is_override: !!override,
                type: type,
                type_description: typeConfig.description
              })
            } else {
              console.log(`    🚫 Slot ${slot.time} conflicts with ${conflict.source}`)
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

    // ✅ NEW: Check for multi-day availability if requested
    let multiDayAvailability = null
    if (multiDay && multiDay > 1) {
      console.log(`🔍 Checking ${multiDay}-day consecutive availability...`)
      
      const hoursPerDay = effectiveDuration / 60
      multiDayAvailability = checkConsecutiveDays(
        availableSlots, 
        startDate, 
        multiDay, 
        hoursPerDay
      )
      
      console.log(`✅ Found ${multiDayAvailability.length} multi-day options`)
    }

    // ✅ NEW: Sort slots based on type priority
    if (typeConfig.priority === 'near_term') {
      // For assessments, prioritize sooner dates
      availableSlots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    } else if (preferredDate) {
      // Sort by proximity to preferred date
      const preferredDateTime = new Date(preferredDate).getTime()
      availableSlots.sort((a, b) => {
        const aDiff = Math.abs(new Date(a.datetime).getTime() - preferredDateTime)
        const bDiff = Math.abs(new Date(b.datetime).getTime() - preferredDateTime)
        return aDiff - bDiff
      })
    }

    // Build response
    const response = {
      professional_id: professionalId,
      type: type,
      type_config: typeConfig,
      available_slots: availableSlots,
      settings: {
        min_notice_hours: minNoticeHours,
        buffer_minutes: bufferMinutes,
        slot_duration: effectiveDuration
      },
      date_range: {
        start: startDate,
        end: endDate
      },
      conflict_summary: {
        appointments: existingAppointments?.length || 0,
        assessments: existingAssessments?.length || 0,
        bookings: existingBookings?.length || 0,
        projects: existingProjects?.length || 0,
        total_busy_periods: busyPeriods.length
      }
    }

    // Add multi-day info if requested
    if (multiDayAvailability) {
      response.multi_day_availability = {
        consecutive_days: multiDay,
        available_blocks: multiDayAvailability
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Error in availability API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}