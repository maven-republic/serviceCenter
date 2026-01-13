// src/components/calendar/hooks/useAppointmentMode.js
import { useMemo } from 'react'

/**
 * Determines the appointment booking mode based on available props
 * 
 * Modes:
 * - 'direct': Single professional booking (professionalId provided)
 * - 'targeted': Multiple selected professionals (selectedProfessionals array)
 * - 'marketplace': Open marketplace (serviceId only)
 * - 'unknown': Invalid configuration
 * 
 * @param {string|null} professionalId - Single professional ID
 * @param {string|null} serviceId - Service ID
 * @param {Array} selectedProfessionals - Array of selected professional objects
 * @returns {Object} { mode, isValid, professionalIds }
 */
export function useAppointmentMode(professionalId, serviceId, selectedProfessionals = []) {
  return useMemo(() => {
    let mode
    let professionalIds = []

    // Determine mode based on props hierarchy
    if (professionalId && professionalId !== null) {
      mode = 'direct'
      professionalIds = [professionalId]
    } else if (selectedProfessionals && selectedProfessionals.length > 0) {
      mode = 'targeted'
      professionalIds = selectedProfessionals.map(p => p.professional_id)
    } else if (serviceId) {
      mode = 'marketplace'
      professionalIds = []
    } else {
      mode = 'unknown'
      professionalIds = []
    }

    // Create stable string for dependency tracking
    const stableProfessionalIds = professionalIds.sort().join(',')

    return {
      mode,
      isValid: mode !== 'unknown',
      professionalIds,
      stableProfessionalIds,
      isDirect: mode === 'direct',
      isTargeted: mode === 'targeted',
      isMarketplace: mode === 'marketplace'
    }
  }, [professionalId, serviceId, JSON.stringify(selectedProfessionals)])
}