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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Explore Services
        </h1>
        <p className="text-gray-600">
          Find and book professional services tailored to your needs
        </p>
      </div>

      {/* Search Section */}
      <div className="space-y-6 mb-8">
        {/* Search Input */}
        <div className="max-w-4xl">
          <SearchInput size="lg" placeholder="Search for services..." />
        </div>
        
        {/* Keyword Filter */}
        <div className="max-w-3xl">
          <KeywordFilter />
        </div>
      </div>
      
      {/* Search Results */}
      <div className="mt-8">
        <Discoveries />
      </div>
    </SearchProvider>
  );
}