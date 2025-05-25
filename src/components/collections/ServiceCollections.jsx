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
      <div className="text-center text-muted py-4">
        <i className="fa fa-info-circle me-2"></i>
        No services added yet.
      </div>
    )
  }

  return (
    <>
      <div className="row g-3">
        {services.map((ps) => (
          <div key={ps.professional_service_id} className="col-md-4 col-sm-6">
            <div className="border rounded p-3 position-relative">
              <button
                className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 me-2 mt-2"
                onClick={() => setDeletingId(ps.professional_service_id)}
                title="Delete service"
              >
                <i className="fa fa-trash"></i>
              </button>

              <h6 className="mb-1">{ps.service.name}</h6>
              <p className="small text-muted mb-1">{ps.service.service_subcategory?.name}</p>
              {ps.custom_price && <p className="small text-muted mb-0">J$ {ps.custom_price}</p>}
              {ps.custom_duration_minutes && <p className="small text-muted mb-0">{ps.custom_duration_minutes} min</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this service?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
