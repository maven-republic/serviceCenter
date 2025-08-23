// src/components/card/portfolio.jsx
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Star, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Lock, 
  Heart,
  Share2,
  MoreVertical,
  CheckCircle,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthGuard } from '@/primitives/useAuthGuard';
import { cn } from "@/lib/utils";

export default function portfolio({ 
  service, 
  variant = "compact", // "default", "compact", "featured" - Changed default to compact
  showAuthButton = true,
  onServiceClick,
  className = ""
}) {
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { requireAuth, isAuthenticated } = useAuthGuard();

  // Safely extract data with fallbacks
  const serviceInformation = {
    id: service?.id || service?.service_id || 'unknown',
    title: service?.title || service?.name || service?.service_name || 'Service',
    price: service?.price || service?.base_price || 0,
    img: service?.img || service?.image_url || null,
    rating: service?.rating || 4.8,
    reviews: service?.reviews || 0,
    duration: service?.duration_minutes,
    location: service?.location || service?.parish,
    featured: service?.is_featured || service?.featured || false,
    pricingModel: service?.pricing_model || 'fixed',
    professional: service?.professional_name || 'Professional',
    verified: service?.verified || true
  };

  const formatPrice = (price, pricingModel) => {
    if (!price) return 'Quote required';
    
    const formatted = new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
    
    switch (pricingModel) {
      case 'hourly': return `${formatted}/hr`;
      case 'daily': return `${formatted}/day`;
      case 'weekly': return `${formatted}/week`;
      case 'monthly': return `${formatted}/month`;
      case 'per_unit': return `${formatted}/unit`;
      case 'fixed':
      default: return `From ${formatted}`;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Duration varies';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const getFlatColor = (seed) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-cyan-100 text-cyan-700',
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-yellow-100 text-yellow-700',
      'bg-red-100 text-red-700',
      'bg-teal-100 text-teal-700',
      'bg-violet-100 text-violet-700'
    ];
    
    const hash = seed?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = getFlatColor(serviceInformation.id || serviceInformation.title);
  const hasValidImage = serviceInformation.img && 
                       serviceInformation.img !== '/images/services/default-service.jpg' && 
                       !imageError;

  const handleServiceClick = () => {
    if (onServiceClick) {
      onServiceClick(serviceInformation);
      return;
    }

    if (showAuthButton && !isAuthenticated()) {
      requireAuth(`book ${serviceInformation.title}`);
    } else {
      // Navigate to service detail page or handle authenticated action
      window.location.href = `/customer/services/${serviceInformation.id}`;
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      requireAuth('save favorites');
      return;
    }
    setIsFavorited(!isFavorited);
    // Add your favorite logic here
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: serviceInformation.title,
        text: serviceInformation.title,
        url: window.location.origin + `/services/${serviceInformation.id}`
      });
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/services/${serviceInformation.id}`);
    }
  };

  // Compact variant for lists
// Compact variant for lists
  if (variant === "compact") {
    return (
      <Card className={cn(
        "cursor-pointer border border-border/20 bg-transparent transition-colors",
        "hover:bg-muted/20 hover:border-primary/30",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3 min-h-[80px]">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
              {hasValidImage ? (
                <Image
                  src={serviceInformation.img}
                  alt={serviceInformation.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-sm font-bold">
                  {serviceInformation.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col justify-start h-full">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="font-semibold text-sm leading-relaxed mb-2 break-words line-clamp-2">
                      {serviceInformation.title}
                    </h3>
                    <div className="font-medium text-sm text-muted-foreground">
                      {formatPrice(serviceInformation.price, serviceInformation.pricingModel)}
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    {serviceInformation.duration && (
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(serviceInformation.duration)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {showAuthButton && (
              <Button 
                onClick={handleServiceClick}
                variant="outline"
                size="sm"
                className="flex-shrink-0 self-start"
              >
                {isAuthenticated() ? 'View' : 'Login'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured variant for hero sections
  if (variant === "featured") {
    return (
      <Card className={cn(
        "cursor-pointer border-0 bg-transparent transition-colors",
        "hover:border hover:border-primary/30",
        serviceInformation.featured ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-transparent",
        className
      )}>
        <div className="relative">
          {hasValidImage ? (
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
              <Image
                src={serviceInformation.img}
                alt={serviceInformation.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={cn("aspect-[4/3] flex items-center justify-center rounded-t-lg", colorClass)}>
              <div className="text-center">
                <div className="text-xs font-bold mb-2">
                  {serviceInformation.title.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {serviceInformation.verified && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90"
              onClick={handleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-xs">
                {serviceInformation.title}
              </h3>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-muted-foreground">
                {serviceInformation.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(serviceInformation.duration)}
                  </div>
                )}
                {serviceInformation.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {serviceInformation.location}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-xl">
                  {formatPrice(serviceInformation.price, serviceInformation.pricingModel)}
                </div>
              </div>
            </div>

            {showAuthButton && (
              <Button 
                onClick={handleServiceClick}
                className="w-full"
                size="lg"
              >
                {isAuthenticated() ? (
                  <>
                    Book Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Login to Book
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn(
      "cursor-pointer border-0 bg-transparent transition-colors",
      "hover:border hover:border-primary/30",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {hasValidImage ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={serviceInformation.img}
                  alt={serviceInformation.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                <div className="text-lg font-bold">
                  {serviceInformation.title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleFavorite}>
                  <Heart className="h-4 w-4 mr-2" />
                  {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-base leading-tight">
            {serviceInformation.title}
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            {serviceInformation.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(serviceInformation.duration)}
              </div>
            )}
            {serviceInformation.verified && (
              <div className="flex items-center gap-1 text-green-600">
                <Shield className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">
            {formatPrice(serviceInformation.price, serviceInformation.pricingModel)}
          </div>
          
          {serviceInformation.rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{serviceInformation.rating}</span>
              {serviceInformation.reviews > 0 && (
                <span>({serviceInformation.reviews})</span>
              )}
            </div>
          )}
        </div>

        {showAuthButton && (
          <Button 
            onClick={handleServiceClick}
            className="w-full"
            variant="outline"
          >
            {isAuthenticated() ? (
              <>
                Book Service
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Login to Book
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}