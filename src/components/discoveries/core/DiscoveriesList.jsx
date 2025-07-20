// src/components/discoveries/core/DiscoveriesList.jsx
// Full-width grid using your beautiful Manifest component
import Manifest from '../legacy/Manifest';

export default function DiscoveriesList({ results, viewMode = 'grid' }) {
  console.log('🔍 DiscoveriesList rendering:', {
    resultsCount: results?.length || 0,
    viewMode,
    firstResult: results?.[0]
  });

  // Safety check
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No services to display</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={`${result.service_id || result.id || index}`}
            className="w-full"
          >
            <Manifest data={result} />
          </div>
        ))}
      </div>
    );
  }

  // Grid view - Full width with maximum columns!
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-6">
      {results.map((result, index) => (
        <div 
          key={`${result.service_id || result.id || index}`}
          className="w-full"
        >
          <Manifest data={result} />
        </div>
      ))}
    </div>
  );
}