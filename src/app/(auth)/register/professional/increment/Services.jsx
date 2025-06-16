'use client'

import { useEffect, useRef } from 'react'; // if not already imported


import serviceDESIGN from './Services.module.css'



export default function Services({
  verticals,        // ✅ Changed from categories
  portfolios,       // ✅ New - portfolios data
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


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div>
      <div className="mb-4">
        {/* <h2 className="mb-2">Select Your Professional Services</h2> */}
        {/* <p className="text-muted mb-1">Step 4 of 10</p> */}
        <div className="progress mb-3" style={{ height: '4px' }}>
          <div className="progress-bar" style={{ width: '66%' }} />
        </div>
      </div>

      {/* ✅ Search bar remains the same */}
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


        {/* ✅ Updated dropdown with new hierarchy */}
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

          {verticals.map((vertical) => {
            const verticalPortfolios = portfolios.filter(
              (p) => p.vertical_id === vertical.vertical_id
            )

            if (!verticalPortfolios.length) return null

            return (
              <div key={vertical.vertical_id} className="mb-4">
                <div className={serviceDESIGN.verticalHeaderSticky}>
                  <h6 className="fw-semibold text-primary mb-2">{vertical.name}</h6>
                </div>

                {verticalPortfolios.map((portfolio) => {
                  const portfolioServices = services.filter(
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