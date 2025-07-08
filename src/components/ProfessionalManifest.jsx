"use client";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Star, MapPin, Clock, Shield, Calendar, MessageCircle, Phone, X, Linkedin, Mail } from "lucide-react";
import AppointmentModal from "@/components/modal/AppointmentModal";
import { useUserStore } from "@/store/userStore";
import useSearchStore from "@/store/searchStore";

export default function ProfessionalManifest({ data, serviceInformation }) {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const { user } = useUserStore();
const confirmedAddress = useSearchStore((state) => state.confirmedAddress);

  const {
    professional_id,
    first_name, 
    last_name,
    profile_picture_url,
    bio,
    verification_status,
    service_name,
    specialties = [],
    hourly_rate,
    daily_rate,
    experience,
    service_radius,
    rating = 4.8,
    review_count = 23,
    distance_km,
    response_time = "2 hours",
    completion_rate = 95,
    account, // Added to access account data
  } = data;

  const full_name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

  // Get customer's confirmed address with fallback to URL coordinates
const getCustomerLocation = useCallback(() => {
  console.log('🔍 DEBUG: confirmedAddress from store:', confirmedAddress);

  if (confirmedAddress) {
    return confirmedAddress;
  }

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');

    if (lat && lng) {
      console.log('⚠️ Fallback to URL coordinates:', { lat, lng });
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        street_address: '',
        city: '',
        parish: '',
        community: '',
        landmark: '',
        is_rural: false,
        formatted_address: `Location: ${lat}, ${lng}`,
        place_id: null,
      };
    }
  }

  return null;
}, [confirmedAddress]);


  // Format pricing display
  const getPricingDisplay = () => {
    if (hourly_rate && daily_rate) {
      return `$${hourly_rate}/hr • $${daily_rate}/day`;
    } else if (hourly_rate) {
      return `$${hourly_rate}/hour`;
    } else if (daily_rate) {
      return `$${daily_rate}/day`;
    } else {
      return "Custom pricing";
    }
  };

  // Format experience as title
  const getJobTitle = () => {
    const expMap = {
      '1': 'Junior',
      '2': 'Mid-level', 
      '3': 'Experienced',
      '5': 'Senior',
      '10': 'Expert'
    };
    const expLevel = expMap[experience] || 'Professional';
    return service_name ? `${expLevel} ${service_name}` : `${expLevel} Service Provider`;
  };

  // Get bio or default description
  const getBioText = () => {
    if (bio) return bio;
    return `I'm a ${getJobTitle().toLowerCase()} and I've been providing quality services with ${rating} star ratings from ${review_count} satisfied customers.`;
  };

  // Handle booking button click
  const handleBookingClick = useCallback(() => {
    // Check if user is logged in
    if (!user) {
      alert('Please log in to book services');
      return;
    }

    // Check if user is a customer
    if (user.primaryRole !== 'customer') {
      alert('Only customers can book services');
      return;
    }

    // Check if customer location is available
    const customerLocation = getCustomerLocation();
    if (!customerLocation) {
      alert('Unable to determine service location. Please refresh and try again.');
      return;
    }

    // Open booking modal
    setIsAppointmentModalOpen(true);
  }, [user, getCustomerLocation]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsAppointmentModalOpen(false);
  }, []);

  // Prepare professional data for booking modal
  const professionalForBooking = {
    professional_id,
    account: {
      first_name,
      last_name,
      ...account
    },
    hourly_rate,
    daily_rate,
    bio,
    verification_status,
    experience
  };

  return (
    <>
      <div className="professional-card">
        {/* Profile Image */}
        <div className="profile-image-container">
          {profile_picture_url ? (
            <Image
              src={profile_picture_url}
              alt={full_name}
              width={100}
              height={100}
              className="profile-image"
            />
          ) : (
            <div className="profile-image profile-image-placeholder">
              {full_name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Social Icons */}
        <div className="social-icons">
          <a href={`/call/${professional_id}`} className="social-icon" title="Call">
            <Phone size={16} />
          </a>
          <a href={`/messages/${professional_id}`} className="social-icon" title="Message">
            <Mail size={16} />
          </a>
          <a href={`/professional/${professional_id}`} className="social-icon" title="View Profile">
            <Linkedin size={16} />
          </a>
        </div>

        {/* Name and Title */}
        <div className="professional-info">
          <h3 className="professional-name">
            {full_name}
            {verification_status === "verified" && (
              <Shield size={16} className="verification-badge" title="Verified Professional" />
            )}
          </h3>
        </div>

        {/* Book Button */}
        <button 
          className="book-button"
          onClick={handleBookingClick}
        >
          <Calendar size={16} />
          Set an appointment
        </button>

        <style jsx>{`
          .professional-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 32px 24px;
            text-align: center;
            transition: all 0.2s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .professional-card:hover {
            border-color: #3b82f6;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.1);
            transform: translateY(-2px);
          }

          .profile-image-container {
            margin: 0 auto 16px;
            position: relative;
          }

          .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #f3f4f6;
          }

          .profile-image-placeholder {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 24px;
          }

          .social-icons {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .social-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .social-icon:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-1px);
          }

          .professional-info {
            margin-bottom: 16px;
          }

          .professional-name {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 4px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .verification-badge {
            color: #10b981;
          }

          .professional-title {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
            font-weight: 500;
          }

          .professional-bio {
            margin-bottom: 24px;
            flex-grow: 1;
          }

          .professional-bio p {
            font-size: 14px;
            line-height: 1.5;
            color: #6b7280;
            margin: 0;
          }

          .book-button {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
          }

          .book-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .book-button:active {
            transform: translateY(0);
          }

          .book-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          @media (max-width: 768px) {
            .professional-card {
              padding: 24px 16px;
            }
            
            .professional-stats {
              flex-direction: column;
              gap: 12px;
            }
            
            .stat-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              text-align: left;
            }
            
            .stat-value {
              justify-content: flex-end;
            }
          }
        `}</style>
      </div>

      {/* Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseModal}
        professional={professionalForBooking}
        serviceInformation={serviceInformation}
        location={getCustomerLocation()} // ← Now passes full address data
      />
    </>
  );
}