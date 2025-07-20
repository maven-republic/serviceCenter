"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
    img: data?.img || null,
    rating: data?.rating || 4.8,
    reviews: data?.reviews || 0
  };

  // Minimalistic pastel gradients
  const getPastelGradient = (seed) => {
    const pastelGradients = [
      'bg-gradient-to-br from-rose-100 to-pink-200',
      'bg-gradient-to-br from-blue-100 to-indigo-200', 
      'bg-gradient-to-br from-green-100 to-emerald-200',
      'bg-gradient-to-br from-purple-100 to-violet-200',
      'bg-gradient-to-br from-yellow-100 to-amber-200',
      'bg-gradient-to-br from-cyan-100 to-teal-200',
      'bg-gradient-to-br from-orange-100 to-red-200',
      'bg-gradient-to-br from-indigo-100 to-blue-200',
      'bg-gradient-to-br from-emerald-100 to-green-200',
      'bg-gradient-to-br from-violet-100 to-purple-200',
      'bg-gradient-to-br from-amber-100 to-yellow-200',
      'bg-gradient-to-br from-teal-100 to-cyan-200'
    ];
    
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const index = hashCode(seed || 'default') % pastelGradients.length;
    return pastelGradients[index];
  };

  const gradientClass = useMemo(() =>
    getPastelGradient(serviceInformation.id || serviceInformation.title),
    [serviceInformation.id, serviceInformation.title]
  );

  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const truncatedTitle = serviceInformation.title.length > 45 ? 
                        serviceInformation.title.slice(0, 45) + "..." : 
                        serviceInformation.title;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Card Section */}
      <Card className="group overflow-hidden border border-gray-100 bg-white hover:border-gray-200  transition-all duration-200">
        {/* Image Section */}
        <div className="relative h-28 overflow-hidden">
          {hasValidImage ? (
            <Image
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              src={serviceInformation.img}
              alt={serviceInformation.title}
              onError={() => setImageError(true)}
            />
          ) : (
            // Minimalistic pastel fallback
            <div className={cn("h-full w-full flex items-center justify-center", gradientClass)}>
              <div className="text-center">
                
              </div>
            </div>
          )}

           {/* Clean Price Badge */}
          {serviceInformation.price > 0 && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-100">
              <span className="text-xs font-medium text-gray-700">
                ${serviceInformation.price}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Content Section - Outside Card */}
      <div className="flex-1 space-y-2">
        {/* Title */}
        <Link 
          href={`services/${serviceInformation.id}`}
          className="block group/link"
        >
          <h3 className="font-medium text-sm text-gray-900 group-hover/link:text-gray-600 transition-colors duration-200 leading-snug">
            {truncatedTitle}
          </h3>
        </Link>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-normal">
            {serviceInformation.category}
          </span>
        </div>
      </div>
    </div>
  );
}