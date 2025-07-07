// src/app/(professional-workspace)/professional/manage-appointments/page.jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import AppointmentInformationTable from '@/components/professional-workspace/table/AppointmentInformationTable'
import AppointmentInformationModal from '@/components/professional-workspace/modal/AppointmentInformationModal'

export default function ManageAppointments() {
  const { user } = useUserStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Fetch appointments from API
  const fetchAppointments = useCallback(async (page = 1) => {
    if (!user?.profile?.professional_id) {
      console.log('No professional ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        professional_id: user.profile.professional_id,
        limit: pagination.limit.toString(),
        offset: ((page - 1) * pagination.limit).toString()
      })

      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      console.log('🔍 Fetching appointments with params:', params.toString())

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments')
      }

      console.log('✅ Appointments fetched:', data.appointments?.length || 0)

      setAppointments(data.appointments || [])
      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }))

    } catch (err) {
      console.error('❌ Error fetching appointments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.profile?.professional_id, filters.status, pagination.limit])

  // Initial load
  useEffect(() => {
    fetchAppointments(1)
  }, [fetchAppointments])

  // Handle appointment action (accept/decline)
  const handleAppointmentAction = useCallback(async (appointmentId, action, additionalData = {}) => {
    if (!appointmentId || !action) return

    console.log(`🔄 ${action}ing appointment:`, appointmentId)

    try {
      const updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        ...additionalData
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} appointment`)
      }

      console.log(`✅ Appointment ${action}ed successfully`)

      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, ...data.appointment }
            : apt
        )
      )

      // Close modal if open
      if (showModal) {
        setShowModal(false)
        setSelectedAppointment(null)
      }

      // Show success message
      // TODO: Add toast notification

    } catch (err) {
      console.error(`❌ Error ${action}ing appointment:`, err)
      setError(err.message)
    }
  }, [showModal])

  // Handle view appointment details
  const handleViewAppointment = useCallback(async (appointmentId) => {
    console.log('👁️ Viewing appointment:', appointmentId)

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointment details')
      }

      setSelectedAppointment(data.appointment)
      setShowModal(true)

    } catch (err) {
      console.error('❌ Error fetching appointment details:', err)
      setError(err.message)
    }
  }, [])

  // Filter appointments locally by search
  const filteredAppointments = appointments.filter(appointment => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase()
    const customerName = `${appointment.customer?.account?.first_name || ''} ${appointment.customer?.account?.last_name || ''}`.toLowerCase()
    const serviceName = appointment.service?.name?.toLowerCase() || ''
    const description = appointment.description?.toLowerCase() || ''
    
    return customerName.includes(searchLower) || 
           serviceName.includes(searchLower) || 
           description.includes(searchLower)
  })

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage)
    }
  }

  if (!user?.profile?.professional_id) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content">
          <div className="row pb40">
            <div className="col-lg-12">
              <div className="dashboard_title_area">
                <h2>Manage Appointments</h2>
                <p className="text">Please complete your professional profile to view appointments.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="">
        <div className="dashboard__content">
          {/* Header */}
          <div className="row pb40">
            <div className="col-lg-12">
              <div className="dashboard_title_area">
                <h2>Manage Appointments</h2>
                <p className="text">Review and respond to appointment requests from customers.</p>
              </div>
            </div>
          </div>

          {/* Filters and Stats */}
          <div className="row pb20">
            <div className="col-lg-12">
              <div className="dashboard_stats_area">
                <div className="row">
                  {/* Stats Cards */}
                  <div className="col-sm-6 col-lg-3">
                    <div className="dashboard_stats_card">
                      <div className="stats_content">
                        <div className="stats_number">
                          {appointments.filter(a => a.status === 'pending').length}
                        </div>
                        <div className="stats_label">Pending</div>
                      </div>
                      <div className="stats_icon">
                        <i className="flaticon-clock text-warning"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-sm-6 col-lg-3">
                    <div className="dashboard_stats_card">
                      <div className="stats_content">
                        <div className="stats_number">
                          {appointments.filter(a => a.status === 'accepted' || a.status === 'converted').length}
                        </div>
                        <div className="stats_label">Accepted</div>
                      </div>
                      <div className="stats_icon">
                        <i className="flaticon-check text-success"></i>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="dashboard_stats_card">
                      <div className="stats_content">
                        <div className="stats_number">
                          {appointments.filter(a => a.status === 'quoted').length}
                        </div>
                        <div className="stats_label">Quoted</div>
                      </div>
                      <div className="stats_icon">
                        <i className="flaticon-price-tag text-info"></i>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="dashboard_stats_card">
                      <div className="stats_content">
                        <div className="stats_number">
                          {appointments.filter(a => a.status === 'declined').length}
                        </div>
                        <div className="stats_label">Declined</div>
                      </div>
                      <div className="stats_icon">
                        <i className="flaticon-close text-danger"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="row pb20">
            <div className="col-lg-12">
              <div className="dashboard_filters_area">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="status_filters">
                      {[
                        { key: 'all', label: 'All Appointments', count: appointments.length },
                        { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
                        { key: 'quoted', label: 'Quoted', count: appointments.filter(a => a.status === 'quoted').length },
                        { key: 'accepted', label: 'Accepted', count: appointments.filter(a => a.status === 'accepted').length },
                        { key: 'converted', label: 'Converted', count: appointments.filter(a => a.status === 'converted').length }
                      ].map(filter => (
                        <button
                          key={filter.key}
                          className={`filter_btn ${filters.status === filter.key ? 'active' : ''}`}
                          onClick={() => handleStatusFilter(filter.key)}
                        >
                          {filter.label} ({filter.count})
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="search_area">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search appointments..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="row pb20">
              <div className="col-lg-12">
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                  <button 
                    className="btn btn-sm btn-outline-danger ml-2"
                    onClick={() => fetchAppointments(pagination.page)}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="row">
              <div className="col-lg-12">
                <div className="loading_area text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading appointments...</span>
                  </div>
                  <p className="mt-3">Loading your appointments...</p>
                </div>
              </div>
            </div>
          )}

          {/* Appointments List */}
          {!loading && (
            <>
              <div className="row">
                <div className="col-lg-12">
                  {filteredAppointments.length === 0 ? (
                    <div className="empty_state text-center py-5">
                      <div className="empty_icon mb-3">
                        <i className="flaticon-calendar" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                      </div>
                      <h4>No appointments found</h4>
                      <p className="text-muted">
                        {filters.status === 'all' 
                          ? "You don't have any appointment requests yet." 
                          : `No ${filters.status} appointments found.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="appointments_grid">
                      {filteredAppointments.map((appointment) => (
                        <AppointmentInformationTable
  appointments={filteredAppointments}
  onView={handleViewAppointment}
  onAccept={(id) => handleAppointmentAction(id, 'accept')}
  onDecline={(id) => handleAppointmentAction(id, 'decline')}
  loading={loading}
/>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="row pt40">
                  <div className="col-lg-12">
                    <div className="pagination_area text-center">
                      <nav aria-label="Appointments pagination">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(pagination.page - 1)}
                              disabled={pagination.page === 1}
                            >
                              Previous
                            </button>
                          </li>
                          
                          {[...Array(pagination.totalPages)].map((_, index) => {
                            const pageNum = index + 1
                            return (
                              <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                <button 
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            )
                          })}
                          
                          <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(pagination.page + 1)}
                              disabled={pagination.page === pagination.totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                      
                      <p className="pagination_info text-muted mt-2">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <AppointmentInformationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onAccept={() => handleAppointmentAction(selectedAppointment.appointment_id, 'accept')}
          onDecline={() => handleAppointmentAction(selectedAppointment.appointment_id, 'decline')}
        />
      )}

      <style jsx>{`
        .dashboard_stats_area {
          margin-bottom: 2rem;
        }

        .dashboard_stats_card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats_number {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
        }

        .stats_label {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .stats_icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .dashboard_filters_area {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .status_filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter_btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter_btn:hover {
          background: #e9ecef;
        }

        .filter_btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .appointments_grid {
          display: grid;
          gap: 1rem;
        }

        .empty_state {
          background: white;
          border-radius: 8px;
          padding: 3rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .loading_area {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .pagination_area {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .dashboard_filters_area .row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .status_filters {
            justify-content: center;
          }
          
          .filter_btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </>
  )
}