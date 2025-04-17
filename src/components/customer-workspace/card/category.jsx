'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function ServiceCard({ service, view = 'grid', isAuthenticated }) {
  const {
    service_id,
    name,
    description,
    base_price,
    price_type,
    service_subcategory,
    service_image = []
  } = service;
  
  // Get primary image or first available image
  const primaryImage = service_image && service_image.length > 0 
    ? (service_image.find(img => img.is_primary) || service_image[0])
    : null;
  
  // Format price display based on price type
  const priceDisplay = () => {
    if (price_type === 'fixed') {
      return `$${base_price?.toFixed(2) || '0.00'}`;
    } else if (price_type === 'hourly') {
      return `$${base_price?.toFixed(2) || '0.00'}/hr`;
    } else if (price_type === 'range' && service.pricing_tier?.length > 0) {
      const prices = service.pricing_tier.map(tier => tier.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    } else {
      return 'Quote needed';
    }
  };
  
  // Truncate description to fit card
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  // Grid view card
  if (view === 'grid') {
    return (
      <Link 
        href={`/customer/services/${service_id}`}
        className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
      >
        <div className="relative h-40 w-full bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {service_subcategory?.service_category?.name && (
            <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {service_subcategory.service_category.name}
            </span>
          )}
          
          {service.is_featured && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
        
        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{name}</h3>
          
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {truncateDescription(description)}
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            <span className="font-bold text-gray-900">{priceDisplay()}</span>
            
            {isAuthenticated && (
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>4.8 (24)</span>
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
      href={`/customer/services/${service_id}`}
      className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
    >
      <div className="relative h-32 w-32 flex-shrink-0 bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || name}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            {service_subcategory?.service_category?.name && (
              <span className="text-xs text-gray-500">
                {service_subcategory.service_category.name}
                {service_subcategory.name && ` > ${service_subcategory.name}`}
              </span>
            )}
          </div>
          
          {service.is_featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm my-2 line-clamp-2">
          {description}
        </p>
        
        <div className="mt-auto flex justify-between items-center">
          <span className="font-bold text-gray-900">{priceDisplay()}</span>
          
          {isAuthenticated && (
            <div className="flex items-center text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>4.8 (24)</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}