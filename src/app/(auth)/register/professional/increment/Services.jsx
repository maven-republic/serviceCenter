'use client'

import styles from '../ProfessionalForm.module.css'

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
  errors
}) {
  return (
    <div className="row">
      {/* Left column: search & dropdown */}
      <div className="col-md-5">
        <div className="mb-4">
          <h2 className="mb-2">Select Your Professional Services</h2>
          <p className="text-muted mb-1">Step 4 of 6</p>
          <div className="progress mb-3" style={{ height: '4px' }}>
            <div className="progress-bar" style={{ width: '66%' }} />
          </div>
        </div>
        <div className="mb-4 position-relative dropdown-search">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 border-end-0"
              placeholder="Search services..."
              value={searchTerm}
              onClick={() => setDropdownOpen(true)}
              onChange={e => {
                setSearchTerm(e.target.value)
                if (!dropdownOpen) setDropdownOpen(true)
              }}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div
              className="dropdown-menu show w-100 p-0 shadow-sm"
              style={{ display: 'block', position: 'absolute', zIndex: 1000 }}
            >
              <div className="p-3 custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {searchTerm && (
                      <div className="mb-3 small text-muted">
                        {services.filter(s =>
                          s.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length}{' '}
                        results for "{searchTerm}"
                      </div>
                    )}

                    {categories.map(category => {
                      const catServices = services.filter(
                        s =>
                          s.service_subcategory.category_id === category.category_id &&
                          (!searchTerm ||
                            s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      if (!catServices.length) return null
                      return (
                        <div key={category.category_id}>
                          <div className={styles.dropdownCategoryHeader}>
                            {category.name}
                          </div>
                          <div className={styles.dropdownServicesGrid}>
                            {catServices.map(service => (
                              <button
                                key={service.service_id}
                                type="button"
                                className={`${styles.serviceTag} badge rounded-pill py-2 px-3 ${
                                  selectedServices.includes(service.service_id)
                                    ? 'bg-primary text-white'
                                    : 'bg-light text-dark border'
                                }`}
                                onClick={() => toggleService(service.service_id)}
                                title={service.name}
                                aria-pressed={selectedServices.includes(service.service_id)}
                              >
                                {service.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
              <div className="p-3 border-top d-flex justify-content-end">
                <button className="btn btn-primary" onClick={() => setDropdownOpen(false)}>
                  Confirm Services
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column: selected services */}
      <div className="col-md-7">
        <div className="card border mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">Your Selected Services</h5>
            <span className="badge bg-primary">{selectedServices.length}</span>
          </div>
          {errors && (
            <div className="alert alert-danger m-3" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {errors}
            </div>
          )}
          <div className="card-body">
            {selectedServices.length ? (
              <>
                <p className="text-muted small mb-3">
                  We recommend selecting 3–5 services that best represent your expertise.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {selectedServices.map(id => {
                    const svc = services.find(s => s.service_id === id)
                    if (!svc) return null
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`${styles.serviceTag} badge rounded-pill bg-primary-subtle text-primary py-2 px-3 d-flex align-items-center`}
                        onClick={() => toggleService(id)}
                        title={svc.name}
                        aria-pressed="true"
                      >
                        <span>{svc.name}</span>
                        <i className="fas fa-times-circle ms-2" />
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mb-3">
                  <i className="far fa-tags text-muted" style={{ fontSize: '48px' }} />
                </div>
                <h6>You haven't selected any services yet</h6>
                <p className="text-muted small mb-0">Search and select services to add them here</p>
              </div>
            )}
          </div>
        </div>
        <div className="card bg-light border-0 p-4">
          <div className="d-flex align-items-center mb-3">
            <i className="fas fa-lightbulb text-warning me-2" />
            <h5 className="mb-0">Tips for Service Selection</h5>
          </div>
          <ul className="mb-0 ps-3">
            <li className="mb-2">Choose services that match your actual skills and experience</li>
            <li className="mb-2">Be specific rather than overly general</li>
            <li className="mb-2">Select services you're ready to start providing immediately</li>
            <li>You can update your services anytime from your profile</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
