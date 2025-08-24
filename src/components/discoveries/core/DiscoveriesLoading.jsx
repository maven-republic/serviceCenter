// src/components/discoveries/core/DiscoveriesLoading.jsx
// REFACTORED - Single component for all loading states
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Masonry-style skeleton card that matches your Manifest component
const MasonrySkeletonCard = ({ index = 0 }) => {
  // Variable heights matching your Manifest card variants
  const cardVariants = [
    { height: 'min-h-[240px]', variant: 'compact' },
    { height: 'min-h-[320px]', variant: 'standard' }, 
    { height: 'min-h-[400px]', variant: 'tall' },
    { height: 'min-h-[480px]', variant: 'extra-tall' }
  ];

  // Color palette backgrounds to match your Manifest design
  const colorPalettes = [
    'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50',
    'bg-pink-50', 'bg-cyan-50', 'bg-indigo-50', 'bg-emerald-50'
  ];

  const cardVariant = cardVariants[index % cardVariants.length];
  const bgColor = colorPalettes[index % colorPalettes.length];
  
  return (
    <div className="break-inside-avoid mb-6">
      <Card className={`${cardVariant.height} border border-border/20 shadow-sm overflow-hidden ${bgColor}`}>
        <CardContent className="p-0 h-full flex flex-col">
          
          {/* Header Section */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              {/* Service Icon */}
              <Skeleton className="h-12 w-12 rounded-xl" />
              
              {/* Like Button & Featured Badge area */}
              <div className="flex items-center gap-2">
                {/* Featured badge (sometimes) */}
                {index % 3 === 0 && (
                  <Skeleton className="h-5 w-16 rounded-full bg-yellow-200" />
                )}
                {/* Like button */}
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Service Title */}
            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Category Badge */}
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Content Section - Variable by card variant */}
          <div className="px-4 flex-1 flex flex-col justify-between">
            
            {/* Description */}
            <div className="mb-4">
              {cardVariant.variant === 'compact' ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ) : cardVariant.variant === 'standard' ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  
                  {/* Rating & reviews for tall cards */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3 rounded bg-yellow-200" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  
                  {/* Feature badges for extra-tall cards */}
                  {cardVariant.variant === 'extra-tall' && (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-4 w-14 rounded-full" />
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Price and Duration */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>

              {/* Action Button */}
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>

          {/* Bottom padding */}
          <div className="p-4 pt-0"></div>
        </CardContent>
      </Card>
    </div>
  );
};

// List view skeleton card
const ListSkeletonCard = ({ index = 0 }) => {
  return (
    <Card key={index} className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main DiscoveriesLoading component
export default function DiscoveriesLoading({ 
  viewMode = 'grid', 
  count = 12,
  className = ""
}) {
  if (viewMode === 'list') {
    // List view skeletons
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <ListSkeletonCard key={`list-skeleton-${i}`} index={i} />
        ))}
      </div>
    );
  }

  // Grid/Masonry view skeletons
  return (
    <div className={`columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <MasonrySkeletonCard key={`masonry-skeleton-${i}`} index={i} />
      ))}
    </div>
  );
}