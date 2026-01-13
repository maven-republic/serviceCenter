// src/components/customer-workspace/customer/appointments/appointment-constants.js

/**
 * Appointment Path Types
 * Based on database logic and business rules
 */
export const APPOINTMENT_PATHS = {
  DIRECT: 'DIRECT',           // Direct booking with a specific professional
  MARKETPLACE: 'MARKETPLACE', // Multiple professionals responding
  UNKNOWN: 'UNKNOWN'          // Invalid or initialization state
};

/**
 * Status Badge Variants by Path
 * Maps appointment statuses to shadcn/ui badge variants
 */
export const STATUS_VARIANTS = {
  // DIRECT booking statuses (from booking.status trigger)
  DIRECT: {
    'pending': 'secondary',      // Awaiting professional acceptance
    'scheduled': 'default',      // Professional accepted, booking confirmed
    'assessing': 'secondary',    // Service in progress
    'assessed': 'default',       // Service completed
    'cancelled': 'destructive',  // Booking cancelled
  },
  
  // MARKETPLACE statuses (from interest/assessment workflow)
  MARKETPLACE: {
    'pending': 'secondary',
    'interested': 'default',
    'competing': 'outline',
    'evaluating': 'secondary',
    'proposed': 'outline',
    'scheduled': 'default',
    'assessing': 'secondary',
    'assessed': 'default',
    'quoted': 'default',
    'comparing': 'outline',
    'approved': 'default',
    'converting': 'secondary',
    'converted': 'default',
  },
  
  // Common statuses (apply to both paths)
  COMMON: {
    'declined': 'destructive',
    'cancelled': 'destructive',
    'withdrawn': 'outline',
    'completed': 'default',
  }
};

/**
 * User-friendly status display text
 */
export const STATUS_LABELS = {
  DIRECT: {
    'pending': 'Awaiting Acceptance',
    'scheduled': 'Scheduled',
    'assessing': 'In Progress',
    'assessed': 'Completed',
    'cancelled': 'Cancelled',
  },
  MARKETPLACE: {
    'pending': 'Pending',
    'interested': 'Interested',
    'competing': 'Competing',
    'evaluating': 'Evaluating',
    'proposed': 'Proposed',
    'scheduled': 'Scheduled',
    'assessing': 'Assessing',
    'assessed': 'Assessed',
    'quoted': 'Quoted',
    'comparing': 'Comparing',
    'approved': 'Approved',
    'converting': 'Converting',
    'converted': 'Converted',
  },
  COMMON: {
    'declined': 'Declined',
    'cancelled': 'Cancelled',
    'withdrawn': 'Withdrawn',
    'completed': 'Completed',
  }
};

/**
 * Path Badge Configuration
 * Visual styling for path indicators
 */
export const PATH_BADGE_CONFIG = {
  [APPOINTMENT_PATHS.DIRECT]: {
    variant: 'default',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
    label: 'Direct',
    icon: 'User', // lucide-react icon name
  },
  [APPOINTMENT_PATHS.MARKETPLACE]: {
    variant: 'outline',
    className: 'border-purple-300 text-purple-700',
    label: 'Marketplace',
    icon: 'Users', // lucide-react icon name
  },
  [APPOINTMENT_PATHS.UNKNOWN]: {
    variant: 'outline',
    className: 'border-gray-300 text-gray-500',
    label: 'Unknown',
    icon: 'HelpCircle', // lucide-react icon name
  }
};

/**
 * Action Button Labels by Path and Status
 */
export const ACTION_BUTTON_LABELS = {
  DIRECT: {
    'converted': 'View Booking',
    'scheduled': 'Track Status',
    'default': 'View Details',
  },
  MARKETPLACE: {
    'has_quotes': 'View {count} Quote{plural}',
    'default': 'View Responses',
  },
  UNKNOWN: 'View Details'
};

/**
 * Column Width Configuration
 * Percentage widths for table columns
 */
export const COLUMN_WIDTHS = {
  SERVICE_DETAILS: '30%',
  STATUS: '20%',
  DATE_TIME: '20%',
  ACTIONS: '30%',
};

/**
 * Mobile Breakpoint
 * Width in pixels where layout switches to mobile
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Date Format Options
 */
export const DATE_FORMATS = {
  FULL: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  SHORT: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  COMPACT: {
    month: 'short',
    day: 'numeric',
  },
};

/**
 * Time Format Options
 */
export const TIME_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Text Truncation Limits
 */
export const TRUNCATION_LIMITS = {
  DESCRIPTION: 80,
  SERVICE_NAME: 60,
  PROFESSIONAL_NAME: 40,
};

/**
 * Search Debounce Delay (ms)
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Animation Durations (ms)
 */
export const ANIMATION_DURATIONS = {
  SHEET_CLOSE: 300,
  SKELETON_PULSE: 2000,
};