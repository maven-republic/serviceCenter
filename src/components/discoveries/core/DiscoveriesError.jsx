// src/components/search/DiscoveriesError.jsx
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/components/discoveries/context/SearchContext';

export default function DiscoveriesError({ error }) {
  const { query, performSearch } = useSearch();

  const handleRetry = () => {
    if (query) {
      performSearch(query);
    }
  };

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Search Error
        </h3>
        <p className="text-muted-foreground mb-6">
          {error || 'Something went wrong while searching. Please try again.'}
        </p>
        
        <Button onClick={handleRetry} className="mr-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}