// File: src/app/(customer-workspace)/customer/services/[id]/components/ViewModeToggle.jsx
// 🔄 Reusable toggle for grid/list view modes

import { Button } from '@/components/ui/button'
import { Grid3X3, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ViewModeToggle({ 
  viewMode = 'grid', 
  onViewModeChange,
  size = 'sm',
  className 
}) {
  return (
    <div className={cn(
      "flex rounded-md border overflow-hidden",
      className
    )}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onViewModeChange('grid')}
        className="px-2 sm:px-3 rounded-none border-0"
        aria-label="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
        {size === 'default' && <span className="ml-2 hidden sm:inline">Grid</span>}
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onViewModeChange('list')}
        className="px-2 sm:px-3 rounded-none border-0"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        {size === 'default' && <span className="ml-2 hidden sm:inline">List</span>}
      </Button>
    </div>
  )
}