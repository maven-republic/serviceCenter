"use client"

import React from "react"

export default function ServiceAddForm({
  verticals = [],
  portfolios = [],
  services = [],
  selectedVertical,
  selectedPortfolio,
  newService,
  onVerticalChange,
  onPortfolioChange,
  onServiceSelect,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting
}) {
  return (
    <div className="bg-white border shadow-sm rounded-2 p-3 mb-3">
      {/* Thin Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-semibold mb-0 text-dark">Add New Service</h6>
        <button 
          className="btn btn-sm btn-link text-muted p-1"
          onClick={onCancel}
          title="Close"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Horizontal Form Layout */}
      <div className="row g-2 align-items-end">
        
        {/* Step 1: Vertical - Compact */}
        <div className="col-md-3">
          <label className="form-label small fw-medium text-muted mb-1">
            <i className="fas fa-layer-group me-1"></i>Business Area
          </label>
          <select 
            className="form-control form-control-sm border-1 rounded-2" 
            value={selectedVertical} 
            onChange={onVerticalChange}
            style={{ 
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Select area...</option>
            {verticals.map(vertical => (
              <option key={vertical.vertical_id} value={vertical.vertical_id}>
                {vertical.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Portfolio - Compact */}
        <div className="col-md-3">
          <label className="form-label small fw-medium text-muted mb-1">
            <i className="fas fa-folder me-1"></i>Category
          </label>
          <select 
            className="form-control form-control-sm border-1 rounded-2"
            value={selectedPortfolio} 
            onChange={onPortfolioChange}
            disabled={!selectedVertical}
            style={{ 
              border: '1px solid #e5e7eb',
              backgroundColor: !selectedVertical ? '#f9fafb' : '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Select category...</option>
            {portfolios.map(portfolio => (
              <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Service - Compact */}
        <div className="col-md-4">
          <label className="form-label small fw-medium text-muted mb-1">
            <i className="fas fa-tools me-1"></i>Service
          </label>
          <select 
            className="form-control form-control-sm border-1 rounded-2"
            value={newService.serviceId} 
            onChange={onServiceSelect}
            disabled={!selectedPortfolio}
            style={{ 
              border: '1px solid #e5e7eb',
              backgroundColor: !selectedPortfolio ? '#f9fafb' : '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Select service...</option>
            {services.map(service => (
              <option key={service.service_id} value={service.service_id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="col-md-2">
          <button 
            className="btn btn-primary btn-sm w-100"
            onClick={onSubmit} 
            disabled={!newService.serviceId || isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <>
                <i className="fas fa-plus me-1"></i>Add
              </>
            )}
          </button>
        </div>

      </div>

      {/* Optional: Horizontal Custom Fields (Only show if service selected) */}
      {newService.serviceId && (
        <div className="row g-2 mt-2 pt-2 border-top">
          <div className="col-md-3">
            <label className="form-label small fw-medium text-muted mb-1">
              <i className="fas fa-dollar-sign me-1 text-success"></i>Price (J$)
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              name="customPrice"
              value={newService.customPrice}
              onChange={onChange}
              placeholder="Optional"
              min="0"
              step="0.01"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-medium text-muted mb-1">
              <i className="fas fa-clock me-1 text-info"></i>Duration (min)
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              name="customDuration"
              value={newService.customDuration}
              onChange={onChange}
              placeholder="Optional"
              min="1"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium text-muted mb-1">
              <i className="fas fa-sticky-note me-1 text-warning"></i>Notes
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              name="additionalNotes"
              value={newService.additionalNotes}
              onChange={onChange}
              placeholder="Optional notes..."
            />
          </div>
        </div>
      )}

      {/* Progress Indicators - Minimal */}
      <div className="d-flex justify-content-center mt-2">
        <div className="d-flex gap-1">
          <div className={`rounded-circle ${selectedVertical ? 'bg-primary' : 'bg-light'}`} style={{width: '6px', height: '6px'}}></div>
          <div className={`rounded-circle ${selectedPortfolio ? 'bg-primary' : 'bg-light'}`} style={{width: '6px', height: '6px'}}></div>
          <div className={`rounded-circle ${newService.serviceId ? 'bg-primary' : 'bg-light'}`} style={{width: '6px', height: '6px'}}></div>
        </div>
      </div>

    </div>
  )
}