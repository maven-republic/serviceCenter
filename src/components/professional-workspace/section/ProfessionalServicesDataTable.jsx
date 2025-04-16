import React, { useState, useMemo } from 'react';

/**
 * Reusable DataTable Component for Professional Services
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.data - Array of professional services
 * @param {Function} props.onRemove - Function to remove a service
 * @param {Function} props.onSelect - Function to toggle service selection
 * @param {Set} props.selectedServices - Set of selected service IDs
 * @param {string} props.viewMode - Current view mode ('grid' or 'list')
 * @param {Function} props.onRowAction - Function to handle row-level actions
 */
export const ProfessionalServicesDataTable = ({
  data = [],
  onRemove,
  onSelect,
  selectedServices = new Set(),
  viewMode = 'grid',
  onRowAction,
  searchTerm = '',
}) => {
  // Memoized filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(ps => 
      ps.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ps.additional_notes && ps.additional_notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  // Render service details
  const renderServiceDetails = (service) => (
    <div className="position-relative">
      {viewMode === 'grid' && (
        <div className="form-check position-absolute" style={{ top: '0', right: '0' }}>
          <input
            className="form-check-input"
            type="checkbox"
            checked={selectedServices.has(service.professional_service_id)}
            onChange={() => onSelect(service.professional_service_id)}
          />
        </div>
      )}
      
      <h5 className="mb5">{service.service.name}</h5>
      
      <div className={viewMode === 'list' ? 'd-flex gap-3' : ''}>
        {service.custom_price && (
          <p className="text-muted mb0 small">
            <span className="fw-bold">Price:</span> ${service.custom_price}
          </p>
        )}
        {service.custom_duration_minutes && (
          <p className="text-muted mb0 small">
            <span className="fw-bold">Duration:</span> {service.custom_duration_minutes} mins
          </p>
        )}
      </div>
      
      {service.additional_notes && viewMode === 'grid' && (
        <p className="text-muted small mb10 mt5">
          <span className="fw-bold">Notes:</span> {service.additional_notes}
        </p>
      )}
    </div>
  );

  // Render no results message
  if (filteredData.length === 0 && searchTerm) {
    return (
      <div className="alert alert-info">
        No services match your search for "{searchTerm}"
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'row' : ''}>
      {filteredData.map((service) => (
        <div 
          key={service.professional_service_id} 
          id={`service-${service.professional_service_id}`}
          className={viewMode === 'grid' ? "col-lg-4 col-md-6 mb15" : "mb15"}
        >
          <div 
            className={`
              border p15 bdrs4 
              ${viewMode === 'list' ? 'd-flex justify-content-between align-items-center' : ''} 
              ${selectedServices.has(service.professional_service_id) ? 'bg-light border-primary' : ''}
            `}
          >
            {renderServiceDetails(service)}
            
            <div className={viewMode === 'list' ? 'd-flex align-items-center' : 'mt10'}>
              {viewMode === 'list' && (
                <div className="form-check mr15">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedServices.has(service.professional_service_id)}
                    onChange={() => onSelect(service.professional_service_id)}
                  />
                </div>
              )}
              
              {/* Remove button */}
              <button 
                className="btn btn-icon btn-sm btn-outline-danger rounded-circle"
                onClick={() => onRemove(service.professional_service_id, service.service.name)}
                aria-label="Remove service"
              >
                <i className="fa fa-trash-alt thin-icon"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfessionalServicesDataTable;