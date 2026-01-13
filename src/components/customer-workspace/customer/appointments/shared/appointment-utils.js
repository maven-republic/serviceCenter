// src/components/customer-workspace/customer/appointments/appointment-utils.js

import {
  APPOINTMENT_PATHS,
  STATUS_VARIANTS,
  STATUS_LABELS,
  PATH_BADGE_CONFIG,
  ACTION_BUTTON_LABELS,
  DATE_FORMATS,
  TIME_FORMAT,
  TRUNCATION_LIMITS,
} from './appointment-constants';

// ============================================
// PATH DETECTION
// ============================================

/**
 * Determines the appointment workflow path
 * @param {Object} appointment - Appointment object
 * @returns {string} - DIRECT, MARKETPLACE, or UNKNOWN
 * 
 * Business Logic:
 * - MARKETPLACE: Once interests exist, it's MARKETPLACE forever (immutable)
 * - DIRECT: professional_id is set AND no interests exist
 * - UNKNOWN: Neither condition met (initialization phase)
 */
export const getAppointmentPath = (appointment) => {
  if (!appointment) return APPOINTMENT_PATHS.UNKNOWN;
  
  // MARKETPLACE: Once interests exist, path is locked
  if (appointment.interests && appointment.interests.length > 0) {
    return APPOINTMENT_PATHS.MARKETPLACE;
  }
  
  // DIRECT: Has professional_id and no interests
  if (appointment.professional_id) {
    return APPOINTMENT_PATHS.DIRECT;
  }
  
  return APPOINTMENT_PATHS.UNKNOWN;
};

// ============================================
// STATUS UTILITIES
// ============================================

/**
 * Gets the badge variant for a status
 * @param {string} status - Appointment status
 * @param {string} path - Appointment path (DIRECT/MARKETPLACE)
 * @returns {string} - Badge variant
 */
export const getStatusVariant = (status, path) => {
  if (!status) return 'outline';
  
  // Check path-specific variants first
  if (path === APPOINTMENT_PATHS.DIRECT && STATUS_VARIANTS.DIRECT[status]) {
    return STATUS_VARIANTS.DIRECT[status];
  }
  
  if (path === APPOINTMENT_PATHS.MARKETPLACE && STATUS_VARIANTS.MARKETPLACE[status]) {
    return STATUS_VARIANTS.MARKETPLACE[status];
  }
  
  // Check common variants
  if (STATUS_VARIANTS.COMMON[status]) {
    return STATUS_VARIANTS.COMMON[status];
  }
  
  return 'outline';
};

/**
 * Gets user-friendly status display text
 * @param {string} status - Appointment status
 * @param {string} path - Appointment path
 * @returns {string} - Display text
 */
export const getStatusDisplayText = (status, path) => {
  if (!status) return 'Unknown';
  
  // Check path-specific labels
  if (path === APPOINTMENT_PATHS.DIRECT && STATUS_LABELS.DIRECT[status]) {
    return STATUS_LABELS.DIRECT[status];
  }
  
  if (path === APPOINTMENT_PATHS.MARKETPLACE && STATUS_LABELS.MARKETPLACE[status]) {
    return STATUS_LABELS.MARKETPLACE[status];
  }
  
  // Check common labels
  if (STATUS_LABELS.COMMON[status]) {
    return STATUS_LABELS.COMMON[status];
  }
  
  // Fallback to proper case
  return toProperCase(status);
};

// ============================================
// BOOKING UTILITIES
// ============================================

/**
 * Gets the booking status if available
 * @param {Object} appointment - Appointment object
 * @returns {string|null} - Booking status or null
 */
export const getBookingStatus = (appointment) => {
  return appointment?.booking?.status || null;
};

/**
 * Checks if appointment has an active booking
 * @param {Object} appointment - Appointment object
 * @returns {boolean}
 */
export const hasActiveBooking = (appointment) => {
  const bookingStatus = getBookingStatus(appointment);
  return bookingStatus && !['cancelled', 'rejected', 'failed'].includes(bookingStatus);
};

// ============================================
// PROFESSIONAL UTILITIES
// ============================================

/**
 * Extracts professional name from appointment
 * @param {Object} appointment - Appointment object
 * @returns {string} - Professional name
 */
export const getProfessionalName = (appointment) => {
  if (!appointment?.professional) return 'Professional';
  
  const prof = appointment.professional;
  const account = prof.account || prof;
  
  const firstName = account.first_name || '';
  const lastName = account.last_name || '';
  
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Professional';
};

/**
 * Gets professional initials for avatar fallback
 * @param {Object} appointment - Appointment object
 * @returns {string} - Initials
 */
export const getProfessionalInitials = (appointment) => {
  if (!appointment?.professional) return 'P';
  
  const account = appointment.professional.account || appointment.professional;
  const firstInitial = account.first_name?.[0] || '';
  const lastInitial = account.last_name?.[0] || '';
  
  return (firstInitial + lastInitial).toUpperCase() || 'P';
};

// ============================================
// INTEREST/RESPONSE UTILITIES
// ============================================

/**
 * Gets total interest count
 * @param {Object} appointment - Appointment object
 * @returns {number}
 */
export const getInterestCount = (appointment) => {
  return appointment?.interest_summary?.total_interests || 
         appointment?.interests?.length || 
         0;
};

/**
 * Gets active interest count (not withdrawn/rejected)
 * @param {Object} appointment - Appointment object
 * @returns {number}
 */
export const getActiveInterestCount = (appointment) => {
  return appointment?.interest_summary?.active_interests || 0;
};

/**
 * Gets quoted interest count
 * @param {Object} appointment - Appointment object
 * @returns {number}
 */
export const getQuotedInterestCount = (appointment) => {
  return appointment?.interest_summary?.quoted_interests || 0;
};

/**
 * Checks if appointment has any quotes
 * @param {Object} appointment - Appointment object
 * @returns {boolean}
 */
export const hasQuotes = (appointment) => {
  return getQuotedInterestCount(appointment) > 0;
};

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Formats date to full format
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMATS.SHORT);
};

/**
 * Formats date to compact format
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMATS.COMPACT);
};

/**
 * Formats time
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', TIME_FORMAT);
};

/**
 * Formats full date and time
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = formatDate(dateString);
  const time = formatTime(dateString);
  return time ? `${date} at ${time}` : date;
};

/**
 * Gets relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffMs > 0) {
    return 'Starting soon';
  } else {
    return 'Started';
  }
};

// ============================================
// TEXT UTILITIES
// ============================================

/**
 * Converts underscore_case to Proper Case
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const toProperCase = (text) => {
  if (!text) return '';
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export const truncateText = (text, maxLength = TRUNCATION_LIMITS.DESCRIPTION) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Pluralizes a word based on count
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string}
 */
export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : (plural || singular + 's');
};

// ============================================
// PATH BADGE UTILITIES
// ============================================

/**
 * Gets path badge configuration
 * @param {string} path - Appointment path
 * @returns {Object} - Badge config
 */
export const getPathBadgeConfig = (path) => {
  return PATH_BADGE_CONFIG[path] || PATH_BADGE_CONFIG[APPOINTMENT_PATHS.UNKNOWN];
};

// ============================================
// ACTION BUTTON UTILITIES
// ============================================

/**
 * Gets action button text based on path and status
 * @param {Object} appointment - Appointment object
 * @param {string} path - Appointment path
 * @returns {string}
 */
export const getActionButtonText = (appointment, path) => {
  if (path === APPOINTMENT_PATHS.DIRECT) {
    const status = appointment.status;
    return ACTION_BUTTON_LABELS.DIRECT[status] || ACTION_BUTTON_LABELS.DIRECT.default;
  }
  
  if (path === APPOINTMENT_PATHS.MARKETPLACE) {
    const quotedCount = getQuotedInterestCount(appointment);
    if (quotedCount > 0) {
      const label = ACTION_BUTTON_LABELS.MARKETPLACE.has_quotes;
      return label
        .replace('{count}', quotedCount)
        .replace('{plural}', quotedCount !== 1 ? 's' : '');
    }
    return ACTION_BUTTON_LABELS.MARKETPLACE.default;
  }
  
  return ACTION_BUTTON_LABELS.UNKNOWN;
};

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validates appointment has required fields
 * @param {Object} appointment - Appointment object
 * @returns {boolean}
 */
export const isValidAppointment = (appointment) => {
  return !!(
    appointment &&
    appointment.appointment_id &&
    appointment.service
  );
};

/**
 * Checks if appointment is scheduled
 * @param {Object} appointment - Appointment object
 * @returns {boolean}
 */
export const isScheduled = (appointment) => {
  return !!(appointment?.session);
};

/**
 * Checks if appointment is in terminal state
 * @param {Object} appointment - Appointment object
 * @returns {boolean}
 */
export const isTerminalState = (appointment) => {
  const terminalStates = ['cancelled', 'completed', 'assessed', 'declined'];
  return terminalStates.includes(appointment?.status);
};