// src/components/professional-workspace/card/AppointmentCard.jsx
'use client'

import { useState } from 'react'

export default function AppointmentCard({ 
  appointment, 
  onView, 
  onAccept, 
  onDecline 
}) {
  const [actionLoading, setActionLoading] = useState(null)

  // Handle action with loading state
  const handleAction = async (action, actionHandler) => {
    setActionLoading(action)
    try {
      await actionHandler()
    } finally {
      setActionLoading(null)
    }
  }

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'quoted':
        return 'status-quoted'
      case 'accepted':
        return 'status-accepted'
      case 'converted':
        return 'status-converted'
      case 'declined':
        return 'status-declined'
      default:
        return 'status-default'
    }
  }

  // Get urgency styling
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'low':
        return 'urgency-low'
      case 'standard':
        return 'urgency-standard'
      case 'high':
        return 'urgency-high'
      case 'urgent':
        return 'urgency-urgent'
      default:
        return 'urgency-standard'
    }
  }

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified'
    
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    if (isToday) {
      return `Today at ${timeStr}`
    } else if (isTomorrow) {
      return `Tomorrow at ${timeStr}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ` at ${timeStr}`
    }
  }

  // Get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return 'Overdue'
    } else if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`
    } else {
      return `In ${Math.ceil(diffDays / 7)} weeks`
    }
  }

  return (
    <div className="appointment-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="header-left">
          <div className="customer-info">
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
            <div className="customer-details">
              <h4 className="customer-name">
                {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
              </h4>
              <p className="customer-contact">
                {appointment.customer?.account?.email}
                {appointment.customer?.phone?.phone_number && (
                  <span className="phone"> • {appointment.customer.phone.phone_number}</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="status-badges">
            <span className={`status-badge ${getStatusStyle(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            <span className={`urgency-badge ${getUrgencyStyle(appointment.urgency)}`}>
              {appointment.urgency === 'standard' ? 'Standard' : 
               appointment.urgency === 'low' ? 'Flexible' :
               appointment.urgency === 'high' ? 'Priority' : 'Urgent'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Service Information */}
        <div className="service-section">
          <div className="section-icon">
            <i className="flaticon-tools"></i>
          </div>
          <div className="section-content">
            <h5 className="service-title">{appointment.service?.name || appointment.title}</h5>
            <p className="service-description">
              {appointment.description || appointment.service?.description}
            </p>
            {appointment.service?.base_price && (
              <div className="service-price">
                Base Price: <strong>JMD ${appointment.service.base_price}</strong>
                {appointment.service.duration_minutes && (
                  <span className="duration"> • {appointment.service.duration_minutes} mins</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Information */}
        <div className="schedule-section">
          <div className="section-icon">
            <i className="flaticon-calendar"></i>
          </div>
          <div className="section-content">
            <div className="schedule-details">
              <div className="preferred-time">
                <strong>Preferred Time:</strong> {formatDateTime(appointment.preferred_start)}
              </div>
              {appointment.deadline && (
                <div className="deadline">
                  <strong>Project Deadline:</strong> {formatDateTime(appointment.deadline)}
                  <span className={`relative-time ${getRelativeTime(appointment.deadline) === 'Overdue' ? 'overdue' : ''}`}>
                    ({getRelativeTime(appointment.deadline)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        {appointment.address && (
          <div className="location-section">
            <div className="section-icon">
              <i className="flaticon-location"></i>
            </div>
            <div className="section-content">
              <div className="location-details">
                <div className="address">
                  {appointment.address.street_address && (
                    <div>{appointment.address.street_address}</div>
                  )}
                  <div>
                    {appointment.address.city}, {appointment.address.parish}
                  </div>
                  {appointment.address.community && (
                    <div className="community">{appointment.address.community}</div>
                  )}
                  {appointment.address.landmark && (
                    <div className="landmark">Near {appointment.address.landmark}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Message */}
        {appointment.customer_message && (
          <div className="message-section">
            <div className="section-icon">
              <i className="flaticon-chat"></i>
            </div>
            <div className="section-content">
              <div className="customer-message">
                <strong>Customer Notes:</strong>
                <p>"{appointment.customer_message}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-left">
          <div className="request-time">
            Requested {new Date(appointment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
        
        <div className="footer-right">
          <div className="action-buttons">
            <button 
              className="btn btn-outline btn-view"
              onClick={onView}
              disabled={!!actionLoading}
            >
              <i className="flaticon-eye"></i>
              View Details
            </button>
            
            {appointment.status === 'pending' && (
              <>
                <button 
                  className="btn btn-danger btn-decline"
                  onClick={() => handleAction('decline', onDecline)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'decline' ? (
                    <>
                      <i className="spinner-border spinner-border-sm"></i>
                      Declining...
                    </>
                  ) : (
                    <>
                      <i className="flaticon-close"></i>
                      Decline
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-success btn-accept"
                  onClick={() => handleAction('accept', onAccept)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'accept' ? (
                    <>
                      <i className="spinner-border spinner-border-sm"></i>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <i className="flaticon-check"></i>
                      Accept
                    </>
                  )}
                </button>
              </>
            )}
            
            {appointment.status === 'quoted' && (
              <>
                <button 
                  className="btn btn-danger btn-decline"
                  onClick={() => handleAction('decline', onDecline)}
                  disabled={!!actionLoading}
                >
                  <i className="flaticon-close"></i>
                  Decline
                </button>
                
                <button 
                  className="btn btn-success btn-accept"
                  onClick={() => handleAction('accept', onAccept)}
                  disabled={!!actionLoading}
                >
                  <i className="flaticon-check"></i>
                  Accept Quote
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .appointment-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .appointment-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        /* Card Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #f1f3f4;
        }

        .header-left {
          flex: 1;
        }

        .customer-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .customer-avatar {
          width: 50px;
          height: 50px;
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
          font-size: 1.2rem;
        }

        .customer-details {
          flex: 1;
        }

        .customer-name {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .customer-contact {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .phone {
          color: #0d6efd;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .status-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        /* Status Badges */
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .status-quoted {
          background: #cff4fc;
          color: #055160;
          border: 1px solid #b6effb;
        }

        .status-accepted {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .status-converted {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-declined {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f1aeb5;
        }

        .urgency-badge {
          padding: 0.2rem 0.6rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .urgency-low {
          background: #e7f3ff;
          color: #0066cc;
        }

        .urgency-standard {
          background: #f0f0f0;
          color: #666;
        }

        .urgency-high {
          background: #fff2e6;
          color: #cc6600;
        }

        .urgency-urgent {
          background: #ffe6e6;
          color: #cc0000;
        }

        /* Card Body */
        .card-body {
          padding: 1rem 1.5rem;
        }

        .service-section,
        .schedule-section,
        .location-section,
        .message-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f3f4;
        }

        .message-section {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-icon {
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .section-content {
          flex: 1;
        }

        .service-title {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
        }

        .service-description {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .service-price {
          font-size: 0.9rem;
          color: #198754;
        }

        .duration {
          color: #666;
          font-weight: normal;
        }

        .schedule-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .preferred-time,
        .deadline {
          font-size: 0.9rem;
          color: #666;
        }

        .relative-time {
          color: #198754;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .relative-time.overdue {
          color: #dc3545;
        }

        .location-details {
          font-size: 0.9rem;
          color: #666;
        }

        .address div {
          margin-bottom: 0.25rem;
        }

        .community {
          font-style: italic;
          color: #888;
        }

        .landmark {
          color: #0d6efd;
          font-size: 0.85rem;
        }

        .customer-message p {
          margin: 0.5rem 0 0 0;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 3px solid #0d6efd;
          font-style: italic;
          color: #555;
        }

        /* Card Footer */
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .request-time {
          font-size: 0.85rem;
          color: #666;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        /* Buttons */
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          border: none;
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

        .btn-outline {
          background: transparent;
          border: 1px solid #dee2e6;
          color: #666;
        }

        .btn-outline:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .btn-view {
          color: #0d6efd;
          border-color: #b6d7ff;
        }

        .btn-view:hover:not(:disabled) {
          background: #f0f9ff;
          border-color: #0d6efd;
        }

        .btn-success {
          background: #198754;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #157347;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #bb2d3b;
        }

        .btn i {
          font-size: 0.8rem;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .appointment-card {
            margin-bottom: 1rem;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .header-right {
            align-items: flex-start;
            width: 100%;
          }

          .status-badges {
            flex-direction: row;
            justify-content: flex-start;
            width: 100%;
          }

          .customer-info {
            gap: 0.75rem;
          }

          .customer-avatar {
            width: 40px;
            height: 40px;
          }

          .card-body {
            padding: 1rem;
          }

          .service-section,
          .schedule-section,
          .location-section,
          .message-section {
            gap: 0.75rem;
          }

          .section-icon {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }

          .card-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            padding: 1rem;
          }

          .action-buttons {
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
          .card-header {
            padding: 0.75rem;
          }

          .card-body {
            padding: 0.75rem;
          }

          .card-footer {
            padding: 0.75rem;
          }

          .customer-name {
            font-size: 1rem;
          }

          .customer-contact {
            font-size: 0.85rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}