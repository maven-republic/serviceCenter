// increment/SelectedServices.jsx
'use client'

import styles from '../ProfessionalForm.module.css'

export default function SelectedServices({
  selectedIds,
  allServices,
  onRemove,
  error
}) {
  const selectedServices = allServices.filter(s =>
    selectedIds.includes(s.service_id)
  )

  return (
    <div className="card border mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0">Your Selected Services</h5>
        <span className="badge bg-primary">{selectedIds.length}</span>
      </div>

      {error && (
        <div className="alert alert-danger m-3" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      <div className="card-body">
        {selectedServices.length ? (
          <div className="d-flex flex-wrap gap-2">
            {selectedServices.map(service => (
              <button
                key={service.service_id}
                type="button"
                className={`
                  ${styles.serviceTag}
                  badge rounded-pill bg-primary-subtle text-primary
                  py-2 px-3 d-flex align-items-center
                `}
                onClick={() => onRemove(service.service_id)}
                title={service.name}
              >
                <span>{service.name}</span>
                <i className="fas fa-times-circle ms-2" />
              </button>
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
