// ============================================================================
// 5. src/components/customer-workspace/collections/ResultsSummaryBar.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, TrendingUp } from "lucide-react";

export function ResultsSummaryBar({
  loading,
  currentItems,
  indexOfFirstItem,
  indexOfLastItem,
  filteredCount,
  servicesCount,
  sortBy,
  onClearFilters
}) {
  if (loading || currentItems.length === 0) return null;

  return (
    <div className="flex justify-between items-center mb-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCount)} of {filteredCount}
        </span>
        
        {sortBy !== 'recommended' && (
          <Badge variant="outline" className="text-xs gap-1">
            <TrendingUp className="h-3 w-3" />
            Sorted by {sortBy.replace('-', ' ')}
          </Badge>
        )}
      </div>
      
      {currentItems.length !== servicesCount && (
        <Button 
          onClick={onClearFilters} 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-xs"
        >
          <Filter className="h-3 w-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
