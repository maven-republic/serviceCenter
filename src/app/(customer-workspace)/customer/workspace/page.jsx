// src/app/(customer-workspace)/customer/workspace/page.jsx - FIXED
import { Suspense } from 'react';
import { 
  SearchProvider,
  SearchInput, 
  Discoveries 
} from '@/components/discoveries';
import KeywordFilter from '@/components/discoveries/core/KeywordFilter';

// Loading component for Suspense
function SearchLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Input Loading */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="h-16 bg-muted rounded-lg animate-pulse" />
      </div>
      
      {/* Keyword Filter Loading */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="h-20 bg-muted rounded-lg animate-pulse" />
      </div>
      
      {/* Results Loading */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchProvider>
        <div className="container mx-auto px-4 py-8">
          
          {/* Search Input */}
          <div className="max-w-4xl mx-auto mb-6">
            <SearchInput size="lg" placeholder="Search for services..." />
          </div>
          
          {/* Keyword Filter - positioned above the results */}
          <div className="max-w-4xl mx-auto mb-8">
            <KeywordFilter />
          </div>
          
          {/* Search Results */}
          <Discoveries />
        </div>
      </SearchProvider>
    </Suspense>
  );
}