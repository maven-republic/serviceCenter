"use client"

import React from "react"

export default function ServiceAddForm({
  categories = [],
  filteredServices = [],
  selectedCategory,
  newService,
  onCategoryChange,
  onServiceSelect,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting
}) {
  return (
    <div className="mb30 border p20 bdrs4 bg-light">
      <h6 className="mb20 d-flex justify-content-between">
        <span>Add New Service</span>
        <button className="btn btn-sm btn-link text-danger" onClick={onCancel}>
          <i className="fa fa-times"></i>
        </button>
      </h6>

      <div className="row">
        {/* Category */}
        <div className="col-md-4 mb15">
          <label className="form-label">Select Category</label>
          <select className="form-select" value={selectedCategory} onChange={onCategoryChange}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        {selectedCategory && (
          <div className="col-md-4 mb15">
            <label className="form-label">Select Service</label>
            <select className="form-select" value={newService.serviceId} onChange={onServiceSelect}>
              <option value="">Select Service</option>
              {filteredServices.map(service => (
                <option key={service.service_id} value={service.service_id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Details */}
        {newService.serviceId && (
          <>
            <div className="col-md-4 mb15">
              <label className="form-label">Custom Price ($)</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  name="customPrice"
                  value={newService.customPrice}
                  onChange={onChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="col-md-4 mb15">
              <label className="form-label">Custom Duration (mins)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="customDuration"
                  value={newService.customDuration}
                  onChange={onChange}
                  placeholder="Optional"
                />
                <span className="input-group-text">min</span>
              </div>
            </div>

            <div className="col-md-8 mb15">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                name="additionalNotes"
                value={newService.additionalNotes}
                onChange={onChange}
                placeholder="Optional notes"
                rows="3"
              />
            </div>

            <div className="col-md-12 d-flex gap-2">
              <button className="btn btn-icon btn-sm btn-primary rounded-circle" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-plus thin-icon"></i>}
              </button>
              <button className="btn btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
