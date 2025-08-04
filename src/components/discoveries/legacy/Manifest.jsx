"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Manifest({ data }) {
  const [imageError, setImageError] = useState(false);

  // Safely extract data with fallbacks
  const serviceInformation = {
    id: data?.id || data?.service_id || 'unknown',
    title: data?.title || data?.name || data?.service_name || 'Service',
    description: data?.description || '',
    price: data?.price || data?.base_price || 0,
    category: data?.category || data?.vertical_name || data?.industry_name || 'General',
    img: data?.img || data?.image_url || null,
    rating: data?.rating || 4.8,
    reviews: data?.reviews || 0
  };

  // Flat shadcn color palette
  const getFlatColor = (seed) => {
    const flatColors = [
      'bg-slate-100 text-slate-700',
      'bg-gray-100 text-gray-700',
      'bg-zinc-100 text-zinc-700',
      'bg-neutral-100 text-neutral-700',
      'bg-stone-100 text-stone-700',
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-amber-100 text-amber-700',
      'bg-yellow-100 text-yellow-700',
      'bg-lime-100 text-lime-700',
      'bg-green-100 text-green-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
      'bg-cyan-100 text-cyan-700',
      'bg-sky-100 text-sky-700',
      'bg-blue-100 text-blue-700',
      'bg-indigo-100 text-indigo-700',
      'bg-violet-100 text-violet-700',
      'bg-purple-100 text-purple-700',
      'bg-fuchsia-100 text-fuchsia-700',
      'bg-pink-100 text-pink-700',
      'bg-rose-100 text-rose-700'
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

    const index = hashCode(seed || 'default') % flatColors.length;
    return flatColors[index];
  };

  const colorClass = useMemo(() =>
    getFlatColor(serviceInformation.id || serviceInformation.title),
    [serviceInformation.id, serviceInformation.title]
  );

  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const truncatedTitle = serviceInformation.title.length > 32 ? 
                        serviceInformation.title.slice(0, 32) + "..." : 
                        serviceInformation.title;

  return (
    <Link 
href={`/customer/services/${serviceInformation.id}`}      
className="block group"
    >
      <div className="space-y-3">
        {/* Flat Card Section */}
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/50 group-hover:bg-muted transition-colors duration-200">
          {hasValidImage ? (
            <Image
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              src={serviceInformation.img}
              alt={serviceInformation.title}
              onError={() => setImageError(true)}
            />
          ) : (
            // Flat color fallback with icon/initial
            <div className={cn("h-full w-full flex items-center justify-center", colorClass)}>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {serviceInformation.title.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {/* Flat Price Badge */}
          {serviceInformation.price > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/90 text-foreground border">
                ${serviceInformation.price}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-1">
          {/* Title */}
          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
            {truncatedTitle}
          </h3>

          {/* Category */}
          <p className="text-xs text-muted-foreground">
            {serviceInformation.category}
          </p>
        </div>
      </div>
    </Link>
  );
}