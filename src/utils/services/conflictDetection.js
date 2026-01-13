// src/utils/services/conflictDetection.js
// ✅ UNIFIED CONFLICT DETECTION - Updated for latest schema

/**
 * Check if a proposed time slot conflicts with existing appointments, assessments, or bookings
 * 
 * @param {Object} params - Configuration object
 * @param {Date|string} params.slotStart - Proposed slot start time (Date object or ISO string)
 * @param {number} params.slotDuration - Duration in minutes
 * @param {Object} params.existingEntities - All existing scheduled entities
 * @param {Array} params.existingEntities.appointments - Array of appointment records
 * @param {Array} params.existingEntities.assessments - Array of assessment records
 * @param {Array} params.existingEntities.bookings - Array of booking records
 * @param {number} [params.bufferMinutes=15] - Buffer time around slots in minutes
 * 
 * @returns {Object} Conflict result
 * @returns {boolean} returns.hasConflict - Whether a conflict exists
 * @returns {Object|null} returns.conflictingEntity - Details of conflicting entity (if any)
 * @returns {string} returns.conflictingEntity.type - Type of conflict ('appointment', 'assessment', 'booking')
 * @returns {string} returns.conflictingEntity.id - ID of conflicting entity
 * @returns {Date} returns.conflictingEntity.start - Start time of conflict
 * @returns {Date} returns.conflictingEntity.end - End time of conflict
 * @returns {string} returns.conflictingEntity.status - Status of conflicting entity
 * @returns {string} returns.conflictingEntity.description - Human-readable description
 */
export function hasConflict({
  slotStart,
  slotDuration,
  existingEntities = {},
  bufferMinutes = 15
}) {
  // Normalize slotStart to Date object
  const slotStartDate = slotStart instanceof Date 
    ? slotStart 
    : new Date(slotStart)
  
  const slotEnd = new Date(slotStartDate.getTime() + (slotDuration * 60 * 1000))
  const bufferMs = bufferMinutes * 60 * 1000

  // Helper: Check if two time ranges overlap (with buffer)
  const overlaps = (entityStart, entityEnd) => {
    const bufferedEntityStart = new Date(entityStart.getTime() - bufferMs)
    const bufferedEntityEnd = new Date(entityEnd.getTime() + bufferMs)
    return slotStartDate < bufferedEntityEnd && slotEnd > bufferedEntityStart
  }

  // Helper: Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      timeZone: 'America/Jamaica',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // 1. Check APPOINTMENTS (using session + duration)
  const appointments = existingEntities.appointments || []
  for (const appointment of appointments) {
    // Skip if no session time or if in a final/cancelled state
    if (!appointment.session) continue
    if (!RELEVANT_STATUSES.appointments.includes(appointment.status)) continue
    
    const apptStart = new Date(appointment.session)
    const apptDuration = appointment.duration || 60
    const apptEnd = new Date(apptStart.getTime() + (apptDuration * 60 * 1000))
    
    if (overlaps(apptStart, apptEnd)) {
      return {
        hasConflict: true,
        conflictingEntity: {
          type: 'appointment',
          id: appointment.appointment_id,
          start: apptStart,
          end: apptEnd,
          status: appointment.status,
          description: `Appointment (${appointment.status}) from ${formatTime(apptStart)} to ${formatTime(apptEnd)}`
        }
      }
    }
  }

  // 2. Check ASSESSMENTS (using proposed_date OR confirmed_date + duration)
  const assessments = existingEntities.assessments || []
  for (const assessment of assessments) {
    // Skip if no date or if in a final/cancelled state
    if (!RELEVANT_STATUSES.assessments.includes(assessment.status)) continue
    
    // Prefer confirmed_date, fall back to proposed_date
    let assessmentDate = assessment.confirmed_date || assessment.proposed_date
    if (!assessmentDate) continue
    
    // Handle date-only strings (need to combine with time)
    let assessmentStart
    if (typeof assessmentDate === 'string' && !assessmentDate.includes('T')) {
      // Date-only string, need to add time
      const timeString = assessment.proposed_time || '09:00:00'
      assessmentStart = new Date(`${assessmentDate}T${timeString}`)
    } else {
      // Full datetime string or Date object
      assessmentStart = new Date(assessmentDate)
    }
    
    const assessmentDuration = assessment.proposed_duration_minutes || 
                               assessment.confirmed_duration_minutes || 
                               60
    const assessmentEnd = new Date(assessmentStart.getTime() + (assessmentDuration * 60 * 1000))
    
    if (overlaps(assessmentStart, assessmentEnd)) {
      return {
        hasConflict: true,
        conflictingEntity: {
          type: 'assessment',
          id: assessment.assessment_id,
          start: assessmentStart,
          end: assessmentEnd,
          status: assessment.status,
          description: `Assessment (${assessment.status}) from ${formatTime(assessmentStart)} to ${formatTime(assessmentEnd)}`
        }
      }
    }
  }

  // 3. Check BOOKINGS (using scheduled_start + scheduled_end)
  const bookings = existingEntities.bookings || []
  for (const booking of bookings) {
    // Skip if no scheduled times or if in a final/cancelled state
    if (!booking.scheduled_start) continue
    if (!RELEVANT_STATUSES.bookings.includes(booking.status)) continue
    
    const bookingStart = new Date(booking.scheduled_start)
    const bookingEnd = booking.scheduled_end 
      ? new Date(booking.scheduled_end)
      : new Date(bookingStart.getTime() + ((booking.duration_minutes || 60) * 60 * 1000))
    
    if (overlaps(bookingStart, bookingEnd)) {
      return {
        hasConflict: true,
        conflictingEntity: {
          type: 'booking',
          id: booking.booking_id,
          start: bookingStart,
          end: bookingEnd,
          status: booking.status,
          description: `Booking (${booking.status}) from ${formatTime(bookingStart)} to ${formatTime(bookingEnd)}`
        }
      }
    }
  }

  // No conflicts found
  return {
    hasConflict: false,
    conflictingEntity: null
  }
}

/**
 * Get ALL conflicts (not just the first one)
 * Useful for showing users "You have 3 conflicts with this time slot"
 */
export function getAllConflicts({
  slotStart,
  slotDuration,
  existingEntities = {},
  bufferMinutes = 15
}) {
  const slotStartDate = slotStart instanceof Date ? slotStart : new Date(slotStart)
  const slotEnd = new Date(slotStartDate.getTime() + (slotDuration * 60 * 1000))
  const bufferMs = bufferMinutes * 60 * 1000
  const conflicts = []

  const overlaps = (entityStart, entityEnd) => {
    const bufferedEntityStart = new Date(entityStart.getTime() - bufferMs)
    const bufferedEntityEnd = new Date(entityEnd.getTime() + bufferMs)
    return slotStartDate < bufferedEntityEnd && slotEnd > bufferedEntityStart
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      timeZone: 'America/Jamaica',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Check all appointments
  const appointments = existingEntities.appointments || []
  appointments.forEach(appointment => {
    if (!appointment.session) return
    if (!RELEVANT_STATUSES.appointments.includes(appointment.status)) return
    
    const apptStart = new Date(appointment.session)
    const apptDuration = appointment.duration || 60
    const apptEnd = new Date(apptStart.getTime() + (apptDuration * 60 * 1000))
    
    if (overlaps(apptStart, apptEnd)) {
      conflicts.push({
        type: 'appointment',
        id: appointment.appointment_id,
        start: apptStart,
        end: apptEnd,
        status: appointment.status,
        description: `Appointment (${appointment.status}) from ${formatTime(apptStart)} to ${formatTime(apptEnd)}`
      })
    }
  })

  // Check all assessments
  const assessments = existingEntities.assessments || []
  assessments.forEach(assessment => {
    if (!RELEVANT_STATUSES.assessments.includes(assessment.status)) return
    
    let assessmentDate = assessment.confirmed_date || assessment.proposed_date
    if (!assessmentDate) return
    
    let assessmentStart
    if (typeof assessmentDate === 'string' && !assessmentDate.includes('T')) {
      const timeString = assessment.proposed_time || '09:00:00'
      assessmentStart = new Date(`${assessmentDate}T${timeString}`)
    } else {
      assessmentStart = new Date(assessmentDate)
    }
    
    const assessmentDuration = assessment.proposed_duration_minutes || 
                               assessment.confirmed_duration_minutes || 
                               60
    const assessmentEnd = new Date(assessmentStart.getTime() + (assessmentDuration * 60 * 1000))
    
    if (overlaps(assessmentStart, assessmentEnd)) {
      conflicts.push({
        type: 'assessment',
        id: assessment.assessment_id,
        start: assessmentStart,
        end: assessmentEnd,
        status: assessment.status,
        description: `Assessment (${assessment.status}) from ${formatTime(assessmentStart)} to ${formatTime(assessmentEnd)}`
      })
    }
  })

  // Check all bookings
  const bookings = existingEntities.bookings || []
  bookings.forEach(booking => {
    if (!booking.scheduled_start) return
    if (!RELEVANT_STATUSES.bookings.includes(booking.status)) return
    
    const bookingStart = new Date(booking.scheduled_start)
    const bookingEnd = booking.scheduled_end 
      ? new Date(booking.scheduled_end)
      : new Date(bookingStart.getTime() + ((booking.duration_minutes || 60) * 60 * 1000))
    
    if (overlaps(bookingStart, bookingEnd)) {
      conflicts.push({
        type: 'booking',
        id: booking.booking_id,
        start: bookingStart,
        end: bookingEnd,
        status: booking.status,
        description: `Booking (${booking.status}) from ${formatTime(bookingStart)} to ${formatTime(bookingEnd)}`
      })
    }
  })

  return {
    hasConflicts: conflicts.length > 0,
    conflictCount: conflicts.length,
    conflicts
  }
}

/**
 * Validate that entity data has required fields
 * Useful for debugging API issues
 */
export function validateEntities(existingEntities) {
  const warnings = []

  // Check appointments
  if (existingEntities.appointments) {
    existingEntities.appointments.forEach((appt, index) => {
      if (!appt.session) {
        warnings.push(`Appointment ${index} missing 'session' field`)
      }
      if (!appt.appointment_id) {
        warnings.push(`Appointment ${index} missing 'appointment_id' field`)
      }
      if (!appt.status) {
        warnings.push(`Appointment ${index} missing 'status' field`)
      }
    })
  }

  // Check assessments
  if (existingEntities.assessments) {
    existingEntities.assessments.forEach((assess, index) => {
      if (!assess.proposed_date && !assess.confirmed_date) {
        warnings.push(`Assessment ${index} missing both 'proposed_date' and 'confirmed_date'`)
      }
      if (!assess.assessment_id) {
        warnings.push(`Assessment ${index} missing 'assessment_id' field`)
      }
      if (!assess.status) {
        warnings.push(`Assessment ${index} missing 'status' field`)
      }
    })
  }

  // Check bookings
  if (existingEntities.bookings) {
    existingEntities.bookings.forEach((booking, index) => {
      if (!booking.scheduled_start) {
        warnings.push(`Booking ${index} missing 'scheduled_start' field`)
      }
      if (!booking.booking_id) {
        warnings.push(`Booking ${index} missing 'booking_id' field`)
      }
      if (!booking.status) {
        warnings.push(`Booking ${index} missing 'status' field`)
      }
    })
  }

  return {
    isValid: warnings.length === 0,
    warnings
  }
}

/**
 * Helper to get relevant statuses for each entity type
 * UPDATED to match current schema status enums
 * Used to construct database queries and filter entities
 */
export const RELEVANT_STATUSES = {
  // appointment.status enum values that should block time slots
  appointments: [
    'pending',
    'interested',
    'competing',
    'evaluating',
    'proposed',
    'scheduled',
    'assessing',
    'assessed',
    'quoted',
    'comparing',
    'negotiating',
    'revised',
    'reviewing',
    'approved',
    'converting'
    // NOT included: 'abandoned', 'expired', 'declined', 'withdrawn', 'cancelled', 'superseded', 'converted'
  ],
  
  // assessment.status enum values that should block time slots
  assessments: [
    'proposed',
    'accepted',
    'scheduled',
    'confirmed',
    'active'
    // NOT included: 'completed', 'cancelled', 'absent'
  ],
  
  // booking.status enum values that should block time slots
  bookings: [
    'pending',
    'accepted',
    'progressing'
    // NOT included: 'rejected', 'cancelled', 'rescheduled', 'expired', 'completed', 'absent', 'failed'
  ]
}

export default hasConflict