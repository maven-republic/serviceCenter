'use client'

import { useState, useCallback, useEffect } from 'react'
import Address from '@/components/Address/Address'

// Jamaica parishes for dropdown
const JAMAICA_PARISHES = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 'Manchester',
  'St. Elizabeth', 'Westmoreland', 'Hanover', 'St. James', 'Trelawny',
  'St. Ann', 'St. Mary', 'Portland', 'St. Thomas'
]

// Helper function to extract address components from Google Place
const parseGooglePlace = (place) => {
  const components = place.address_components || []
  const geometry = place.geometry?.location
  
  let street_number = ''
  let route = ''
  let locality = ''
  let parish = ''

  components.forEach(component => {
    const types = component.types
    if (types.includes('street_number')) {
      street_number = component.long_name
    } else if (types.includes('route')) {
      route = component.long_name
    } else if (types.includes('locality')) {
      locality = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      parish = component.long_name
    }
  })

  // Try to match parish with Jamaica parishes
  const matchedParish = JAMAICA_PARISHES.find(p => 
    parish.toLowerCase().includes(p.toLowerCase()) || 
    p.toLowerCase().includes(parish.toLowerCase())
  )

  return {
    street_address: `${street_number} ${route}`.trim() || '',
    city: locality || '',
    parish: matchedParish || parish || '',
    community: '',
    landmark: '',
    is_rural: false,
    latitude: geometry?.lat?.() || null,
    longitude: geometry?.lng?.() || null,
    formatted_address: place.formatted_address || '',
    place_id: place.place_id || null,
    google_place_data: place
  }
}

export default function AppointmentAddressSelector({ 
  onAddressSelect, 
  currentAddress = null,
  className = ''
}) {
  const [selectedMode, setSelectedMode] = useState('search')
  const [addressData, setAddressData] = useState(currentAddress || {
    street_address: '',
    city: '',
    parish: '',
    community: '',
    landmark: '',
    is_rural: false,
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: null
  })
  const [errors, setErrors] = useState({})
  const [hasGoogleSelection, setHasGoogleSelection] = useState(false)

  // Update local state when currentAddress prop changes
  useEffect(() => {
    if (currentAddress) {
      setAddressData(currentAddress)
      if (currentAddress.place_id) {
        setHasGoogleSelection(true)
        setSelectedMode('search')
      }
    }
  }, [currentAddress])

  // Handle Google Places selection
  const handlePlaceSelect = useCallback((place) => {
    console.log('🗺️ Google Place selected:', place)
    
    const parsedAddress = parseGooglePlace(place)
    setAddressData(parsedAddress)
    setHasGoogleSelection(true)
    setErrors({})
    
    onAddressSelect?.(parsedAddress)
  }, [onAddressSelect])

  // Handle manual form changes
  const handleManualChange = useCallback((field, value) => {
    const newAddressData = {
      ...addressData,
      [field]: value
    }
    setAddressData(newAddressData)
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }

    onAddressSelect?.({
      ...newAddressData,
      latitude: null,
      longitude: null,
      place_id: null,
      formatted_address: `${newAddressData.street_address}, ${newAddressData.city}, ${newAddressData.parish}`.replace(/^,\s*|,\s*$/g, '')
    })
  }, [addressData, errors, onAddressSelect])

  // Validate manual form
  const validateManualForm = useCallback(() => {
    const newErrors = {}
    if (!addressData.street_address.trim()) {
      newErrors.street_address = 'Street address is required'
    }
    if (!addressData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!addressData.parish.trim()) {
      newErrors.parish = 'Parish is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [addressData])

  return (
    <div className={`compact-address-selector ${className}`}>
      {/* Compact Mode Toggle */}
      <div className="mode-toggle">
        <div className="toggle-buttons">
          <button
            type="button"
            className={`toggle-btn ${selectedMode === 'search' ? 'active' : ''}`}
            onClick={() => setSelectedMode('search')}
          >
            🔍 Search
          </button>
          <button
            type="button"
            className={`toggle-btn ${selectedMode === 'manual' ? 'active' : ''}`}
            onClick={() => setSelectedMode('manual')}
          >
            ✏️ Manual
          </button>
        </div>
      </div>

      {/* Search Mode */}
      {selectedMode === 'search' && (
        <div className="search-section">
          <div className="search-input-wrapper">
            <Address
              onSelect={handlePlaceSelect}
              defaultValue={addressData.formatted_address}
              placeholder="Search for address in Jamaica..."
            />
          </div>

          {hasGoogleSelection && addressData.street_address && (
            <div className="search-result">
              <div className="result-header">
                <span className="result-icon">✅</span>
                <span className="result-title">Address Selected</span>
              </div>
              <div className="result-address">
                {addressData.street_address}, {addressData.city}, {addressData.parish}
              </div>
              <button
                type="button"
                className="edit-link"
                onClick={() => setSelectedMode('manual')}
              >
                Edit details →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {selectedMode === 'manual' && (
        <div className="manual-section">
          <div className="manual-grid">
            <div className="input-group">
              <label>Street Address *</label>
              <input
                type="text"
                className={`compact-input ${errors.street_address ? 'error' : ''}`}
                value={addressData.street_address}
                onChange={(e) => handleManualChange('street_address', e.target.value)}
                placeholder="123 Main Street"
              />
              {errors.street_address && (
                <span className="error-text">{errors.street_address}</span>
              )}
            </div>

            <div className="input-group">
              <label>City *</label>
              <input
                type="text"
                className={`compact-input ${errors.city ? 'error' : ''}`}
                value={addressData.city}
                onChange={(e) => handleManualChange('city', e.target.value)}
                placeholder="Kingston"
              />
              {errors.city && (
                <span className="error-text">{errors.city}</span>
              )}
            </div>

            <div className="input-group">
              <label>Parish *</label>
              <select
                className={`compact-input ${errors.parish ? 'error' : ''}`}
                value={addressData.parish}
                onChange={(e) => handleManualChange('parish', e.target.value)}
              >
                <option value="">Select Parish</option>
                {JAMAICA_PARISHES.map(parish => (
                  <option key={parish} value={parish}>{parish}</option>
                ))}
              </select>
              {errors.parish && (
                <span className="error-text">{errors.parish}</span>
              )}
            </div>

            <div className="input-group">
              <label>Community</label>
              <input
                type="text"
                className="compact-input"
                value={addressData.community}
                onChange={(e) => handleManualChange('community', e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="input-group full-width">
              <label>Landmark</label>
              <input
                type="text"
                className="compact-input"
                value={addressData.landmark}
                onChange={(e) => handleManualChange('landmark', e.target.value)}
                placeholder="Near landmark (optional)"
              />
            </div>

            <div className="checkbox-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={addressData.is_rural}
                  onChange={(e) => handleManualChange('is_rural', e.target.checked)}
                />
                <span>This is a rural location</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="mode-switch-link"
            onClick={() => setSelectedMode('search')}
          >
            ← Switch to search
          </button>
        </div>
      )}

      <style jsx>{`
        .compact-address-selector {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
        }

        /* Mode Toggle */
        .mode-toggle {
          margin-bottom: 1rem;
        }

        .toggle-buttons {
          display: flex;
          background: #e9ecef;
          border-radius: 6px;
          padding: 2px;
        }

        .toggle-btn {
          flex: 1;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6c757d;
        }

        .toggle-btn.active {
          background: white;
          color: #0d6efd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toggle-btn:hover:not(.active) {
          color: #495057;
        }

        /* Search Section */
        .search-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-result {
          background: white;
          border: 1px solid #198754;
          border-radius: 6px;
          padding: 12px;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .result-icon {
          font-size: 14px;
        }

        .result-title {
          font-weight: 600;
          color: #198754;
          font-size: 13px;
        }

        .result-address {
          color: #495057;
          font-size: 13px;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .edit-link {
          background: none;
          border: none;
          color: #0d6efd;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .edit-link:hover {
          color: #0b5ed7;
        }

        /* Manual Section */
        .manual-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .manual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group.full-width {
          grid-column: 1 / -1;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 4px;
        }

        .compact-input {
          padding: 8px 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: white;
        }

        .compact-input:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }

        .compact-input.error {
          border-color: #dc3545;
        }

        .error-text {
          color: #dc3545;
          font-size: 11px;
          margin-top: 2px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #495057;
          cursor: pointer;
          margin: 0;
        }

        .checkbox-label input[type="checkbox"] {
          transform: scale(1.1);
        }

        .mode-switch-link {
          background: none;
          border: none;
          color: #6c757d;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }

        .mode-switch-link:hover {
          color: #495057;
          text-decoration: underline;
        }

        /* Mobile Responsive */
        @media (max-width: 576px) {
          .compact-address-selector {
            padding: 0.75rem;
          }

          .manual-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .toggle-btn {
            padding: 6px 8px;
            font-size: 12px;
          }

          .compact-input {
            padding: 6px 8px;
            font-size: 12px;
          }

          .input-group label {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  )
}