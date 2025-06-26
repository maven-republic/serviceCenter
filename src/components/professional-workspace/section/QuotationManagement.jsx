"use client";
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
// ✅ NEW: Add quantification import
import useQuantificationManifold from '@/hook/useQuantificationManifold';

export default function QuotationManagement() {
  const { user } = useUserStore();
  
  // ✅ EXISTING STATE (unchanged)
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    averagePrice: 0,
    totalValue: 0
  });

  // ✅ NEW: Add quantification state
  const [modalStep, setModalStep] = useState('selection'); // 'selection' | 'quantification'
  const [selectedServiceForQuantification, setSelectedServiceForQuantification] = useState(null);
  const [quantificationNotes, setQuantificationNotes] = useState('');

  // ✅ NEW: Add quantification hook
  const {
    service: quantService,
    setService: setQuantService,
    attributes,
    quantificationResult,
    isCalculating,
    error: quantError,
    config,
    marketConditions,
    updateAttribute,
    updateConfig,
    updateMarketConditions,
    performCalculation,
    formatPrice,
    getRecommendedPrice,
    hasValidService,
    isReady
  } = useQuantificationManifold({
    autoCalculate: true,
    cacheResults: true
  });

  // ✅ ENHANCED: Custom CSS for Tailwind-esque styling with quantification features
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

      /* ✅ NEW: Quantification-specific styles */
      .service-card {
        transition: all 0.2s ease;
        cursor: pointer;
        border: 1px solid #e2e8f0;
      }
      .service-card:hover {
        border-color: #5bbb7b;
        box-shadow: 0 4px 12px rgba(91, 187, 123, 0.15);
      }
      .service-card.selected {
        border-color: #5bbb7b;
        background-color: #f0fdf4;
      }

      .quantification-badge {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-weight: 600;
      }

      .pricing-panel {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #0ea5e9;
        border-radius: 0.75rem;
      }
    </style>
  `;

  // ✅ ALL YOUR EXISTING FUNCTIONS (unchanged)
  // Load data on component mount
  useEffect(() => {
    loadQuotations();
    loadAvailableServices();
  }, []);

  // Update stats when quotations change
  useEffect(() => {
    updateStats();
  }, [quotations]);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch('/api/quantification/professional-quotations');
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableServices = async () => {
    try {
      // Replace with your actual API call to get services
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setAvailableServices(data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const updateStats = () => {
    const activeQuotations = quotations.filter(q => q.is_active);
    const totalValue = quotations.reduce((sum, q) => sum + (q.custom_price || 0), 0);
    const averagePrice = quotations.length > 0 ? totalValue / quotations.length : 0;

    setStats({
      total: quotations.length,
      active: activeQuotations.length,
      averagePrice,
      totalValue
    });
  };

  // ✅ NEW: Quantification handler functions
  const handleServiceSelect = (service) => {
    setSelectedServiceForQuantification(service);
    setQuantService(service);
    setModalStep('quantification');
  };

  const handleBackToSelection = () => {
    setModalStep('selection');
    setSelectedServiceForQuantification(null);
    setQuantService(null);
    setQuantificationNotes('');
  };

  const handleSaveQuantification = async () => {
    if (!quantificationResult || !selectedServiceForQuantification) return;

    try {
      const quotationData = {
        service_id: selectedServiceForQuantification.service_id,
        custom_price: quantificationResult.recommendedPrice,
        custom_duration: quantificationResult.tradeCalculations?.totalDuration || selectedServiceForQuantification.duration_minutes,
        notes: `${quantificationNotes} [Quantification: ${quantificationResult.model}]`,
        is_active: true,
        quantification_data: {
          model: quantificationResult.model,
          attributes,
          config,
          marketConditions,
          calculatedAt: new Date().toISOString()
        }
      };

      // Replace with your actual API call
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      });

      if (response.ok) {
        await loadQuotations(); // Reload quotations
        setShowModal(false);
        setModalStep('selection');
        setSelectedService(null);
        setSelectedServiceForQuantification(null);
        setQuantificationNotes('');
      }
    } catch (error) {
      console.error('Error saving quantification:', error);
    }
  };

  // ✅ NEW: Trade-specific input renderer
  const renderTradeInputs = () => {
    if (!selectedServiceForQuantification) return null;

    const serviceName = selectedServiceForQuantification.name?.toLowerCase() || '';
    const verticalName = selectedServiceForQuantification.portfolio?.vertical?.name?.toLowerCase() || '';

    if (verticalName.includes('plumb') || serviceName.includes('plumb')) {
      return (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Pipe Diameter</label>
            <select
              className="form-select"
              value={attributes.pipeDiameter || ''}
              onChange={(e) => updateAttribute('pipeDiameter', parseFloat(e.target.value))}
            >
              <option value="">Select diameter</option>
              <option value="0.5">1/2 inch</option>
              <option value="0.75">3/4 inch</option>
              <option value="1">1 inch</option>
              <option value="1.25">1 1/4 inch</option>
              <option value="1.5">1 1/2 inch</option>
              <option value="2">2 inch</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Pipe Length (feet)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter length"
              value={attributes.pipeLength || ''}
              onChange={(e) => updateAttribute('pipeLength', parseFloat(e.target.value))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Pipe Material</label>
            <select
              className="form-select"
              value={attributes.pipeMaterial || 'copper'}
              onChange={(e) => updateAttribute('pipeMaterial', e.target.value)}
            >
              <option value="copper">Copper</option>
              <option value="pvc">PVC</option>
              <option value="pex">PEX</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Accessibility</label>
            <select
              className="form-select"
              value={attributes.accessibility || 'standard'}
              onChange={(e) => updateAttribute('accessibility', e.target.value)}
            >
              <option value="easy">Easy Access</option>
              <option value="standard">Standard</option>
              <option value="difficult">Difficult</option>
              <option value="crawlspace">Crawlspace</option>
              <option value="wallaccess">Behind Wall</option>
            </select>
          </div>
        </div>
      );
    } else if (verticalName.includes('weld') || serviceName.includes('weld')) {
      return (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Metal Type</label>
            <select
              className="form-select"
              value={attributes.metalType || 'steel'}
              onChange={(e) => updateAttribute('metalType', e.target.value)}
            >
              <option value="steel">Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="stainless">Stainless Steel</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Thickness (inches)</label>
            <input
              type="number"
              step="0.125"
              className="form-control"
              placeholder="Enter thickness"
              value={attributes.thickness || ''}
              onChange={(e) => updateAttribute('thickness', parseFloat(e.target.value))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Joint Length (inches)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter length"
              value={attributes.jointLength || ''}
              onChange={(e) => updateAttribute('jointLength', parseFloat(e.target.value))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Joint Type</label>
            <select
              className="form-select"
              value={attributes.jointType || 'butt'}
              onChange={(e) => updateAttribute('jointType', e.target.value)}
            >
              <option value="butt">Butt Joint</option>
              <option value="fillet">Fillet</option>
              <option value="groove">Groove</option>
              <option value="lap">Lap Joint</option>
              <option value="corner">Corner</option>
            </select>
          </div>
        </div>
      );
    }

    return (
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Complexity Level</label>
          <select
            className="form-select"
            value={attributes.complexityLevel || 'standard'}
            onChange={(e) => updateAttribute('complexityLevel', e.target.value)}
          >
            <option value="simple">Simple</option>
            <option value="standard">Standard</option>
            <option value="complex">Complex</option>
            <option value="expert">Expert Level</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Material Quantity</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter quantity"
            value={attributes.materialQuantity || ''}
            onChange={(e) => updateAttribute('materialQuantity', parseFloat(e.target.value))}
          />
        </div>
      </div>
    );
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.service?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.service?.portfolio?.portfolio_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && quotation.is_active) ||
                         (filterStatus === 'inactive' && !quotation.is_active);
    return matchesSearch && matchesFilter;
  });

  // ✅ ENHANCED: EmptyState with advanced pricing messaging
  const EmptyState = () => (
    <div className="text-center py-4">
      <div className="empty-state rounded-3 p-4 mx-auto" style={{maxWidth: '400px'}}>
        <div className="mb-3">
          <i className="flaticon-file-1 text-primary" style={{fontSize: '3rem'}}></i>
        </div>
        <h5 className="text-gray-900 fw-semibold mb-2">No Quotations Yet</h5>
        <p className="text-gray-600 mb-3">
          Start building your service portfolio by creating your first quotation with advanced pricing models.
        </p>
        {/* ✅ NEW: Advanced pricing indicator */}
        <div className="d-flex justify-content-center mb-3">
          <span className="quantification-badge">
            <i className="fas fa-calculator me-1"></i>
            ADVANCED PRICING
          </span>
        </div>
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

  // ✅ ENHANCED: QuotationCard with quantification badges
  const QuotationCard = ({ quotation }) => (
    <div className="col-12 mb-3">
      <div className="quotation-card bg-white rounded-3 p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <h6 className="text-gray-900 fw-semibold mb-0 me-3">
                {quotation.service?.service_name || quotation.service?.name || 'Service Name'}
              </h6>
              <span className={`badge rounded-pill px-3 ${quotation.is_active ? 'bg-success' : 'bg-secondary'}`}>
                {quotation.is_active ? 'Active' : 'Inactive'}
              </span>
              {/* ✅ NEW: Quantification badge for advanced pricing */}
              {quotation.notes && quotation.notes.includes('[Quantification:') && (
                <span className="quantification-badge ms-2">
                  <i className="fas fa-calculator me-1"></i>
                  ADVANCED PRICING
                </span>
              )}
            </div>
            <p className="text-gray-600 small mb-2">
              {quotation.service?.portfolio?.portfolio_name || quotation.service?.portfolio?.name} • {quotation.service?.vertical?.vertical_name || quotation.service?.portfolio?.vertical?.name}
            </p>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-dollar-sign text-primary me-2"></i>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      ${quotation.custom_price?.toFixed(2) || '0.00'}
                    </div>
                    {quotation.service?.base_price && quotation.custom_price !== quotation.service.base_price && (
                      <div className="small text-gray-500">
                        <span className="text-decoration-line-through">
                          ${quotation.service.base_price.toFixed(2)}
                        </span>
                        {/* ✅ NEW: Price adjustment percentage */}
                        <span className={`ms-2 fw-semibold ${
                          quotation.custom_price > quotation.service.base_price ? 'text-success' : 'text-danger'
                        }`}>
                          {quotation.custom_price > quotation.service.base_price ? '+' : ''}
                          {((quotation.custom_price / quotation.service.base_price - 1) * 100).toFixed(1)}%
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
                      {quotation.custom_duration || quotation.service?.duration || quotation.service?.duration_minutes || 'N/A'} min
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
                      {/* ✅ ENHANCED: Extract pricing model from notes or use default */}
                      {quotation.notes && quotation.notes.includes('[Quantification:') 
                        ? quotation.notes.match(/\[Quantification: ([^\]]+)\]/)?.[1]?.replace('_', ' ').toUpperCase() || 'ADVANCED'
                        : quotation.service?.quant?.pricing_model || 'Quote'
                      }
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
            {/* ✅ ENHANCED: Notes display (hide quantification metadata from user) */}
            {quotation.notes && !quotation.notes.includes('[Quantification:') && (
              <div className="mt-3">
                <p className="text-gray-600 small mb-0">
                  <i className="fas fa-sticky-note text-primary me-2"></i>
                  {quotation.notes}
                </p>
              </div>
            )}
            {/* ✅ NEW: Display clean notes without metadata */}
            {quotation.notes && quotation.notes.includes('[Quantification:') && (
              <div className="mt-3">
                <p className="text-gray-600 small mb-0">
                  <i className="fas fa-sticky-note text-primary me-2"></i>
                  {quotation.notes.split('[Quantification:')[0].trim() || 'Advanced pricing applied'}
                </p>
                {/* ✅ NEW: Quantification indicator */}
                <div className="d-flex align-items-center mt-2 text-muted small">
                  <i className="fas fa-chart-line me-2"></i>
                  <span>Calculated using advanced quantification models</span>
                </div>
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
                  onClick={() => {
                    // Add toggle functionality here
                    console.log('Toggle status for:', quotation.id);
                  }}
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
                      // Add delete functionality here
                      console.log('Delete quotation:', quotation.id);
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
              <h2 className="text-gray-900">Advanced Quotation Management</h2>
              <p className="text text-gray-600 mb-0">
                Manage your service quotations with sophisticated pricing models and real-time calculations
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
              >
                <i className="fas fa-plus me-2"></i>
                Add Quotation
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                  <div className="fs-3 fw-bold text-gray-900">${stats.averagePrice.toFixed(0)}</div>
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
                  <div className="fs-3 fw-bold text-gray-900">${stats.totalValue.toFixed(0)}</div>
                  <div className="text-gray-600 small">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control border-gray-300 ps-5"
                placeholder="Search quotations by service name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400"></i>
            </div>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select border-gray-300"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
              {filteredQuotations.length} of {quotations.length} quotations
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
            ) : quotations.length === 0 ? (
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
                  <QuotationCard key={quotation.id} quotation={quotation} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Modal with two-step quantification workflow */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className={`modal-dialog ${modalStep === 'quantification' ? 'modal-xl' : 'modal-lg'}`}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalStep === 'selection' 
                    ? (selectedService ? 'Edit Quotation' : 'Add New Quotation')
                    : 'Advanced Pricing Configuration'
                  }
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedService(null);
                    setModalStep('selection');
                    handleBackToSelection();
                  }}
                ></button>
              </div>
              
              <div className="modal-body">
                {/* ✅ STEP 1: SERVICE SELECTION */}
                {modalStep === 'selection' && (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <p className="text-gray-600 mb-0">
                        Select a service and customize with advanced mathematical pricing models.
                      </p>
                      <span className="quantification-badge">
                        <i className="fas fa-calculator me-1"></i>
                        ADVANCED PRICING
                      </span>
                    </div>
                    
                    {/* Search Services */}
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search services..."
                          />
                          <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400"></i>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <select className="form-select">
                          <option value="all">All Categories</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="welding">Welding</option>
                          <option value="electrical">Electrical</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Services Grid */}
                    <div className="row g-3" style={{maxHeight: '400px', overflowY: 'auto'}}>
                      {availableServices.length > 0 ? (
                        availableServices.slice(0, 12).map(service => (
                          <div key={service.service_id || service.id} className="col-md-6 col-lg-4">
                            <div 
                              className="service-card card h-100"
                              onClick={() => handleServiceSelect(service)}
                            >
                              <div className="card-body">
                                <h6 className="card-title fw-semibold mb-2">{service.name}</h6>
                                <p className="card-text small text-gray-600 mb-3">
                                  {service.portfolio?.vertical?.name || 'General'} • {service.portfolio?.name || 'Services'}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold text-primary">
                                    ${parseFloat(service.base_price || 0).toFixed(2)}
                                  </span>
                                  <span className={`badge rounded-pill px-2 ${
                                    service.pricing_model === 'monte_carlo' ? 'bg-warning' :
                                    service.pricing_model === 'black_scholes' ? 'bg-info' : 'bg-success'
                                  }`}>
                                    {service.pricing_model || 'quote'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* ✅ ENHANCED: Better loading/empty state */
                        <div className="col-12">
                          <div className="text-center py-4">
                            {loading ? (
                              <>
                                <div className="spinner-border text-primary mb-3"></div>
                                <h6 className="text-gray-600">Loading Services...</h6>
                                <p className="text-gray-500">Fetching available services for quantification</p>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                <h6 className="text-gray-600">No Services Available</h6>
                                <p className="text-gray-500">
                                  Unable to load services. Please check your connection or try again later.
                                </p>
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={loadAvailableServices}
                                >
                                  <i className="fas fa-refresh me-2"></i>
                                  Retry
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ✅ STEP 2: QUANTIFICATION CONFIGURATION */}
                {modalStep === 'quantification' && selectedServiceForQuantification && (
                  <div className="row">
                    <div className="col-md-8">
                      {/* Service Header */}
                      <div className="border rounded p-3 mb-4 bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="fw-bold mb-1">{selectedServiceForQuantification.name}</h6>
                            <p className="text-gray-600 small mb-0">
                              {selectedServiceForQuantification.portfolio?.vertical?.name || 'General'} • {selectedServiceForQuantification.portfolio?.name || 'Services'}
                            </p>
                          </div>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleBackToSelection}
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Change Service
                          </button>
                        </div>
                      </div>

                      {/* Trade-specific Inputs */}
                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3">
                          <i className="fas fa-tools me-2 text-primary"></i>
                          Service Parameters
                        </h6>
                        {renderTradeInputs()}
                      </div>

                      {/* Configuration Options */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Urgency Level</label>
                          <select
                            className="form-select"
                            value={config.urgencyLevel}
                            onChange={(e) => updateConfig({ urgencyLevel: e.target.value })}
                          >
                            <option value="scheduled">Scheduled (-10%)</option>
                            <option value="standard">Standard</option>
                            <option value="urgent">Urgent (+50%)</option>
                            <option value="emergency">Emergency (+100%)</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Market Demand</label>
                          <select
                            className="form-select"
                            value={marketConditions.marketDemand}
                            onChange={(e) => updateMarketConditions({ marketDemand: e.target.value })}
                          >
                            <option value="low">Low Demand</option>
                            <option value="normal">Normal</option>
                            <option value="high">High Demand</option>
                            <option value="peak">Peak Demand</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Pricing Model</label>
                          <select
                            className="form-select"
                            value={config.pricingModel}
                            onChange={(e) => updateConfig({ pricingModel: e.target.value })}
                          >
                            <option value="auto">Auto-Select</option>
                            <option value="quote">Quote Model</option>
                            <option value="black_scholes">Black-Scholes</option>
                            <option value="monte_carlo">Monte Carlo</option>
                          </select>
                        </div>
                      </div>

                      {/* Calculate Button */}
                      <div className="text-center mb-4">
                        <button
                          className="btn gradient-btn text-white px-4 py-2"
                          onClick={performCalculation}
                          disabled={isCalculating || !hasValidService}
                        >
                          {isCalculating ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2"></div>
                              Calculating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-calculator me-2"></i>
                              Calculate Advanced Pricing
                            </>
                          )}
                        </button>
                      </div>

                      {/* Notes Section */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Quotation Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Add special terms, conditions, or notes..."
                          value={quantificationNotes}
                          onChange={(e) => setQuantificationNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* ✅ RESULTS PANEL */}
                    <div className="col-md-4">
                      <div className="sticky-top" style={{top: '1rem'}}>
                        {/* Price Display */}
                        {quantificationResult ? (
                          <div className="pricing-panel p-4 mb-4">
                            <h6 className="fw-semibold mb-3 text-primary">
                              <i className="fas fa-chart-line me-2"></i>
                              Calculated Pricing
                            </h6>
                            <div className="text-center mb-3">
                              <div className="h3 fw-bold text-primary mb-1">
                                {formatPrice && typeof formatPrice === 'function' 
                                  ? formatPrice(getRecommendedPrice()) 
                                  : `${(getRecommendedPrice() || 0).toFixed(2)}`
                                }
                              </div>
                              <span className={`badge rounded-pill px-3 ${
                                quantificationResult.model === 'monte_carlo' ? 'bg-warning' :
                                quantificationResult.model === 'black_scholes' ? 'bg-info' : 'bg-success'
                              }`}>
                                {quantificationResult.model?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="row g-2 text-center">
                              <div className="col-6">
                                <div className="small text-gray-600">Base Price</div>
                                <div className="fw-semibold">
                                  ${(selectedServiceForQuantification.base_price || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="small text-gray-600">Adjustment</div>
                                <div className={`fw-semibold ${
                                  (getRecommendedPrice() || 0) > (selectedServiceForQuantification.base_price || 0) ? 'text-success' : 'text-danger'
                                }`}>
                                  {(getRecommendedPrice() || 0) > (selectedServiceForQuantification.base_price || 0) ? '+' : ''}
                                  ${((getRecommendedPrice() || 0) - (selectedServiceForQuantification.base_price || 0)).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {quantificationResult.tradeCalculations && (
                              <>
                                <hr className="my-3" />
                                <div className="small">
                                  <div className="d-flex justify-content-between">
                                    <span>Material Cost:</span>
                                    <span>${(quantificationResult.tradeCalculations.materialCost || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span>Duration:</span>
                                    <span>{quantificationResult.tradeCalculations.totalDuration || 0} min</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="border rounded p-4 mb-4 bg-light text-center">
                            <i className="fas fa-calculator fa-2x text-gray-400 mb-3"></i>
                            <p className="text-gray-600 mb-0">
                              Configure parameters and click calculate to see advanced pricing
                            </p>
                          </div>
                        )}

                        {/* Error Display */}
                        {quantError && (
                          <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {quantError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {modalStep === 'selection' ? (
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
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleBackToSelection}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Selection
                    </button>
                    <button 
                      type="button" 
                      className="btn gradient-btn text-white"
                      onClick={handleSaveQuantification}
                      disabled={!quantificationResult || isCalculating}
                    >
                      <i className="fas fa-save me-2"></i>
                      Save Advanced Quotation
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}