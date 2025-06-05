// src/components/professional-workspace/section/professional-computation/ServiceQuantificationGrid.jsx
// PURE OPTION 1 IMPLEMENTATION - STAGE 1
'use client'

import { useState } from 'react'
import ServiceCard from './ServiceCard'
import ServiceConfigurationModal from './ServiceConfigurationModal'

export default function ServiceQuantificationGrid({ 
  services = [], 
  onUpdate, 
  professionalId 
}) {
  const [selectedService, setSelectedService] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVertical, setFilterVertical] = useState('all')
  const [sortBy, setSortBy] = useState('name') // Added sorting
  const [viewMode, setViewMode] = useState('grid') // Added view modes

  // Get unique verticals for filter
  const verticals = [...new Set(services.map(s => s.service?.portfolio?.vertical?.name).filter(Boolean))]

  // Filter and sort services
  const processedServices = services
    .filter(service => {
      const matchesSearch = !searchTerm || 
        service.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service?.portfolio?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service?.portfolio?.vertical?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesVertical = filterVertical === 'all' || 
        service.service?.portfolio?.vertical?.name === filterVertical

      return matchesSearch && matchesVertical
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.service?.name || '').localeCompare(b.service?.name || '')
        case 'price':
          const priceA = a.custom_price || a.service?.quant?.base_price_mean || a.service?.base_price || 0
          const priceB = b.custom_price || b.service?.quant?.base_price_mean || b.service?.base_price || 0
          return priceB - priceA // Descending
        case 'vertical':
          return (a.service?.portfolio?.vertical?.name || '').localeCompare(b.service?.portfolio?.vertical?.name || '')
        case 'status':
          const statusA = a.custom_price ? 'custom' : a.service?.quant?.base_price_mean ? 'calculated' : 'base'
          const statusB = b.custom_price ? 'custom' : b.service?.quant?.base_price_mean ? 'calculated' : 'base'
          return statusA.localeCompare(statusB)
        default:
          return 0
      }
    })

  const openConfigModal = (service) => {
    setSelectedService(service)
    setModalOpen(true)
  }

  const closeConfigModal = () => {
    setModalOpen(false)
    setSelectedService(null)
  }

  const handleServiceUpdate = (updatedService) => {
    if (onUpdate) {
      onUpdate(updatedService)
    }
    // Keep modal open for quick successive edits
    // User can close manually when done
  }

  // Get statistics for display
  const stats = {
    total: services.length,
    filtered: processedServices.length,
    configured: services.filter(s => s.custom_price).length,
    calculated: services.filter(s => s.service?.quant?.base_price_mean).length
  }

  return (
    <>
      {/* Enhanced Header with Stats */}
      <div className="mb-4">
        <div className="row align-items-center mb-3">
          <div className="col-md-6">
            <h4 className="text-gray-900 mb-1 fw-semibold">Service Pricing Configuration</h4>
            <p className="text-gray-600 mb-0">Configure and optimize pricing for your services</p>
          </div>
          <div className="col-md-6 text-end">
            {/* Statistics Cards */}
            <div className="d-inline-flex gap-3">
              <div className="bg-light rounded-3 px-3 py-2 text-center">
                <div className="h6 text-gray-900 mb-0">{stats.total}</div>
                <small className="text-gray-500">Total</small>
              </div>
              <div className="bg-success bg-opacity-10 rounded-3 px-3 py-2 text-center">
                <div className="h6 text-success mb-0">{stats.configured}</div>
                <small className="text-success">Custom</small>
              </div>
              <div className="bg-info bg-opacity-10 rounded-3 px-3 py-2 text-center">
                <div className="h6 text-info mb-0">{stats.calculated}</div>
                <small className="text-info">Calculated</small>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-light rounded-4 p-3">
          <div className="row align-items-center g-3">
            {/* Search */}
            <div className="col-md-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search services, portfolios, verticals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400"></i>
              </div>
            </div>

            {/* Filters */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterVertical}
                onChange={(e) => setFilterVertical(e.target.value)}
              >
                <option value="all">All Verticals ({services.length})</option>
                {verticals.map(vertical => (
                  <option key={vertical} value={vertical}>
                    {vertical} ({services.filter(s => s.service?.portfolio?.vertical?.name === vertical).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price (High-Low)</option>
                <option value="vertical">Sort by Vertical</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="col-md-2">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm || filterVertical !== 'all' ? (
          <div className="mt-2">
            <small className="text-gray-600">
              Showing {stats.filtered} of {stats.total} services
              {searchTerm && ` matching "${searchTerm}"`}
              {filterVertical !== 'all' && ` in ${filterVertical}`}
            </small>
            {(searchTerm || filterVertical !== 'all') && (
              <button 
                className="btn btn-link btn-sm p-0 ms-2 text-decoration-none"
                onClick={() => {
                  setSearchTerm('')
                  setFilterVertical('all')
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Service Display */}
      {processedServices.length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-light rounded-4 p-5">
            <i className="fas fa-search fa-3x text-gray-400 mb-3"></i>
            <h6 className="text-gray-600 mb-2">No services found</h6>
            <p className="text-gray-500 mb-3">
              {searchTerm || filterVertical !== 'all' 
                ? 'Try adjusting your search criteria or filters' 
                : 'No services available to configure'}
            </p>
            {(searchTerm || filterVertical !== 'all') && (
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setSearchTerm('')
                  setFilterVertical('all')
                }}
              >
                <i className="fas fa-undo me-2"></i>
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="row g-3">
              {processedServices.map((service) => (
                <div key={service.professional_service_id} className="col-sm-6 col-md-4 col-lg-3">
                  <ServiceCard
                    service={service}
                    onClick={() => openConfigModal(service)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-4 border">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">Service</th>
                      <th className="border-0">Vertical</th>
                      <th className="border-0">Current Price</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Duration</th>
                      <th className="border-0 pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedServices.map((service) => {
                      const currentPrice = service?.custom_price || 
                                         service?.service?.quant?.base_price_mean || 
                                         service?.service?.base_price || 0
                      
                      const status = service?.custom_price ? 'Custom' :
                                   service?.service?.quant?.base_price_mean ? 'Calculated' : 'Base'
                      
                      const statusColor = service?.custom_price ? 'success' :
                                        service?.service?.quant?.base_price_mean ? 'info' : 'secondary'

                      return (
                        <tr key={service.professional_service_id} style={{cursor: 'pointer'}} onClick={() => openConfigModal(service)}>
                          <td className="ps-4">
                            <div>
                              <div className="fw-semibold text-gray-900">{service?.service?.name}</div>
                              <small className="text-gray-500">{service?.service?.portfolio?.name}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-gray-600 rounded-pill">
                              {service?.service?.portfolio?.vertical?.name}
                            </span>
                          </td>
                          <td>
                            <span className="fw-semibold">J${currentPrice.toFixed(2)}</span>
                          </td>
                          <td>
                            <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} rounded-pill`}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <span className="text-gray-600">{service?.service?.duration_minutes || 0}m</span>
                          </td>
                          <td className="pe-4">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                openConfigModal(service)
                              }}
                            >
                              <i className="fas fa-cog me-1"></i>
                              Configure
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Configuration Modal */}
      <ServiceConfigurationModal
        service={selectedService}
        isOpen={modalOpen}
        onClose={closeConfigModal}
        onUpdate={handleServiceUpdate}
        professionalId={professionalId}
      />

      {/* Styles */}
      <style jsx>{`
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        
        .table-hover tbody tr:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .btn-link:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </>
  )
}