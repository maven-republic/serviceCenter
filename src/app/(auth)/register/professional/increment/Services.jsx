'use client'

import serviceDESIGN from './Services.module.css'

export default function Services({
  categories,
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
  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-2">Select Your Professional Services</h2>
        <p className="text-muted mb-1">Step 4 of 10</p>
        <div className="progress mb-3" style={{ height: '4px' }}>
          <div className="progress-bar" style={{ width: '66%' }} />
        </div>
      </div>

      {/* ✅ Tailwind-styled search bar */}
      <div className="mb-4 position-relative dropdown-search">
        <div className={serviceDESIGN.searchBox}>
          <i className={`fas fa-search ${serviceDESIGN.searchIcon}`} />
          <input
            type="text"
            className={serviceDESIGN.searchInput}
            placeholder="Search services..."
            value={searchTerm}
            onClick={() => setDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!dropdownOpen) setDropdownOpen(true)
            }}
          />
        </div>

        {/* ✅ Organized dropdown with new module styles */}
        {dropdownOpen && (
          <div className={serviceDESIGN.dropdownPanel}>
            <div className={serviceDESIGN.scrollContainer}>
              {loading ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {searchTerm && (
                    <div className="mb-3 small text-muted">
                      {
                        services.filter((s) =>
                          s.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length
                      }{' '}
                      results for "{searchTerm}"
                    </div>
                  )}

                  {categories.map((category) => {
                    const catServices = services.filter(
                      (s) =>
                        s.service_subcategory.category_id === category.category_id &&
                        (!searchTerm ||
                          s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    if (!catServices.length) return null

                    return (
                      <div
                        key={category.category_id}
                        className={serviceDESIGN.categoryBlock}
                      >
                        <div className={serviceDESIGN.dropdownCategoryHeader}>
                          {category.name}
                        </div>
                        <div className={serviceDESIGN.dropdownServicesGrid}>
                          {catServices.map((service) => {
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
                </>
              )}
            </div>

            <div className={serviceDESIGN.dropdownFooter}>
              <button
                className="btn btn-primary"
                onClick={() => setDropdownOpen(false)}
              >
                Confirm Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

