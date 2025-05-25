'use client'

import styles from '../ProfessionalForm.module.css'

export default function SelectedServices({
  selected,
  toggleService,
  services,
  formData,
  updateFormData
}) {
  const selectedServices = services.filter(service =>
    selected.includes(service.service_id)
  )

  return (
    <div className="card border mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0">Your Selected Services</h5>
        <span className="badge bg-primary">{selected.length}</span>
      </div>

      <div className="card-body">
        {selectedServices.length ? (
          <div className="d-flex flex-wrap gap-3">
            {selectedServices.map(service => (
    
    
    
  <div
  key={service.service_id}
  className=" border rounded-3 p-2 d-flex flex-column justify-content-between"
  style={{ width: '300px', flexShrink: 0 }}
>
  <div className="d-flex justify-content-between align-items-center mb-3">
    <span className="badge  text-primary px-2 py-1 fw-medium rounded-pill">
      {service.name}
    </span>
    <button
      type="button"
      className="btn btn-sm"
      onClick={() => toggleService(service.service_id)}
      title="Remove"
    >
      <i className="fas fa-times" />
    </button>
  </div>

  <label className="form-label text-muted small fw-semibold mb-1">
    When did you start offering this service?
  </label>
  <input
    type="date"
    className="form-control form-control-sm"
    value={formData.serviceStartDates?.[service.service_id] || ''}
    onChange={(e) =>
      updateFormData({
        target: {
          name: 'serviceStartDates',
          value: {
            ...formData.serviceStartDates,
            [service.service_id]: e.target.value
          }
        }
      })
    }
  />
</div>
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mb-3">
              <i className="far fa-tags text-muted" style={{ fontSize: '48px' }} />
            </div>
            <h6>You haven't selected any services yet</h6>
            <p className="text-muted small mb-0">
              Search and select services to add them here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

