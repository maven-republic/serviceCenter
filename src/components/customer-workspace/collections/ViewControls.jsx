// ============================================================================
// 4. src/components/customer-workspace/collections/ViewControls.jsx
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";

export function ViewControls({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  itemsPerPage,
  onItemsPerPageChange
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
        </SelectContent>
      </Select>

      {/* View Mode Toggle */}
      <div className="hidden sm:flex bg-muted rounded-lg p-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('grid')}
          className="gap-2 h-8"
        >
          <Grid3X3 className="h-4 w-4" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="gap-2 h-8"
        >
          <List className="h-4 w-4" />
          List
        </Button>
      </div>

      {/* Items per page */}
      <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="8">8 per page</SelectItem>
          <SelectItem value="12">12 per page</SelectItem>
          <SelectItem value="16">16 per page</SelectItem>
          <SelectItem value="24">24 per page</SelectItem>
          <SelectItem value="48">48 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}