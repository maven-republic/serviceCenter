'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, CheckCircle, MapPin, Briefcase } from 'lucide-react';

export default function ProviderCard({ provider, view = 'grid', isAuthenticated }) {
  const {
    professional_id,
    bio,
    experience,
    hourly_rate,
    daily_rate,
    verification_status,
    identity_verified,
    skills_verified,
    account,
    professional_expertise = [],
    displayName
  } = provider;
  
  // Format experience level
  const experienceLabel = () => {
    switch (experience) {
      case '2': return 'Entry level';
      case '3': return 'Intermediate';
      case '5': return 'Experienced';
      case '10': return 'Expert';
      default: return 'Not specified';
    }
  };
  
  // Get primary expertise
  const primaryExpertise = professional_expertise.find(exp => exp.is_primary) || professional_expertise[0];
  
  // Format verification status
  const isVerified = verification_status === 'verified';
  
  // Truncate bio to fit card
  const truncateBio = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  // Grid view card
  if (view === 'grid') {
    return (
      <Link 
        href={`/customer/providers/${professional_id}`}
        className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
      >
        <div className="p-4 flex flex-col items-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden mb-3 bg-gray-100">
            {account?.profile_picture_url ? (
              <Image
                src={account.profile_picture_url}
                alt={displayName || "Provider"}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500 text-xl font-bold">
                {displayName?.charAt(0) || "P"}
              </div>
            )}
          </div>
          
          <h3 className="font-medium text-lg text-center">{displayName}</h3>
          
          {isVerified && (
            <div className="flex items-center text-green-600 text-sm mt-1">
              <CheckCircle size={14} className="mr-1" />
              <span>Verified Professional</span>
            </div>
          )}
          
          <div className="w-full mt-3">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Briefcase size={14} className="mr-1" />
              <span>{experienceLabel()}</span>
            </div>
            
            {primaryExpertise?.service_category?.name && (
              <div className="text-sm text-gray-600 mb-2">
                Specializes in {primaryExpertise.service_category.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {truncateBio(bio) || "No bio provided."}
          </p>
          
          <div className="flex justify-between items-center">
            {hourly_rate ? (
              <span className="font-bold text-gray-900">${hourly_rate.toFixed(2)}/hr</span>
            ) : (
              <span className="text-gray-500 text-sm">Rate not specified</span>
            )}
            
            {isAuthenticated && (
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>4.9 (18)</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  // List view card
  return (
    <Link 
      href={`/customer/providers/${professional_id}`}
      className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
    >
      <div className="p-4 flex items-center justify-center w-32">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
          {account?.profile_picture_url ? (
            <Image
              src={account.profile_picture_url}
              alt={displayName || "Provider"}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500 text-xl font-bold">
              {displayName?.charAt(0) || "P"}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{displayName}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase size={14} className="mr-1" />
              <span>{experienceLabel()}</span>
              
              {isVerified && (
                <>
                  <span className="mx-2">•</span>
                  <CheckCircle size={14} className="mr-1 text-green-600" />
                  <span className="text-green-600">Verified</span>
                </>
              )}
            </div>
          </div>
          
          {hourly_rate && (
            <span className="font-bold text-gray-900">${hourly_rate.toFixed(2)}/hr</span>
          )}
        </div>
        
        {primaryExpertise?.service_category?.name && (
          <div className="text-sm text-gray-600 mt-1 mb-2">
            Specializes in {primaryExpertise.service_category.name}
          </div>
        )}
        
        <p className="text-gray-600 text-sm my-2 line-clamp-2">
          {bio || "No bio provided."}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {professional_expertise.slice(0, 3).map((expertise, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
              >
                {expertise.service_category?.name}
              </span>
            ))}
            {professional_expertise.length > 3 && (
              <span className="inline-block text-gray-500 text-xs">
                +{professional_expertise.length - 3} more
              </span>
            )}
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>4.9 (18)</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

