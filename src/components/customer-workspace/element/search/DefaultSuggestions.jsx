// ============================================================================
// 4️⃣ DEFAULT SUGGESTIONS COMPONENT
// File: src/components/customer-workspace/element/search/DefaultSuggestions.jsx
import { Sparkles, Grid3X3, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPastelGradient } from '@/primitives/customer/colorGenerator';
import { useSearchConfig } from './SearchConfigProvider';

export default function DefaultSuggestions({ 
  suggestions, 
  loading, 
  onSuggestionClick 
}) {
  const { config } = useSearchConfig();

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'service':
        return <Grid3X3 className="h-4 w-4 text-white" />;
      case 'category':
        return <Tag className="h-4 w-4 text-white" />;
      default:
        return <Grid3X3 className="h-4 w-4 text-white" />;
    }
  };

  return (
    <>
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Sparkles className="h-4 w-4" />
          Browse popular services
        </div>
      </div>
      <div className="p-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className={cn(
                  "rounded-md animate-pulse bg-gray-100",
                  config.suggestionIconSize
                )} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const gradientClass = getPastelGradient(suggestion.title + suggestion.type);
            
            return (
              <button
                key={`${suggestion.type}-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
                    gradientClass,
                    config.suggestionIconSize
                  )}>
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-400 font-normal">
                      {suggestion.category}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                  >
                    {suggestion.type === 'service' ? 'Service' : 'Category'}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}