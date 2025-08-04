// ============================================================================
// FIXED: src/components/customer-workspace/collections/CollectionHeader.jsx
// ============================================================================

import { Badge } from "@/components/ui/badge";
import { Search, Zap } from "lucide-react";
// ✅ Correct import path - you created it in primitives/customer/
import { getPastelGradient } from "@/primitives/customer/colorGenerator";

export function CollectionHeader({ 
  urlQuery, 
  urlCategory, 
  searchQuery, 
  totalResults, 
  filteredCount, 
  loading, 
  error, 
  servicesCount 
}) {
  const getDisplayTitle = () => {
    if (urlQuery || searchQuery) {
      return `Search Results for "${urlQuery || searchQuery}"`;
    } else if (urlCategory) {
      return `Category: ${urlCategory}`;
    } else {
      return 'Explore Services';
    }
  };

  const getResultsSummary = () => {
    if (loading) return 'Loading services...';
    
    if (filteredCount === 0 && servicesCount > 0) {
      return 'No services match your filters';
    }
    
    return `${filteredCount} service${filteredCount !== 1 ? 's' : ''} found`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">
          {getDisplayTitle()}
        </h1>
        
        {error && servicesCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Using cached data
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{getResultsSummary()}</span>
        
        {totalResults > filteredCount && (
          <Badge variant="outline" className="text-xs">
            {totalResults} total available
          </Badge>
        )}
        
        {urlQuery && (
          <Badge variant="default" className="text-xs gap-1">
            <Search className="h-3 w-3" />
            Search Active
          </Badge>
        )}
      </div>
    </div>
  );
}

