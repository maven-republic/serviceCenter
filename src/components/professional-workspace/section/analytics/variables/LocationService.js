// src/components/professional-workspace/section/analytics/variables/LocationService.js
export class LocationService {
  constructor(professionalProfile) {
    this.profile = professionalProfile;
  }

  getLocation() {
    const address = this.profile?.address;
    
    return {
      country: address?.country || 'Jamaica', // Default to Jamaica for now
      region: address?.parish || address?.state || address?.province || 'Kingston',
      city: address?.city || 'Kingston',
      coordinates: {
        lat: address?.latitude,
        lng: address?.longitude
      }
    };
  }

  // Start with Jamaica, expand later
  getRegionType() {
    const country = this.getLocation().country;
    const regionTypes = {
      'Jamaica': 'parish',
      'United States': 'state',
      'Canada': 'province',
      'United Kingdom': 'county'
    };
    return regionTypes[country] || 'region';
  }
}