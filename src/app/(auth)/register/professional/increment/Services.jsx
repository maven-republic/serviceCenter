'use client'

import { useEffect, useRef, useMemo } from 'react';
import serviceDESIGN from './Services.module.css'

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Services({
  verticals,
  portfolios,
  services,
  loading,
  dropdownOpen,
  searchTerm,
  setSearchTerm,
  setDropdownOpen,
  toggleService,
  selectedServices,
  formData,
  updateFormData,
  errors
}) {

  const dropdownRef = useRef(null);

  // Memoize randomized data to prevent re-shuffling on every render
  const randomizedData = useMemo(() => {
    return {
      verticals: shuffleArray(verticals),
      portfolios: shuffleArray(portfolios),
      services: shuffleArray(services)
    };
  }, [verticals, portfolios, services]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter services for search
  const filteredServices = randomizedData.services.filter(service =>
    !searchTerm || service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <div className="progress mb-3" style={{ height: '4px' }}>
          <div className="progress-bar" style={{ width: '66%' }} />
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 position-relative dropdown-search">
        <div className={serviceDESIGN.searchWrapper}>
          <i className={`fas fa-search ${serviceDESIGN.searchIcon}`} />
          <input
            type="text"
            placeholder="Search services..."
            aria-label="Search services"
            className={serviceDESIGN.searchInput}
            value={searchTerm}
            onClick={() => setDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!dropdownOpen) setDropdownOpen(true)
            }}
          />
        </div>

        {/* Randomized dropdown */}
        {dropdownOpen && (
          <div className={serviceDESIGN.dropdownPanel} ref={dropdownRef}>
            <div className={serviceDESIGN.scrollContainer}>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {searchTerm && filteredServices.length === 0 && (
                    <div className="text-muted small text-center py-3">
                      No services match your search.
                    </div>
                  )}

                  {randomizedData.verticals.map((vertical) => {
                    // Get portfolios for this vertical (also randomized)
                    const verticalPortfolios = randomizedData.portfolios.filter(
                      (p) => p.vertical_id === vertical.vertical_id
                    )

                    if (!verticalPortfolios.length) return null

                    return (
                      <div key={vertical.vertical_id} className="mb-4">
                        <div className={serviceDESIGN.verticalHeader}>
                          <h6 className="fw-semibold text-primary mb-2">{vertical.name}</h6>
                        </div>

                        {verticalPortfolios.map((portfolio) => {
                          // Get services for this portfolio (also randomized)
                          const portfolioServices = randomizedData.services.filter(
                            (s) =>
                              s.portfolio_id === portfolio.portfolio_id &&
                              (!searchTerm ||
                                s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          )

                          if (!portfolioServices.length) return null

                          return (
                            <div key={portfolio.portfolio_id} className={serviceDESIGN.categoryBlock}>
                              <div className={serviceDESIGN.dropdownCategoryHeader}>
                                {portfolio.name}
                              </div>
                              <div className={serviceDESIGN.dropdownServicesGrid}>
                                {portfolioServices.map((service) => {
                                  const isSelected = selectedServices.includes(service.service_id)
                                  return (
                                    <button
                                      key={service.service_id}
                                      type="button"
                                      className={`${serviceDESIGN.serviceTag} ${isSelected ? serviceDESIGN.selected : ''}`}
                                      onClick={() => toggleService(service.service_id)}
                                      title={service.name}
                                      aria-pressed={isSelected}
                                    >
                                      {service.name}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            <div className={serviceDESIGN.dropdownFooter}>
              <button className="btn btn-primary" onClick={() => setDropdownOpen(false)}>
                Confirm Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}