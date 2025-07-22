// ============================================================================
// Phase 2: Workspace Page Container - workspace/page.jsx
// Clean content flow with optimal spacing hierarchy
// ============================================================================

import { 
  SearchProvider,
  SearchInput, 
  Discoveries 
} from '@/components/discoveries';
import KeywordFilter from '@/components/discoveries/core/KeywordFilter';

export default function WorkspacePage() {
  return (
    <SearchProvider>
      {/* ✅ CONTENT CONTAINER: Full height, clean spacing */}
      <div className="h-full w-full space-y-6">
        
       

        {/* ✅ SEARCH SECTION: Contained, no overflow */}
        <section className="space-y-4">
          {/* Search Input */}
          <div className="w-full">
            <SearchInput 
              size="lg" 
              placeholder="Search for services..." 
              className="max-w-4xl"
            />
          </div>
          
          {/* Keyword Filter */}
          <div className="w-full">
            <KeywordFilter />
          </div>
        </section>
        
        {/* ✅ RESULTS SECTION: Main content area */}
        <section className="flex-1 w-full">
          <Discoveries />
        </section>
        
      </div>
    </SearchProvider>
  );
}