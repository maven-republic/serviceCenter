"use client"

import { useState } from "react"
import { createClient } from '@/utils/supabase/client';
import { toast } from "sonner"

export default function ServiceCollections({ services = [], onDelete }) {
  const supabase = createClient()
  const [deletingId, setDeletingId] = useState(null)

  const confirmDelete = async () => {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)

    const { error } = await supabase
      .from("professional_service")
      .update({ is_active: false })
      .eq("professional_service_id", id)

    if (error) {
      toast.error("Failed to delete service")
    } else {
      toast.success("Service deleted")
      onDelete?.() // notify parent to refresh
    }
  }

  if (!services.length) {
    return (
      <div className="text-center text-muted py-5">
        <i className="fas fa-tools mb-3" style={{ fontSize: '48px' }}></i>
        <h6>No Services Added Yet</h6>
        <p className="small mb-0">Click the + button above to add your first service</p>
      </div>
    )
  }

  return (
    <>
      <div className="row g-3">
        {services.map((ps) => (
          <div key={ps.professional_service_id} className="col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                
                {/* Delete button */}
                <button
                  className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 me-2 mt-2"
                  onClick={() => setDeletingId(ps.professional_service_id)}
                  title="Delete service"
                >
                  <i className="fa fa-trash"></i>
                </button>

                {/* ✅ Updated display for new structure */}
                <div className="mb-2">
                  <span className="badge bg-primary-subtle text-primary px-2 py-1 rounded-pill small fw-semibold">
                    {ps.service?.portfolio?.vertical?.name || 'Unknown Vertical'}
                  </span>
                </div>

                <h6 className="fw-bold text-dark mb-1 lh-sm">
                  {ps.service?.name || 'Unknown Service'}
                </h6>

                <div className="mb-2">
                  <small className="text-muted fw-medium d-flex align-items-center">
                    <i className="fas fa-folder me-2" style={{ fontSize: '0.75rem' }}></i>
                    {ps.service?.portfolio?.name || 'Unknown Portfolio'}
                  </small>
                </div>

                {/* Service details */}
                <div className="mt-auto">
                  <div className="row g-1">
                    {ps.custom_price && (
                      <div className="col-auto">
                        <div className="bg-success-subtle text-success rounded-pill px-2 py-1 small fw-semibold">
                          <i className="fas fa-dollar-sign me-1"></i>
                          J$ {parseFloat(ps.custom_price).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {ps.custom_duration_minutes && (
                      <div className="col-auto">
                        <div className="bg-info-subtle text-info rounded-pill px-2 py-1 small">
                          <i className="fas fa-clock me-1"></i>
                          {ps.custom_duration_minutes}m
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {ps.additional_notes && (
                    <div className="mt-2">
                      <small className="text-muted fst-italic">
                        "{ps.additional_notes}"
                      </small>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  Confirm Deletion
                </h5>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to remove this service from your offerings?</p>
                <p className="small text-muted mb-0">
                  <i className="fas fa-info-circle me-1"></i>
                  This action can be undone by adding the service again.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setDeletingId(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={confirmDelete}
                >
                  <i className="fas fa-trash me-2"></i>
                  Remove Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}