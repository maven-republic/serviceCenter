"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Manifest({ data }) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safely extract data with fallbacks
  const serviceInformation = {
    id: data?.id || data?.service_id || 'unknown',
    title: data?.display || data?.title || data?.name || data?.service_name || 'Service',
    description: data?.description || '',
    price: data?.price || data?.base_price || 0,
    category: data?.category || data?.vertical_name || data?.industry_name || 'General',
    img: data?.img || data?.image_url || null,
    rating: data?.rating || 4.8,
    reviews: data?.reviews || 0,
    duration: data?.duration_minutes || null,
    featured: data?.featured || false,
    professional: data?.professional || data?.provider_name || 'Professional'
  };

  // Generate consistent gradient backgrounds for cards without images
  const getGradientBackground = (seed) => {
    const gradients = [
      'from-blue-400 via-blue-500 to-blue-600',
      'from-purple-400 via-purple-500 to-purple-600',
      'from-green-400 via-green-500 to-green-600',
      'from-orange-400 via-orange-500 to-orange-600',
      'from-pink-400 via-pink-500 to-pink-600',
      'from-cyan-400 via-cyan-500 to-cyan-600',
      'from-indigo-400 via-indigo-500 to-indigo-600',
      'from-emerald-400 via-emerald-500 to-emerald-600',
      'from-yellow-400 via-yellow-500 to-yellow-600',
      'from-red-400 via-red-500 to-red-600',
      'from-teal-400 via-teal-500 to-teal-600',
      'from-violet-400 via-violet-500 to-violet-600',
      'from-rose-400 via-rose-500 to-rose-600',
      'from-amber-400 via-amber-500 to-amber-600',
      'from-lime-400 via-lime-500 to-lime-600',
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

    const index = hashCode(seed || 'default') % gradients.length;
    return gradients[index];
  };

  const gradientBg = useMemo(() =>
    getGradientBackground(serviceInformation.id + serviceInformation.title),
    [serviceInformation.id, serviceInformation.title]
  );

  // Generate variable card heights for masonry effect
  const getCardHeight = () => {
    const heights = [
      'h-[280px]',   // Short
      'h-[320px]',   // Medium
      'h-[360px]',   // Tall
      'h-[400px]',   // Extra tall
    ];
    const hash = (parseInt(serviceInformation.id) || serviceInformation.title.length) % heights.length;
    return heights[hash];
  };

  const cardHeight = getCardHeight();

  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const formatPrice = (price) => {
    if (!price || price === 0) return "Quote";
    if (price < 100) return `${price}`;
    return `${(price / 1).toLocaleString()}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="break-inside-avoid mb-6">
      <Link href={`/customer/services/${serviceInformation.id}`} className="block group">
        <Card className={cn(
          "border-0 hover:shadow-2xl transition-shadow duration-300 cursor-pointer overflow-hidden rounded-2xl",
          cardHeight,
          "relative"
        )}>
          <CardContent className="p-0 h-full relative">
            
            {/* Main Visual Section */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              
              {/* Background Image or Gradient */}
              {hasValidImage ? (
                <>
                  <Image
                    fill
                    className={cn(
                      "object-cover transition-all duration-700 group-hover:scale-110",
                      !imageLoaded && "opacity-0"
                    )}
                    src={serviceInformation.img}
                    alt={serviceInformation.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Loading placeholder */}
                  {!imageLoaded && (
                    <div className={cn("absolute inset-0 bg-gradient-to-br animate-pulse", gradientBg)} />
                  )}
                </>
              ) : (
                /* Gradient Background for no-image cards */
                <div className={cn("absolute inset-0 bg-gradient-to-br", gradientBg)}>
                </div>
              )}

              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Top-right badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                {serviceInformation.featured && (
                  <Badge className="bg-yellow-500 text-yellow-50 border-0 text-xs font-semibold px-2 py-1">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Top-right letter icon for services without images */}
              {!hasValidImage && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {serviceInformation.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Left-aligned content overlay */}
              <div className="absolute inset-0 flex flex-col justify-center p-6 z-10">
                
                {/* Category tag */}
                <div className="mb-3">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/20 text-xs px-2 py-1">
                    {serviceInformation.category}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg leading-tight mb-3 text-white line-clamp-2">
                  {serviceInformation.title}
                </h3>

                {/* Price */}
                <div className="text-white font-bold text-lg">
                  {formatPrice(serviceInformation.price)}
                </div>
              </div>

              {/* Hover overlay removed - keeping it clean */}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}