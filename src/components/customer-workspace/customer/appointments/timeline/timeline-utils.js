// src/components/customer-workspace/customer/appointments/timeline/timeline-utils.js

import { TIMELINE_SECTIONS, TIMELINE_DATE_FORMAT } from './timeline-constants';

/**
 * Gets the start and end of today
 * @returns {Object} - { startOfToday, endOfToday }
 */
const getTodayBounds = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { startOfToday, endOfToday };
};

/**
 * Gets the start and end of tomorrow
 * @returns {Object} - { startOfTomorrow, endOfTomorrow }
 */
const getTomorrowBounds = () => {
  const now = new Date();
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);
  return { startOfTomorrow, endOfTomorrow };
};

/**
 * Gets the start and end of this week (Sunday to Saturday)
 * @returns {Object} - { startOfWeek, endOfWeek }
 */
const getThisWeekBounds = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59);
  return { startOfWeek, endOfWeek };
};

/**
 * Gets the start and end of next week
 * @returns {Object} - { startOfNextWeek, endOfNextWeek }
 */
const getNextWeekBounds = () => {
  const { endOfWeek } = getThisWeekBounds();
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 1);
  startOfNextWeek.setHours(0, 0, 0, 0);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59);
  
  return { startOfNextWeek, endOfNextWeek };
};

/**
 * Determines which timeline section an appointment belongs to
 * @param {Object} appointment - Appointment object
 * @returns {string} - Timeline section key
 */
export const getTimelineSection = (appointment) => {
  if (!appointment.session) {
    return TIMELINE_SECTIONS.UNSCHEDULED;
  }

  const sessionDate = new Date(appointment.session);
  const now = new Date();
  const { startOfToday, endOfToday } = getTodayBounds();
  const { startOfTomorrow, endOfTomorrow } = getTomorrowBounds();
  const { endOfWeek } = getThisWeekBounds();
  const { endOfNextWeek } = getNextWeekBounds();

  // Overdue
  if (sessionDate < now && sessionDate < startOfToday) {
    return TIMELINE_SECTIONS.OVERDUE;
  }

  // Today
  if (sessionDate >= startOfToday && sessionDate <= endOfToday) {
    return TIMELINE_SECTIONS.TODAY;
  }

  // Tomorrow
  if (sessionDate >= startOfTomorrow && sessionDate <= endOfTomorrow) {
    return TIMELINE_SECTIONS.TOMORROW;
  }

  // This week (after tomorrow)
  if (sessionDate > endOfTomorrow && sessionDate <= endOfWeek) {
    return TIMELINE_SECTIONS.THIS_WEEK;
  }

  // Next week
  if (sessionDate > endOfWeek && sessionDate <= endOfNextWeek) {
    return TIMELINE_SECTIONS.NEXT_WEEK;
  }

  // Later
  return TIMELINE_SECTIONS.LATER;
};

/**
 * Groups appointments by timeline section
 * @param {Array} appointments - Array of appointments
 * @returns {Object} - Grouped appointments by section
 */
export const groupAppointmentsByTimeline = (appointments) => {
  const grouped = {
    [TIMELINE_SECTIONS.OVERDUE]: [],
    [TIMELINE_SECTIONS.TODAY]: [],
    [TIMELINE_SECTIONS.TOMORROW]: [],
    [TIMELINE_SECTIONS.THIS_WEEK]: [],
    [TIMELINE_SECTIONS.NEXT_WEEK]: [],
    [TIMELINE_SECTIONS.LATER]: [],
    [TIMELINE_SECTIONS.UNSCHEDULED]: [],
  };

  appointments.forEach((appointment) => {
    const section = getTimelineSection(appointment);
    grouped[section].push(appointment);
  });

  // Sort appointments within each section by session time
  Object.keys(grouped).forEach((section) => {
    grouped[section].sort((a, b) => {
      if (!a.session) return 1;
      if (!b.session) return -1;
      return new Date(a.session) - new Date(b.session);
    });
  });

  return grouped;
};

/**
 * Formats date for timeline display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatTimelineDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', TIMELINE_DATE_FORMAT.SHORT);
};

/**
 * Formats time for timeline display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time
 */
export const formatTimelineTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', TIMELINE_DATE_FORMAT.TIME);
};

/**
 * Gets day of week for timeline display
 * @param {string} dateString - ISO date string
 * @returns {string} - Day of week (e.g., "Monday") or "Today" or "Tomorrow"
 */
export const getTimelineDayOfWeek = (dateString) => {
  if (!dateString) return '';
  
  // Check if it's today
  if (isToday(dateString)) return 'Today';
  
  // Check if it's tomorrow
  if (isTomorrow(dateString)) return 'Tomorrow';
  
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Checks if date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const { startOfToday, endOfToday } = getTodayBounds();
  return date >= startOfToday && date <= endOfToday;
};

/**
 * Checks if date is tomorrow
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isTomorrow = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const { startOfTomorrow, endOfTomorrow } = getTomorrowBounds();
  return date >= startOfTomorrow && date <= endOfTomorrow;
};