// src/app/browse-services/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List, ArrowRight, AlertCircle, MoreVertical, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Import Portfolio Component
import Portfolio from '@/components/card/portfolio';

// Twitter-Style Skeleton Loader with Palette Colors
const ServiceSkeleton = ({ colorIndex = 0 }) => {
  // Color palette system matching Portfolio component approach
  const colorPalettes = [
    { bg: 'bg-blue-50', icon: 'bg-blue-100', accent: 'bg-blue-200/50' },
    { bg: 'bg-green-50', icon: 'bg-green-100', accent: 'bg-green-200/50' },
    { bg: 'bg-purple-50', icon: 'bg-purple-100', accent: 'bg-purple-200/50' },
    { bg: 'bg-orange-50', icon: 'bg-orange-100', accent: 'bg-orange-200/50' },
    { bg: 'bg-pink-50', icon: 'bg-pink-100', accent: 'bg-pink-200/50' },
    { bg: 'bg-cyan-50', icon: 'bg-cyan-100', accent: 'bg-cyan-200/50' },
    { bg: 'bg-indigo-50', icon: 'bg-indigo-100', accent: 'bg-indigo-200/50' },
    { bg: 'bg-emerald-50', icon: 'bg-emerald-100', accent: 'bg-emerald-200/50' },
    { bg: 'bg-yellow-50', icon: 'bg-yellow-100', accent: 'bg-yellow-200/50' },
    { bg: 'bg-red-50', icon: 'bg-red-100', accent: 'bg-red-200/50' },
    { bg: 'bg-teal-50', icon: 'bg-teal-100', accent: 'bg-teal-200/50' },
    { bg: 'bg-violet-50', icon: 'bg-violet-100', accent: 'bg-violet-200/50' }
  ];

  const palette = colorPalettes[colorIndex % colorPalettes.length];

  return (
    <Card className={cn(
      "border border-border/20 shadow-none transition-all duration-300",
      palette.bg,
      "animate-pulse"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 min-h-[80px]">
          {/* Icon Skeleton - matches Portfolio w-12 h-12 */}
          <div className={cn(
            "w-12 h-12 rounded-lg flex-shrink-0",
            palette.icon,
            "relative overflow-hidden"
          )}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-2 space-y-3">
                {/* Title Skeleton - 2 lines like line-clamp-2 */}
                <div className="space-y-2">
                  <div className={cn(
                    "h-4 rounded-md relative overflow-hidden",
                    palette.accent
                  )}>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className={cn(
                    "h-4 rounded-md w-3/4 relative overflow-hidden",
                    palette.accent
                  )}>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                </div>
                
                {/* Price Skeleton */}
                <div className={cn(
                  "h-5 rounded-md w-24 relative overflow-hidden",
                  palette.accent
                )}>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>
              
              {/* Duration Skeleton */}
              <div className="text-right ml-2 flex-shrink-0">
                <div className={cn(
                  "h-3 rounded-md w-12 relative overflow-hidden",
                  palette.accent
                )}>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="flex-shrink-0 self-start">
            <div className={cn(
              "h-9 w-16 rounded-md border border-border/20 relative overflow-hidden",
              palette.accent
            )}>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Staggered Skeleton Grid Component
const SkeletonGrid = ({ count = 12 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div 
          key={`skeleton-${i}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ 
            animationDelay: `${i * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <ServiceSkeleton colorIndex={i} />
        </div>
      ))}
    </>
  );
};

// Main Page Component
export default function BrowseServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: ''
  });

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    let hasError = false;
    
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '50', // Reduced from 50 for better UX
        offset: '0'
      });

      if (filters.category) params.append('vertical', filters.category);

      const response = await fetch(`/api/services?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
      setStats(data.stats);
      
      // Success - hide loading immediately
      setIsLoading(false);
    } catch (err) {
      hasError = true;
      console.error('Error fetching services:', err);
      setError(err.message);
      
      // Simulate loading delay to show skeleton
      setTimeout(() => {
        // Fallback demo data for development
        setServices([
          {
            service_id: 1,
            service_name: "Emergency Plumbing Repair",
            description: "24/7 emergency plumbing services for urgent repairs and maintenance",
            base_price: 15000,
            duration_minutes: 120,
            is_featured: true,
            pricing_model: "hourly",
            vertical_name: "Plumbing"
          },
          {
            service_id: 2,
            service_name: "Custom Metal Welding",
            description: "Professional welding services for custom metalwork and repairs",
            base_price: 25000,
            duration_minutes: 240,
            is_featured: true,
            pricing_model: "fixed",
            vertical_name: "Welding"
          },
          {
            service_id: 3,
            service_name: "Kitchen Pipe Installation",
            description: "Complete kitchen plumbing installation and pipe routing",
            base_price: 35000,
            duration_minutes: 480,
            is_featured: false,
            pricing_model: "fixed",
            vertical_name: "Plumbing"
          },
          {
            service_id: 4,
            service_name: "Artistic Steel Welding",
            description: "Custom artistic steel fabrication and decorative welding",
            base_price: 50000,
            duration_minutes: 360,
            is_featured: false,
            pricing_model: "fixed",
            vertical_name: "Welding"
          }
        ]);
        setStats({
          total: 4,
          featured: 2,
          verticals: ["Plumbing", "Welding"],
          priceRange: { min: 15000, max: 50000, average: 31250 }
        });
        
        // Hide loading after showing fallback data
        setIsLoading(false);
      }, 1500); // 1.5 second delay to showcase skeleton
    }
  };

  // Filter services by search query AND category
  const filteredServices = services.filter(service => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      service.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vertical_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || 
      service.vertical_name === filters.category;
    
    return matchesSearch && matchesCategory;
  });

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    const returnUrl = encodeURIComponent(currentPath);
    router.push(`/login?returnTo=${returnUrl}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pinterest-Style Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
             
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">maven republic</h1>
              <h1 className="text-xl font-bold text-gray-900 sm:hidden">Maven</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search services, categories, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 text-base bg-gray-50 border-gray-200 rounded-full hover:bg-white hover:shadow-sm focus:bg-white focus:shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleLoginRedirect}
                className="hidden sm:flex text-gray-700 hover:bg-gray-100 font-semibold"
              >
                SIGN IN
              </Button>
              <Button 
                onClick={() => router.push('/register')}
                className=" text-white font-semibold px-6 rounded-full"
              >
                Create account
              </Button>
              
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="sm" className="lg:hidden p-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="pb-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div 
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap",
                  !filters.category ? 
                    "bg-gray-900 text-white shadow-sm" : 
                    "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                )}
                onClick={() => setFilters({...filters, category: ''})}
              >
                <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">
                  <span className="text-xs">🔧</span>
                </div>
                <span className="font-medium text-sm">All</span>
                {stats?.total > 0 && (
                  <Badge variant={!filters.category ? "secondary" : "outline"} className="text-xs bg-white/20 text-current border-current/20">
                    {stats.total}
                  </Badge>
                )}
              </div>

              {/* Dynamic Category Pills */}
              {stats?.verticals?.map((category) => {
                const isActive = filters.category === category;
                const categoryIcons = {
                  'Plumbing': '🔧',
                  'Electrical': '⚡',
                  'Construction': '🏠',
                  'Painting': '🎨',
                  'Gardening': '🌱',
                  'Cleaning': '🧹',
                  'Welding': '⚒️',
                  'Repair': '🔨',
                  'Maintenance': '⚙️',
                  'Installation': '🔩'
                };
                
                return (
                  <div 
                    key={category}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap",
                      isActive ? 
                        "bg-gray-900 text-white shadow-sm" : 
                        "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    )}
                    onClick={() => setFilters({...filters, category: isActive ? '' : category})}
                  >
                    <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">
                      <span className="text-xs">{categoryIcons[category] || '📋'}</span>
                    </div>
                    <span className="font-medium text-sm">{category}</span>
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-xs bg-white/20 text-current border-current/20">
                      {services.filter(s => s.vertical_name === category).length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{filteredServices.length}</span> services 
                {searchQuery && <span> matching "{searchQuery}"</span>}
                {filters.category && <span> in {filters.category}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            <SkeletonGrid count={12} />
          </div>
        ) : error && services.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <div className="text-xl font-semibold mb-2">Unable to load services</div>
            <p className="text-muted-foreground mb-6">
              There was a problem connecting to our services. Please try again.
            </p>
            <Button onClick={fetchServices} variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <div className="text-xl font-semibold mb-2">No services found</div>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 
                `No services match "${searchQuery}". Try different keywords or adjust your filters.` :
                'Try adjusting your filters to see more services.'
              }
            </p>
            {searchQuery && (
              <Button 
                onClick={() => setSearchQuery('')} 
                variant="outline"
                className="mr-3"
              >
                Clear Search
              </Button>
            )}
            <Button onClick={() => setFilters({
              category: ''
            })}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredServices.map((service) => (
              <Portfolio
                key={service.service_id}
                service={service}
                variant="compact"
              />
            ))}
          </div>
        )}

        {/* Bottom Call to Action
        {!isLoading && filteredServices.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 border border-primary/20">
              <h2 className="text-2xl font-bold mb-3">Ready to book a service?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of satisfied customers who trust our platform for their service needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleLoginRedirect} size="lg" className="gap-2">
                  <LogIn className="h-5 w-5" />
                  Login to Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/register')}>
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}