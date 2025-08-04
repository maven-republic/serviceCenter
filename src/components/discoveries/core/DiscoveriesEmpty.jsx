
// src/components/search/DiscoveriesEmpty.jsx
import { Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/components/discoveries/context/SearchContext';

export default function DiscoveriesEmpty({ query }) {
  const { clearAll, performSearch } = useSearch();

  const suggestions = [
    'plumbing',
    'electrical',
    'welding',
    'carpentry',
    'painting'
  ];

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          No discoveries for "{query}"
        </h3>
        <p className="text-muted-foreground mb-6">
          We couldn't find any services matching your search. Try adjusting your search terms or browse our suggestions below.
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1 text-sm font-medium mb-2">
              <Lightbulb className="h-4 w-4" />
              Try searching for:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => performSearch(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
          
          <Button onClick={clearAll} variant="ghost" size="sm">
            Clear search and start over
          </Button>
        </div>
      </div>
    </div>
  );
}