"use client";
import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useProfessionalServices } from '@/hook/useProfessionalServices';

export default function QuotationManagement() {
  const { user } = useUserStore();
  
  // ✅ PROPERLY INTEGRATED WITH HOOK
  const {
    services: quotations,           // Alias for UI consistency
    stats,                          // Auto-calculated stats
    loading,                        // Built-in loading state
    error,                          // Error handling
    addService,                     // Add new quotation
    updateService,                  // Update existing quotation
    deleteService,                  // Remove quotation
    toggleServiceStatus,            // Toggle active/inactive
    handleSearch,                   // Built-in search handler
    handleStatusFilter,             // Built-in filter handler
    searchTerm,                     // Current search term
    statusFilter,                   // Current status filter
    getServicePrice,                // Utility function
    getPricingModel                 // Utility function
  } = useProfessionalServices(user?.id);

  // ✅ MODAL AND SELECTION STATE (Not managed by hook)
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);

  // ✅ LOAD AVAILABLE SERVICES FOR MODAL (Separate from professional services)
  const loadAvailableServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setAvailableServices(data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  // ✅ FILTERED QUOTATIONS (Using hook's built-in filtering)
  const filteredQuotations = quotations; // Hook already filters

  // Custom CSS for Tailwind-esque styling with your dashboard theme
  const customStyles = `
    <style>
      .text-gray-900 { color: #111827; }
      .text-gray-700 { color: #374151; }
      .text-gray-600 { color: #4B5563; }
      .text-gray-500 { color: #6B7280; }
      .text-gray-400 { color: #9CA3AF; }
      .bg-gray-50 { background-color: #F9FAFB; }
      .bg-gray-100 { background-color: #F3F4F6; }
      .border-gray-300 { border-color: #D1D5DB; }
      .border-gray-200 { border-color: #E5E7EB; }
      .hover\\:bg-gray-50:hover { background-color: #F9FAFB; }
      .hover\\:border-primary:hover { border-color: #5bbb7b; }
      .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
      .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
      
      .gradient-btn {
        background: linear-gradient(135deg, #5bbb7b 0%, #4ade80 100%);
        transition: all 0.3s ease;
        border: none;
      }
      .gradient-btn:hover {
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(91, 187, 123, 0.3);
      }
      
      .stats-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
      }
      .stats-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      
      .quotation-card {
        transition: all 0.3s ease;
        border: 1px solid #e2e8f0;
      }
      .quotation-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #5bbb7b;
      }
      
      .empty-state {
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        border: 2px dashed #e2e8f0;
      }
    </style>
  `;

  // ✅ CRUD OPERATIONS USING HOOK
  const handleAddQuotation = async (serviceData) => {
    const result = await addService(serviceData);
    if (result.success) {
      setShowModal(false);
      setSelectedService(null);
    }
    return result;
  };

  const handleUpdateQuotation = async (quotationId, updateData) => {
    return await updateService(quotationId, updateData);
  };

  const handleDeleteQuotation = async (quotationId) => {
    return await deleteService(quotationId);
  };

  const handleToggleStatus = async (quotationId, currentStatus) => {
    return await toggleServiceStatus(quotationId, currentStatus);
  };

  const EmptyState = () => (
    <div className="text-center py-4">
      <div className="empty-state rounded-3 p-4 mx-auto" style={{maxWidth: '400px'}}>
        <div className="mb-3">
          <i className="flaticon-file-1 text-primary" style={{fontSize: '3rem'}}></i>
        </div>
        <h5 className="text-gray-900 fw-semibold mb-2">No Quotations Yet</h5>
        <p className="text-gray-600 mb-3">
          Start building your service portfolio by creating your first quotation.
        </p>
        <button 
          onClick={() => {
            loadAvailableServices();
            setShowModal(true);
          }}
          className="btn gradient-btn text-white px-4 py-2 rounded-2"
        >
          <i className="fas fa-plus me-2"></i>
          Create First Quotation
        </button>
      </div>
    </div>
  );

  const QuotationCard = ({ quotation }) => (
    <div className="col-12 mb-3">
      <div className="quotation-card bg-white rounded-3 p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <h6 className="text-gray-900 fw-semibold mb-0 me-3">
                {quotation.service?.service_name || 'Service Name'}
              </h6>
              <span className={`badge rounded-pill px-3 ${quotation.is_active ? 'bg-success' : 'bg-secondary'}`}>
                {quotation.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-600 small mb-2">
              {quotation.service?.portfolio?.portfolio_name} • {quotation.service?.portfolio?.vertical?.vertical_name}
            </p>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-dollar-sign text-primary me-2"></i>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      ${getServicePrice(quotation)?.toFixed(2) || '0.00'}
                    </div>
                    {quotation.service?.base_price && quotation.custom_price !== quotation.service.base_price && (
                      <div className="small text-gray-500">
                        <span className="text-decoration-line-through">
                          ${quotation.service.base_price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-clock text-primary me-2"></i>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      {quotation.custom_duration_minutes || quotation.service?.base_duration_minutes || 'N/A'} min
                    </div>
                    <div className="small text-gray-500">Duration</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-brain text-primary me-2"></i>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      {getPricingModel(quotation) || 'Quote'}
                    </div>
                    <div className="small text-gray-500">Model</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-calendar-plus text-primary me-2"></i>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </div>
                    <div className="small text-gray-500">Created</div>
                  </div>
                </div>
              </div>
            </div>
            {quotation.notes && (
              <div className="mt-3">
                <p className="text-gray-600 small mb-0">
                  <i className="fas fa-sticky-note text-primary me-2"></i>
                  {quotation.notes}
                </p>
              </div>
            )}
          </div>
          <div className="dropdown">
            <button 
              className="btn btn-light btn-sm"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedService(quotation);
                    setShowModal(true);
                  }}
                >
                  <i className="fas fa-edit me-2"></i>Edit
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item"
                  onClick={() => handleToggleStatus(quotation.professional_service_id, quotation.is_active)}
                >
                  <i className={`fas ${quotation.is_active ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>
                  {quotation.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item text-danger"
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this quotation?')) {
                      handleDeleteQuotation(quotation.professional_service_id);
                    }
                  }}
                >
                  <i className="fas fa-trash me-2"></i>Remove
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Content renders directly inside DashboardLayout's dashboard__content */}
      <div className="dashboard__content hover-bgc-color">
        {/* Header Section */}
        <div className="row pb40">
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2 className="text-gray-900">Quotation Management</h2>
              <p className="text text-gray-600 mb-0">
                Manage your service quotations with custom pricing and parameters
              </p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <button 
                onClick={() => {
                  loadAvailableServices();
                  setShowModal(true);
                }}
                className="btn gradient-btn text-white px-4 py-2 rounded-2"
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                Add Quotation
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Updated to use hook's stats */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="stats-card rounded-3 p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="flaticon-file-1 text-primary fs-5"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fs-3 fw-bold text-gray-900">{stats.total}</div>
                  <div className="text-gray-600 small">Total Quotations</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stats-card rounded-3 p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="flaticon-check text-success fs-5"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fs-3 fw-bold text-gray-900">{stats.active}</div>
                  <div className="text-gray-600 small">Active Quotations</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stats-card rounded-3 p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="flaticon-dollar text-warning fs-5"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fs-3 fw-bold text-gray-900">${stats.averagePrice?.toFixed(0) || '0'}</div>
                  <div className="text-gray-600 small">Avg. Quotation</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stats-card rounded-3 p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="flaticon-analytics text-info fs-5"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fs-3 fw-bold text-gray-900">${stats.totalPotentialValue?.toFixed(0) || '0'}</div>
                  <div className="text-gray-600 small">Portfolio Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section - Updated to use hook handlers */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control border-gray-300 ps-5"
                placeholder="Search quotations by service name or category..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400"></i>
            </div>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select border-gray-300"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">All Quotations</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="row mb-3">
          <div className="col-12">
            <p className="text-gray-600 small mb-0">
              {filteredQuotations.length} of {stats.total} quotations
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-gray-600">Loading quotations...</p>
              </div>
            ) : stats.total === 0 ? (
              <EmptyState />
            ) : filteredQuotations.length === 0 ? (
              <div className="text-center py-4">
                <i className="flaticon-search text-gray-400" style={{fontSize: '3rem'}}></i>
                <h5 className="text-gray-600 mt-3">No quotations found</h5>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="row">
                {filteredQuotations.map((quotation) => (
                  <QuotationCard key={quotation.professional_service_id} quotation={quotation} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Quotation Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedService ? 'Edit Quotation' : 'Add New Quotation'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedService(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-gray-600 mb-4">
                  Select a service from your {availableServices.length || '145+'} available services and customize the pricing.
                </p>
                {/* TODO: Complete modal content with service selection */}
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    Service selection interface coming next...
                    <br />
                    <small>Will include: Service search, pricing model selection, custom pricing, duration settings</small>
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedService(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn gradient-btn text-white"
                  disabled={!selectedService && !availableServices.length}
                >
                  {selectedService ? 'Update Quotation' : 'Create Quotation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}