// src/components/search/DiscoveriesHeader.jsx
import { Grid, List, Filter, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DiscoveriesHeader({
  query,
  totalResults,
  searchTimeMs,
  usedFuzzy,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Discoveries for "{query}"
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              {totalResults} results
            </span>
            {searchTimeMs && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {searchTimeMs}ms
                </div>
              </>
            )}
            {usedFuzzy && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Smart Search</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Filter Toggle */}
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* View Mode Toggle */}
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}