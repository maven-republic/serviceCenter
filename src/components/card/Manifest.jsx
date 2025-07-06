"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function Manifest({ data }) {
  const [isFavActive, setFavActive] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Safely extract data with fallbacks
  const serviceInformation = {
    id: data?.id || data?.service_id || 'unknown',
    title: data?.title || data?.name || 'Service',
    description: data?.description || '',
    price: data?.price || data?.base_price || 0,
    category: data?.category || 'General',
    img: data?.img || null
  };

  // Function to generate a random pastel color for fallback
  const getRandomPastelColor = (seed) => {
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const hue = hashCode(seed || 'default') % 360;
    return `hsl(${hue}, 65%, 85%)`;
  };

  const backgroundColor = useMemo(() =>
    getRandomPastelColor(serviceInformation.id || serviceInformation.title),
    [serviceInformation.id, serviceInformation.title]
  );

  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const truncatedTitle = serviceInformation.title.length > 45 ? 
                        serviceInformation.title.slice(0, 45) + "..." : 
                        serviceInformation.title;

  return (
    <div className="pinterest-card">
      {/* Card Container */}
      <div className="card h-100 border-0 ">
        
        {/* Image Section - Fixed Height */}
        <div 
          className="card-img-container position-relative overflow-hidden"
          style={{
            height: '220px',
            backgroundColor: hasValidImage ? 'transparent' : backgroundColor,
            borderRadius: '15px 15px 15px 15px'
          }}
        >
          {/* Service Image */}
          {hasValidImage ? (
            <Image
              fill
              className="card-img-top"
              style={{ 
                objectFit: "cover",
                // transition: 'transform 0.3s ease'
              }}
              src={serviceInformation.img}
              alt={serviceInformation.title}
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback with colored background and icon
            <div 
              className="d-flex align-items-center justify-content-center h-100"
              style={{ backgroundColor }}
            >
              <div className="text-center">
                <div 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {/* {serviceInformation.category} */}
                </div>
              </div>
            </div>
          )}

          {/* Favorite Button - Pinterest Style */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setFavActive(!isFavActive);
            }}
            className={`btn position-absolute ${isFavActive ? 'btn-danger' : 'btn-light'}`}
            style={{
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
             
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            <i 
              className={isFavActive ? 'fas fa-heart' : 'far fa-heart'}
              style={{ 
                fontSize: '14px',
                color: isFavActive ? 'white' : '#666'
              }}
            ></i>
          </button>

          {/* Hover Overlay */}
          <div 
            className="card-hover-overlay position-absolute w-100 h-100"
            style={{
              top: 0,
              left: 0,
              background: 'rgba(0,0,0,0.1)',
              opacity: 0,
              borderRadius: '12px 12px 0 0'
            }}
          ></div>
        </div>

        {/* Content Section - Below Image */}
        <div className="card-body p-3">
          
          
          {/* Category and Price Row */}
          <div className="d-flex justify-content-between align-items-center">
            
            {/* Price */}
            {serviceInformation.price > 0 && (
              <div style={{ 
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                ${serviceInformation.price}
              </div>
            )}
          </div>

        </div>
        {/* Title and Category Wrapper */}
<div className="title-category-section">
  <h6 className="card-title mb-2" style={{ 
    fontWeight: '600', 
    fontSize: '0.95rem',
    lineHeight: '1.3',
    color: '#2d3748'
  }}>
    <Link 
      href={`services/${data.id}`}
      className="text-decoration-none text-dark"
      style={{ 
        transition: 'color 0.2s ease',
        fontSize: ".7rem"
      }}
    >
      {truncatedTitle}
    </Link>
  </h6>

  {/* <span 
    className="badge"
    style={{
      backgroundColor: '#f7fafc',
      color: '#4a5568',
      fontSize: '0.7rem',
      fontWeight: '500',
      padding: '4px 8px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}
  >
    {serviceInformation.category}
  </span> */}
</div>
      </div>



      {/* CSS Styles */}
      <style jsx>{`
        .pinterest-card {
          transition: transform 0.2s ease;
        }
        
        .pinterest-card:hover .card-hover-overlay {
          opacity: 1;
        }
        
        .pinterest-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .pinterest-card .card {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .pinterest-card .card-title a:hover {
          color: #4299e1 !important;
        }
      `}</style>
    </div>
  );
}