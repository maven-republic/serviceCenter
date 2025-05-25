import { Suspense } from 'react';
import { createClient } from '../../../utils/supabase/server'
// In app/(customer-workspace)/customer/search/page.jsx
import SearchResults from '@/components/customer-workspace/section/SearchResults';
// import SearchFilters from '@/components/customer-workspace/section/ServiceFilters';
// import LoadingResults from '@/components/section/LoadingResults';

// This is a Server Component
export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  const type = searchParams.type || 'all';
  const category = searchParams.category || null;
  const page = parseInt(searchParams.page || '1');
  const sortBy = searchParams.sortBy || 'relevance';
  const sortOrder = searchParams.sortOrder || 'desc';
  
  // Additional filter params
  const subcategory = searchParams.subcategory || null;
  const parish = searchParams.parish || null;
  const minPrice = searchParams.minPrice || null;
  const maxPrice = searchParams.maxPrice || null;
  const experience = searchParams.experience || null;
  const verified = searchParams.verified === 'true';
  
  // Construct API URL
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/search/results`);
  
  // Add all search params to API URL
  if (query) apiUrl.searchParams.append('q', query);
  if (type) apiUrl.searchParams.append('type', type);
  if (category) apiUrl.searchParams.append('category', category);
  if (subcategory) apiUrl.searchParams.append('subcategory', subcategory);
  if (parish) apiUrl.searchParams.append('parish', parish);
  if (minPrice) apiUrl.searchParams.append('minPrice', minPrice);
  if (maxPrice) apiUrl.searchParams.append('maxPrice', maxPrice);
  if (experience) apiUrl.searchParams.append('experience', experience);
  if (verified) apiUrl.searchParams.append('verified', 'true');
  if (sortBy) apiUrl.searchParams.append('sortBy', sortBy);
  if (sortOrder) apiUrl.searchParams.append('sortOrder', sortOrder);
  if (page) apiUrl.searchParams.append('page', page.toString());
  
  // Fetch search results from API
  const response = await fetch(apiUrl, { cache: 'no-store' });
  const { results, total, pagination, filters } = await response.json();

  // Check for authentication status (for UI customization)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {query ? (
            <>Search results for "{query}"</>
          ) : (
            <>Browse all</>
          )}
        </h1>
        <p className="text-gray-600">
          {total} {total === 1 ? 'result' : 'results'} found
          {category && filters?.categories?.length > 0 && 
            ` in ${filters.categories.find(c => c.category_id === category)?.name || 'selected category'}`
          }
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar 
        <div className="w-full md:w-1/4">
          <SearchFilters 
            currentFilters={searchParams}
            categories={filters?.categories || []} 
            parishes={filters?.parishes || []}
            isAuthenticated={isAuthenticated}
          />
        </div> */}
        
        {/* Results Area 
        <div className="w-full md:w-3/4">
          <Suspense fallback={<LoadingResults />}>
            <SearchResults 
              results={results} 
              pagination={pagination}
              currentQuery={query}
              currentType={type}
              currentFilters={searchParams}
              isAuthenticated={isAuthenticated}
            />
          </Suspense>
        </div> */}
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ searchParams }) {
  const query = searchParams.q || '';
  
  return {
    title: query ? `Search results for "${query}"` : "Search",
    description: `Find services and providers ${query ? `matching "${query}"` : ''} on our marketplace.`
  };
}