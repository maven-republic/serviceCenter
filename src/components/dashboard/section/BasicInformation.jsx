"use client";

import { useState, useEffect } from "react";
import { createClient } from '../../../../utils/supabase/client';
import Link from "next/link";
import { toast } from "sonner"; // Changed from react-hot-toast to sonner

export default function ProfessionalServicesManagement() {
  // State for professional ID
  const [professionalId, setProfessionalId] = useState(null);

  // State for categories and services
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for professional's current services
  const [professionalServices, setProfessionalServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // State for new service addition
  const [newService, setNewService] = useState({
    serviceId: '',
    customPrice: '',
    customDuration: '',
    additionalNotes: ''
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingService, setAddingService] = useState(false);
  const [removingService, setRemovingService] = useState(null);

  // UI states
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Supabase client
  const supabase = createClient();

  // Fetch professional ID first
  useEffect(() => {
    const fetchProfessionalId = async () => {
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          return window.location.href = '/login';
        }

        // Fetch the professional ID using the account ID
        const { data: professionalData, error: professionalError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', user.id)
          .single();

        if (professionalError) throw professionalError;

        if (!professionalData) {
          throw new Error('No professional profile found');
        }

        setProfessionalId(professionalData.professional_id);
      } catch (error) {
        console.error('Error fetching professional ID:', error);
        toast.error('Unable to load your profile. Please log in again.');
        window.location.href = '/login';
      }
    };

    fetchProfessionalId();
  }, []);

  // Fetch categories, services, and current professional services
  useEffect(() => {
    // Only run if professional ID is available
    if (!professionalId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active service categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_category')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (categoryError) throw categoryError;

        // Fetch active services with subcategory details
        const { data: serviceData, error: serviceError } = await supabase
          .from('service')
          .select(`
            service_id, 
            name, 
            description, 
            service_subcategory(
              subcategory_id, 
              name, 
              category_id
            )
          `)
          .eq('is_active', true);

        if (serviceError) throw serviceError;

        // Fetch current professional's services
        const { data: professionalServiceData, error: professionalServiceError } = await supabase
          .from('professional_service')
          .select(`
            professional_service_id,
            service_id,
            custom_price,
            custom_duration_minutes,
            additional_notes,
            service:service_id(
              name,
              description,
              service_subcategory(
                category_id,
                name
              )
            )
          `)
          .eq('professional_id', professionalId)
          .eq('is_active', true);

        if (professionalServiceError) throw professionalServiceError;

        setCategories(categoryData || []);
        setServices(serviceData || []);
        setProfessionalServices(professionalServiceData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        toast.error('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [professionalId]);

  // Filter services when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = services.filter(
        service => service.service_subcategory.category_id === selectedCategory
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [selectedCategory, services]);

  // Handle service selection
  const handleServiceSelect = (serviceId) => {
    setNewService({
      ...newService,
      serviceId
    });
  };

  // Handle custom details change
  const handleCustomDetailsChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };

  // Add new service to professional's services
  const addNewService = async () => {
    try {
      // Validate input
      if (!newService.serviceId) {
        toast.error('Please select a service');
        return;
      }

      setAddingService(true);

      // Check if service exists but is inactive
      const { data: existingService, error: checkError } = await supabase
        .from('professional_service')
        .select('professional_service_id')
        .eq('professional_id', professionalId)
        .eq('service_id', newService.serviceId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, other errors should be handled
        throw checkError;
      }

      let serviceData;

      if (existingService) {
        // Reactivate the existing service
        const { error: updateError } = await supabase
          .from('professional_service')
          .update({
            is_active: true,
            custom_price: newService.customPrice || null,
            custom_duration_minutes: newService.customDuration || null,
            additional_notes: newService.additionalNotes || null
          })
          .eq('professional_service_id', existingService.professional_service_id);

        if (updateError) throw updateError;

        // Fetch the complete service data
        const { data: reactivatedService, error: fetchError } = await supabase
          .from('professional_service')
          .select(`
            professional_service_id,
            service_id,
            custom_price,
            custom_duration_minutes,
            additional_notes,
            service:service_id(
              name,
              description,
              service_subcategory(
                category_id,
                name
              )
            )
          `)
          .eq('professional_service_id', existingService.professional_service_id)
          .single();

        if (fetchError) throw fetchError;
        
        serviceData = reactivatedService;
        
        // Show reactivation toast
        toast.success('Service reactivated!', {
          description: `You've reactivated ${serviceData.service.name} with updated details.`
        });
      } else {
        // Insert new professional service
        const { data: newServiceData, error: insertError } = await supabase
          .from('professional_service')
          .insert({
            professional_id: professionalId,
            service_id: newService.serviceId,
            custom_price: newService.customPrice || null,
            custom_duration_minutes: newService.customDuration || null,
            additional_notes: newService.additionalNotes || null,
            is_active: true
          })
          .select(`
            professional_service_id,
            service_id,
            custom_price,
            custom_duration_minutes,
            additional_notes,
            service:service_id(
              name,
              description,
              service_subcategory(
                category_id,
                name
              )
            )
          `);

        if (insertError) throw insertError;
        
        serviceData = newServiceData[0];
        
        // Show success toast for new service
        toast.success('Service added successfully!', {
          description: `You've added ${serviceData.service.name} to your services.`,
          action: {
            label: 'View',
            onClick: () => {
              // Scroll to the added service
              document.getElementById(`service-${serviceData.professional_service_id}`)?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }
          }
        });
      }

      // Add to professional services state
      setProfessionalServices(prev => [...prev, serviceData]);

      // Reset form
      setNewService({
        serviceId: '',
        customPrice: '',
        customDuration: '',
        additionalNotes: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding service:', err);
      
      // Special handling for duplicate key error
      if (err.message?.includes('duplicate key value') || err.code === '23505') {
        toast.error('This service is already in your list', {
          description: 'You may need to refresh the page to see all your active services.'
        });
      } else {
        toast.error('Failed to add service', {
          description: err.message || 'Please try again or contact support.'
        });
      }
    } finally {
      setAddingService(false);
    }
  };

  // Remove a service from professional's services
  const removeService = async (professionalServiceId, serviceName) => {
    try {
      if (!confirm('Are you sure you want to remove this service?')) {
        return;
      }
      
      setRemovingService(professionalServiceId);
      
      const { error } = await supabase
        .from('professional_service')
        .update({ is_active: false })
        .eq('professional_service_id', professionalServiceId);

      if (error) throw error;

      // Remove from local state
      setProfessionalServices(prev => 
        prev.filter(ps => ps.professional_service_id !== professionalServiceId)
      );
      
      // Use Sonner toast
      toast.success('Service removed', {
        description: `${serviceName} has been removed from your services.`,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Reactivate the service
              const { data, error } = await supabase
                .from('professional_service')
                .update({ is_active: true })
                .eq('professional_service_id', professionalServiceId)
                .select();
              
              if (error) throw error;
              
              // Add back to state
              const { data: serviceData, error: serviceError } = await supabase
                .from('professional_service')
                .select(`
                  professional_service_id,
                  service_id,
                  custom_price,
                  custom_duration_minutes,
                  additional_notes,
                  service:service_id(name, description, service_subcategory(category_id, name))
                `)
                .eq('professional_service_id', professionalServiceId)
                .single();
              
              if (serviceError) throw serviceError;
              
              setProfessionalServices(prev => [...prev, serviceData]);
              toast.success('Service restored');
            } catch (err) {
              console.error('Error restoring service:', err);
              toast.error('Failed to restore service');
            }
          }
        }
      });
    } catch (err) {
      console.error('Error removing service:', err);
      toast.error('Failed to remove service', {
        description: err.message || 'Please try again.'
      });
    } finally {
      setRemovingService(null);
    }
  };

  // Bulk remove selected services
  const bulkRemoveServices = async () => {
    if (selectedServices.length === 0) {
      toast.error('No services selected');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedServices.length} services?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Update each service to inactive
      const { error } = await supabase
        .from('professional_service')
        .update({ is_active: false })
        .in('professional_service_id', selectedServices);

      if (error) throw error;

      // Update local state
      setProfessionalServices(prev => 
        prev.filter(ps => !selectedServices.includes(ps.professional_service_id))
      );
      
      // Reset selection
      setSelectedServices([]);
      
      // Use Sonner toast
      toast.success(`Services removed`, {
        description: `${selectedServices.length} services have been removed.`
      });
    } catch (err) {
      console.error('Error removing services:', err);
      toast.error('Failed to remove services', {
        description: err.message || 'Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle service selection for bulk actions
  const toggleServiceSelection = (id) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Filter services by search term
  const filterServicesBySearch = () => {
    if (!searchTerm) return professionalServices;
    
    return professionalServices.filter(ps => 
      ps.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ps.additional_notes && ps.additional_notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Skeleton loader for services
  const renderSkeletonLoader = () => (
    <div className="row">
      {[1, 2, 3].map(i => (
        <div key={i} className="col-md-4 mb15">
          <div className="border p15 bdrs4">
            <div className="skeleton-loader" style={{ height: '24px', width: '70%', marginBottom: '10px' }}></div>
            <div className="skeleton-loader" style={{ height: '18px', width: '50%', marginBottom: '10px' }}></div>
            <div className="skeleton-loader" style={{ height: '18px', width: '40%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center p30 bg-light bdrs4">
      <div className="mb15">
        <i className="fa fa-clipboard-list fa-3x text-muted"></i>
      </div>
      <h4>No Services Added Yet</h4>
      <p className="text-muted mb20">Start adding services that you offer to your clients.</p>
      <button 
        className="btn btn-primary" 
        onClick={() => setShowAddForm(true)}
      >
        <i className="fa fa-plus mr10"></i> Add Your First Service
      </button>
    </div>
  );

  if (loading && !professionalId) return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30">
      <div className="alert alert-danger">
        <h5><i className="fa fa-exclamation-circle mr10"></i> Error</h5>
        <p>{error}</p>
        <button 
          className="btn btn-outline-danger" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const filteredProfessionalServices = filterServicesBySearch();

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25 d-flex justify-content-between align-items-center">
        <h5 className="list-title mb0">Manage Your Services</h5>
        <div className="d-flex">
          <button 
            className={`btn btn-sm mr10 ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <i className="fa fa-th-large"></i>
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <i className="fa fa-list"></i>
          </button>
        </div>
      </div>

      {/* Services Header with Search */}
      <div className="mb20 d-flex justify-content-between align-items-center flex-wrap">
        <h6 className="mb0">
          Your Services
          {professionalServices.length > 0 && (
            <span className="badge bg-primary rounded-pill ml10">{professionalServices.length}</span>
          )}
        </h6>
        
        <div className="d-flex mt-md-0 mt10">
          {professionalServices.length > 0 && (
            <>
              <div className="position-relative mr10">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa fa-search position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
              </div>
              
              {selectedServices.length > 0 && (
                <button 
                  className="btn btn-sm btn-danger mr10"
                  onClick={bulkRemoveServices}
                >
                  Remove Selected ({selectedServices.length})
                </button>
              )}
            </>
          )}
          
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className={`fa ${showAddForm ? 'fa-times' : 'fa-plus'} mr5`}></i>
            {showAddForm ? 'Cancel' : 'Add Service'}
          </button>
        </div>
      </div>

      {/* Current Services */}
      <div className="mb30">
        {loading && professionalId ? (
          renderSkeletonLoader()
        ) : professionalServices.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {filteredProfessionalServices.length === 0 && searchTerm ? (
              <div className="alert alert-info">
                No services match your search for "{searchTerm}"
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'row' : ''}>
                {filteredProfessionalServices.map((ps) => (
                  <div 
                    key={ps.professional_service_id} 
                    id={`service-${ps.professional_service_id}`}
                    className={viewMode === 'grid' ? "col-lg-4 col-md-6 mb15" : "mb15"}
                  >
                    <div className={`border p15 bdrs4 ${viewMode === 'list' ? 'd-flex justify-content-between align-items-center' : ''} ${selectedServices.includes(ps.professional_service_id) ? 'bg-light border-primary' : ''}`}>
                      <div className="position-relative">
                        {viewMode === 'grid' && (
                          <div className="form-check position-absolute" style={{ top: '0', right: '0' }}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedServices.includes(ps.professional_service_id)}
                              onChange={() => toggleServiceSelection(ps.professional_service_id)}
                            />
                          </div>
                        )}
                        
                        <h5 className="mb5">{ps.service.name}</h5>
                        
                        <div className={viewMode === 'list' ? 'd-flex gap-3' : ''}>
                          {ps.custom_price && (
                            <p className="text-muted mb0 small">
                              <span className="fw-bold">Price:</span> ${ps.custom_price}
                            </p>
                          )}
                          {ps.custom_duration_minutes && (
                            <p className="text-muted mb0 small">
                              <span className="fw-bold">Duration:</span> {ps.custom_duration_minutes} mins
                            </p>
                          )}
                        </div>
                        
                        {ps.additional_notes && viewMode === 'grid' && (
                          <p className="text-muted small mb10 mt5">
                            <span className="fw-bold">Notes:</span> {ps.additional_notes}
                          </p>
                        )}
                      </div>
                      
                      <div className={viewMode === 'list' ? 'd-flex align-items-center' : 'mt10'}>
                        {viewMode === 'list' && (
                          <div className="form-check mr15">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedServices.includes(ps.professional_service_id)}
                              onChange={() => toggleServiceSelection(ps.professional_service_id)}
                            />
                          </div>
                        )}
                        
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeService(ps.professional_service_id, ps.service.name)}
                          disabled={removingService === ps.professional_service_id}
                        >
                          {removingService === ps.professional_service_id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <><i className="fa fa-trash mr5"></i> Remove</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add New Service */}
      {showAddForm && (
        <div className="mb30 border p20 bdrs4 bg-light">
          <h6 className="mb20 d-flex justify-content-between">
            <span>Add New Service</span>
            <button className="btn btn-sm btn-link text-danger" onClick={() => setShowAddForm(false)}>
              <i className="fa fa-times"></i>
            </button>
          </h6>
          
          <div className="row">
            <div className="col-md-4 mb15">
              <label className="form-label">Select Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setNewService({...newService, serviceId: ''});
                }}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option 
                    key={category.category_id} 
                    value={category.category_id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="col-md-4 mb15">
                <label className="form-label">Select Service</label>
                <select
                  className="form-select"
                  value={newService.serviceId}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                >
                  <option value="">Select Service</option>
                  {filteredServices.map((service) => (
                    <option 
                      key={service.service_id} 
                      value={service.service_id}
                    >
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {newService.serviceId && (
              <>
                <div className="col-md-4 mb15">
                  <label className="form-label">Custom Price ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      name="customPrice"
                      value={newService.customPrice}
                      onChange={handleCustomDetailsChange}
                      placeholder="Optional price"
                    />
                  </div>
                </div>
                <div className="col-md-4 mb15">
                  <label className="form-label">Custom Duration (mins)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="customDuration"
                      value={newService.customDuration}
                      onChange={handleCustomDetailsChange}
                      placeholder="Optional duration"
                    />
                    <span className="input-group-text">mins</span>
                  </div>
                </div>
                <div className="col-md-8 mb15">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    name="additionalNotes"
                    value={newService.additionalNotes}
                    onChange={handleCustomDetailsChange}
                    placeholder="Any additional information about this service"
                    rows="3"
                  />
                </div>
                <div className="col-md-12">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={addNewService}
                      disabled={addingService}
                    >
                      {addingService ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr10" role="status" aria-hidden="true"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-plus mr10"></i> Add Service
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAddForm(false)}
                      disabled={addingService}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add this CSS for skeleton loaders and animations */}
      <style jsx>{`
        .skeleton-loader {
          background: #e2e5e7;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }

        .skeleton-loader::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.6) 50%, 
            rgba(255,255,255,0) 100%);
          animation: shimmer 1.5s infinite;
          transform: translateX(-100%);
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .mr5 { margin-right: 5px; }
        .mr10 { margin-right: 10px; }
        .mr15 { margin-right: 15px; }
        .mb0 { margin-bottom: 0; }
        .mb5 { margin-bottom: 5px; }
        .mb10 { margin-bottom: 10px; }
        .mb15 { margin-bottom: 15px; }
        .mb20 { margin-bottom: 20px; }
        .ml10 { margin-left: 10px; }
        .mt5 { margin-top: 5px; }
        .mt10 { margin-top: 10px; }
        .p15 { padding: 15px; }
        .p20 { padding: 20px; }
        .p30 { padding: 30px; }
      `}</style>
    </div>
  );
}