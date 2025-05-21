// src/config/availabilityRules.js

export const AVAILABILITY_RULES = {
  MIN_NOTICE_HOURS: 12,        // Only used for specific date overrides
  BUFFER_MINUTES: 60,          // Required spacing between blocks
  MAX_BLOCKS_PER_DAY: 3,       // Max slots per weekday or override
  DEFAULT_BLOCK_START: '09:00',
  DEFAULT_BLOCK_END: '10:00'
}
