// src/app/(customer-workspace)/customer/workspace/page.jsx
import { 
  SearchProvider,
  SearchInput, 
  Discoveries 
} from '@/components/discoveries';
import KeywordFilter from '@/components/discoveries/core/KeywordFilter';

export default function WorkspacePage() {
  return (
    <SearchProvider>
      <div className="container mx-auto px-4 py-8">
        
        {/* Search Input */}
        <div className="max-w-6xl mx-auto mb-6">
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
  );
}