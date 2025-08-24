'use client'
// src/components/search/DiscoveryCard.jsx
import { Star, MapPin, Clock, User, Building, Tag, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function DiscoveryCard({ result, layout = 'grid', index = 0 }) {
  const [isLiked, setIsLiked] = useState(false);

  // Enhanced color palette system for masonry cards
  const getColorPalette = (type, index) => {
    const palettes = {
      service: [
        { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-700', accent: 'bg-blue-500' },
        { bg: 'bg-cyan-50', icon: 'bg-cyan-100', text: 'text-cyan-700', accent: 'bg-cyan-500' },
        { bg: 'bg-indigo-50', icon: 'bg-indigo-100', text: 'text-indigo-700', accent: 'bg-indigo-500' }
      ],
      professional: [
        { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-700', accent: 'bg-green-500' },
        { bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-700', accent: 'bg-emerald-500' },
        { bg: 'bg-teal-50', icon: 'bg-teal-100', text: 'text-teal-700', accent: 'bg-teal-500' }
      ],
      industry: [
        { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-700', accent: 'bg-purple-500' },
        { bg: 'bg-violet-50', icon: 'bg-violet-100', text: 'text-violet-700', accent: 'bg-violet-500' },
        { bg: 'bg-fuchsia-50', icon: 'bg-fuchsia-100', text: 'text-fuchsia-700', accent: 'bg-fuchsia-500' }
      ],
      vertical: [
        { bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-700', accent: 'bg-orange-500' },
        { bg: 'bg-amber-50', icon: 'bg-amber-100', text: 'text-amber-700', accent: 'bg-amber-500' },
        { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-700', accent: 'bg-yellow-500' }
      ]
    };

    const typeGroup = palettes[result.type] || palettes.service;
    return typeGroup[index % typeGroup.length];
  };

  const colorPalette = useMemo(() => 
    getColorPalette(result.type, index), 
    [result.type, index]
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'service':
        return <Tag className="h-4 w-4" />;
      case 'professional':
        return <User className="h-4 w-4" />;
      case 'industry':
      case 'vertical':
        return <Building className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  // Generate card variant for variable heights (Masonry effect)
  const getCardVariant = () => {
    const variants = ['compact', 'standard', 'tall', 'extra-tall'];
    const hash = (result.service_id || index) % variants.length;
    return variants[hash];
  };

  const cardVariant = getCardVariant();

  // Card height classes based on variant
  const heightClasses = {
    'compact': 'min-h-[240px]',
    'standard': 'min-h-[320px]', 
    'tall': 'min-h-[400px]',
    'extra-tall': 'min-h-[480px]'
  };

  const formatPrice = (price, pricingModel) => {
    if (!price) return 'Quote required';
    const formatted = new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 0
    }).format(price);
    
    if (pricingModel === 'hourly') return `${formatted}/hr`;
    if (pricingModel === 'daily') return `${formatted}/day`;
    return `From ${formatted}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (layout === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border border-border/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-xl", colorPalette.icon)}>
                  <div className={cn("", colorPalette.text)}>
                    {getTypeIcon(result.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {result.service_name || result.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.description || result.subtitle}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary" className={cn("text-xs bg-white/80 border-0", colorPalette.text)}>
                          {result.category || result.type}
                        </Badge>
                        {result.is_featured && (
                          <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            Featured
                          </Badge>
                        )}
                        {result.match_type === 'keyword' && (
                          <Badge variant="outline" className="text-xs">
                            {result.matched_keyword}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>4.8 • 24+ reviews</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-lg text-gray-900 mb-1">
                        {formatPrice(result.base_price || result.price, result.pricing_model)}
                      </div>
                      {result.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 justify-end">
                          <Clock className="h-3 w-3" />
                          {formatDuration(result.duration_minutes)}
                        </div>
                      )}
                      <Button 
                        className={cn("mt-3 text-white hover:opacity-90", colorPalette.accent)} 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Masonry Grid Card
  return (
    <div className="break-inside-avoid mb-6">
      <Card className={cn(
        "border border-border/20 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group overflow-hidden",
        colorPalette.bg,
        heightClasses[cardVariant]
      )}>
        <CardContent className="p-0 h-full flex flex-col">
          
          {/* Header Section */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              
              {/* Service Icon */}
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorPalette.icon)}>
                <div className={cn("", colorPalette.text)}>
                  {getTypeIcon(result.type)}
                </div>
              </div>
              
              {/* Like Button & Featured Badge */}
              <div className="flex items-center gap-2">
                {result.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                    Featured
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLiked(!isLiked);
                  }}
                >
                  <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                </Button>
              </div>
            </div>

            {/* Service Title */}
            <h3 className="font-semibold text-base leading-tight mb-2 text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {result.service_name || result.title}
            </h3>

            {/* Category Badge */}
            <Badge variant="secondary" className={cn("text-xs bg-white/80 border-0", colorPalette.text)}>
              {result.category || result.type}
            </Badge>
          </div>

          {/* Content Section - Variable based on card variant */}
          <div className="px-4 flex-1 flex flex-col justify-between">
            
            {/* Description */}
            <div className="mb-4">
              {cardVariant === 'compact' ? (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {result.description || result.subtitle}
                </p>
              ) : cardVariant === 'standard' ? (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {result.description || result.subtitle}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {result.description || result.subtitle}
                  </p>
                  
                  {/* Extra content for tall cards */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                    <div>24+ reviews</div>
                    {result.match_type === 'keyword' && (
                      <Badge variant="outline" className="text-xs">
                        {result.matched_keyword}
                      </Badge>
                    )}
                  </div>
                  
                  {cardVariant === 'extra-tall' && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Same Day</Badge>
                        <Badge variant="outline" className="text-xs">Licensed</Badge>
                        <Badge variant="outline" className="text-xs">Insured</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Price and Duration */}
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold text-gray-900">
                  {formatPrice(result.base_price || result.price, result.pricing_model)}
                </div>
                {result.duration_minutes && (
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(result.duration_minutes)}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button className={cn("w-full text-white hover:opacity-90 transition-opacity", colorPalette.accent)}>
                View Details
              </Button>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="p-4 pt-0"></div>
        </CardContent>
      </Card>
    </div>
  );
}