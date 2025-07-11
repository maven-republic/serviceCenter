// src/app/(customer-workspace)/customer/workspace/page.jsx

"use client";
import Collection from "@/components/section/Collection";
import UniversalSearch from "@/components/customer-workspace/element/UniversalSearch";

export default function ExploreInterface() {
  // Handle search from the UniversalSearch
  const handleSearch = (query) => {
    // The UniversalSearch will handle navigation and store updates
    console.log('Search query:', query);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* Search Bar Only */}
        <div className="flex justify-center mb-8">
          <UniversalSearch 
            onSearch={handleSearch}
            className="w-full max-w-3xl"
            placeholder="What service are you looking for today?"
          />
        </div>

        {/* Services Collection */}
        <Collection />

      </div>
    </div>
  );
}