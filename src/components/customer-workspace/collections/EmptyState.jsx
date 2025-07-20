// ============================================================================
// 8. src/components/customer-workspace/collections/EmptyState.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RefreshCw } from "lucide-react";

export function EmptyState({ servicesCount, onClearFilters, onRetry }) {
  return (
    <Card className="text-center py-16">
      <CardContent className="space-y-6">
        <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No services found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {servicesCount === 0 
              ? "We couldn't find any services at the moment. Please try again later."
              : "We couldn't find any services matching your criteria. Try adjusting your filters or search terms."
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {servicesCount > 0 && (
            <Button onClick={onClearFilters} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
          
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}