"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Manifest({ data }) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Safely extract data with fallbacks
  const serviceInformation = {
    id: data?.id || data?.service_id || 'unknown',
    title: data?.title || data?.name || data?.service_name || 'Service',
    description: data?.description || '',
    price: data?.price || data?.base_price || 0,
    category: data?.category || data?.vertical_name || data?.industry_name || 'General',
    img: data?.img || data?.image_url || null,
    rating: data?.rating || 4.8,
    reviews: data?.reviews || 0,
    duration: data?.duration_minutes || null
  };

  // Enhanced color palette for Masonry style
  const getFlatColor = (seed) => {
    const colorPalettes = [
      { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-700', accent: 'bg-blue-500' },
      { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-700', accent: 'bg-green-500' },
      { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-700', accent: 'bg-purple-500' },
      { bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-700', accent: 'bg-orange-500' },
      { bg: 'bg-pink-50', icon: 'bg-pink-100', text: 'text-pink-700', accent: 'bg-pink-500' },
      { bg: 'bg-cyan-50', icon: 'bg-cyan-100', text: 'text-cyan-700', accent: 'bg-cyan-500' },
      { bg: 'bg-indigo-50', icon: 'bg-indigo-100', text: 'text-indigo-700', accent: 'bg-indigo-500' },
      { bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-700', accent: 'bg-emerald-500' },
      { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-700', accent: 'bg-yellow-500' },
      { bg: 'bg-red-50', icon: 'bg-red-100', text: 'text-red-700', accent: 'bg-red-500' },
      { bg: 'bg-teal-50', icon: 'bg-teal-100', text: 'text-teal-700', accent: 'bg-teal-500' },
      { bg: 'bg-violet-50', icon: 'bg-violet-100', text: 'text-violet-700', accent: 'bg-violet-500' }
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

    const index = hashCode(seed || 'default') % colorPalettes.length;
    return colorPalettes[index];
  };

  const colorPalette = useMemo(() =>
    getFlatColor(serviceInformation.id || serviceInformation.title),
    [serviceInformation.id, serviceInformation.title]
  );

  // Generate card variant for variable heights (Masonry effect)
  const getCardVariant = () => {
    const variants = ['compact', 'standard', 'tall', 'extra-tall'];
    const hash = parseInt(serviceInformation.id) || serviceInformation.title.length;
    return variants[hash % variants.length];
  };

  const cardVariant = getCardVariant();

  // Card height classes based on variant
  const heightClasses = {
    'compact': 'min-h-[240px]',
    'standard': 'min-h-[320px]', 
    'tall': 'min-h-[400px]',
    'extra-tall': 'min-h-[480px]'
  };

  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const formatPrice = (price) => {
    if (!price) return "Quote required";
    return `$${price.toLocaleString()}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="break-inside-avoid mb-6">
      <Link href={`/customer/services/${serviceInformation.id}`} className="block group">
        <Card className={cn(
          "border border-border/20 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer overflow-hidden",
          colorPalette.bg,
          heightClasses[cardVariant]
        )}>
          <CardContent className="p-0 h-full flex flex-col">
            
            {/* Header Section */}
            <div className="p-4 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                
                {/* Service Icon or Image */}
                <div className="flex-shrink-0">
                  {hasValidImage ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      <Image
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        src={serviceInformation.img}
                        alt={serviceInformation.title}
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorPalette.icon)}>
                      <span className={cn("text-lg font-bold", colorPalette.text)}>
                        {serviceInformation.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Like Button */}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLiked(!isLiked);
                  }}
                >
                  <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                </Button> */}
              </div>

              {/* Service Title - Enhanced Typography */}
              <h3 className="font-bold text-base leading-snug mb-2 text-slate-950 line-clamp-2 group-hover:text-primary transition-colors">
                {serviceInformation.title}
              </h3>

              {/* Category Badge */}
              {/* <Badge variant="secondary" className={cn("text-xs bg-white/80 border-0", colorPalette.text)}>
                {serviceInformation.category}
              </Badge> */}
            </div>

            {/* Content Section - Variable based on card variant */}
            <div className="px-4 flex-1 flex flex-col justify-between">
              
              {/* Description - Enhanced Typography */}
              <div className="mb-4">
                {cardVariant === 'compact' ? (
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {serviceInformation.description}
                  </p>
                ) : cardVariant === 'standard' ? (
                  <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                    {serviceInformation.description}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700 line-clamp-4 leading-relaxed">
                      {serviceInformation.description}
                    </p>
                    
                    {/* Extra content for tall cards */}
                    {/* <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{serviceInformation.rating}</span>
                      </div>
                      <div>{serviceInformation.reviews}+ reviews</div>
                    </div> */}
                    
                    {/* {cardVariant === 'extra-tall' && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Features:</div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Same Day</Badge>
                          <Badge variant="outline" className="text-xs">Licensed</Badge>
                          <Badge variant="outline" className="text-xs">Insured</Badge>
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
              </div>

              {/* Bottom Section - Enhanced Typography */}
              <div className="space-y-3">
                {/* Price and Duration */}
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-slate-950">
                    {formatPrice(serviceInformation.price)}
                  </div>
                  {serviceInformation.duration && (
                    <div className="text-slate-600 text-xs">
                      {formatDuration(serviceInformation.duration)}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {/* <Button className={cn("w-full text-white hover:opacity-90 transition-opacity", colorPalette.accent)}>
                  View Details
                </Button> */}
              </div>
            </div>

            {/* Bottom padding */}
            <div className="p-4 pt-0"></div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}