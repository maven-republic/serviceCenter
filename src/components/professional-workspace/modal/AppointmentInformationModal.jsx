// src/components/professional-workspace/modal/AppointmentInformationModal.jsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import AppointmentInteractionForm from '@/components/forms/AppointmentInteractionForm'

export default function AppointmentInformationModal({ 
  isOpen, 
  onClose, 
  appointment,
  onAccept,
  onDecline 
}) {
  const modalRef = useRef(null)
  const [currentView, setCurrentView] = useState('details') // 'details', 'accept', 'decline', 'quote'
  const [actionLoading, setActionLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix for Next.js SSR - ensure component is mounted before using createPortal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView('details')
      setActionLoading(false)
    }
  }, [isOpen])

  // Handle escape key press
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && !actionLoading) {
      handleClose()
    }
  }, [actionLoading])

  // Handle click outside modal
  const handleBackdropClick = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target) && !actionLoading) {
      handleClose()
    }
  }, [actionLoading])

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!actionLoading) {
      setCurrentView('details')
      onClose?.()
    }
  }, [actionLoading, onClose])

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    setActionLoading(true)
    
    try {
      console.log('📝 Submitting appointment response:', formData)
      
      // Call the API to update appointment
      const response = await fetch(`/api/appointments/${formData.appointment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: formData.action === 'accept' ? 'accepted' : 
                 formData.action === 'decline' ? 'declined' : 'quoted',
          
          // Include all form data
          professional_notes: formData.professional_notes,
          estimated_duration: formData.estimated_duration,
          suggested_start: formData.suggested_start,
          suggested_end: formData.suggested_end,
          quoted_price: formData.quoted_price,
          price_breakdown: formData.price_breakdown,
          requirements: formData.requirements,
          next_steps: formData.next_steps,
          decline_reason: formData.decline_reason,
          alternative_suggestions: formData.alternative_suggestions,
          
          // Additional metadata
          response_timestamp: new Date().toISOString(),
          duration_minutes: formData.estimated_duration
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${formData.action} appointment`)
      }

      console.log(`✅ Appointment ${formData.action}ed successfully:`, data.appointment)

      // Call the appropriate callback
      if (formData.action === 'accept') {
        onAccept?.()
      } else if (formData.action === 'decline') {
        onDecline?.()
      }

      // Show success message
      // TODO: Replace with toast notification
      alert(`Appointment ${formData.action}ed successfully!`)

      // Close modal
      handleClose()

    } catch (error) {
      console.error(`❌ Error ${formData.action}ing appointment:`, error)
      // TODO: Replace with toast notification
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, handleClose])

  // Handle quick actions (for simple accept/decline without form)
  const handleQuickAction = useCallback(async (action) => {
    setActionLoading(true)
    
    try {
      if (action === 'accept') {
        await onAccept?.()
      } else if (action === 'decline') {
        await onDecline?.()
      }
      handleClose()
    } catch (error) {
      console.error(`❌ Quick ${action} error:`, error)
    } finally {
      setActionLoading(false)
    }
  }, [onAccept, onDecline, handleClose])

  // Add event listeners when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.addEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscapeKey, handleBackdropClick])

  // Don't render if not open
  if (!isOpen || !appointment) return null

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get status styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'quoted': return '#17a2b8'
      case 'accepted': return '#28a745'
      case 'converted': return '#20c997'
      case 'declined': return '#dc3545'
      default: return '#6c757d'
    }
  }

  // Render modal using portal
  return createPortal(
    <div className="appointment-modal-overlay">
      <div className="appointment-modal-backdrop" />
      <div className="appointment-modal-container">
        <div 
          ref={modalRef}
          className="appointment-modal-content"
          role="dialog" 
          aria-modal="true"
          aria-labelledby="appointment-modal-title"
        >
          
          {/* Modal Header */}
          <div className="appointment-modal-header">
            <div className="header-left">
              <h3 id="appointment-modal-title">
                {currentView === 'details' ? 'Appointment Details' :
                 currentView === 'accept' ? 'Accept Appointment' :
                 currentView === 'decline' ? 'Decline Appointment' :
                 currentView === 'quote' ? 'Send Quote' : 'Appointment'}
              </h3>
              <div className="appointment-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <span className="urgency-badge urgency-{appointment.urgency}">
                  {appointment.urgency === 'standard' ? 'Standard' :
                   appointment.urgency === 'low' ? 'Flexible' :
                   appointment.urgency === 'high' ? 'Priority' : 'Urgent'}
                </span>
              </div>
            </div>
            
            <div className="header-actions">
              {currentView !== 'details' && (
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setCurrentView('details')}
                  disabled={actionLoading}
                  title="Back to details"
                >
                  <i className="flaticon-left-arrow"></i>
                </button>
              )}
              
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={actionLoading}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="appointment-modal-body">
            
            {/* Details View */}
            {currentView === 'details' && (
              <div className="appointment-details">
                
                {/* Customer Information */}
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="flaticon-user"></i>
                    Customer Information
                  </h6>
                  <div className="customer-card">
                    <div className="customer-avatar">
                      {appointment.customer?.account?.profile_picture_url ? (
                        <img 
                          src={appointment.customer.account.profile_picture_url} 
                          alt="Customer"
                        />
                      ) : (
                        <div className="avatar-initials">
                          {appointment.customer?.account?.first_name?.[0]}
                          {appointment.customer?.account?.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="customer-info">
                      <h5>
                        {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
                      </h5>
                      <div className="contact-info">
                        <div className="contact-item">
                          <i className="flaticon-email"></i>
                          <span>{appointment.customer?.account?.email}</span>
                        </div>
                        {appointment.customer?.phone?.phone_number && (
                          <div className="contact-item">
                            <i className="flaticon-phone"></i>
                            <span>{appointment.customer.phone.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="flaticon-tools"></i>
                    Service Details
                  </h6>
                  <div className="service-info">
                    <h5>{appointment.service?.name || appointment.title}</h5>
                    {appointment.description && (
                      <div className="service-description">
                        <strong>Project Description:</strong>
                        <p>{appointment.description}</p>
                      </div>
                    )}
                    {appointment.service?.base_price && (
                      <div className="price-info">
                        <strong>Base Price:</strong> JMD ${appointment.service.base_price}
                        {appointment.service.duration_minutes && (
                          <span> • {appointment.service.duration_minutes} minutes</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="flaticon-calendar"></i>
                    Scheduling
                  </h6>
                  <div className="schedule-info">
                    <div className="schedule-item">
                      <strong>Preferred Start:</strong>
                      <span>{formatDateTime(appointment.preferred_start)}</span>
                    </div>
                    {appointment.preferred_end && (
                      <div className="schedule-item">
                        <strong>Preferred End:</strong>
                        <span>{formatDateTime(appointment.preferred_end)}</span>
                      </div>
                    )}
                    {appointment.deadline && (
                      <div className="schedule-item deadline">
                        <strong>Project Deadline:</strong>
                        <span>{formatDateTime(appointment.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Information */}
                {appointment.address && (
                  <div className="detail-section">
                    <h6 className="section-title">
                      <i className="flaticon-location"></i>
                      Service Location
                    </h6>
                    <div className="location-info">
                      {appointment.address.street_address && (
                        <div>{appointment.address.street_address}</div>
                      )}
                      <div>{appointment.address.city}, {appointment.address.parish}</div>
                      {appointment.address.community && (
                        <div className="community">{appointment.address.community}</div>
                      )}
                      {appointment.address.landmark && (
                        <div className="landmark">Near {appointment.address.landmark}</div>
                      )}
                      {appointment.address.is_rural && (
                        <div className="rural-indicator">
                          <i className="flaticon-info"></i>
                          Rural location
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Message */}
                {appointment.customer_message && (
                  <div className="detail-section">
                    <h6 className="section-title">
                      <i className="flaticon-chat"></i>
                      Customer Notes
                    </h6>
                    <div className="customer-message">
                      <p>"{appointment.customer_message}"</p>
                    </div>
                  </div>
                )}

                {/* Request Information */}
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="flaticon-time"></i>
                    Request Information
                  </h6>
                  <div className="request-info">
                    <div className="info-item">
                      <strong>Requested:</strong>
                      <span>{formatDateTime(appointment.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <strong>Last Updated:</strong>
                      <span>{formatDateTime(appointment.updated_at)}</span>
                    </div>
                    <div className="info-item">
                      <strong>Urgency Level:</strong>
                      <span className={`urgency-${appointment.urgency}`}>
                        {appointment.urgency === 'standard' ? 'Standard (3 days)' :
                         appointment.urgency === 'low' ? 'Flexible (1 week)' :
                         appointment.urgency === 'high' ? 'Priority (24hrs)' : 'Urgent (ASAP)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Views */}
            {(currentView === 'accept' || currentView === 'decline' || currentView === 'quote') && (
              <AppointmentInteractionForm
                appointment={appointment}
                action={currentView}
                onSubmit={handleFormSubmit}
                onCancel={() => setCurrentView('details')}
                loading={actionLoading}
              />
            )}
          </div>

          {/* Modal Footer (only show for details view) */}
          {currentView === 'details' && (
            <div className="appointment-modal-footer">
              <div className="footer-left">
                <div className="appointment-id">
                  ID: {appointment.appointment_id.split('-')[0]}...
                </div>
              </div>
              
              <div className="footer-actions">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-outline-info"
                      onClick={() => setCurrentView('quote')}
                      disabled={actionLoading}
                    >
                      <i className="flaticon-price-tag"></i>
                      Send Quote
                    </button>
                    
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => setCurrentView('decline')}
                      disabled={actionLoading}
                    >
                      <i className="flaticon-close"></i>
                      Decline
                    </button>
                    
                    <button
                      className="btn btn-success"
                      onClick={() => setCurrentView('accept')}
                      disabled={actionLoading}
                    >
                      <i className="flaticon-check"></i>
                      Accept
                    </button>
                  </>
                )}
                
                {appointment.status === 'quoted' && (
                  <>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => setCurrentView('decline')}
                      disabled={actionLoading}
                    >
                      <i className="flaticon-close"></i>
                      Decline
                    </button>
                    
                    <button
                      className="btn btn-success"
                      onClick={() => setCurrentView('accept')}
                      disabled={actionLoading}
                    >
                      <i className="flaticon-check"></i>
                      Accept Quote
                    </button>
                  </>
                )}
                
                {['accepted', 'converted', 'declined'].includes(appointment.status) && (
                  <div className="status-message">
                    <i className={`flaticon-${appointment.status === 'declined' ? 'close' : 'check'}`}></i>
                    This appointment has been {appointment.status}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .appointment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .appointment-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
          backdrop-filter: blur(3px);
        }

        .appointment-modal-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          z-index: 1051;
        }

        .appointment-modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        /* Modal Header */
        .appointment-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          flex-shrink: 0;
        }

        .header-left h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.4rem;
          font-weight: 600;
          color: #333;
        }

        .appointment-status {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .urgency-badge {
          padding: 0.2rem 0.6rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #f0f0f0;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-back {
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-back:hover:not(:disabled) {
          background: #5c636a;
          transform: scale(1.1);
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6c757d;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .btn-close:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.1);
          color: #000;
          transform: scale(1.1);
        }

        /* Modal Body */
        .appointment-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .appointment-details {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f1f3f4;
        }

        .detail-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #495057;
        }

        .section-title i {
          color: #6c757d;
          font-size: 1.1rem;
        }

        /* Customer Card */
        .customer-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .customer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .customer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.5rem;
        }

        .customer-info h5 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .contact-item i {
          color: #0d6efd;
          font-size: 0.8rem;
        }

        /* Service Info */
        .service-info h5 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }

        .service-description {
          margin-bottom: 1rem;
        }

        .service-description strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .service-description p {
          margin: 0;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 3px solid #0d6efd;
          color: #555;
          line-height: 1.5;
        }

        .price-info {
          color: #198754;
          font-weight: 500;
        }

        /* Schedule Info */
        .schedule-info,
        .request-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .schedule-item,
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .schedule-item:last-child,
        .info-item:last-child {
          border-bottom: none;
        }

        .schedule-item strong,
        .info-item strong {
          color: #495057;
          font-weight: 600;
        }

        .schedule-item.deadline {
          color: #dc3545;
        }

        .urgency-low { color: #0066cc; }
        .urgency-standard { color: #666; }
        .urgency-high { color: #cc6600; }
        .urgency-urgent { color: #cc0000; }

        /* Location Info */
        .location-info {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        .location-info > div {
          margin-bottom: 0.25rem;
        }

        .location-info > div:last-child {
          margin-bottom: 0;
        }

        .community {
          font-style: italic;
          color: #888;
        }

        .landmark {
          color: #0d6efd;
          font-weight: 500;
        }

        .rural-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #856404;
          background: #fff3cd;
          padding: 0.5rem;
          border-radius: 6px;
          margin-top: 0.5rem;
        }

        /* Customer Message */
        .customer-message p {
          margin: 0;
          padding: 1rem;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 3px solid #2196f3;
          font-style: italic;
          color: #555;
          line-height: 1.5;
        }

        /* Modal Footer */
        .appointment-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          flex-shrink: 0;
        }

        .appointment-id {
          font-size: 0.85rem;
          color: #666;
          font-family: monospace;
        }

        .footer-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-style: italic;
        }

        /* Buttons */
        .btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-success {
          background: #198754;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #157347;
        }

        .btn-outline-danger {
          background: transparent;
          color: #dc3545;
          border: 2px solid #dc3545;
        }

        .btn-outline-danger:hover:not(:disabled) {
          background: #dc3545;
          color: white;
        }

        .btn-outline-info {
          background: transparent;
          color: #0dcaf0;
          border: 2px solid #0dcaf0;
        }

        .btn-outline-info:hover:not(:disabled) {
          background: #0dcaf0;
          color: white;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .appointment-modal-container {
            max-width: 95vw;
            max-height: 95vh;
          }

          .appointment-modal-header {
            padding: 1rem;
          }

          .header-left h3 {
            font-size: 1.2rem;
          }

          .appointment-details {
            padding: 1rem;
          }

          .customer-card {
            flex-direction: column;
            text-align: center;
          }

          .schedule-item,
          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .appointment-modal-footer {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .footer-actions {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn {
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .appointment-modal-container {
            padding: 0.5rem;
          }

          .footer-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn {
            width: 100%;
            min-width: auto;
          }
        }

        /* Custom Scrollbar */
        .appointment-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .appointment-modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .appointment-modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .appointment-modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Loading States */
        .btn:disabled {
          position: relative;
        }

        .btn:disabled::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          margin: -8px 0 0 -8px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .btn:hover:not(:disabled) {
            transform: none;
          }
          
          .btn-back:hover:not(:disabled),
          .btn-close:hover:not(:disabled) {
            transform: none;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        }

        /* Focus States */
        .btn:focus,
        .btn-back:focus,
        .btn-close:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .appointment-modal-content {
            border: 2px solid;
          }
          
          .status-badge,
          .urgency-badge {
            border: 1px solid;
          }
        }

        /* Fix urgency badge template literal */
        .urgency-badge.urgency-low {
          background: #e7f3ff;
          color: #0066cc;
        }

        .urgency-badge.urgency-standard {
          background: #f0f0f0;
          color: #666;
        }

        .urgency-badge.urgency-high {
          background: #fff2e6;
          color: #cc6600;
        }

        .urgency-badge.urgency-urgent {
          background: #ffe6e6;
          color: #cc0000;
        }

        /* Animation for modal entrance */
        .appointment-modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }

        .appointment-modal-content {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Status badge animations */
        .status-badge {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }

        /* Smooth transitions for all interactive elements */
        .customer-card,
        .detail-section,
        .service-description p,
        .location-info,
        .customer-message p {
          transition: all 0.2s ease;
        }

        .customer-card:hover {
          background: #f1f3f4;
        }

        /* Enhanced button states */
        .btn {
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: width 0.6s, height 0.6s, top 0.6s, left 0.6s;
          transform: translate(-50%, -50%);
        }

        .btn:hover::before {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 50%;
        }

        /* Print styles */
        @media print {
          .appointment-modal-overlay {
            position: static;
            background: none;
            backdrop-filter: none;
          }

          .appointment-modal-backdrop {
            display: none;
          }

          .appointment-modal-container {
            max-width: 100%;
            max-height: none;
          }

          .appointment-modal-content {
            box-shadow: none;
            border: 1px solid #000;
          }

          .header-actions,
          .appointment-modal-footer {
            display: none;
          }

          .appointment-modal-body {
            overflow: visible;
          }
        }

        /* Dark mode support (if implemented in the future) */
        @media (prefers-color-scheme: dark) {
          .appointment-modal-content {
            background: #1a1a1a;
            color: #ffffff;
          }

          .appointment-modal-header {
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            border-bottom-color: #404040;
          }

          .customer-card,
          .location-info {
            background: #2d2d2d;
          }

          .service-description p,
          .customer-message p {
            background: #2d2d2d;
            color: #e0e0e0;
          }

          .detail-section {
            border-bottom-color: #404040;
          }

          .appointment-modal-footer {
            background: #2d2d2d;
            border-top-color: #404040;
          }
        }

        /* RTL Support */
        [dir="rtl"] .appointment-modal-header {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .header-actions {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .customer-card {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .contact-item {
          flex-direction: row-reverse;
        }

        [dir="rtl"] .service-description p {
          border-left: none;
          border-right: 3px solid #0d6efd;
        }

        [dir="rtl"] .customer-message p {
          border-left: none;
          border-right: 3px solid #2196f3;
        }

        /* Error states */
        .error-state {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .error-state i {
          margin-right: 0.5rem;
        }

        /* Success states */
        .success-state {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .success-state i {
          margin-right: 0.5rem;
        }:-webkit-scrollbar {
          width: 6px;
        }

        .appointment-modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .appointment-modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .appointment-modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Loading States */
        .btn:disabled {
          position: relative;
        }

        .btn:disabled::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          margin: -8px 0 0 -8px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .btn:hover:not(:disabled) {
            transform: none;
          }
          
          .btn-back:hover:not(:disabled),
          .btn-close:hover:not(:disabled) {
            transform: none;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        }

        /* Focus States */
        .btn:focus,
        .btn-back:focus,
        .btn-close:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .appointment-modal-content {
            border: 2px solid;
          }
          
          .status-badge,
          .urgency-badge {
            border: 1px solid;
          }
        }

              `}</style>


      </div>
  )
}