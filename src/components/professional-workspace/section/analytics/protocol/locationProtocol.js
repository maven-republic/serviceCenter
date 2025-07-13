// src/components/professional-workspace/section/analytics/protocol/locationProtocol.js
export const LOCATION_PROTOCOL = {
  // Start with countries we support
  supportedCountries: [
    'Jamaica',
    'United States', 
    'Canada',
    'United Kingdom',
    'Australia'
  ],

  // Default fallbacks
  defaults: {
    country: 'Jamaica',
    currency: 'JMD',
    region_type: 'parish'
  },

  // Regional divisions (start small, expand later)
  regions: {
    'Jamaica': [
      'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon',
      'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover',
      'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'
    ],
    // Add other countries as needed
  }
};

export function getRegionsForCountry(country) {
  return LOCATION_PROTOCOL.regions[country] || [];
}

export function isCountrySupported(country) {
  return LOCATION_PROTOCOL.supportedCountries.includes(country);
}