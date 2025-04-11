"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { useUserStore } from "@/store/userStore";

// Supabase client setup (typically in a separate utility file)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProfessionalServices() {
  const { user } = useUserStore();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessionalServices = async () => {
      // Ensure we have a professional ID
      if (!user?.account?.account_id) {
        setIsLoading(false);
        return;
      }

      try {
        // First, fetch the professional ID using the account ID
        const { data: professionalData, error: professionalError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', user.account.account_id)
          .single();

        if (professionalError) throw professionalError;
        if (!professionalData) {
          setServices([]);
          setIsLoading(false);
          return;
        }

        // Then fetch the services for this professional
        const { data: servicesData, error: servicesError } = await supabase
          .from('professional_service')
          .select(`
            service_id,
            custom_price,
            custom_duration_minutes,
            service:service_id (
              name,
              description,
              subcategory_id,
              subcategory:subcategory_id (
                name,
                category_id,
                category:category_id (
                  name
                )
              )
            )
          `)
          .eq('professional_id', professionalData.professional_id)
          .eq('is_active', true);

        if (servicesError) throw servicesError;

        // Transform the data to a more usable format
        const formattedServices = servicesData.map(service => ({
          name: service.service.name,
          description: service.service.description,
          category: service.service.subcategory.category.name,
          subcategory: service.service.subcategory.name,
          customPrice: service.custom_price,
          customDuration: service.custom_duration_minutes
        }));

        setServices(formattedServices);
      } catch (err) {
        console.error('Error fetching professional services:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionalServices();
  }, [user?.account?.account_id]);

  if (isLoading) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Professional Services</h5>
        </div>
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Professional Services</h5>
        </div>
        <p>Error loading services: {error}</p>
      </div>
    );
  }

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Professional Services</h5>
      </div>
      <div className="col-lg-12">
        {services.length === 0 ? (
          <p>No services have been added yet.</p>
        ) : (
          <div className="row">
            {services.map((service, index) => (
              <div key={index} className="col-md-6 mb20">
                <div className="border p15 bdrs4">
                  <h5 className="mb10">{service.name}</h5>
                  <p className="text-muted mb10">{service.description}</p>
                  {/* <div className="d-flex justify-content-between">
                    <span className="fw500">Category:</span>
                    <span>{service.category}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fw500">Subcategory:</span>
                    <span>{service.subcategory}</span>
                  </div> */}
                  {service.customPrice && (
                    <div className="d-flex justify-content-between">
                      <span className="fw500">Custom Price:</span>
                      <span>$${service.customPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {service.customDuration && (
                    <div className="d-flex justify-content-between">
                      <span className="fw500">Custom Duration:</span>
                      <span>{service.customDuration} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-start mt20">
          <Link className="ud-btn btn-thm" href="/dashboard/edit-services">
            Edit Services
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </div>
  );
}