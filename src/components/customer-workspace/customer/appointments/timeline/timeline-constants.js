// src/components/customer-workspace/customer/appointments/timeline/timeline-constants.js

/**
 * Timeline section types for grouping appointments
 */
export const TIMELINE_SECTIONS = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'this_week',
  NEXT_WEEK: 'next_week',
  LATER: 'later',
  UNSCHEDULED: 'unscheduled',
};

/**
 * Section display configuration
 */
export const SECTION_CONFIG = {
  [TIMELINE_SECTIONS.OVERDUE]: {
    label: 'Overdue',
    icon: '⚠️',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    defaultExpanded: true,
  },
  [TIMELINE_SECTIONS.TODAY]: {
    label: 'Today',
    icon: '📅',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    defaultExpanded: true,
  },
  [TIMELINE_SECTIONS.TOMORROW]: {
    label: 'Tomorrow',
    icon: '📆',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    defaultExpanded: true,
  },
  [TIMELINE_SECTIONS.THIS_WEEK]: {
    label: 'This Week',
    icon: '📋',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    defaultExpanded: true,
  },
  [TIMELINE_SECTIONS.NEXT_WEEK]: {
    label: 'Next Week',
    icon: '📊',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    defaultExpanded: false,
  },
  [TIMELINE_SECTIONS.LATER]: {
    label: 'Later',
    icon: '📅',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    defaultExpanded: false,
  },
  [TIMELINE_SECTIONS.UNSCHEDULED]: {
    label: 'Not Scheduled',
    icon: '📝',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    defaultExpanded: false,
  },
};

/**
 * Date format for timeline
 */
export const TIMELINE_DATE_FORMAT = {
  FULL: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  SHORT: {
    month: 'short',
    day: 'numeric',
  },
  TIME: {
    hour: '2-digit',
    minute: '2-digit',
  },
};