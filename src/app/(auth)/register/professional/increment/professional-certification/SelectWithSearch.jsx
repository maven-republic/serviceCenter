'use client'

import { useState, useEffect } from 'react'

export default function SelectWithSearch({
  label,
  placeholder,
  value,
  options = [],
  onValueChange,
  onQueryChange,
  displayField = 'name',
  valueField = 'name',
  isLoading = false,
  noResultsMessage = 'No results found'
}) {
  const [query, setQuery] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Filter options based on query
  useEffect(() => {
    if (query.trim()) {
      const matches = options.filter(option =>
        option[displayField].toLowerCase().includes(query.toLowerCase())
      )
      setFilteredOptions(matches)
      setShowDropdown(true)
    } else {
      setFilteredOptions([])
      setShowDropdown(false)
    }
  }, [query, options, displayField])

  // Sync query with external value changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    onValueChange(newValue)
    if (onQueryChange) {
      onQueryChange(newValue)
    }
  }

  const handleOptionSelect = (option) => {
    const selectedValue = option[valueField]
    setQuery(selectedValue)
    onValueChange(selectedValue)
    setShowDropdown(false)
  }

  const DropdownItem = ({ option, onClick }) => (
    <div
      className="px-2 py-1 border-bottom"
      style={{
        transition: 'all 0.2s ease',
        fontSize: '13px',
        cursor: 'pointer',
        borderBottomColor: '#e9ecef'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f8f9fa'
        e.target.style.color = '#0d6efd'
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent'
        e.target.style.color = '#212529'
      }}
      onMouseDown={onClick}
    >
      <div className="fw-medium">{option[displayField]}</div>
      {option.subtitle && <small className="text-muted d-block">{option.subtitle}</small>}
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-enter {
          animation: fadeInDown 0.2s ease-out;
        }
        
        .enhanced-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
        }
        
        .enhanced-input.has-dropdown {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
        }
        
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }
        
        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }
        
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>

      <div className="mb-4 position-relative">
        <label className="form-label small text-muted">{label}</label>
        <input
          type="text"
          className={`form-control rounded-3 px-3 py-2 shadow-sm enhanced-input ${showDropdown ? 'has-dropdown' : ''}`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          style={{
            transition: 'all 0.2s ease'
          }}
        />

        {showDropdown && (
          <div 
            className="position-absolute bg-white border rounded-3 shadow-lg w-100 dropdown-enter thin-scrollbar" 
            style={{ 
              zIndex: 1000, 
              maxHeight: '200px', 
              overflowY: 'auto',
              borderColor: '#e9ecef',
              top: 'calc(100% + 8px)'
            }}
          >
            {isLoading && (
              <div className="px-2 py-1 text-center text-muted">
                <i className="fas fa-spinner fa-spin me-1"></i>
                <small>Loading...</small>
              </div>
            )}

            {!isLoading && filteredOptions.length === 0 && query.trim() && (
              <div className="px-2 py-1 text-center text-muted">
                <i className="fas fa-search me-1"></i>
                <small>{noResultsMessage}</small>
              </div>
            )}

            {!isLoading && filteredOptions.length > 0 && 
              filteredOptions.map((option, index) => (
                <DropdownItem
                  key={option.id || option[valueField] || index}
                  option={option}
                  onClick={() => handleOptionSelect(option)}
                />
              ))
            }
          </div>
        )}
      </div>
    </>
  )
}