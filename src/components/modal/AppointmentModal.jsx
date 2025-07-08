'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Appointment from '@/components/forms/Appointment'

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  professional, 
  serviceInformation, 
  location 
}) {
  const modalRef = useRef(null)

  // Handle escape key press
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose?.()
    }
  }, [onClose])

  // Handle click outside modal
  const handleBackdropClick = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose?.()
    }
  }, [onClose])

  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointmentRequest) => {
    console.log('✅ appointment successful:', appointmentRequest)
    
    // Show success message or redirect
    alert('Appointment sent  You will receive a confirmation email shortly.')
    
    // Close modal
    onClose?.()
  }, [onClose])

  // Add event listeners when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.addEventListener('mousedown', handleBackdropClick)
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscapeKey, handleBackdropClick])

  // Don't render if not open
  if (!isOpen) return null

  // Render modal using portal to avoid z-index issues
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
          {/* Compact Modal Header */}
          <div className="appointment-modal-header">
            <div className="header-content">
              {/* <h5 className="modal-title">Book Service</h5> */}
              {/* <span className="service-name">{serviceInformation?.name}</span> */}
            </div>
            <button
              type="button"
              className="appointment-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Modal Body - No padding, form handles its own spacing */}
          <div className="appointment-modal-body">
            <Appointment
              professional={professional}
              serviceInformation={serviceInformation}
              location={location}
              onSuccess={handleAppointmentSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>

      {/* Optimized Modal Styles */}
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
          max-width: 1500px;
          height: 90vh;
          z-index: 1051;
        }

        .appointment-modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .appointment-modal-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          min-height: 70px;
        }

        .header-content {
          flex: 1;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #212529;
          line-height: 1.2;
        }

        .service-name {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
          display: block;
          margin-top: 2px;
        }

        .appointment-modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6c757d;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .appointment-modal-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #000;
          transform: scale(1.1);
        }

        .appointment-modal-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .appointment-modal-overlay {
            padding: 0.5rem;
          }
          
          .appointment-modal-container {
            height: 95vh;
          }
          
          .appointment-modal-header {
            // min-height: 60px;
          }
          
          .modal-title {
            font-size: 1.1rem;
          }
          
          .service-name {
            font-size: 0.8rem;
          }
          
          .appointment-modal-close {
            font-size: 1.5rem;
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 576px) {
          .appointment-modal-overlay {
            padding: 0.25rem;
          }
          
          .appointment-modal-container {
            height: 98vh;
          }
          
          .appointment-modal-content {
            border-radius: 12px;
          }
        }
      `}</style>
    </div>,
    document.body
  )
}