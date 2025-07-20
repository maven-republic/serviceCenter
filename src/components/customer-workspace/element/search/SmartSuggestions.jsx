// ============================================================================
// 5️⃣ SMART SUGGESTIONS COMPONENT
// File: src/components/customer-workspace/element/search/SmartSuggestions.jsx
import { Search, AlertTriangle, Wrench, Tag, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPastelGradient } from '@/primitives/customer/colorGenerator';
import { useSearchConfig } from './SearchConfigProvider';

export default function SmartSuggestions({ 
  query, 
  smartSuggestions, 
  onSuggestionClick 
}) {
  const { config } = useSearchConfig();

  const getSuggestionIcon = (type, IconComponent) => {
    if (IconComponent) {
      return <IconComponent className="h-4 w-4 text-white" />;
    }
    
    switch (type) {
      case 'solution':
        return <Wrench className="h-4 w-4 text-white" />;
      case 'category':
        return <Tag className="h-4 w-4 text-white" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-white" />;
      default:
        return <Search className="h-4 w-4 text-white" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'solution':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'category':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
        <Search className="h-4 w-4" />
        Search results for "{query}"
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="space-y-2 mb-4">
          {smartSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
                  getPastelGradient(suggestion.type + suggestion.title),
                  config.suggestionIconSize
                )}>
                  {getSuggestionIcon(suggestion.type, suggestion.icon)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-gray-400 font-normal">
                    {suggestion.subtitle}
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getBadgeColor(suggestion.type))}
                >
                  {suggestion.badge}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* General Search */}
      <Button
        onClick={() => onSuggestionClick({ searchTerm: query, type: 'general' })}
        variant="ghost"
        className="w-full justify-start text-left h-auto p-2 hover:bg-gray-50 rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-md flex items-center justify-center",
            getPastelGradient('search-' + query),
            config.suggestionIconSize
          )}>
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Search all services</div>
            <div className="text-sm text-gray-400">Find "{query}" in all categories</div>
          </div>
        </div>
      </Button>
    </div>
  );
}